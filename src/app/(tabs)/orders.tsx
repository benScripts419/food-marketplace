import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";

export default function OrdersScreen() {
  const { orders } = useCart();

  /*
   * EMPTY ORDERS
   */
  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-white px-5 pt-6">
        <Text className="text-2xl font-bold text-text">My Orders</Text>

        <View className="mt-10 items-center">
          <Text className="text-5xl">🛍️</Text>

          <Text className="mt-4 text-lg font-bold text-text">
            No orders yet
          </Text>

          <Text className="mt-2 text-center text-sm text-textSecondary">
            Your food orders will appear here.
          </Text>

          <Pressable
            onPress={() => router.push("/restaurants")}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">Browse Restaurants</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  /*
   * ORDERS
   */
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-6">
        <Text className="text-2xl font-bold text-text">My Orders</Text>

        <Text className="mt-1 text-sm text-textSecondary">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() =>
              router.push({
                pathname: "/orders/[id]",
                params: {
                  id: order.id,
                },
              })
            }
            className="mb-5 rounded-2xl border border-border bg-white p-4"
          >
            {/* ORDER HEADER */}
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className="text-base font-bold text-text">
                  {order.restaurantName}
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Order #{order.id}
                </Text>
              </View>

              {/* STATUS */}
              <View className="rounded-full bg-orange-50 px-3 py-1">
                <Text className="text-xs font-semibold capitalize text-orange-600">
                  {order.status.replace(/_/g, " ")}
                </Text>
              </View>
            </View>

            {/* ITEMS */}
            <View className="mt-4 border-t border-border pt-3">
              {order.items.map((item) => (
                <View
                  key={`${order.id}-${item.id}`}
                  className="mb-2 flex-row justify-between"
                >
                  <Text
                    className="mr-3 flex-1 text-sm text-text"
                    numberOfLines={1}
                  >
                    {item.quantity} × {item.name}
                  </Text>

                  <Text className="text-sm font-semibold text-text">
                    GH₵
                    {(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* ORDER FOOTER */}
            <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
              <View>
                <Text className="text-xs text-textSecondary">Total</Text>

                <Text className="mt-1 text-base font-bold text-primary">
                  GH₵{order.total.toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className="mr-1 text-sm font-semibold text-primary">
                  View Order
                </Text>

                <Ionicons name="chevron-forward" size={18} color="#E53935" />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
