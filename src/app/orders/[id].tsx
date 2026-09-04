import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useCart();

  const order = orders.find((item) => item.id === id);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="receipt-outline" size={50} color="#E53935" />

        <Text className="mt-4 text-xl font-bold text-text">
          Order not found
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // FORMAT ORDER DATE AND TIME
  const orderDate = new Date(order.createdAt);

  const formattedDate = orderDate.toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = orderDate.toLocaleTimeString("en-GH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <View className="ml-3">
          <Text className="text-xl font-bold text-text">Order Details</Text>

          <Text className="text-xs text-textSecondary">{order.id}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {/* RESTAURANT */}
        <View className="mt-4 rounded-2xl border border-border bg-white p-4">
          <Text className="text-lg font-bold text-text">
            {order.restaurantName}
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            Order #{order.id}
          </Text>

          {/* DATE & TIME */}
          <View className="mt-3 flex-row items-center">
            <Ionicons name="calendar-outline" size={15} color="#737373" />

            <Text className="ml-1.5 text-xs text-textSecondary">
              {formattedDate}
            </Text>

            <Ionicons
              name="time-outline"
              size={15}
              color="#737373"
              style={{ marginLeft: 16 }}
            />

            <Text className="ml-1.5 text-xs text-textSecondary">
              {formattedTime}
            </Text>
          </View>
        </View>

        {/* STATUS */}
        <View className="mt-5 rounded-2xl bg-surface p-4">
          <Text className="text-base font-bold text-text">Order Status</Text>

          <View className="mt-4 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />
            </View>

            <View className="ml-3">
              <Text className="text-base font-bold capitalize text-text">
                {order.status.replace(/_/g, " ")}
              </Text>

              <Text className="mt-1 text-xs text-textSecondary">
                We are processing your order.
              </Text>
            </View>
          </View>
        </View>

        {/* ITEMS */}
        <View className="mt-6">
          <Text className="text-lg font-bold text-text">Items</Text>

          {order.items.map((item) => (
            <View
              key={`${order.id}-${item.id}`}
              className="mt-4 flex-row items-center border-b border-border pb-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                <Text className="text-sm font-bold text-primary">
                  {item.quantity}x
                </Text>
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-text">
                  {item.name}
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  GH₵{item.price.toFixed(2)} each
                </Text>
              </View>

              <Text className="text-sm font-bold text-text">
                GH₵{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ORDER SUMMARY */}
        <View className="mt-6 rounded-2xl border border-border p-4">
          {/* SUBTOTAL */}
          <View className="flex-row justify-between">
            <Text className="text-sm text-textSecondary">Subtotal</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.subtotal.toFixed(2)}
            </Text>
          </View>

          {/* DELIVERY FEE */}
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Delivery Fee</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.deliveryFee.toFixed(2)}
            </Text>
          </View>

          {/* SERVICE FEE */}
          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Service Fee</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.serviceFee.toFixed(2)}
            </Text>
          </View>

          {/* DIVIDER */}
          <View className="my-4 border-t border-border" />

          {/* TOTAL */}
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Total</Text>

            <Text className="text-base font-bold text-primary">
              GH₵{order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* TRACK ORDER */}
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/order-tracking",
              params: {
                orderId: order.id,
              },
            })
          }
          className="mt-6 h-14 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Track Order</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
