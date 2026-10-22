import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  calculateDeliveryFee,
  DELIVERY_TOWNS,
  type DeliveryQuote,
} from "@/lib/deliveryPricing";
import {
  loadDeliveryLocation,
  type DeliveryLocation,
} from "@/lib/deliveryLocation";
import { loadCustomerDetails } from "@/lib/customerDetails";
import { SERVICE_FEE } from "@/lib/fees";
import { goBackOr } from "@/lib/goBack";
import { RESTAURANT_LOCATIONS } from "@/lib/restaurantLocations";

// Where the rider collects the parcel. It is either the centre of a town or
// a known restaurant, so the fee can be worked out from real positions.
type PickupPoint = {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
  kind: "town" | "restaurant";
};

type Quote =
  Extract<DeliveryQuote, { ok: true }> | { ok: false; message: string };

function titleCase(name: string): string {
  return name.replace(
    /(^|\s)(\S)/g,
    (_match, space: string, char: string) => space + char.toUpperCase(),
  );
}

function problemFor(
  reason: "missing_location" | "outside_area" | "too_far",
): string {
  if (reason === "outside_area") {
    return "Sorry, your delivery location is outside our delivery area.";
  }
  if (reason === "too_far") {
    return "Sorry, that pickup is too far from your delivery location.";
  }
  return "Choose the pickup point and your delivery location.";
}

const townPoints: PickupPoint[] = DELIVERY_TOWNS.map((town) => ({
  key: `town:${town.name}`,
  label: town.name,
  latitude: town.latitude,
  longitude: town.longitude,
  kind: "town",
}));

const restaurantPoints: PickupPoint[] = RESTAURANT_LOCATIONS.map((place) => ({
  key: `restaurant:${place.name}`,
  label: titleCase(place.name),
  latitude: place.latitude,
  longitude: place.longitude,
  kind: "restaurant",
}));

