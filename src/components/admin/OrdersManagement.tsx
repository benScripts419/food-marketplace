import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/lib/dialog";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  Text,
  View,
} from "react-native";

import { nearestTown } from "@/lib/deliveryPricing";
import { getFunctionErrorMessage } from "@/lib/paystack";
import { supabase } from "@/lib/supabase";

// If assigning a rider should also change the order status, put that status
// here. Leave as null to only save the rider.
const STATUS_FLOW = ["confirmed", "preparing", "ready"];
const STATUS_ON_ASSIGN: string | null = null;

// Orders in these statuses don't need a rider.
const CLOSED_STATUSES = [
  "delivered",
  "completed",
  "cancelled",
  "canceled",
  "refunded",
];

// Payment statuses that mean "not paid (yet)".
const UNPAID_STATUSES = [
  "pending",
  "failed",
  "abandoned",
  "unpaid",
  "cancelled",
  "canceled",
  "refunded",
];

const CANCELLABLE_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "accepted",
  "arrived_at_pickup",
];

const STATUS_EDITABLE = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "accepted",
];

async function openUrl(url: string, failTitle: string, failMessage: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert(failTitle, failMessage);
  }
}

function payoutLabel(status: string): string {
  switch (status) {
    case "needs_account":
      return "needs a Mobile Money account";
    case "processing":
      return "sending";
    case "queued":
      return "sent, waiting for confirmation";
    case "paid":
      return "paid";
    case "failed":
      return "failed";
    case "cancelled":
      return "cancelled";
    default:
      return status;
  }
}

function offerLabel(status: string): string {
  switch (status) {
    case "offered":
      return "waiting for a reply";
    case "accepted":
      return "accepted";
    case "declined":
      return "declined";
    case "expired":
      return "expired";
    default:
      return status;
  }
}
// Used to turn local numbers (024...) into WhatsApp format (23324...).
const DEFAULT_COUNTRY_CODE = "233";

const REFRESH_INTERVAL_MS = 30000;

// ---------- Types ----------

type OrderItemTopping = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  toppings: OrderItemTopping[];
};

type AdminOrder = {
  id: string;
  restaurant: string;
  status: string;
  paymentStatus: string | null;
  total: number;
  deliveryFee: number | null;
  createdAt: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAltPhone: string | null;
  deliveryAddress: string | null;
  deliveryTown: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  riderId: string | null;
  items: OrderItem[];
  cancellationReason: string | null;
  refundStatus: string | null;
  restaurantPayouts: RestaurantPayout[];
  orderType: string;
  pickupAddress: string | null;
  pickupTown: string | null;
  pickupLat: number | null;
  pickupLng: number | null;
  orderDetails: string | null;
  itemCount: number | null;
  adminConfirmedAt: string | null;
  offer: OrderOffer | null;
};

type RestaurantPayout = {
  id: string;
  status: string;
  amount: number;
};

type OrderOffer = {
  status: string;
  driverName: string | null;
};

type Rider = {
  id: string | number;
  name: string;
  phone: string | null;
};

type Filter = "confirm" | "unassigned" | "assigned" | "all";

// ---------- Small helpers ----------

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toNumber(value: unknown): number {
  return toNullableNumber(value) ?? 0;
}

function toText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function parseOrderItemToppings(value: unknown): OrderItemTopping[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const row = entry as Record<string, unknown>;
    const name = toText(row.name);

    if (!name) return [];

    return [
      {
        id: toText(row.id) ?? `${name}-${index}`,
        name,
        price: toNumber(row.price),
      },
    ];
  });
}

function isMilkOption(name: string): boolean {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Match named milk options and common menu labels such as Oat or Soy.
  return (
    normalized.includes("milk") ||
    ["oat", "almond", "soy", "coconut", "whole", "skim", "fresh"].includes(
      normalized,
    )
  );
}

function errorText(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Unknown error";
}

function formatMoney(value: number) {
  return `GH₵${value.toFixed(2)}`;
}

function shortId(id: string) {
  return id.length > 8 ? id.slice(0, 8).toUpperCase() : id;
}

function isUnpaid(order: AdminOrder) {
  return (
    order.paymentStatus !== null &&
    UNPAID_STATUSES.includes(order.paymentStatus.toLowerCase())
  );
}

// Which town pin is closest to where the customer pinned their location.
function townFromRow(row: Record<string, unknown>): string | null {
  const latitude = toNullableNumber(row.customer_latitude ?? row.delivery_lat);
  const longitude = toNullableNumber(
    row.customer_longitude ?? row.delivery_lng,
  );

  if (latitude === null || longitude === null) return null;
  if (latitude === 0 && longitude === 0) return null;

  return nearestTown({ latitude, longitude }).name;
}

// Accepts whatever shape your riders have and pulls out what we need.
function normalizeRider(raw: object): Rider | null {
  const row = raw as Record<string, unknown>;
  if (row.id === undefined || row.id === null) return null;

  return {
    id: row.id as string | number,
    name:
      toText(row.name) ??
      toText(row.full_name) ??
      toText(row.rider_name) ??
      "Unnamed rider",
    phone:
      toText(row.phone) ??
      toText(row.phone_number) ??
      toText(row.mobile) ??
      toText(row.contact),
  };
}

