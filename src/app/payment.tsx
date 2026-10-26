import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState, useRef } from "react";
import { Alert } from "@/lib/dialog";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { openCheckout } from "@/lib/openCheckout";
import { quoteCartDelivery } from "@/lib/cartDeliveryFee";
import {
  loadCustomerDetails,
  validateCustomerDetails,
  type CustomerDetails,
} from "@/lib/customerDetails";
import {
  loadDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/deliveryLocation";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from "@/lib/paystack";

const isWeb = Platform.OS === "web";

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    customerName?: string;
    customerPhone?: string;
    customerAltPhone?: string;
  }>();

  const {
    cartItems,
    cartSubtotal,
    promotionDiscount,
    cartTotal,
    freeItemSelections,
    clearCart,
    refreshOrders,
  } = useCart();

  const paymentStartLock = useRef(false);
  const verificationLock = useRef(false);
  // On the web, Paystack opens in a new tab. On a phone it opens inside the app.
  const openPayment = (url: string) => {
    setPaymentUrl(url);

    if (isWeb) {
      void Linking.openURL(url);
    }
  };

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [savedLocation, setSavedLocation] = useState<DeliveryLocation | null>(
    null,
  );
  const [savedDetails, setSavedDetails] = useState<CustomerDetails | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void loadDeliveryLocation()
        .then((location) => {
          if (active) setSavedLocation(location);
        })
        .catch((error: unknown) => {
          console.error("Could not load payment delivery location:", error);
          if (active) setSavedLocation(null);
        });

      void loadCustomerDetails()
        .then((details) => {
          if (active) setSavedDetails(details);
        })
        .catch((error: unknown) => {
          console.error("Could not load saved customer details:", error);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const contact = useMemo(
    () =>
      validateCustomerDetails({
        name: params.customerName ?? savedDetails?.name ?? "",
        phone: params.customerPhone ?? savedDetails?.phone ?? "",
        altPhone: params.customerAltPhone ?? savedDetails?.altPhone ?? "",
      }),
    [
      params.customerName,
      params.customerPhone,
      params.customerAltPhone,
      savedDetails,
    ],
  );

  const deliveryQuote = useMemo(
    () => quoteCartDelivery(cartItems, savedLocation),
    [cartItems, savedLocation],
  );

  const deliveryFee = deliveryQuote.ok ? deliveryQuote.fee : 0;
  const serviceFee = cartItems.length > 0 ? 7.5 : 0;

  // This is the screen estimate. The backend remains authoritative.
  const estimatedTotal = Number(
    (cartTotal + deliveryFee + serviceFee).toFixed(2),
  );

  const canPay = cartItems.length > 0 && deliveryQuote.ok && contact.ok;

  const startPayment = async () => {
    if (paymentStartLock.current || loading || paymentUrl) return;

    paymentStartLock.current = true;

    if (cartItems.length === 0) {
      Alert.alert("Empty cart", "Add some food to your cart before paying.");
      return;
    }

    if (!contact.ok) {
      Alert.alert(
        "Contact details needed",
        "Add your name and a phone number the rider can call.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go back",
            onPress: () => router.back(),
          },
        ],
      );
      return;
    }

    try {
      setLoading(true);

      const deliveryLocation = await loadDeliveryLocation();

      if (!deliveryLocation) {
        Alert.alert(
          "Choose a delivery location",
          "Select your drop-off point on the map before placing your order.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Choose location",
              onPress: () =>
                router.push({
                  pathname: "/location",
                  params: { returnTo: "payment" },
                }),
            },
          ],
        );
        return;
      }

      const quote = quoteCartDelivery(cartItems, deliveryLocation);

      if (!quote.ok) {
        Alert.alert("Delivery unavailable", quote.message);
        return;
      }

      const expectedTotal = Number(
        (cartTotal + quote.fee + serviceFee).toFixed(2),
      );

      const payload = {
        cartItems: cartItems.map((item) => ({
          id: item.menuItemId ?? item.id, // changed
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          toppingIds: item.toppings?.map((topping) => topping.id) ?? [], // added
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
        deliveryOption: "standard" as const,
        freeItemSelections,
        deliveryLocation,
        customer: {
          name: contact.details.name,
          phone: contact.details.phone,
          altPhone: contact.details.altPhone,
        },
      };

      const result = await initializePaystackPayment(payload);

      // Validate the amount returned by the trusted backend.
      const serverTotal = Number(result.total);

      if (
        !Number.isFinite(serverTotal) ||
        serverTotal <= 0 ||
        result.currency !== "GHS"
      ) {
        throw new Error(
          "The server returned an invalid payment amount. Please try again.",
        );
      }

      if (
        typeof result.authorization_url !== "string" ||
        !result.authorization_url.startsWith("https://")
      ) {
        throw new Error("Paystack did not return a valid payment URL.");
      }

      setOrderId(result.orderId);
      setReference(result.reference);

      // If the server total differs, explicitly ask the customer
      // to accept the actual amount before opening Paystack.
      if (Math.abs(serverTotal - expectedTotal) > 0.01) {
        Alert.alert(
          "Order total updated",
          `Your checkout estimate was GH₵${expectedTotal.toFixed(
            2,
          )}, but the verified order total is GH₵${serverTotal.toFixed(
            2,
          )}. Continue to Paystack with the verified amount?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                setOrderId(null);
                setReference(null);
              },
            },
            {
              text: "Continue to payment",
              onPress: () => {
                openPayment(result.authorization_url);
              },
            },
          ],
        );

        return;
      }

      openPayment(result.authorization_url);
    } catch (error) {
      console.error("Failed to initialize payment:", error);

      Alert.alert(
        "Payment error",
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!reference || !orderId || verifying) return;

    try {
      setVerifying(true);

      const result = await verifyPaystackPayment(reference, orderId);

      if (result.paid) {
        clearCart();
        await refreshOrders();

        Alert.alert(
          "Payment received",
          "We'll confirm your order with the restaurant and notify you.",
          [
            {
              text: "View order",
              onPress: () => {
                router.replace({
                  pathname: "/orders/[id]",
                  params: { id: result.orderId },
                });
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Payment not confirmed",
          "Paystack has not confirmed this payment yet. If you completed payment, please wait a moment and verify again.",
        );
      }
    } catch (error) {
      console.error("Payment verification failed:", error);

      Alert.alert(
        "Payment not confirmed",
        error instanceof Error
          ? error.message
          : "We could not confirm your payment yet.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // Paystack checkout
  // Paystack checkout on the web: opened in a new tab
  if (paymentUrl && isWeb) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-full max-w-[480px] items-center">
          <Ionicons name="card-outline" size={44} color="#E53935" />

          <Text className="mt-4 text-center text-lg font-bold text-text">
            Complete your payment
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
            Paystack opened in a new tab. Pay there, then come back to this page
            and tap the button below.
          </Text>

          <Pressable
            onPress={confirmPayment}
            disabled={verifying}
            className={`mt-6 w-full items-center rounded-xl bg-primary py-4 ${
              verifying ? "opacity-60" : ""
            }`}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">
                I Have Completed Payment
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => openCheckout(paymentUrl)}
            className="mt-4 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-primary">
              Open the payment page again
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPaymentUrl(null)}
            className="mt-2 px-4 py-2"
          >
            <Text className="text-sm text-textSecondary">Back to summary</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (paymentUrl) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center border-b border-border px-4 pb-3 pt-12">
          <Pressable
            onPress={() => setPaymentUrl(null)}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
            accessibilityRole="button"
            accessibilityLabel="Return to payment summary"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-lg font-bold text-text">Paystack</Text>
            <Text className="text-sm text-textSecondary">
              Complete your payment
            </Text>
          </View>
        </View>

        <WebView
          source={{ uri: paymentUrl }}
          startInLoadingState
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="#E53935" />
              <Text className="mt-3 text-textSecondary">
                Loading payment...
              </Text>
            </View>
          )}
        />

        <View className="border-t border-border bg-white p-4">
          <Pressable
            onPress={confirmPayment}
            disabled={verifying}
            className={`items-center rounded-xl bg-primary py-4 ${
              verifying ? "opacity-60" : ""
            }`}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">
                I Have Completed Payment
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Payment summary
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex-row items-center px-4 pb-5 pt-14">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <Text className="text-2xl font-bold text-text">Payment</Text>
        </View>

        <View className="mx-4 rounded-2xl bg-white p-5">
          <Text className="mb-4 text-lg font-bold text-text">
            Order summary
          </Text>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-textSecondary">Food subtotal</Text>
            <Text className="font-medium text-text">
              GH₵{cartSubtotal.toFixed(2)}
            </Text>
          </View>

          {promotionDiscount > 0 && (
            <>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-semibold text-success">
                  Roll&apos;d Up Wednesday 🎉
                </Text>
                <Text className="font-bold text-success">
                  -GH₵{promotionDiscount.toFixed(2)}
                </Text>
              </View>

              <View className="mb-3 flex-row justify-between">
                <Text className="font-semibold text-text">
                  Discounted food total
                </Text>
                <Text className="font-semibold text-text">
                  GH₵{cartTotal.toFixed(2)}
                </Text>
              </View>
            </>
          )}

          <View className="mb-3 flex-row justify-between">
            <Text className="text-textSecondary">Delivery</Text>
            <Text className="font-medium text-text">
              {deliveryQuote.ok ? `GH₵${deliveryFee.toFixed(2)}` : "—"}
            </Text>
          </View>

          {deliveryQuote.ok ? (
            <View className="mb-3 flex-row justify-between">
              <Text className="text-textSecondary">Delivering to</Text>
              <Text className="ml-3 flex-1 text-right font-medium text-text">
                {deliveryQuote.town}
              </Text>
            </View>
          ) : (
            <Text className="mb-3 text-xs text-primary">
              {savedLocation
                ? deliveryQuote.message
                : "Choose your delivery location at checkout."}
            </Text>
          )}

          <View className="mb-4 flex-row justify-between">
            <Text className="text-textSecondary">Service fee</Text>
            <Text className="font-medium text-text">
              GH₵{serviceFee.toFixed(2)}
            </Text>
          </View>

          <View className="border-t border-border pt-4">
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-lg font-bold text-text">
                  Estimated total
                </Text>

                {promotionDiscount > 0 && (
                  <Text className="mt-1 text-xs text-success">
                    You saved GH₵{promotionDiscount.toFixed(2)}
                  </Text>
                )}
              </View>

              <Text className="text-lg font-bold text-primary">
                GH₵{estimatedTotal.toFixed(2)}
              </Text>
            </View>

            <Text className="mt-2 text-xs text-textSecondary">
              The final amount is verified by AkroBite before payment.
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-white p-5">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-bold text-text">
                Rider will call
              </Text>

              {contact.ok ? (
                <View>
                  <Text className="mt-2 text-sm font-semibold text-text">
                    {contact.details.name}
                  </Text>
                  <Text className="mt-1 text-sm text-textSecondary">
                    {contact.details.phone}
                  </Text>

                  {contact.details.altPhone ? (
                    <Text className="mt-1 text-sm text-textSecondary">
                      {contact.details.altPhone}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="mt-2 text-sm text-primary">
                  Add your name and phone number at checkout so the rider can
                  reach you.
                </Text>
              )}
            </View>

            <Pressable onPress={() => router.back()}>
              <Text className="text-xs font-bold text-primary">
                {contact.ok ? "Edit" : "Add"}
              </Text>
            </Pressable>
          </View>
        </View>

        {freeItemSelections.length > 0 && (
          <View className="mx-4 mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
            <View className="flex-row items-center">
              <View className="mr-3 h-11 w-11 items-center justify-center rounded-full bg-green-100">
                <Text className="text-xl">🎁</Text>
              </View>

              <View className="flex-1">
                <Text className="font-bold text-success">
                  FREE item applied
                </Text>
                <Text className="mt-1 text-sm text-textSecondary">
                  Your selected Roll&apos;d Up promotion item has been submitted
                  for server-side price verification.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="mx-4 mt-4 rounded-2xl bg-white p-5">
          <View className="flex-row items-center">
            <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Ionicons
                name="shield-checkmark-outline"
                size={26}
                color="#E53935"
              />
            </View>

            <View className="flex-1">
              <Text className="font-bold text-text">Secure payment</Text>
              <Text className="mt-1 text-sm text-textSecondary">
                Your payment is securely processed by Paystack.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white p-4">
        <Pressable
          onPress={startPayment}
          disabled={loading || !canPay}
          className={`items-center rounded-xl bg-primary py-4 ${
            loading || !canPay ? "opacity-50" : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-base font-bold text-white">
              Pay GH₵{estimatedTotal.toFixed(2)}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
