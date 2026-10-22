import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import DeliveryMap from "@/components/DeliveryMap";
import { isValidCoordinates, type Coordinates } from "@/lib/deliveryLocation";
import { supabase } from "@/lib/supabase";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "accepted"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled"
  | string;

type TrackingOrder = {
  id: string;
  restaurant: string;
  status: OrderStatus;
  customer: string | null;
  customer_address: string | null;
  customer_latitude: number | null;
  customer_longitude: number | null;
  phone: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string | null;
  rider_id: string | null;
  updated_at: string | null;
  delivered_at: string | null;
  admin_confirmed_at: string | null;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type RiderPosition = Coordinates & {
  updated_at: string;
};

const ACTIVE_RIDER_STATUSES = ["picked_up", "on_the_way"];

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseOrder(value: unknown): TrackingOrder | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.status !== "string") {
    return null;
  }

  return {
    id: row.id,
    restaurant: nullableString(row.restaurant) ?? "Restaurant",
    status: row.status,
    customer: nullableString(row.customer),
    customer_address: nullableString(row.customer_address),
    customer_latitude:
      row.customer_latitude == null
        ? null
        : toNumber(row.customer_latitude, NaN),
    customer_longitude:
      row.customer_longitude == null
        ? null
        : toNumber(row.customer_longitude, NaN),
    phone: nullableString(row.phone),
    subtotal: toNumber(row.subtotal),
    delivery_fee: toNumber(row.delivery_fee),
    total: toNumber(row.total),
    payment_status: nullableString(row.payment_status),
    rider_id: nullableString(row.rider_id),
    updated_at: nullableString(row.updated_at),
    delivered_at: nullableString(row.delivered_at),
    admin_confirmed_at: nullableString(row.admin_confirmed_at),
  };
}

function parseOrderItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];

    const row = entry as Record<string, unknown>;
    const name = nullableString(row.name);

    if (!name) return [];

    return [
      {
        id: String(row.id ?? `item-${index}`),
        name,
        price: toNumber(row.price),
        quantity: Math.max(0, toNumber(row.quantity)),
      },
    ];
  });
}

function parseRiderPosition(value: unknown): RiderPosition | null {
  if (!isValidCoordinates(value)) return null;

  const row = value as Record<string, unknown>;

  return {
    latitude: value.latitude,
    longitude: value.longitude,
    updated_at: typeof row.updated_at === "string" ? row.updated_at : "",
  };
}

function money(value: number): string {
  return `GH₵${value.toFixed(2)}`;
}

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function getStatusMessage(status: string): string {
  switch (status) {
    case "pending":
      return "Your order has been placed and is awaiting confirmation.";
    case "confirmed":
    case "accepted":
      return "The restaurant has confirmed your order.";
    case "preparing":
      return "The restaurant is preparing your food.";
    case "ready":
      return "Your order is ready for pickup.";
    case "picked_up":
      return "Your rider has picked up your order.";
    case "on_the_way":
      return "Your rider is on the way to your address.";
    case "delivered":
      return "Your order has been delivered. Enjoy your meal!";
    case "cancelled":
      return "This order has been cancelled.";
    default:
      return "We're checking the latest status of your order.";
  }
}