// Google Maps link that opens turn-by-turn directions to the customer.
function mapsUrl(order: AdminOrder): string | null {
  if (order.deliveryLat !== null && order.deliveryLng !== null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLat},${order.deliveryLng}`;
  }

  // Town-based orders have no exact pin, so search "landmark, town" instead.
  if (order.deliveryAddress || order.deliveryTown) {
    const place = [order.deliveryAddress, order.deliveryTown, "Ghana"]
      .filter(Boolean)
      .join(", ");
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`;
  }

  return null;
}

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return DEFAULT_COUNTRY_CODE + digits.slice(1);
  if (digits.length === 9) return DEFAULT_COUNTRY_CODE + digits;

  return digits;
}

function buildRiderMessage(order: AdminOrder): string {
  const map = mapsUrl(order);
  const isDelivery = order.orderType === "delivery";

  const lines = [
    isDelivery ? "🛵 New delivery request" : "🛵 New delivery",
    `Order #${shortId(order.id)}${isDelivery ? "" : ` — ${order.restaurant}`}`,
    "",
  ];

  if (isDelivery) {
    lines.push(
      "PICK UP",
      `Pickup town: ${order.pickupTown ?? "N/A"}`,
      `Pickup details: ${order.pickupAddress ?? "N/A"}`,
      ...(order.restaurant && order.restaurant !== "Delivery request"
        ? [`Shop / restaurant: ${order.restaurant}`]
        : []),
      ...(order.orderDetails ? [`Collect: ${order.orderDetails}`] : []),
      ...(order.itemCount ? [`Items: ${order.itemCount}`] : []),
      ...(order.pickupLat !== null && order.pickupLng !== null
        ? [
            `Pickup location: https://www.google.com/maps/dir/?api=1&destination=${order.pickupLat},${order.pickupLng}`,
          ]
        : []),
      "",
      "DELIVER TO",
    );
  }

  lines.push(
    `Customer: ${order.customerName ?? "N/A"}`,
    `Phone: ${order.customerPhone ?? "N/A"}`,
    ...(order.customerAltPhone ? [`Alt phone: ${order.customerAltPhone}`] : []),
    `Town: ${order.deliveryTown ?? "N/A"}`,
    `Address / landmark: ${order.deliveryAddress ?? "Not given, please call the customer"}`,
    map
      ? `Location: ${map}`
      : "Location: not provided, please call the customer",
  );

  if (isDelivery) {
    lines.push("", `Delivery fee paid: ${formatMoney(order.deliveryFee ?? 0)}`);
  } else {
    lines.push("", "Items:");

    if (order.items.length === 0) {
      lines.push("Not listed");
    } else {
      for (const item of order.items) {
        lines.push(`${item.quantity} × ${item.name}`);
      }
    }

    lines.push("", `Order total: ${formatMoney(order.total)}`);
  }

  return lines.join("\n");
}

function sendByWhatsApp(rider: Rider, message: string) {
  if (!rider.phone) {
    Alert.alert("No phone number", `${rider.name} has no phone number saved.`);
    return;
  }

  void openUrl(
    `https://wa.me/${toWhatsAppNumber(rider.phone)}?text=${encodeURIComponent(message)}`,
    "Couldn't open WhatsApp",
    "Try sending it by SMS instead.",
  );
}

function sendBySms(rider: Rider, message: string) {
  if (!rider.phone) {
    Alert.alert("No phone number", `${rider.name} has no phone number saved.`);
    return;
  }

  const isIos =
    Platform.OS === "ios" ||
    (Platform.OS === "web" &&
      typeof navigator !== "undefined" &&
      /iPhone|iPad|iPod/i.test(navigator.userAgent));

  const separator = isIos ? "&" : "?";

  void openUrl(
    `sms:${rider.phone}${separator}body=${encodeURIComponent(message)}`,
    "Couldn't open messages",
    "Try sending it by WhatsApp instead.",
  );
}

function chooseSendMethod(order: AdminOrder, rider: Rider, title: string) {
  Alert.alert(
    title,
    order.customerPhone
      ? "Send the order details and the customer's location to the rider?"
      : "This order has no customer phone number, so the rider won't be able to call them. Send anyway?",
    [
      { text: "Not now", style: "cancel" },
      {
        text: "SMS",
        onPress: () => sendBySms(rider, buildRiderMessage(order)),
      },
      {
        text: "WhatsApp",
        onPress: () => sendByWhatsApp(rider, buildRiderMessage(order)),
      },
    ],
  );
}

// ---------- One order card ----------

type OrderCardProps = {
  order: AdminOrder;
  rider: Rider | undefined;
  saving: boolean;
  onAssign: () => void;
  onSendToRider: () => void;
  onChangeStatus: (status: string) => void;
  onCancel: () => void;
  onRetryRefund: () => void;
  onRetryPayouts: () => void;
  onConfirm: () => void;
};

