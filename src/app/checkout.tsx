import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import BottomBar from "@/components/BottomBar";
import WebSiteFooter from "@/components/web-site-footer";

import { quoteCartDelivery } from "@/lib/cartDeliveryFee";
import {
  loadCustomerDetails,
  saveCustomerDetails,
  validateCustomerDetails,
  type CustomerDetailErrors,
  type CustomerDetails,
} from "@/lib/customerDetails";

import {
  loadDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/deliveryLocation";

export default function CheckoutScreen() {
  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);

  const [locationError, setLocationError] = useState<string | null>(null);

  const [details, setDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    altPhone: "",
  });
  const [detailErrors, setDetailErrors] = useState<CustomerDetailErrors>({});

  // Fill in the details the customer used last time.
  useEffect(() => {
    let active = true;

    void loadCustomerDetails().then((saved) => {
      if (active && saved) setDetails(saved);
    });

    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadDeliveryLocation()
        .then((location) => {
          if (active) {
            setDeliveryLocation(location);
            setLocationError(null);
          }
        })
        .catch((error: unknown) => {
          console.error("Could not load checkout delivery location:", error);

          if (active) {
            setDeliveryLocation(null);
            setLocationError(
              error instanceof Error
                ? error.message
                : "Could not load your delivery location.",
            );
          }
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const { cartItems, cartSubtotal, promotionDiscount, cartTotal } = useCart();

  // Delivery fee depends on where the customer is (their GPS location),
  // which restaurant(s) they're ordering from, and how many items.
  const deliveryQuote = useMemo(
    () => quoteCartDelivery(cartItems, deliveryLocation),
    [cartItems, deliveryLocation],
  );

  const deliveryFee = deliveryQuote.ok ? deliveryQuote.fee : 0;

  // Only explain a pricing problem once a location exists
  // (before that, the address card already asks for one).
  const deliveryProblem =
    deliveryLocation && !deliveryQuote.ok ? deliveryQuote.message : null;
  const addressMessage = deliveryProblem ?? locationError;

  const serviceFee = 7.5;
  const total = cartTotal + deliveryFee + serviceFee;

  const updateDetail = (field: keyof CustomerDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
    setDetailErrors((current) => ({ ...current, [field]: undefined }));
  };

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-lg font-bold text-text">Your cart is empty</Text>

        <Pressable
          onPress={() => router.replace("/restaurants")}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Browse Restaurants</Text>
        </Pressable>
      </View>
    );
  }

  const continueToPayment = () => {
    // Check the contact details first so their errors always show.
    const validation = validateCustomerDetails(details);
    setDetailErrors(validation.ok ? {} : validation.errors);

    if (
      !deliveryLocation ||
      !Number.isFinite(deliveryLocation.latitude) ||
      !Number.isFinite(deliveryLocation.longitude)
    ) {
      setLocationError(
        "Please select your GPS delivery location before continuing.",
      );
      return;
    }

    if (!deliveryQuote.ok) {
      setLocationError(deliveryQuote.message);
      return;
    }

    if (!validation.ok) return;

    void saveCustomerDetails(validation.details);

    router.push({
      pathname: "/payment",
      params: {
        deliveryOption: "standard",
        // The payment screen must use these instead of recalculating the fee,
        // and must save the customer details on the order.
        deliveryFee: String(deliveryQuote.fee),
        deliveryTown: deliveryQuote.town,
        customerName: validation.details.name,
        customerPhone: validation.details.phone,
        customerAltPhone: validation.details.altPhone,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-text">Checkout</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 150,
        }}
      >
        {/* DELIVERY ADDRESS */}

        <View className="mt-3">
          <Text className="mb-3 text-sm font-bold text-text">
            Delivery Address
          </Text>

          <View className="rounded-xl border border-border bg-white p-4">
            <View className="flex-row items-start">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="location-outline" size={19} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-text">
                  {deliveryLocation ? "Drop-off point" : "No location selected"}
                </Text>

                <Text
                  className="mt-1 text-xs leading-4 text-textSecondary"
                  numberOfLines={4}
                >
                  {deliveryLocation?.address ??
                    "Share your GPS location and enter your address so the rider can find you."}
                </Text>

                {deliveryLocation && (
                  <Text className="mt-2 text-xs text-textSecondary">
                    GPS: {deliveryLocation.latitude.toFixed(6)},{" "}
                    {deliveryLocation.longitude.toFixed(6)}
                  </Text>
                )}
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/location",
                    params: {
                      returnTo: "checkout",
                    },
                  })
                }
              >
                <Text className="text-xs font-bold text-primary">
                  {deliveryLocation ? "Change" : "Add"}
                </Text>
              </Pressable>
            </View>

            {addressMessage ? (
              <Text className="ml-12 mt-2 text-xs text-primary">
                {addressMessage}
              </Text>
            ) : null}
          </View>
        </View>

        {/* CONTACT DETAILS */}

        <View className="mt-6">
          <Text className="mb-1 text-sm font-bold text-text">
            Contact Details
          </Text>
          <Text className="mb-3 text-xs leading-4 text-textSecondary">
            Our rider will call you when they arrive. Please use a number that
            is switched on and can receive calls.
          </Text>

          <View className="rounded-xl border border-border bg-white p-4">
            <Text className="mb-1 text-xs font-semibold text-text">
              Full name
            </Text>
            <TextInput
              value={details.name}
              onChangeText={(value: string) => updateDetail("name", value)}
              placeholder="e.g. Kwame Mensah"
              placeholderTextColor="#A3A3A3"
              autoComplete="name"
              textContentType="name"
              autoCapitalize="words"
              className="h-12 rounded-xl border border-border px-4 text-sm text-text"
            />
            {detailErrors.name ? (
              <Text className="mt-1 text-xs text-primary">
                {detailErrors.name}
              </Text>
            ) : null}

            <Text className="mb-1 mt-4 text-xs font-semibold text-text">
              Phone number
            </Text>
            <TextInput
              value={details.phone}
              onChangeText={(value: string) => updateDetail("phone", value)}
              placeholder="e.g. 024 123 4567"
              placeholderTextColor="#A3A3A3"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              maxLength={17}
              className="h-12 rounded-xl border border-border px-4 text-sm text-text"
            />
            {detailErrors.phone ? (
              <Text className="mt-1 text-xs text-primary">
                {detailErrors.phone}
              </Text>
            ) : null}

            <Text className="mb-1 mt-4 text-xs font-semibold text-text">
              Alternative number (optional)
            </Text>
            <TextInput
              value={details.altPhone}
              onChangeText={(value: string) => updateDetail("altPhone", value)}
              placeholder="Another number the rider can try"
              placeholderTextColor="#A3A3A3"
              keyboardType="phone-pad"
              maxLength={17}
              className="h-12 rounded-xl border border-border px-4 text-sm text-text"
            />
            {detailErrors.altPhone ? (
              <Text className="mt-1 text-xs text-primary">
                {detailErrors.altPhone}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ORDER SUMMARY */}

        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">
            Order Summary
          </Text>

          <View className="rounded-xl border border-border p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Subtotal</Text>

              <Text className="text-xs text-text">
                GH₵{cartSubtotal.toFixed(2)}
              </Text>
            </View>

            {promotionDiscount > 0 && (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-success">
                  Promotion discount 🎉
                </Text>

                <Text className="text-xs font-bold text-success">
                  -GH₵{promotionDiscount.toFixed(2)}
                </Text>
              </View>
            )}

            {promotionDiscount > 0 && (
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-text">
                  Food total
                </Text>

                <Text className="text-xs font-semibold text-text">
                  GH₵{cartTotal.toFixed(2)}
                </Text>
              </View>
            )}

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Delivery Fee</Text>

              <Text className="text-xs text-text">
                {deliveryQuote.ok ? `GH₵${deliveryFee.toFixed(2)}` : "—"}
              </Text>
            </View>

            {deliveryQuote.ok ? (
              <Text className="mt-1 text-[10px] text-textSecondary">
                Delivery to {deliveryQuote.town}
              </Text>
            ) : null}

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Service Fee</Text>

              <Text className="text-xs text-text">
                GH₵{serviceFee.toFixed(2)}
              </Text>
            </View>

            <View className="my-4 border-t border-border" />

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-bold text-text">Total</Text>

                {promotionDiscount > 0 && (
                  <Text className="mt-1 text-[10px] text-success">
                    You saved GH₵{promotionDiscount.toFixed(2)}
                  </Text>
                )}
              </View>

              <Text className="text-base font-bold text-primary">
                GH₵{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CONTINUE TO PAYMENT */}
      <BottomBar>
        <Pressable
          onPress={continueToPayment}
          className={`h-14 flex-row items-center justify-center rounded-xl ${
            deliveryQuote.ok ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <Text className="text-sm font-bold text-white">
            Continue to Payment
          </Text>

          <Text className="ml-3 text-sm font-bold text-white">
            GH₵{total.toFixed(2)}
          </Text>
        </Pressable>
      </BottomBar>
      {/* Footer scrolls naturally with the page */}
      <View className="w-full">
        <WebSiteFooter />
      </View>
    </View>
  );
}
