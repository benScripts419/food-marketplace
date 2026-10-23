import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import {
  loadAssignedRiderDelivery,
  type RiderDelivery,
} from "@/lib/riderDelivery";
import {
  completeRiderDelivery,
  markArrivedAtPickup,
  markPickedUp,
} from "@/lib/riderPayout";
import { useRiderLocationSharing } from "@/lib/useRiderLocationSharing";
import DeliveryMap from "@/components/DeliveryMap";
import { openDirections, type MapPoint } from "@/lib/navigation";

export default function ActiveDeliveryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [delivery, setDelivery] = useState<RiderDelivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [reload, setReload] = useState(0);
  const [stepping, setStepping] = useState(false);
  const isDeliveryActive =
    delivery?.status === "picked_up" || delivery?.status === "on_the_way";
  const { riderLocation, error: locationSharingError } =
    useRiderLocationSharing(id, isDeliveryActive);

  useEffect(() => {
    let mounted = true;

    async function loadDelivery() {
      setLoading(true);
      setLoadError(null);

      try {
        const result = await loadAssignedRiderDelivery(id);
        if (mounted) {
          setDelivery(result);
        }
      } catch (error) {
        console.error("Failed to load active delivery:", error);
        if (mounted) {
          setDelivery(null);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load delivery details.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadDelivery();
    return () => {
      mounted = false;
    };
  }, [id, reload]);

  const runStep = async (action: () => Promise<unknown>, failTitle: string) => {
    if (stepping) return;
    setStepping(true);

    try {
      await action();
      setReload((value) => value + 1);
    } catch (error) {
      Alert.alert(
        failTitle,
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setStepping(false);
    }
  };

  const navigateTo = async (
    destination: MapPoint | null,
    fallbackAddress: string | null,
    label: string,
  ) => {
    const opened = await openDirections(destination, fallbackAddress);
    if (!opened) {
      Alert.alert(
        "Can't open directions",
        `No location is saved for the ${label}.`,
      );
    }
  };

  const handleDelivered = async () => {
    if (!id || !delivery || completing) return;
    setCompleting(true);

    try {
      const payout = await completeRiderDelivery(id);
      router.replace({
        pathname: "/rider/delivery-completed",
        params: {
          id,
          payoutAmount: String(payout.amount),
          payoutStatus: payout.status,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Please try again.";
      if (message.includes("payout method")) {
        Alert.alert("Set up your payout method", message, [
          { text: "Cancel", style: "cancel" },
          {
            text: "Set up Mobile Money",
            onPress: () => router.push("/rider/payment-details"),
          },
        ]);
      } else {
        Alert.alert("Unable to complete delivery", message);
      }
    } finally {
      setCompleting(false);
    }
  };

  const callCustomer = async () => {
    if (!delivery?.phone) {
      Alert.alert(
        "Phone number unavailable",
        "No customer phone is on this order.",
      );
      return;
    }

    try {
      await Linking.openURL(`tel:${delivery.phone}`);
    } catch {
      Alert.alert(
        "Unable to call",
        "Your device could not open the phone app.",
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-3 text-sm text-textSecondary">
          Loading delivery...
        </Text>
      </View>
    );
  }

  if (!delivery) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Ionicons name="alert-circle-outline" size={50} color="#E53935" />
        <Text className="mt-4 text-center text-base text-textSecondary">
          {loadError ?? "Delivery details are unavailable."}
        </Text>
        <Pressable
          onPress={() => setReload((value) => value + 1)}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} className="mt-4 px-6 py-3">
          <Text className="font-bold text-primary">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const items = delivery.order_items.length
    ? delivery.order_items.map((item) => ({
        name: item.item_name || item.name || "Menu item",
        quantity: item.quantity,
      }))
    : [];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View className="h-[220px] w-full items-center justify-center bg-surface px-6">
          <Pressable
            onPress={() => router.back()}
            className="absolute left-5 top-14 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>
          <View className="h-20 w-20 items-center justify-center rounded-full bg-white">
            <Ionicons name="bicycle-outline" size={42} color="#E53935" />
          </View>
          <Text className="mt-4 text-center text-lg font-bold text-text">
            Active delivery
          </Text>
          <Text className="mt-1 text-sm text-textSecondary">
            Order #{delivery.id.slice(0, 8)}
          </Text>
        </View>

        <View className="mx-5 mt-5 rounded-2xl border border-border bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery route</Text>
          {delivery.customer_latitude !== null &&
          delivery.customer_longitude !== null ? (
            <View className="mt-4 overflow-hidden rounded-xl">
              <DeliveryMap
                destination={{
                  latitude: delivery.customer_latitude,
                  longitude: delivery.customer_longitude,
                }}
                riderLocation={riderLocation}
                style={{ height: 250, width: "100%" }}
              />
            </View>
          ) : (
            <Text className="mt-3 text-sm text-textSecondary">
              No map pin was saved for this order. Use the customer address
              below to navigate.
            </Text>
          )}
          {isDeliveryActive ? (
            <Text
              accessibilityRole={locationSharingError ? "alert" : undefined}
              className={`mt-3 text-xs ${
                locationSharingError ? "text-primary" : "text-textSecondary"
              }`}
            >
              {locationSharingError ??
                "Your location is shared with this customer while the active delivery is open."}
            </Text>
          ) : null}
          <View className="mt-5 flex-row items-start">
            <Ionicons name="restaurant-outline" size={22} color="#E53935" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-semibold text-textSecondary">
                PICK UP
              </Text>
              <Text className="mt-1 font-bold text-text">
                {delivery.restaurant || "Restaurant"}
              </Text>
              <Text className="mt-1 text-sm text-textSecondary">
                {delivery.restaurant_address ||
                  "Restaurant address unavailable"}
              </Text>
              <Pressable
                onPress={() =>
                  void navigateTo(
                    delivery.restaurant_latitude !== null &&
                      delivery.restaurant_longitude !== null
                      ? {
                          latitude: delivery.restaurant_latitude,
                          longitude: delivery.restaurant_longitude,
                        }
                      : null,
                    delivery.restaurant_address,
                    "restaurant",
                  )
                }
                className="mt-2 flex-row items-center self-start rounded-lg bg-surface px-3 py-2"
              >
                <Ionicons name="navigate-outline" size={15} color="#E53935" />
                <Text className="ml-1 text-xs font-bold text-text">
                  Directions to restaurant
                </Text>
              </Pressable>
            </View>
          </View>
          <View className="my-4 ml-[10px] h-6 border-l border-dashed border-border" />
          <View className="flex-row items-start">
            <Ionicons name="location-outline" size={22} color="#E53935" />
            <View className="ml-3 flex-1">
              <Text className="text-xs font-semibold text-textSecondary">
                DELIVER TO
              </Text>
              <Text className="mt-1 font-bold text-text">
                {delivery.customer || "Customer"}
              </Text>
              <Text className="mt-1 text-sm text-textSecondary">
                {delivery.customer_address || "Customer address unavailable"}
              </Text>
              <Pressable
                onPress={() =>
                  void navigateTo(
                    delivery.customer_latitude !== null &&
                      delivery.customer_longitude !== null
                      ? {
                          latitude: delivery.customer_latitude,
                          longitude: delivery.customer_longitude,
                        }
                      : null,
                    delivery.customer_address,
                    "customer",
                  )
                }
                className="mt-2 flex-row items-center self-start rounded-lg bg-surface px-3 py-2"
              >
                <Ionicons name="navigate-outline" size={15} color="#E53935" />
                <Text className="ml-1 text-xs font-bold text-text">
                  Directions to customer
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text">Order details</Text>
            <Text className="font-bold text-primary">
              {delivery.rider_payout_fee.toFixed(2)} earnings
            </Text>
          </View>
          <View className="mt-4">
            {items.length ? (
              items.map((item, index) => (
                <Text
                  key={`${item.name}-${index}`}
                  className="mb-2 text-sm text-text"
                >
                  {item.name} × {item.quantity}
                </Text>
              ))
            ) : (
              <Text className="text-sm text-textSecondary">
                No item details available.
              </Text>
            )}
          </View>
          {delivery.delivery_notes ? (
            <Text className="mt-3 text-sm text-textSecondary">
              Delivery notes: {delivery.delivery_notes}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => void callCustomer()}
          className="mx-5 mt-5 flex-row items-center rounded-2xl bg-white p-5"
        >
          <Ionicons name="call-outline" size={22} color="#E53935" />
          <View className="ml-3 flex-1">
            <Text className="font-bold text-text">
              {delivery.customer || "Customer"}
            </Text>
            <Text className="mt-1 text-sm text-textSecondary">
              {delivery.phone || "Phone number unavailable"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#737373" />
        </Pressable>

        <View className="mx-5 mt-5 rounded-2xl bg-primary p-5">
          <Text className="text-sm text-white">
            Your earnings (80% of the delivery fee)
          </Text>
          <Text className="mt-1 text-2xl font-extrabold text-white">
            GH₵{delivery.rider_payout_fee.toFixed(2)}
          </Text>
          <Text className="mt-2 text-xs text-white">
            Requested automatically when you confirm delivery.
          </Text>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pt-3"
        style={{
          paddingBottom: "max(28px, env(safe-area-inset-bottom))" as any,
        }}
      >
        {delivery.status === "arrived_at_pickup" ? (
          <Pressable
            onPress={() =>
              void runStep(
                () => markPickedUp(delivery.id),
                "Unable to confirm pickup",
              )
            }
            disabled={stepping}
            className={`h-14 items-center justify-center rounded-xl bg-primary ${
              stepping ? "opacity-60" : ""
            }`}
          >
            {stepping ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">
                I have picked up the order
              </Text>
            )}
          </Pressable>
        ) : isDeliveryActive ? (
          <Pressable
            onPress={() => void handleDelivered()}
            disabled={completing}
            className={`h-14 items-center justify-center rounded-xl bg-primary ${
              completing ? "opacity-60" : ""
            }`}
          >
            {completing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">
                Confirm Delivery & Request Payout
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            onPress={() =>
              void runStep(
                () => markArrivedAtPickup(delivery.id),
                "Unable to confirm arrival",
              )
            }
            disabled={stepping}
            className={`h-14 items-center justify-center rounded-xl bg-primary ${
              stepping ? "opacity-60" : ""
            }`}
          >
            {stepping ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">
                I have arrived at the restaurant
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}
