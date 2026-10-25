import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { goBack } from "@/lib/goBack";
import { supabase } from "@/lib/supabase";

type DeliveryRequest = {
  id: string;
  earnings: number;
  isDeliveryRequest: boolean;
  title: string;
  subtitle: string | null;
  itemCount: number;
};

export default function RiderOrdersScreen() {
  const [orders, setOrders] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, restaurant_id, restaurant, order_type, pickup_town, item_count, rider_payout_fee, status",
      )
      .eq("payment_status", "paid")
      .in("status", ["pending", "confirmed", "ready"])
      .is("rider_id", null)
      .not("admin_confirmed_at", "is", null)
      .order("created_at", { ascending: true });

    if (ordersError) {
      console.error("Failed to load delivery requests:", ordersError);
      setError("Unable to load delivery requests. Please try again.");
      setLoading(false);
      return;
    }

    // Hide orders this rider has declined.
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    let declinedIds = new Set<string>();
    if (currentUser) {
      const { data: declinedRows } = await supabase
        .from("rider_order_declines")
        .select("order_id")
        .eq("rider_id", currentUser.id);

      declinedIds = new Set(
        (declinedRows ?? []).map((row) => String(row.order_id)),
      );
    }

    const rows = (orderRows ?? []).filter(
      (order) => !declinedIds.has(String(order.id)),
    );

    // Restaurants and item counts are only needed for food orders. A delivery
    // request has no restaurant record and no items.
    const foodRows = rows.filter((order) => order.order_type !== "delivery");

    const restaurantIds = [
      ...new Set(
        foodRows
          .map((order) => order.restaurant_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const foodOrderIds = foodRows.map((order) => order.id);

    const [restaurantsResult, itemsResult] = await Promise.all([
      restaurantIds.length > 0
        ? supabase
            .from("restaurants")
            .select("id, name")
            .in("id", restaurantIds)
        : Promise.resolve({ data: [], error: null }),
      foodOrderIds.length > 0
        ? supabase
            .from("order_items")
            .select("order_id")
            .in("order_id", foodOrderIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (restaurantsResult.error || itemsResult.error) {
      const loadError = restaurantsResult.error ?? itemsResult.error;
      console.error("Failed to load delivery request details:", loadError);
      setError("Unable to load delivery request details. Please try again.");
      setLoading(false);
      return;
    }

    const restaurantNames = new Map(
      (restaurantsResult.data ?? []).map((restaurant) => [
        restaurant.id,
        restaurant.name,
      ]),
    );
    const itemCounts = new Map<string, number>();
    for (const item of itemsResult.data ?? []) {
      itemCounts.set(item.order_id, (itemCounts.get(item.order_id) ?? 0) + 1);
    }

    setOrders(
      rows.map((order) => {
        const isDeliveryRequest = order.order_type === "delivery";

        if (isDeliveryRequest) {
          const named =
            order.restaurant && order.restaurant !== "Delivery request"
              ? order.restaurant
              : null;

          return {
            id: order.id,
            earnings: Number(order.rider_payout_fee) || 0,
            isDeliveryRequest: true,
            title: "Delivery request",
            subtitle:
              [order.pickup_town ? `Pickup: ${order.pickup_town}` : null, named]
                .filter(Boolean)
                .join(" · ") || null,
            itemCount: Math.max(1, Number(order.item_count) || 1),
          };
        }

        const title = order.restaurant_id
          ? (restaurantNames.get(order.restaurant_id) ??
            order.restaurant ??
            "Food order")
          : (order.restaurant ?? "Multiple restaurants");

        return {
          id: order.id,
          earnings: Number(order.rider_payout_fee) || 0,
          isDeliveryRequest: false,
          title,
          subtitle: null,
          itemCount: itemCounts.get(order.id) ?? 0,
        };
      }),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14">
        <Pressable
          onPress={() => goBack("/rider/dashboard")}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="mt-4 text-2xl font-bold text-text">
          Delivery Requests
        </Text>
        <Text className="mt-1 text-sm text-textSecondary">
          Choose a paid order to deliver
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}
      >
        {loading ? (
          <ActivityIndicator className="mt-10" color="#E53935" />
        ) : error ? (
          <View className="mt-8 items-center">
            <Text className="text-center text-sm text-textSecondary">
              {error}
            </Text>
            <Pressable onPress={() => void loadOrders()} className="mt-4">
              <Text className="font-bold text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : orders.length === 0 ? (
          <View className="mt-10 items-center">
            <Ionicons name="bicycle-outline" size={42} color="#737373" />
            <Text className="mt-4 text-base font-bold text-text">
              No available deliveries
            </Text>
            <Text className="mt-2 text-center text-sm text-textSecondary">
              Paid orders will appear here when they are ready for a rider.
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <Pressable
              key={order.id}
              onPress={() => router.push(`/rider/order/${order.id}`)}
              className="mb-4 rounded-2xl border border-border bg-white p-5"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-text">
                  Order #{order.id.slice(0, 8)}
                </Text>
                <Text className="font-bold text-primary">
                  GH₵{order.earnings.toFixed(2)}
                </Text>
              </View>

              <Text className="mt-3 font-semibold text-text">
                {order.title}
              </Text>

              {order.subtitle ? (
                <Text className="mt-1 text-xs text-textSecondary">
                  {order.subtitle}
                </Text>
              ) : null}

              <View className="mt-3 flex-row items-center">
                <Ionicons
                  name={
                    order.isDeliveryRequest
                      ? "bag-handle-outline"
                      : "fast-food-outline"
                  }
                  size={17}
                  color="#737373"
                />
                <Text className="ml-2 text-sm text-textSecondary">
                  {order.isDeliveryRequest
                    ? `${order.itemCount} ${order.itemCount === 1 ? "item" : "items"} to collect`
                    : `${order.itemCount} ${order.itemCount === 1 ? "item" : "items"}`}
                </Text>
              </View>

              <Text className="mt-3 text-xs text-success">
                Your earnings: GH₵{order.earnings.toFixed(2)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
