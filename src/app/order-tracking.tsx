import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{
    orderId?: string;
  }>();

  const { orders } = useCart();

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="receipt-outline" size={50} color="#E53935" />

        <Text className="mt-4 text-xl font-bold text-text">
          Order not found
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

  const placedActive = true;

  const preparingActive =
    status === "confirmed" ||
    status === "preparing" ||
    status === "ready" ||
    status === "picked_up" ||
    status === "on_the_way" ||
    status === "delivered";

  const onTheWayActive =
    status === "picked_up" || status === "on_the_way" || status === "delivered";

  const deliveredActive = status === "delivered";

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="ml-3">
            <Text className="text-xl font-bold text-text">Track Order</Text>

            <Text className="text-xs text-textSecondary">#{order.id}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        {/* CURRENT STATUS */}
        <View className="mt-3">
          <Text className="text-lg font-bold capitalize text-primary">
            {status.replace(/_/g, " ")}
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            {order.restaurantName} is processing your order.
          </Text>
        </View>

        {/* PROGRESS TRACKER */}
        <View className="mt-7 rounded-2xl border border-border bg-white p-5">
          <View className="flex-row items-center justify-between">
            <StatusStep
              icon="receipt-outline"
              label="Placed"
              active={placedActive}
            />

            <View
              className={`h-[2px] flex-1 ${
                preparingActive ? "bg-primary" : "bg-border"
              }`}
            />

            <StatusStep
              icon="restaurant-outline"
              label="Preparing"
              active={preparingActive}
            />

            <View
              className={`h-[2px] flex-1 ${
                onTheWayActive ? "bg-primary" : "bg-border"
              }`}
            />

            <StatusStep
              icon="bicycle-outline"
              label="On the way"
              active={onTheWayActive}
            />

            <View
              className={`h-[2px] flex-1 ${
                deliveredActive ? "bg-primary" : "bg-border"
              }`}
            />

            <StatusStep
              icon="checkmark-circle-outline"
              label="Delivered"
              active={deliveredActive}
            />
          </View>
        </View>

        {/* ESTIMATED TIME */}
        <View className="mt-6 rounded-2xl bg-surface p-5">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white">
              <Ionicons name="time-outline" size={23} color="#E53935" />
            </View>

            <View className="ml-3">
              <Text className="text-xs text-textSecondary">
                Estimated delivery
              </Text>

              <Text className="mt-1 text-base font-bold text-text">
                20–30 min
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
                  {order.restaurantName}
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Order #{order.id}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ORDER DETAILS */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">
            Order Details
          </Text>

          <View className="rounded-xl border border-border p-4">
            {order.items.map((item) => (
              <View
                key={`${order.id}-${item.id}`}
                className="mb-4 flex-row items-center"
              >
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-surface">
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

                <Text className="text-xs font-semibold text-text">
                  GH₵
                  {(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ORDER TOTAL */}
        <View className="mt-6 rounded-xl border border-border p-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-textSecondary">Subtotal</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.subtotal.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Delivery Fee</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Service Fee</Text>

            <Text className="text-sm font-semibold text-text">
              GH₵{order.serviceFee.toFixed(2)}
            </Text>
          </View>

          <View className="my-4 border-t border-border" />

          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Total</Text>

            <Text className="text-base font-bold text-primary">
              GH₵{order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* VIEW ORDERS */}
        <Pressable
          onPress={() => router.replace("/(tabs)/orders")}
          className="mt-6 h-14 items-center justify-center rounded-xl border border-primary bg-white"
        >
          <Text className="font-bold text-primary">View My Orders</Text>
        </Pressable>
      </ScrollView>

      {/* CONTACT RIDER */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable className="h-14 flex-row items-center justify-center rounded-xl bg-primary">
          <Ionicons name="call-outline" size={18} color="#FFFFFF" />

          <Text className="ml-2 text-sm font-bold text-white">
            Contact Rider
          </Text>
        </Pressable>
      </View>
    </View>
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
    <View className="w-16 items-center">
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
