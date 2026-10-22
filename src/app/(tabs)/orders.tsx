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

import { supabase } from "@/lib/supabase";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  restaurant: string;
  status: string;
  total: number;
  created_at: string | null;
  items: OrderItem[];
};

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
}

function parseItems(value: unknown): OrderItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];

    const row = entry as Record<string, unknown>;
    if (typeof row.name !== "string") return [];

    return [
      {
        id: String(row.id ?? `item-${index}`),
        name: row.name,
        price: toNumber(row.price),
        quantity: Math.max(0, toNumber(row.quantity)),
      },
    ];
  });
}

function formatMoney(value: number) {
  return `GH₵${value.toFixed(2)}`;
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setOrders([]);
        setErrorMessage("Please sign in to view your orders.");
        return;
      }

      const { data: orderRows, error: ordersError } = await supabase
        .from("orders")
        .select("id, restaurant, status, total, created_at")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const rows = orderRows ?? [];

      if (rows.length === 0) {
        setOrders([]);
        setErrorMessage(null);
        return;
      }

      const orderIds = rows.map((row) => String(row.id));

      const { data: itemRows, error: itemsError } = await supabase
        .from("order_items")
        .select("id, order_id, name, price, quantity")
        .in("order_id", orderIds);

      if (itemsError) throw itemsError;

      const itemsByOrder = new Map<string, OrderItem[]>();

      for (const row of itemRows ?? []) {
        const orderKey = String(row.order_id);
        const existing = itemsByOrder.get(orderKey) ?? [];

        existing.push({
          id: String(row.id),
          name: String(row.name),
          price: toNumber(row.price),
          quantity: Math.max(0, toNumber(row.quantity)),
        });

        itemsByOrder.set(orderKey, existing);
      }

      const parsedOrders: Order[] = rows.map((row) => ({
        id: String(row.id),
        restaurant: row.restaurant ?? "Restaurant",
        status: row.status ?? "pending",
        total: toNumber(row.total),
        created_at: row.created_at ?? null,
        items: itemsByOrder.get(String(row.id)) ?? [],
      }));

      setOrders(parsedOrders);
      setErrorMessage(null);
    } catch (error) {
      console.error("Could not load orders:", error);
      setErrorMessage(
        "We couldn't load your orders. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();

    const channel = supabase
      .channel("my-orders-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          void loadOrders(false);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadOrders]);

  const openOrder = (orderId: string) => {
    router.push({
      pathname: "/order-tracking",
      params: { orderId },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-4 text-sm text-textSecondary">
          Loading your orders...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pb-4 pt-6">
        <Text className="text-2xl font-bold text-text">My Orders</Text>
        <Text className="mt-1 text-sm text-textSecondary">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </Text>
      </View>

      {errorMessage ? (
        <View className="mx-5 mt-2 rounded-xl bg-red-50 p-4">
          <Text accessibilityRole="alert" className="text-sm text-red-700">
            {errorMessage}
          </Text>

          <Pressable
            onPress={() => void loadOrders()}
            className="mt-3 self-start rounded-lg bg-primary px-4 py-2"
          >
            <Text className="font-semibold text-white">Try again</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View className="mt-10 items-center px-5">
          <Text className="text-5xl">🛍️</Text>
          <Text className="mt-4 text-lg font-bold text-text">
            No orders yet
          </Text>
          <Text className="mt-2 text-center text-sm text-textSecondary">
            Your saved food orders will appear here.
          </Text>

          <Pressable
            onPress={() => router.push("/restaurants")}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">Browse Restaurants</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 100,
          }}
          onScrollBeginDrag={() => {
            // Refreshing is also available from the button below.
          }}
        >
          <Pressable
            onPress={() => {
              setRefreshing(true);
              void loadOrders(false);
            }}
            className="mb-4 self-end flex-row items-center"
          >
            <Ionicons name="refresh-outline" size={17} color="#E53935" />
            <Text className="ml-1 text-sm font-semibold text-primary">
              Refresh orders
            </Text>
          </Pressable>

          {refreshing ? (
            <Text className="mb-3 text-center text-xs text-textSecondary">
              Updating orders...
            </Text>
          ) : null}

          {orders.map((order) => (
            <Pressable
              key={order.id}
              accessibilityRole="button"
              accessibilityLabel={`Track order ${order.id}`}
              onPress={() => openOrder(order.id)}
              className="mb-5 rounded-2xl border border-border bg-white p-4"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-text">
                    {order.restaurant}
                  </Text>
                  <Text className="mt-1 text-xs text-textSecondary">
                    Order #{order.id}
                  </Text>
                  {order.created_at ? (
                    <Text className="mt-1 text-xs text-textSecondary">
                      {new Date(order.created_at).toLocaleDateString("en-GH")}
                    </Text>
                  ) : null}
                </View>

                <View className="rounded-full bg-orange-50 px-3 py-1">
                  <Text className="text-xs font-semibold capitalize text-orange-600">
                    {order.status.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>

              <View className="mt-4 border-t border-border pt-3">
                {order.items.length === 0 ? (
                  <Text className="text-sm text-textSecondary">
                    Item details unavailable
                  </Text>
                ) : (
                  order.items.map((item) => (
                    <View
                      key={`${order.id}-${item.id}`}
                      className="mb-2 flex-row justify-between"
                    >
                      <Text
                        numberOfLines={1}
                        className="mr-3 flex-1 text-sm text-text"
                      >
                        {item.quantity} × {item.name}
                      </Text>

                      <Text className="text-sm font-semibold text-text">
                        {formatMoney(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))
                )}
              </View>

              <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
                <View>
                  <Text className="text-xs text-textSecondary">Total</Text>
                  <Text className="mt-1 text-base font-bold text-primary">
                    {formatMoney(order.total)}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Text className="mr-1 text-sm font-semibold text-primary">
                    Track Order
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#E53935" />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