export default function DeliveryRequestScreen() {
  const [restaurant, setRestaurant] = useState("");
  const [pickup, setPickup] = useState<PickupPoint | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState("");
  const [itemCount, setItemCount] = useState("1");

  // Same drop-off point that checkout uses.
  const [deliveryLocation, setDeliveryLocation] =
    useState<DeliveryLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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
          console.error("Could not load delivery location:", error);

          if (active) {
            setDeliveryLocation(null);
            setLocationError(
              error instanceof Error
                ? error.message
                : "Could not load your delivery location.",
            );
          }
        });

      // Fill in the name and phone saved from an earlier order.
      void loadCustomerDetails()
        .then((details) => {
          if (!active || !details) return;
          setCustomerName((current) => current || details.name);
          setPhone((current) => current || details.phone);
        })
        .catch((error: unknown) => {
          console.error("Could not load saved customer details:", error);
        });

      return () => {
        active = false;
      };
    }, []),
  );

  const hasLocation =
    !!deliveryLocation &&
    Number.isFinite(deliveryLocation.latitude) &&
    Number.isFinite(deliveryLocation.longitude);

  const items = Math.max(1, parseInt(itemCount, 10) || 1);

  // Fee = the price for the distance from the pickup to the delivery town,
  // plus an extra for how far the delivery point is from that town's centre,
  // plus a charge for extra items. No cart and no restaurant needed.
  const quote = useMemo<Quote>(() => {
    if (!pickup) {
      return {
        ok: false,
        message: "Choose the pickup town or a restaurant.",
      };
    }

    if (!deliveryLocation || !hasLocation) {
      return { ok: false, message: "Choose your delivery location." };
    }

    const result = calculateDeliveryFee(
      { latitude: pickup.latitude, longitude: pickup.longitude },
      deliveryLocation,
      items,
    );

    if (result.ok) return result;

    return { ok: false, message: problemFor(result.reason) };
  }, [pickup, deliveryLocation, hasLocation, items]);

  const deliveryFee = quote.ok ? quote.fee : 0;
  const total = deliveryFee + SERVICE_FEE;

  // Explain a pricing problem only once both points are chosen.
  const quoteProblem =
    !quote.ok && pickup && hasLocation ? quote.message : null;

  const canContinue =
    !!pickup &&
    !!pickupAddress.trim() &&
    customerName.trim().length >= 2 &&
    !!phone.trim() &&
    hasLocation &&
    quote.ok;

  const choosePickup = (point: PickupPoint) => {
    setPickup(point);

    // A known restaurant fills in the name, unless one was already typed.
    if (point.kind === "restaurant" && !restaurant.trim()) {
      setRestaurant(point.label);
    }
  };

  const continueToConfirm = () => {
    setFormError(null);

    if (!pickup) {
      setFormError("Choose where the rider should collect it.");
      return;
    }

    if (!pickupAddress.trim()) {
      setFormError("Add the pickup details, such as a shop name or landmark.");
      return;
    }

    if (customerName.trim().length < 2) {
      setFormError("Enter your name.");
      return;
    }

    if (!phone.trim()) {
      setFormError("Enter a phone number the rider can call.");
      return;
    }

    if (!deliveryLocation || !hasLocation) {
      setLocationError(
        "Please choose your delivery location before continuing.",
      );
      return;
    }

    if (!quote.ok) {
      setLocationError(quote.message);
      return;
    }

    router.push({
      pathname: "/delivery-confirm",
      params: {
        // Optional: may be an empty string.
        restaurant: restaurant.trim(),
        customerName: customerName.trim(),
        pickupKey: pickup.key,
        pickupAddress,
        pickupTown: pickup.label,
        pickupLatitude: String(pickup.latitude),
        pickupLongitude: String(pickup.longitude),
        phone,
        orderDetails,
        deliveryAddress: deliveryLocation.address ?? "",
        deliveryLatitude: String(deliveryLocation.latitude),
        deliveryLongitude: String(deliveryLocation.longitude),
        itemCount: String(items),
        // Confirm and payment must use these instead of recalculating,
        // and must save them on the order.
        deliveryFee: String(quote.fee),
        deliveryTown: quote.town,
        distanceKm: String(quote.distanceKm),
        serviceFee: String(SERVICE_FEE),
        total: String(quote.fee + SERVICE_FEE),
      },
    });
  };

  const renderChips = (points: PickupPoint[]) => (
    <View className="flex-row flex-wrap">
      {points.map((point) => {
        const selected = pickup?.key === point.key;

        return (
          <Pressable
            key={point.key}
            onPress={() => choosePickup(point)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
              selected ? "border-primary bg-red-50" : "border-border bg-white"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                selected ? "text-primary" : "text-text"
              }`}
            >
              {point.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-3 pt-14">
        <Pressable
          onPress={() => goBackOr("/(tabs)")}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="ml-3 text-xl font-bold text-text">
          Request Delivery
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        {/* INTRO */}
        <View className="mt-3 rounded-2xl bg-surface p-5">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="bicycle-outline" size={24} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">
                Need something delivered?
              </Text>

              <Text className="mt-1 text-xs leading-5 text-textSecondary">
                Tell us where to collect it and where to bring it. The fee
                depends on the pickup town, your town and the distance between
                them, plus a service fee of GH₵{SERVICE_FEE.toFixed(2)}.
              </Text>
            </View>
          </View>
        </View>

        {/* PICKUP */}
        <View className="mt-6">
          <Text className="mb-1 text-sm font-bold text-text">
            Where should the rider collect it?
          </Text>
          <Text className="mb-3 text-xs text-textSecondary">
            Choose the pickup town.
          </Text>

          {renderChips(townPoints)}

          <Text className="mb-2 mt-2 text-xs text-textSecondary">
            Or choose a restaurant:
          </Text>

          {renderChips(restaurantPoints)}
        </View>

        <View className="mt-4">
          <Text className="mb-2 text-sm font-bold text-text">
            Pickup details
          </Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="location-outline" size={19} color="#E53935" />

            <TextInput
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Shop name, street or landmark"
              placeholderTextColor="#737373"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* RESTAURANT (OPTIONAL) */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Restaurant or shop name (optional)
          </Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="restaurant-outline" size={19} color="#737373" />

            <TextInput
              value={restaurant}
              onChangeText={setRestaurant}
              placeholder="e.g. Mama's Kitchen"
              placeholderTextColor="#737373"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* DELIVERY */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Delivery location
          </Text>

          <View className="rounded-xl border border-border bg-white p-4">
            <View className="flex-row items-start">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="navigate-outline" size={19} color="#E53935" />
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
                    "Share your location and enter your address so the rider can find you."}
                </Text>

                {deliveryLocation ? (
                  <Text className="mt-2 text-xs text-textSecondary">
                    GPS: {deliveryLocation.latitude.toFixed(6)},{" "}
                    {deliveryLocation.longitude.toFixed(6)}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/location",
                    params: { returnTo: "delivery-request" },
                  })
                }
              >
                <Text className="text-xs font-bold text-primary">
                  {deliveryLocation ? "Change" : "Add"}
                </Text>
              </Pressable>
            </View>

            {locationError ? (
              <Text className="ml-12 mt-2 text-xs text-primary">
                {locationError}
              </Text>
            ) : null}
          </View>
        </View>

        {/* NAME */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">Your name</Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="person-outline" size={19} color="#737373" />

            <TextInput
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Your full name"
              placeholderTextColor="#737373"
              autoCapitalize="words"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* PHONE */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">Phone number</Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="call-outline" size={19} color="#737373" />

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="024 XXX XXXX"
              placeholderTextColor="#737373"
              keyboardType="phone-pad"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* ITEM COUNT */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Number of items
          </Text>

          <Text className="mb-2 text-xs text-textSecondary">
            Extra items can add to the delivery fee.
          </Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="bag-outline" size={19} color="#737373" />

            <TextInput
              value={itemCount}
              onChangeText={(v: string) => setItemCount(v.replace(/\D/g, ""))}
              placeholder="1"
              placeholderTextColor="#737373"
              keyboardType="number-pad"
              maxLength={2}
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* WHAT TO COLLECT */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            What should the rider collect?
          </Text>

          <Text className="mb-2 text-xs text-textSecondary">
            Optional. Help whoever hands it over identify your order.
          </Text>

          <View className="rounded-xl border border-border bg-white px-4">
            <TextInput
              value={orderDetails}
              onChangeText={setOrderDetails}
              placeholder="e.g. Jollof with chicken, order #245"
              placeholderTextColor="#737373"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-[90px] py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* FEES */}
        <View className="mt-6 rounded-xl border border-border p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-textSecondary">Delivery Fee</Text>
            <Text className="text-xs text-text">
              {quote.ok ? `GH₵${deliveryFee.toFixed(2)}` : "—"}
            </Text>
          </View>

          {quote.ok && pickup ? (
            <Text className="mt-1 text-[10px] text-textSecondary">
              {pickup.label} to {quote.town} · about {quote.distanceKm} km
              between pickup and the delivery town
            </Text>
          ) : null}

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-xs text-textSecondary">Service Fee</Text>
            <Text className="text-xs text-text">
              GH₵{SERVICE_FEE.toFixed(2)}
            </Text>
          </View>

          <View className="my-4 border-t border-border" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-text">Total</Text>
            <Text className="text-base font-bold text-primary">
              {quote.ok ? `GH₵${total.toFixed(2)}` : "—"}
            </Text>
          </View>

          {quoteProblem ? (
            <Text className="mt-3 text-xs text-primary">{quoteProblem}</Text>
          ) : null}

          {formError ? (
            <Text
              accessibilityRole="alert"
              className="mt-3 text-xs text-primary"
            >
              {formError}
            </Text>
          ) : null}
        </View>
      </ScrollView>

      {/* CONTINUE */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={continueToConfirm}
          className={`h-14 items-center justify-center rounded-xl ${
            canContinue ? "bg-primary" : "bg-border"
          }`}
        >
          <Text className="font-bold text-white">Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
