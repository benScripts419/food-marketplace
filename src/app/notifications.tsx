import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useCart } from "@/context/CartContext";

const READ_NOTIFICATIONS_STORAGE_KEY = "@akrobite_read_notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  destination: () => void;
};

function formatOrderTime(createdAt: string) {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return "Order update";

  const elapsed = Math.max(0, Date.now() - createdDate.getTime());
  const elapsedMinutes = Math.floor(elapsed / 60_000);
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min${elapsedMinutes === 1 ? "" : "s"} ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) {
    return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
  }

  return createdDate.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
  });
}

type OrderLike = {
  status: string;
  cancellationReason: string | null;
  refundStatus: string | null;
  paymentStatus: string | null;
  adminConfirmed: boolean;
};

// Paid, but the admin hasn't confirmed it with the restaurant yet.
function isAwaitingConfirmation(order: OrderLike) {
  return (
    order.paymentStatus === "paid" &&
    !order.adminConfirmed &&
    ["pending", "confirmed"].includes(order.status)
  );
}

function getOrderMessage(order: OrderLike) {
  if (order.status === "cancelled") {
    const reason = order.cancellationReason
      ? ` Reason: ${order.cancellationReason}.`
      : "";

    switch (order.refundStatus) {
      case "refunded":
      case "processed":
        return `This order was cancelled.${reason} Your full refund has been sent to your original payment method.`;
      case "pending":
      case "processing":
        return `This order was cancelled.${reason} Your full refund is being processed.`;
      case "failed":
        return `This order was cancelled.${reason} The automatic refund could not be completed. Please contact AkroBite support.`;
      case "not_required":
        return `This order was cancelled.${reason} You were not charged.`;
      default:
        return `This order was cancelled.${reason} Tap to view its details.`;
    }
  }

  if (isAwaitingConfirmation(order)) {
    return "We've received your payment and are confirming your order with the restaurant. We'll let you know as soon as it's confirmed.";
  }

  switch (order.status) {
    case "pending":
      return "Your order has been received and is waiting for payment.";
    case "confirmed":
      return "Your order has been confirmed with the restaurant.";
    case "accepted":
      return "A rider has accepted your order.";
    case "preparing":
      return "The restaurant is preparing your food.";
    case "ready":
      return "Your order is ready for pickup by the rider.";
    case "arrived_at_pickup":
      return "Your rider has arrived at the restaurant.";
    case "picked_up":
    case "on_the_way":
      return "Your rider has picked up your order. Open the live tracking map.";
    case "delivered":
      return "Your order has been delivered. We hope you enjoy it.";
    default:
      return "There is an update on your order. Tap to view its details.";
  }
}

function getOrderIcon(status: string): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case "pending":
      return "time-outline";
    case "confirmed":
      return "checkmark-circle-outline";
    case "preparing":
      return "restaurant-outline";
    case "ready":
      return "bag-check-outline";
    case "picked_up":
    case "on_the_way":
      return "bicycle-outline";
    case "accepted":
    case "arrived_at_pickup":
      return "bicycle-outline";
    case "delivered":
      return "checkmark-done-circle-outline";
    case "cancelled":
      return "close-circle-outline";
    default:
      return "notifications-outline";
  }
}