function getProgress(status: string) {
  const preparationStatuses = [
    "confirmed",
    "accepted",
    "preparing",
    "ready",
    "picked_up",
    "on_the_way",
    "delivered",
  ];

  const deliveryStatuses = ["picked_up", "on_the_way", "delivered"];

  return {
    placed: status !== "cancelled",
    preparing: preparationStatuses.includes(status),
    onTheWay: deliveryStatuses.includes(status),
    delivered: status === "delivered",
  };
}

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams<{
    orderId?: string | string[];
  }>();

  const orderId = Array.isArray(params.orderId)
    ? params.orderId[0]
    : params.orderId;

  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [riderLocation, setRiderLocation] = useState<RiderPosition | null>(
    null,
  );
  const [riderPhone, setRiderPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [screenError, setScreenError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const loadOrder = useCallback(
    async (isMounted: () => boolean) => {
      if (!orderId) {
        if (isMounted()) {
          setOrder(null);
          setScreenError("No order ID was provided.");
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          [
            "id",
            "restaurant",
            "status",
            "customer",
            "customer_address",
            "customer_latitude",
            "customer_longitude",
            "phone",
            "subtotal",
            "delivery_fee",
            "total",
            "payment_status",
            "rider_id",
            "updated_at",
            "delivered_at",
            "admin_confirmed_at",
          ].join(", "),
        )
        .eq("id", orderId)
        .maybeSingle();

      if (!isMounted()) return;

      if (error) {
        console.error("Track Order: failed to load order", error);
        setScreenError(
          "We couldn't load this order. Check your connection and try again.",
        );
        setLoading(false);
        return;
      }

      const parsedOrder = parseOrder(data);

      if (!parsedOrder) {
        setOrder(null);
        setScreenError(
          "This order could not be found or you don't have permission to view it.",
        );
        setLoading(false);
        return;
      }

      setOrder(parsedOrder);
      setScreenError(null);
      setLoading(false);

      // Load the saved line items, not the current cart.
      const { data: itemRows, error: itemError } = await supabase
        .from("order_items")
        .select("id, name, price, quantity")
        .eq("order_id", orderId);

      if (!isMounted()) return;

      if (itemError) {
        console.error("Track Order: failed to load order items", itemError);
        setItems([]);
        setItemsError("Order items are temporarily unavailable.");
      } else {
        setItems(parseOrderItems(itemRows));
        setItemsError(null);
      }

      // Contact information belongs to the assigned rider.
      if (parsedOrder.rider_id) {
        const { data: rider, error: riderError } = await supabase
          .from("riders")
          .select("phone")
          .eq("id", parsedOrder.rider_id)
          .maybeSingle();

        if (!isMounted()) return;

        if (riderError) {
          console.error(
            "Track Order: failed to load rider contact",
            riderError,
          );
          setRiderPhone(null);
        } else {
          setRiderPhone(nullableString(rider?.phone));
        }
      } else {
        setRiderPhone(null);
      }

      // Load the latest position only during the delivery stage.
      if (ACTIVE_RIDER_STATUSES.includes(parsedOrder.status)) {
        const { data: position, error: positionError } = await supabase
          .from("order_rider_locations")
          .select("latitude, longitude, updated_at")
          .eq("order_id", orderId)
          .maybeSingle();

        if (!isMounted()) return;

        if (positionError) {
          console.error(
            "Track Order: failed to load rider location",
            positionError,
          );
          setLocationError(
            "The rider's live location is temporarily unavailable.",
          );
        } else {
          setRiderLocation(parseRiderPosition(position));
          setLocationError(null);
        }
      } else {
        setRiderLocation(null);
        setLocationError(null);
      }
    },
    [orderId],
  );

  useEffect(() => {
    let mounted = true;
    const isMounted = () => mounted;

    void loadOrder(isMounted);

    if (!orderId) {
      return () => {
        mounted = false;
      };
    }

    const channel = supabase
      .channel(`track-order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          // Re-fetch the authoritative order, totals, and assigned rider.
          void loadOrder(isMounted);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_rider_locations",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === "DELETE") {
            setRiderLocation(null);
            return;
          }

          const next = parseRiderPosition(payload.new);
          if (next) {
            setRiderLocation(next);
            setLocationError(null);
          }
        },
      )
      .subscribe((status) => {
        if (!mounted) return;

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setScreenError(
            "Live updates are temporarily unavailable. The screen can still show the last loaded order details.",
          );
        }
      });

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [orderId, loadOrder]);

  const contactRider = useCallback(async () => {
    if (!order?.rider_id) {
      Alert.alert(
        "Rider not assigned",
        "A rider has not been assigned to this order yet.",
      );
      return;
    }

    if (!riderPhone) {
      Alert.alert(
        "Contact unavailable",
        "The assigned rider's phone number is not available. Please try again later.",
      );
      return;
    }

    const phone = riderPhone.replace(/[^\d+]/g, "");

    try {
      const url = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(url);

      if (!canOpen) {
        Alert.alert(
          "Unable to call",
          "Your device cannot open the phone dialer for this number.",
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error("Track Order: could not open phone dialer", error);
      Alert.alert("Unable to call", "Please try again later.");
    }
  }, [order?.rider_id, riderPhone]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="time-outline" size={40} color="#E53935" />
        <Text className="mt-4 text-base font-semibold text-text">
          Loading your order...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="receipt-outline" size={48} color="#E53935" />
        <Text className="mt-4 text-xl font-bold text-text">
          Order unavailable
        </Text>
        <Text className="mt-2 text-center text-sm text-textSecondary">
          {screenError ?? "We couldn't find this order."}
        </Text>
        <Pressable
          onPress={() => router.replace("/(tabs)/orders")}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">View My Orders</Text>
        </Pressable>
      </View>
    );
  }

  const status = order.status;
  const awaitingConfirmation =
    order.payment_status === "paid" &&
    !order.admin_confirmed_at &&
    status !== "cancelled" &&
    ["pending", "confirmed"].includes(status);
  const progress = getProgress(status);

  const customerLocation =
    order.customer_latitude !== null &&
    order.customer_longitude !== null &&
    Number.isFinite(order.customer_latitude) &&
    Number.isFinite(order.customer_longitude) &&
    isValidCoordinates({
      latitude: order.customer_latitude,
      longitude: order.customer_longitude,
    })
      ? {
          latitude: order.customer_latitude,
          longitude: order.customer_longitude,
        }
      : null;

  // The database total is authoritative. Additional fees are calculated
  // from the saved total rather than inventing a separate service fee.
  const itemSubtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const subtotal = order.subtotal || itemSubtotal;
  const additionalFees = Math.max(
    0,
    order.total - subtotal - order.delivery_fee,
  );

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-text">Track Order</Text>
            <Text className="text-xs text-textSecondary">
              Order #{order.id}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my orders"
            onPress={() => router.replace("/(tabs)/orders")}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="receipt-outline" size={22} color="#171717" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 125,
        }}
      >
        {screenError ? (
          <View className="mt-2 rounded-xl bg-amber-50 p-3">
            <Text accessibilityRole="alert" className="text-sm text-amber-800">
              {screenError}
            </Text>
          </View>
        ) : null}

        {/* CURRENT STATUS */}
        <View className="mt-3">
          <Text className="text-lg font-bold capitalize text-primary">
            {awaitingConfirmation
              ? "awaiting confirmation"
              : statusLabel(status)}
          </Text>
          <Text className="mt-1 text-sm text-textSecondary">
            {awaitingConfirmation
              ? "We've received your payment and are confirming your order with the restaurant. We'll notify you as soon as it's confirmed."
              : getStatusMessage(status)}
          </Text>
          <Text className="mt-2 text-sm text-text">
            Restaurant: {order.restaurant}
          </Text>
        </View>

        {/* LIVE MAP */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">
            Live delivery map
          </Text>

          {customerLocation ? (
            <View className="overflow-hidden rounded-2xl border border-border">
              <DeliveryMap
                destination={customerLocation}
                riderLocation={
                  ACTIVE_RIDER_STATUSES.includes(status) ? riderLocation : null
                }
                style={{ height: 280, width: "100%" }}
              />

              <View className="p-4">
                <Text className="font-semibold text-text">
                  {ACTIVE_RIDER_STATUSES.includes(status)
                    ? riderLocation
                      ? "Rider location"
                      : "Waiting for rider location"
                    : "Delivery destination"}
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  {order.customer_address ?? "Delivery address not provided"}
                </Text>

                {riderLocation?.updated_at ? (
                  <Text className="mt-1 text-xs text-textSecondary">
                    Last update:{" "}
                    {new Date(riderLocation.updated_at).toLocaleTimeString(
                      "en-GH",
                      { hour: "numeric", minute: "2-digit" },
                    )}
                  </Text>
                ) : null}

                {locationError ? (
                  <Text
                    accessibilityRole="alert"
                    className="mt-2 text-xs text-primary"
                  >
                    {locationError}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View className="rounded-xl bg-surface p-4">
              <Text className="text-sm text-textSecondary">
                A valid delivery map location was not saved for this order. You
                can still view the order status and delivery address below.
              </Text>
              {order.customer_address ? (
                <Text className="mt-2 text-sm font-medium text-text">
                  {order.customer_address}
                </Text>
              ) : null}
              {locationError ? (
                <Text
                  accessibilityRole="alert"
                  className="mt-2 text-xs text-primary"
                >
                  {locationError}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* ORDER PROGRESS */}
        {status !== "cancelled" ? (
          <View className="mt-7 rounded-2xl border border-border bg-white p-4">
            <View className="flex-row items-start justify-between">
              <StatusStep
                icon="receipt-outline"
                label="Placed"
                active={progress.placed}
              />
              <ProgressLine active={progress.preparing} />
              <StatusStep
                icon="restaurant-outline"
                label="Preparing"
                active={progress.preparing}
              />
              <ProgressLine active={progress.onTheWay} />
              <StatusStep
                icon="bicycle-outline"
                label="On the way"
                active={progress.onTheWay}
              />
              <ProgressLine active={progress.delivered} />
              <StatusStep
                icon="checkmark-circle-outline"
                label="Delivered"
                active={progress.delivered}
              />
            </View>
          </View>
        ) : (
          <View className="mt-6 rounded-xl bg-red-50 p-4">
            <Text className="font-bold text-red-700">Order cancelled</Text>
            <Text className="mt-1 text-sm text-red-700">
              Contact support if you need help with this order.
            </Text>
          </View>
        )}

        {/* RIDER INFORMATION */}
        <View className="mt-6 rounded-xl border border-border p-4">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
              <Ionicons name="bicycle-outline" size={23} color="#E53935" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">Delivery rider</Text>
              <Text className="mt-1 text-xs text-textSecondary">
                {order.rider_id
                  ? riderPhone
                    ? "Your rider has been assigned."
                    : "Rider assigned; contact details unavailable."
                  : "Waiting for a rider to be assigned."}
              </Text>
            </View>
          </View>
        </View>

        {/* RESTAURANT */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">Restaurant</Text>
          <View className="rounded-xl border border-border p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="restaurant-outline" size={20} color="#E53935" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-text">
                  {order.restaurant}
                </Text>
                <Text className="mt-1 text-xs text-textSecondary">
                  Order #{order.id}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ORDER ITEMS */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">
            Order details
          </Text>
          <View className="rounded-xl border border-border p-4">
            {itemsError ? (
              <Text accessibilityRole="alert" className="text-sm text-primary">
                {itemsError}
              </Text>
            ) : items.length === 0 ? (
              <Text className="text-sm text-textSecondary">
                No saved order items were found.
              </Text>
            ) : (
              items.map((item) => (
                <View
                  key={`${order.id}-${item.id}`}
                  className="mb-4 flex-row items-center"
                >
                  <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
                    <Text className="text-sm font-bold text-primary">
                      {item.quantity}×
                    </Text>
                  </View>

                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-text">
                      {item.name}
                    </Text>
                    <Text className="mt-1 text-xs text-textSecondary">
                      {money(item.price)} each
                    </Text>
                  </View>

                  <Text className="text-xs font-semibold text-text">
                    {money(item.price * item.quantity)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* DATABASE TOTALS */}
        <View className="mt-6 rounded-xl border border-border p-4">
          <TotalRow label="Subtotal" value={money(subtotal)} />
          <TotalRow label="Delivery fee" value={money(order.delivery_fee)} />

          {additionalFees > 0 ? (
            <TotalRow label="Additional fees" value={money(additionalFees)} />
          ) : null}

          <View className="my-4 border-t border-border" />

          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Total</Text>
            <Text className="text-base font-bold text-primary">
              {money(order.total)}
            </Text>
          </View>

          {order.payment_status ? (
            <View className="mt-3 flex-row justify-between">
              <Text className="text-xs text-textSecondary">Payment status</Text>
              <Text className="text-xs font-semibold capitalize text-text">
                {statusLabel(order.payment_status)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* DELIVERY ADDRESS */}
        <View className="mt-6 rounded-xl border border-border p-4">
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={21} color="#E53935" />
            <Text className="ml-2 font-bold text-text">Delivery address</Text>
          </View>
          <Text className="mt-2 text-sm text-textSecondary">
            {order.customer_address ?? "No delivery address saved"}
          </Text>
        </View>

        <Pressable
          onPress={() => router.replace("/(tabs)/orders")}
          className="mt-6 h-14 items-center justify-center rounded-xl border border-primary bg-white"
        >
          <Text className="font-bold text-primary">View My Orders</Text>
        </Pressable>
      </ScrollView>

      {/* CONTACT RIDER */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call delivery rider"
          onPress={() => void contactRider()}
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Ionicons name="call-outline" size={18} color="#FFFFFF" />
          <Text className="ml-2 text-sm font-bold text-white">
            Contact Rider
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-3 flex-row justify-between">
      <Text className="text-sm text-textSecondary">{label}</Text>
      <Text className="text-sm font-semibold text-text">{value}</Text>
    </View>
  );
}

function ProgressLine({ active }: { active: boolean }) {
  return (
    <View
      className={`mt-[18px] h-[2px] flex-1 ${
        active ? "bg-primary" : "bg-border"
      }`}
    />
  );
}

function StatusStep({
  icon,
  label,
  active = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
}) {
  return (
    <View className="w-[58px] items-center">
      <View
        className={`h-9 w-9 items-center justify-center rounded-full ${
          active ? "bg-primary" : "bg-surface"
        }`}
      >
        <Ionicons
          name={icon}
          size={17}
          color={active ? "#FFFFFF" : "#737373"}
        />
      </View>
      <Text
        className={`mt-2 text-center text-[9px] ${
          active ? "font-bold text-primary" : "text-textSecondary"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