function OrderCard({
  order,
  rider,
  saving,
  onAssign,
  onSendToRider,
  onChangeStatus,
  onCancel,
  onRetryPayouts,
  onRetryRefund,
  onConfirm,
}: OrderCardProps) {
  const map = mapsUrl(order);
  const unpaid = isUnpaid(order);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status.toLowerCase());
  const awaitingConfirmation =
    order.paymentStatus?.toLowerCase() === "paid" &&
    !order.adminConfirmedAt &&
    order.status.toLowerCase() !== "cancelled";
  const canRetryPayout =
    order.status.toLowerCase() !== "cancelled" &&
    order.restaurantPayouts.some(
      (payout) =>
        payout.status === "needs_account" || payout.status === "failed",
    );

  const phones = [
    { label: "Phone", value: order.customerPhone },
    { label: "Alternative", value: order.customerAltPhone },
  ].filter(
    (phone): phone is { label: string; value: string } => phone.value !== null,
  );

  const placedAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-GH", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-gray-900">
            {order.restaurant}
          </Text>
          <Text className="mt-1 text-xs text-gray-500">
            #{shortId(order.id)}
            {placedAt ? ` · ${placedAt}` : ""}
          </Text>
        </View>

        <View className="rounded-full bg-orange-50 px-3 py-1">
          <Text className="text-xs font-semibold capitalize text-orange-600">
            {order.status.replace(/_/g, " ")}
          </Text>
        </View>
      </View>

      <Text
        className={`mt-2 text-xs font-semibold capitalize ${
          unpaid ? "text-amber-600" : "text-green-700"
        }`}
      >
        {order.paymentStatus
          ? `Payment: ${order.paymentStatus.replace(/_/g, " ")}`
          : "Payment status unknown"}
      </Text>

      {/* Customer + location */}
      <View className="mt-3 rounded-xl bg-gray-50 p-3">
        <Text className="text-sm font-semibold text-gray-900">
          {order.customerName ?? "Customer"}
        </Text>

        {phones.length === 0 ? (
          <Text className="mt-1 text-xs font-semibold text-amber-600">
            No phone number saved. The rider won't be able to reach this
            customer.
          </Text>
        ) : (
          phones.map((phone) => (
            <View
              key={phone.label}
              className="mt-2 flex-row items-center justify-between"
            >
              <Text className="text-xs text-gray-600">
                {phone.label}: {phone.value}
              </Text>

              <Pressable
                accessibilityLabel={`Call ${phone.label.toLowerCase()} number`}
                onPress={() =>
                  void openUrl(
                    `tel:${phone.value}`,
                    "Couldn't start the call",
                    "Please dial the number manually.",
                  )
                }
                className="h-9 w-9 items-center justify-center rounded-full bg-white"
              >
                <Ionicons name="call-outline" size={18} color="#E53935" />
              </Pressable>
            </View>
          ))
        )}

        <View className="mt-3 flex-row items-center justify-between border-t border-gray-200 pt-3">
          <View className="flex-1 flex-row items-start pr-3">
            <Ionicons name="location-outline" size={16} color="#737373" />
            <Text className="ml-1.5 flex-1 text-xs text-gray-600">
              {[order.deliveryTown, order.deliveryAddress]
                .filter(Boolean)
                .join(" · ") ||
                (map ? "Pinned location" : "No delivery location saved")}
            </Text>
          </View>

          {map ? (
            <Pressable
              onPress={() =>
                void openUrl(
                  map,
                  "Couldn't open the map",
                  "Copy the address and search for it in Maps.",
                )
              }
              className="rounded-lg bg-white px-3 py-2"
            >
              <Text className="text-xs font-bold text-red-600">Open map</Text>
            </Pressable>
          ) : null}
        </View>

        {!map ? (
          <Text className="mt-2 text-xs font-semibold text-amber-600">
            This order has no location. Call the customer to confirm where to
            deliver.
          </Text>
        ) : null}
      </View>

      {/* Delivery request: where to collect it */}
      {order.orderType === "delivery" ? (
        <View className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
          <Text className="text-xs font-bold text-red-700">
            DELIVERY REQUEST · no food from the app
          </Text>

          <Text className="mt-2 text-xs font-semibold text-gray-700">
            Pick up
          </Text>
          <Text className="text-sm font-semibold text-gray-900">
            {order.pickupTown ?? "Pickup point"}
            {order.restaurant && order.restaurant !== "Delivery request"
              ? ` · ${order.restaurant}`
              : ""}
          </Text>
          <Text className="text-xs text-gray-600">
            {order.pickupAddress ?? "No pickup details"}
          </Text>

          {order.orderDetails ? (
            <Text className="mt-2 text-xs text-gray-700">
              To collect: {order.orderDetails}
            </Text>
          ) : null}

          {order.itemCount ? (
            <Text className="mt-1 text-xs text-gray-700">
              Items: {order.itemCount}
            </Text>
          ) : null}

          {order.pickupLat !== null && order.pickupLng !== null ? (
            <Pressable
              onPress={() =>
                void openUrl(
                  `https://www.google.com/maps/dir/?api=1&destination=${order.pickupLat},${order.pickupLng}`,
                  "Couldn't open the map",
                  "Copy the pickup details and search for them in Maps.",
                )
              }
              className="mt-2 self-start rounded-lg bg-white px-3 py-2"
            >
              <Text className="text-xs font-bold text-red-600">
                Open pickup map
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Items */}
      <View className="mt-3">
        {order.orderType === "delivery" ? null : order.items.length === 0 ? (
          <Text className="text-sm text-gray-500">
            Item details unavailable
          </Text>
        ) : (
          order.items.map((item) => {
            const toppings = item.toppings ?? [];
            const milkOptions = toppings.filter((t) => isMilkOption(t.name));
            const extraToppings = toppings.filter((t) => !isMilkOption(t.name));

            const renderSelectedOption = (topping: OrderItemTopping) => (
              <Text key={topping.id} className="mt-1 text-xs text-gray-600">
                • {topping.name}
                {topping.price > 0
                  ? ` (+${formatMoney(topping.price)})`
                  : " (Free)"}
              </Text>
            );

            return (
              <View key={`${order.id}-${item.id}`} className="mb-3">
                {/* Food item and line total */}
                <View className="flex-row justify-between">
                  <Text className="mr-3 flex-1 text-sm text-gray-800">
                    {item.quantity} × {item.name}
                  </Text>

                  <Text className="text-sm font-semibold text-gray-800">
                    {formatMoney(item.price * item.quantity)}
                  </Text>
                </View>

                {/* Selected milk */}
                {milkOptions.length > 0 ? (
                  <View className="ml-3 mt-1">
                    <Text className="text-xs font-semibold text-gray-700">
                      Milk option
                    </Text>
                    {milkOptions.map(renderSelectedOption)}
                  </View>
                ) : null}

                {/* Selected extras */}
                {extraToppings.length > 0 ? (
                  <View className="ml-3 mt-1">
                    <Text className="text-xs font-semibold text-gray-700">
                      Extra toppings
                    </Text>
                    {extraToppings.map(renderSelectedOption)}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>

      {order.deliveryFee !== null ? (
        <View className="mt-1 flex-row justify-between">
          <Text className="text-xs text-gray-500">Delivery fee</Text>
          <Text className="text-xs text-gray-500">
            {formatMoney(order.deliveryFee)}
          </Text>
        </View>
      ) : null}

      <View className="mt-2 flex-row justify-between border-t border-gray-200 pt-3">
        <Text className="text-sm font-bold text-gray-900">Total</Text>
        <Text className="text-sm font-bold text-red-600">
          {formatMoney(order.total)}
        </Text>
      </View>

      {/* Admin confirmation */}
      {awaitingConfirmation ? (
        <View className="mt-4 rounded-xl bg-amber-50 p-3">
          <Text className="text-sm font-bold text-amber-800">
            Waiting for your confirmation
          </Text>
          <Text className="mt-1 text-xs leading-5 text-amber-800">
            Call the restaurant first. Assigning a rider confirms the order
            automatically. You can also confirm it now, so riders can see it in
            their list.
          </Text>
          <Pressable
            onPress={onConfirm}
            className="mt-3 items-center rounded-xl bg-green-600 py-3"
          >
            <Text className="text-sm font-bold text-white">Confirm order</Text>
          </Pressable>
        </View>
      ) : order.adminConfirmedAt ? (
        <Text className="mt-3 text-xs font-semibold text-green-700">
          Confirmed by admin
        </Text>
      ) : null}

      {order.offer ? (
        <Text className="mt-2 text-xs text-gray-600">
          Offer to {order.offer.driverName ?? "driver"}:{" "}
          {offerLabel(order.offer.status)}
        </Text>
      ) : null}

      {/* Cancellation / refund */}
      {order.status.toLowerCase() === "cancelled" ? (
        <View className="mt-4 rounded-xl bg-red-50 p-3">
          <Text className="text-sm font-bold text-red-700">
            Order cancelled
          </Text>
          {order.cancellationReason ? (
            <Text className="mt-1 text-xs text-red-700">
              Reason: {order.cancellationReason}
            </Text>
          ) : null}
          <Text className="mt-1 text-xs font-semibold capitalize text-red-700">
            Refund: {(order.refundStatus ?? "unknown").replace(/_/g, " ")}
          </Text>
          {order.refundStatus === "failed" ? (
            <Pressable
              onPress={onRetryRefund}
              className="mt-2 self-start rounded-lg bg-red-600 px-3 py-2"
            >
              <Text className="text-xs font-bold text-white">Retry refund</Text>
            </Pressable>
          ) : null}
        </View>
      ) : canCancel ? (
        <Pressable
          onPress={onCancel}
          className="mt-4 items-center rounded-xl border border-red-600 py-3"
        >
          <Text className="text-sm font-bold text-red-600">
            Cancel order and refund
          </Text>
        </Pressable>
      ) : null}

      {/* Restaurant payout */}
      {order.restaurantPayouts.length > 0 ? (
        <View className="mt-3 rounded-xl bg-gray-50 p-3">
          <Text className="text-xs font-semibold text-gray-500">
            Restaurant payout
          </Text>
          {order.restaurantPayouts.map((payout) => (
            <Text key={payout.id} className="mt-1 text-xs text-gray-700">
              {formatMoney(Number(payout.amount))} ·{" "}
              {payoutLabel(payout.status)}
            </Text>
          ))}
          {canRetryPayout ? (
            <Pressable
              onPress={onRetryPayouts}
              className="mt-2 self-start rounded-lg bg-red-600 px-3 py-2"
            >
              <Text className="text-xs font-bold text-white">Retry payout</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* Status */}
      {STATUS_EDITABLE.includes(order.status.toLowerCase()) ? (
        <View className="mt-4">
          <Text className="mb-2 text-xs font-semibold text-gray-500">
            Update status
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {STATUS_FLOW.map((status) => {
              const active = order.status.toLowerCase() === status;

              return (
                <Pressable
                  key={status}
                  onPress={() => {
                    if (!active) onChangeStatus(status);
                  }}
                  className={`mr-2 rounded-full px-3 py-2 ${
                    active ? "bg-red-600" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold capitalize ${
                      active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {status.replace(/_/g, " ")}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {/* Rider */}
      <View className="mt-4">
        {saving ? (
          <ActivityIndicator color="#E53935" />
        ) : order.riderId ? (
          <View>
            <View className="flex-row items-center">
              <Ionicons name="bicycle-outline" size={18} color="#16A34A" />
              <Text className="ml-2 flex-1 text-sm font-semibold text-gray-900">
                {rider ? rider.name : "Rider assigned"}
              </Text>
            </View>

            <View className="mt-3 flex-row">
              {rider ? (
                <Pressable
                  onPress={onSendToRider}
                  className="mr-2 flex-1 items-center rounded-xl bg-red-600 py-3"
                >
                  <Text className="text-sm font-bold text-white">
                    Send details to rider
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                onPress={onAssign}
                className="flex-1 items-center rounded-xl bg-gray-100 py-3"
              >
                <Text className="text-sm font-bold text-gray-700">
                  Change rider
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={onAssign}
            className="items-center rounded-xl bg-red-600 py-3"
          >
            <Text className="text-sm font-bold text-white">Assign rider</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ---------- The tab ----------

export default function OrdersManagement({
  riders,
}: {
  riders: readonly object[];
}) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("confirm");
  const [pickerOrder, setPickerOrder] = useState<AdminOrder | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [showNewOrderBanner, setShowNewOrderBanner] = useState(false);
  const [adminProblem, setAdminProblem] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const riderList = useMemo(
    () =>
      riders
        .map(normalizeRider)
        .filter((rider): rider is Rider => rider !== null),
    [riders],
  );

  const ridersById = useMemo(
    () => new Map(riderList.map((rider) => [String(rider.id), rider])),
    [riderList],
  );

  const flashNewOrderBanner = useCallback(() => {
    setShowNewOrderBanner(true);
    if (bannerTimer.current) clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setShowNewOrderBanner(false), 8000);
  }, []);

  const loadOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      // Load orders first.
      const { data: orderRows, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (ordersError) throw ordersError;

      const rows = orderRows ?? [];
      const orderIds = rows.map((row: Record<string, unknown>) =>
        String(row.id),
      );

      const itemsByOrder = new Map<string, OrderItem[]>();
      const restaurantsByOrder = new Map<string, string[]>();
      const payoutsByOrder = new Map<string, RestaurantPayout[]>();
      const offersByOrder = new Map<string, OrderOffer>();

      // Load food items, including saved milk options and toppings.
      if (orderIds.length > 0) {
        const { data: itemRows, error: itemsError } = await supabase
          .from("order_items")
          .select("id, order_id, name, price, quantity, toppings")
          .in("order_id", orderIds);

        if (itemsError) throw itemsError;

        for (const row of itemRows ?? []) {
          const orderKey = String(row.order_id);
          const existing = itemsByOrder.get(orderKey) ?? [];

          existing.push({
            id: String(row.id),
            name: String(row.name ?? "Unnamed item"),
            price: toNumber(row.price),
            quantity: Math.max(0, toNumber(row.quantity)),
            toppings: parseOrderItemToppings(row.toppings),
          });

          itemsByOrder.set(orderKey, existing);
        }
      }

      // Load restaurant payouts.
      if (orderIds.length > 0) {
        const { data: payoutRows, error: payoutsError } = await supabase
          .from("restaurant_payouts")
          .select("id, order_id, amount, status")
          .in("order_id", orderIds);

        if (payoutsError) {
          console.error(
            "Admin: could not load restaurant payouts:",
            payoutsError,
          );
        } else {
          for (const row of payoutRows ?? []) {
            const key = String(row.order_id);
            const existing = payoutsByOrder.get(key) ?? [];

            existing.push({
              id: String(row.id),
              status: String(row.status),
              amount: toNumber(row.amount),
            });

            payoutsByOrder.set(key, existing);
          }
        }
      }

      // Load the latest driver offer for each order.
      if (orderIds.length > 0) {
        const { data: offerRows, error: offersError } = await supabase
          .from("order_assignments")
          .select("order_id, status, offered_at, drivers(name)")
          .in("order_id", orderIds)
          .order("offered_at", { ascending: false });

        if (offersError) {
          console.error("Admin: could not load driver offers:", offersError);
        } else {
          for (const row of offerRows ?? []) {
            const key = String(row.order_id);

            // Since results are newest first, keep the latest offer.
            if (offersByOrder.has(key)) continue;

            const driver = Array.isArray(row.drivers)
              ? row.drivers[0]
              : row.drivers;

            offersByOrder.set(key, {
              status: String(row.status),
              driverName: toText(
                (driver as { name?: unknown } | null | undefined)?.name,
              ),
            });
          }
        }
      }

      // Convert database records into admin orders.
      setOrders(
        rows.map((row: Record<string, unknown>) => ({
          id: String(row.id),

          restaurant:
            toText(row.restaurant) ??
            ((restaurantsByOrder.get(String(row.id)) ?? []).join(", ") ||
              "Restaurant"),

          status: toText(row.status) ?? "pending",
          paymentStatus: toText(row.payment_status),
          total: toNumber(row.total),
          deliveryFee: toNullableNumber(row.delivery_fee),
          createdAt: toText(row.created_at),

          customerName: toText(row.customer) ?? toText(row.customer_name),
          customerPhone: toText(row.phone) ?? toText(row.customer_phone),
          customerAltPhone: toText(row.customer_alt_phone),

          deliveryAddress:
            toText(row.customer_address) ?? toText(row.delivery_address),

          deliveryTown: toText(row.delivery_town) ?? townFromRow(row),

          deliveryLat: toNullableNumber(
            row.customer_latitude ?? row.delivery_lat,
          ),

          deliveryLng: toNullableNumber(
            row.customer_longitude ?? row.delivery_lng,
          ),

          riderId:
            row.rider_id === null || row.rider_id === undefined
              ? null
              : String(row.rider_id),

          items: itemsByOrder.get(String(row.id)) ?? [],

          cancellationReason: toText(row.cancellation_reason),
          refundStatus: toText(row.refund_status),

          restaurantPayouts: payoutsByOrder.get(String(row.id)) ?? [],

          orderType: toText(row.order_type) ?? "food",
          pickupAddress: toText(row.pickup_address),
          pickupTown: toText(row.pickup_town),
          pickupLat: toNullableNumber(row.pickup_latitude),
          pickupLng: toNullableNumber(row.pickup_longitude),
          orderDetails: toText(row.order_details),
          itemCount: toNullableNumber(row.item_count),
          adminConfirmedAt: toText(row.admin_confirmed_at),

          offer: offersByOrder.get(String(row.id)) ?? null,
        })),
      );

      setErrorMessage(null);
    } catch (error) {
      console.error("Admin: could not load orders:", error);

      setErrorMessage(
        `Couldn't load orders: ${errorText(error)}. If this mentions a missing column, run supabase-admin-setup.sql in Supabase.`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch orders when this screen mounts and keep the list refreshed.
  useEffect(() => {
    void loadOrders(true);

    const intervalId = setInterval(() => {
      void loadOrders(false);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loadOrders]);

  // Supabase hides other people's orders from non-admin accounts without any
  // error, which looks exactly like "no orders". Check and say so.
  useEffect(() => {
    let active = true;

    void (async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (!active) return;

      if (error) {
        setAdminProblem(
          "Admin setup isn't finished. Run supabase-admin-setup.sql in the Supabase SQL Editor.",
        );
      } else if (data !== true) {
        setAdminProblem(
          "This account isn't registered as an admin, so other customers' orders are hidden. Add it to the admins table (see supabase-admin-setup.sql).",
        );
      } else {
        setAdminProblem(null);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const assignRider = async (order: AdminOrder, rider: Rider) => {
    setPickerOrder(null);
    setSavingOrderId(order.id);

    try {
      // An offer needs the rider's driver profile.
      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("id, is_active")
        .eq("rider_id", rider.id)
        .maybeSingle();

      if (driverError) throw driverError;

      if (!driver) {
        Alert.alert(
          "Rider not linked",
          `${rider.name} has no driver profile yet. Add them in the Riders tab with their WhatsApp number, and make sure it is linked to their rider account.`,
        );
        return;
      }

      // Assigning a rider means the admin has called the restaurant, so
      // confirm the order now if it isn't confirmed yet.
      const wasUnconfirmed = !order.adminConfirmedAt;

      if (wasUnconfirmed) {
        const { data: confirmData, error: confirmError } =
          await supabase.functions.invoke("confirm-order", {
            body: { orderId: order.id },
          });

        if (confirmError) {
          throw new Error(await getFunctionErrorMessage(confirmError));
        }
        if (confirmData?.error) throw new Error(confirmData.error);
      }

      const { data, error } = await supabase.functions.invoke("assign-order", {
        body: { order_id: order.id, driver_id: driver.id },
      });

      if (error) throw new Error(await getFunctionErrorMessage(error));
      if (data?.error) throw new Error(data.error);

      await loadOrders(false);

      if (typeof data?.whatsapp_url === "string") {
        const whatsappUrl: string = data.whatsapp_url;

        Alert.alert(
          wasUnconfirmed ? "Order confirmed and offered" : "Offer created",
          `${rider.name} can now accept or decline in the app. Send the WhatsApp message too?`,
          [
            { text: "Not now", style: "cancel" },
            {
              text: "WhatsApp",
              onPress: () =>
                void openUrl(
                  whatsappUrl,
                  "Couldn't open WhatsApp",
                  "Try again, or ask the rider to open the app.",
                ),
            },
          ],
        );
      }
    } catch (error) {
      await loadOrders(false);
      Alert.alert("Couldn't offer the order", errorText(error));
    } finally {
      setSavingOrderId(null);
    }
  };

  const updateStatus = async (order: AdminOrder, status: string) => {
    setSavingOrderId(order.id);

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id)
      .select("id");

    setSavingOrderId(null);

    if (error) {
      Alert.alert("Couldn't update status", errorText(error));
      return;
    }

    if (!data || data.length === 0) {
      Alert.alert(
        "Not allowed",
        "The status wasn't changed. Make sure this account is registered as an admin (see supabase-admin-setup.sql).",
      );
      return;
    }

    await loadOrders(false);
  };

  const runConfirm = async (order: AdminOrder) => {
    setSavingOrderId(order.id);

    try {
      const { data, error } = await supabase.functions.invoke("confirm-order", {
        body: { orderId: order.id },
      });

      if (error) throw new Error(await getFunctionErrorMessage(error));
      if (data?.error) throw new Error(data.error);

      await loadOrders(false);
      Alert.alert(
        "Order confirmed",
        data?.notified === false
          ? "The order is confirmed, but the customer's notification could not be saved."
          : "The customer has been notified and the order is open for riders.",
      );
    } catch (error) {
      Alert.alert("Couldn't confirm the order", errorText(error));
    } finally {
      setSavingOrderId(null);
    }
  };

  const confirmOrder = (order: AdminOrder) => {
    Alert.alert(
      "Confirm this order?",
      `Only confirm after you've phoned ${order.restaurant} and they agreed to make it. The customer will be notified and riders will be able to see it.`,
      [
        { text: "Not yet", style: "cancel" },
        { text: "Confirm", onPress: () => void runConfirm(order) },
      ],
    );
  };

  const callCancelOrder = async (orderId: string, reason: string) => {
    const { data, error } = await supabase.functions.invoke("cancel-order", {
      body: { orderId, reason },
    });

    if (error) throw new Error(await getFunctionErrorMessage(error));
    if (data?.error) throw new Error(data.error);

    return data as { orderId: string; refundStatus: string };
  };

  const confirmCancel = async () => {
    if (!cancelTarget || cancelling) return;

    const reason = cancelReason.trim();
    if (reason.length < 3) {
      Alert.alert(
        "Add a reason",
        "Say why the order is being cancelled, for example which item is unavailable.",
      );
      return;
    }

    setCancelling(true);

    try {
      const result = await callCancelOrder(cancelTarget.id, reason);
      setCancelTarget(null);
      setCancelReason("");
      await loadOrders(false);

      Alert.alert(
        "Order cancelled",
        result.refundStatus === "not_required"
          ? "The order was not paid, so no refund is needed."
          : result.refundStatus === "failed"
            ? "The order is cancelled, but the refund could not be started. Use 'Retry refund' on the order."
            : "The refund has been started.",
      );
    } catch (error) {
      Alert.alert("Couldn't cancel the order", errorText(error));
    } finally {
      setCancelling(false);
    }
  };

  const retryRefund = async (order: AdminOrder) => {
    setSavingOrderId(order.id);

    try {
      const result = await callCancelOrder(
        order.id,
        order.cancellationReason ?? "Retrying refund",
      );
      Alert.alert(
        "Refund",
        result.refundStatus === "failed"
          ? "The refund failed again. Check the Paystack dashboard."
          : "The refund has been started.",
      );
      await loadOrders(false);
    } catch (error) {
      Alert.alert("Couldn't retry the refund", errorText(error));
    } finally {
      setSavingOrderId(null);
    }
  };

  const retryPayouts = (order: AdminOrder) => {
    Alert.alert(
      "Retry restaurant payout",
      "Check the Paystack dashboard first, so the restaurant is not paid twice. Retry now?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Retry",
          onPress: () => {
            void (async () => {
              setSavingOrderId(order.id);

              try {
                const { data, error } = await supabase.functions.invoke(
                  "arrive-at-pickup",
                  { body: { orderId: order.id, action: "retry" } },
                );

                if (error)
                  throw new Error(await getFunctionErrorMessage(error));
                if (data?.error) throw new Error(data.error);

                Alert.alert(
                  "Payout retried",
                  "Check the order again in a moment for the new status.",
                );
                await loadOrders(false);
              } catch (error) {
                Alert.alert("Couldn't retry the payout", errorText(error));
              } finally {
                setSavingOrderId(null);
              }
            })();
          },
        },
      ],
    );
  };

  // Don't send a rider to an order the customer hasn't paid for.
  const requestAssign = (order: AdminOrder) => {
    if (!isUnpaid(order)) {
      setPickerOrder(order);
      return;
    }

    Alert.alert(
      "Order not paid",
      `This order isn't marked as paid (payment: ${order.paymentStatus}). Assign a rider anyway?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Assign anyway", onPress: () => setPickerOrder(order) },
      ],
    );
  };

  const isPaid = (order: AdminOrder) =>
    order.paymentStatus?.toLowerCase() === "paid";

  const isClosed = (order: AdminOrder) =>
    CLOSED_STATUSES.includes(order.status.toLowerCase());

  const needsConfirmation = (order: AdminOrder) =>
    isPaid(order) && !order.adminConfirmedAt && !isClosed(order);

  const needsRider = (order: AdminOrder) =>
    order.riderId === null &&
    order.adminConfirmedAt !== null &&
    !isClosed(order) &&
    !isUnpaid(order);

  const confirmCount = orders.filter(needsConfirmation).length;
  const unassignedCount = orders.filter(needsRider).length;

  const visibleOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "assigned") return order.riderId !== null;
    if (filter === "confirm") return needsConfirmation(order);
    return needsRider(order);
  });

  const filters: { id: Filter; label: string }[] = [
    { id: "confirm", label: `Needs confirmation (${confirmCount})` },
    { id: "unassigned", label: `Needs rider (${unassignedCount})` },
    { id: "assigned", label: "Assigned" },
    { id: "all", label: "All" },
  ];

  if (loading) {
    return (
      <View className="items-center py-16">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-4 text-sm text-gray-500">Loading orders...</Text>
      </View>
    );
  }

  return (
    <View>
      {showNewOrderBanner ? (
        <View className="mb-3 flex-row items-center rounded-xl bg-green-50 p-3">
          <Ionicons name="notifications-outline" size={18} color="#16A34A" />
          <Text className="ml-2 text-sm font-semibold text-green-700">
            New order received
          </Text>
        </View>
      ) : null}

      {adminProblem ? (
        <View className="mb-4 rounded-xl bg-amber-50 p-4">
          <Text accessibilityRole="alert" className="text-sm text-amber-800">
            {adminProblem}
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View className="mb-4 rounded-xl bg-red-50 p-4">
          <Text accessibilityRole="alert" className="text-sm text-red-700">
            {errorMessage}
          </Text>
          <Pressable
            onPress={() => void loadOrders()}
            className="mt-3 self-start rounded-lg bg-red-600 px-4 py-2"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : null}

      {/* Filters + refresh */}
      <View className="mb-4 flex-row items-center justify-between">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          {filters.map((item) => {
            const active = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFilter(item.id)}
                className={`mr-2 rounded-full px-4 py-2 ${
                  active ? "bg-red-600" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? "text-white" : "text-gray-700"
                  }`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          accessibilityLabel="Refresh orders"
          onPress={() => void loadOrders(false)}
          className="ml-2 h-9 w-9 items-center justify-center"
        >
          <Ionicons name="refresh-outline" size={20} color="#E53935" />
        </Pressable>
      </View>

      {visibleOrders.length === 0 ? (
        <View className="items-center rounded-2xl border border-gray-200 bg-white p-6">
          <Ionicons name="receipt-outline" size={30} color="#E53935" />
          <Text className="mt-3 text-base font-bold text-gray-900">
            {filter === "unassigned"
              ? "No orders waiting for a rider"
              : "No orders here"}
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-gray-500">
            {orders.length === 0
              ? "If customers have placed orders but nothing shows up, this account probably isn't registered as an admin yet. See supabase-admin-setup.sql."
              : "Try another filter above."}
          </Text>
        </View>
      ) : (
        visibleOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            rider={order.riderId ? ridersById.get(order.riderId) : undefined}
            saving={savingOrderId === order.id}
            onAssign={() => requestAssign(order)}
            onChangeStatus={(status) => void updateStatus(order, status)}
            onCancel={() => {
              setCancelReason("");
              setCancelTarget(order);
            }}
            onRetryRefund={() => void retryRefund(order)}
            onRetryPayouts={() => retryPayouts(order)}
            onSendToRider={() => {
              const rider = order.riderId
                ? ridersById.get(order.riderId)
                : undefined;
              if (rider)
                chooseSendMethod(order, rider, `Send to ${rider.name}`);
            }}
            onConfirm={() => confirmOrder(order)}
          />
        ))
      )}

      {/* Cancel order */}
      <Modal
        visible={cancelTarget !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!cancelling) setCancelTarget(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-white px-5 pb-8 pt-5">
            <Text className="text-lg font-bold text-gray-900">
              Cancel this order?
            </Text>
            <Text className="mt-2 text-sm leading-5 text-gray-600">
              {cancelTarget && !isUnpaid(cancelTarget)
                ? `The customer will be refunded ${formatMoney(cancelTarget.total)} in full, including delivery and service fees. The rider is not paid.`
                : "This order isn't paid, so no refund is needed."}
            </Text>

            <Text className="mb-1 mt-4 text-xs font-semibold text-gray-500">
              Reason (the customer will see it)
            </Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              editable={!cancelling}
              multiline
              placeholder="e.g. Jollof rice is finished at the restaurant"
              placeholderTextColor="#9CA3AF"
              className="min-h-[80px] rounded-xl border border-gray-200 px-3 py-3 text-gray-900"
            />

            <View className="mt-5 flex-row">
              <Pressable
                onPress={() => setCancelTarget(null)}
                disabled={cancelling}
                className="mr-2 flex-1 items-center rounded-xl bg-gray-100 py-3"
              >
                <Text className="text-sm font-bold text-gray-700">
                  Keep order
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void confirmCancel()}
                disabled={cancelling}
                className={`flex-1 items-center rounded-xl bg-red-600 py-3 ${
                  cancelling ? "opacity-60" : ""
                }`}
              >
                {cancelling ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-bold text-white">
                    Cancel and refund
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rider picker */}
      <Modal
        visible={pickerOrder !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerOrder(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[70%] rounded-t-3xl bg-white px-5 pb-8 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                Choose a rider
              </Text>
              <Pressable
                accessibilityLabel="Close"
                onPress={() => setPickerOrder(null)}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="close" size={22} color="#171717" />
              </Pressable>
            </View>

            {riderList.length === 0 ? (
              <Text className="py-6 text-center text-sm text-gray-500">
                No riders yet. Add riders in the Riders tab first.
              </Text>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {riderList.map((rider) => {
                  const current = pickerOrder?.riderId === String(rider.id);

                  return (
                    <Pressable
                      key={String(rider.id)}
                      onPress={() => {
                        if (pickerOrder) void assignRider(pickerOrder, rider);
                      }}
                      className={`mb-2 flex-row items-center rounded-xl border p-4 ${
                        current
                          ? "border-red-600 bg-red-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <Ionicons
                        name="bicycle-outline"
                        size={20}
                        color="#E53935"
                      />
                      <View className="ml-3 flex-1">
                        <Text className="text-sm font-bold text-gray-900">
                          {rider.name}
                        </Text>
                        <Text className="mt-0.5 text-xs text-gray-500">
                          {rider.phone ?? "No phone number"}
                        </Text>
                      </View>
                      {current ? (
                        <Text className="text-xs font-bold text-red-600">
                          Current
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