export default function NotificationsScreen() {
  const { orders, refreshOrders } = useCart();
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [loadingReadState, setLoadingReadState] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refreshOrders();
    }, [refreshOrders]),
  );

  useEffect(() => {
    let mounted = true;

    const loadReadState = async () => {
      try {
        const storedReadIds = await AsyncStorage.getItem(
          READ_NOTIFICATIONS_STORAGE_KEY,
        );
        if (!storedReadIds) return;

        const parsedIds: unknown = JSON.parse(storedReadIds);
        if (
          !Array.isArray(parsedIds) ||
          !parsedIds.every((id): id is string => typeof id === "string")
        ) {
          throw new Error("Saved notification state is invalid.");
        }

        if (mounted) setReadNotificationIds(parsedIds);
      } catch (error) {
        console.error("Could not load notification read state:", error);
        if (mounted) {
          setStorageError("Read status could not be loaded on this device.");
        }
      } finally {
        if (mounted) setLoadingReadState(false);
      }
    };

    void loadReadState();
    return () => {
      mounted = false;
    };
  }, []);

  const notifications = useMemo<Notification[]>(() => {
    const staticNotifications: Notification[] = [
      {
        id: "welcome",
        title: "Welcome to AkroBite",
        message: "Explore restaurants and find your next favourite meal.",
        time: "Getting started",
        icon: "restaurant-outline",
        destination: () => router.push("/restaurants"),
      },
      {
        id: "delivery-location",
        title: "Set your delivery location",
        message:
          "Choose a drop-off point so your rider can find you and deliver your order.",
        time: "Delivery tip",
        icon: "location-outline",
        destination: () => router.push("/location"),
      },
    ];

    const orderNotifications: Notification[] = orders
      .slice(0, 10)
      .map((order) => ({
        // The id includes the confirmation and refund state, so a change shows
        // up as a new unread notification.
        id: `order:${order.id}:${order.status}:${
          order.adminConfirmed ? "confirmed" : "waiting"
        }:${order.refundStatus ?? ""}`,
        title:
          order.status === "cancelled"
            ? "Order cancelled"
            : isAwaitingConfirmation(order)
              ? `${order.restaurantName}: awaiting confirmation`
              : `${order.restaurantName}: ${order.status.replace(/_/g, " ")}`,
        message: getOrderMessage(order),
        time: formatOrderTime(order.createdAt),
        icon: getOrderIcon(
          isAwaitingConfirmation(order) ? "pending" : order.status,
        ),
        destination: () =>
          router.push({
            pathname: "/orders/[id]",
            params: { id: order.id },
          }),
      }));

    return [...orderNotifications, ...staticNotifications];
  }, [orders]);

  const unreadCount = notifications.filter(
    (notification) => !readNotificationIds.includes(notification.id),
  ).length;

  const markAsRead = async (notificationId: string) => {
    if (readNotificationIds.includes(notificationId)) return;

    const nextReadIds = [...readNotificationIds, notificationId];
    setReadNotificationIds(nextReadIds);
    setStorageError(null);

    try {
      await AsyncStorage.setItem(
        READ_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(nextReadIds),
      );
    } catch (error) {
      console.error("Could not save notification read state:", error);
      setStorageError("Read status could not be saved on this device.");
    }
  };

  const markAllAsRead = async () => {
    const nextReadIds = [
      ...new Set([
        ...readNotificationIds,
        ...notifications.map((notification) => notification.id),
      ]),
    ];
    setReadNotificationIds(nextReadIds);
    setStorageError(null);

    try {
      await AsyncStorage.setItem(
        READ_NOTIFICATIONS_STORAGE_KEY,
        JSON.stringify(nextReadIds),
      );
    } catch (error) {
      console.error("Could not mark all notifications as read:", error);
      setStorageError("Read status could not be saved on this device.");
    }
  };

  const openNotification = (notification: Notification) => {
    void markAsRead(notification.id);
    notification.destination();
  };

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center px-5 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <View className="ml-3 flex-1">
          <Text className="text-xl font-bold text-text">Notifications</Text>
          <Text className="mt-0.5 text-xs text-textSecondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <Pressable
            onPress={() => void markAllAsRead()}
            disabled={loadingReadState}
            className="px-2 py-2"
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
          >
            <Text className="text-xs font-bold text-primary">
              Mark all read
            </Text>
          </Pressable>
        ) : null}
      </View>

      {storageError ? (
        <Text
          accessibilityRole="alert"
          className="mx-5 mb-3 text-xs text-primary"
        >
          {storageError}
        </Text>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {notifications.map((notification) => {
          const unread = !readNotificationIds.includes(notification.id);

          return (
            <Pressable
              key={notification.id}
              onPress={() => openNotification(notification)}
              accessibilityRole="button"
              accessibilityLabel={`${notification.title}. ${notification.message}`}
              accessibilityHint="Opens the related screen and marks this notification as read."
              className={`mb-3 flex-row rounded-2xl border border-border p-4 ${
                unread ? "bg-red-50" : "bg-white"
              }`}
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
                <Ionicons name={notification.icon} size={21} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 text-sm font-bold capitalize text-text">
                    {notification.title}
                  </Text>
                  {unread ? (
                    <View
                      className="ml-2 h-2.5 w-2.5 rounded-full bg-primary"
                      accessibilityLabel="Unread"
                    />
                  ) : null}
                </View>

                <Text className="mt-1 text-sm leading-5 text-textSecondary">
                  {notification.message}
                </Text>

                <View className="mt-2 flex-row items-center justify-between">
                  <Text className="text-xs text-textSecondary">
                    {notification.time}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#737373" />
                </View>
              </View>
            </Pressable>
          );
        })}

        {loadingReadState ? (
          <ActivityIndicator
            className="mt-2"
            color="#E53935"
            accessibilityLabel="Loading notification read status"
          />
        ) : null}
      </ScrollView>
    </View>
  );
}
