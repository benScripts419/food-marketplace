import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const completedOrders = {
  "1001": {
    id: "1001",
    restaurant: "Mama's Kitchen",
    customer: "Customer",
    address: "Akropong, Ghana",
    items: "Jollof Rice with Chicken × 2",
    earnings: "GH₵15.00",
    completedAt: "Today, 12:45 PM",
  },

  "1002": {
    id: "1002",
    restaurant: "Pizzamania",
    customer: "Customer",
    address: "Akuapem, Ghana",
    items: "Pepperoni Pizza × 1",
    earnings: "GH₵20.00",
    completedAt: "Today, 1:20 PM",
  },
};

export default function DeliveryCompletedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const order =
    completedOrders[id as keyof typeof completedOrders] ??
    completedOrders["1001"];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 120,
        }}
      >
        {/* SUCCESS HEADER */}
        <View className="items-center px-5 pt-24">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success">
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>
          </View>

          <Text className="mt-6 text-2xl font-extrabold text-text">
            Delivery Completed!
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
            Order #{order.id} has been successfully delivered to the customer.
          </Text>
        </View>

        {/* EARNINGS */}
        <View className="mx-5 mt-8 rounded-2xl bg-primary p-6">
          <View className="items-center">
            <Text className="text-sm text-white">You earned</Text>

            <Text className="mt-1 text-4xl font-extrabold text-white">
              {order.earnings}
            </Text>

            <Text className="mt-1 text-xs text-white">Delivery fee</Text>
          </View>
        </View>

        {/* DELIVERY SUMMARY */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery summary</Text>

          {/* ORDER */}
          <View className="mt-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="receipt-outline" size={20} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-textSecondary">ORDER</Text>

              <Text className="mt-1 font-semibold text-text">#{order.id}</Text>
            </View>
          </View>

          {/* RESTAURANT */}
          <View className="mt-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="restaurant-outline" size={20} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-textSecondary">RESTAURANT</Text>

              <Text className="mt-1 font-semibold text-text">
                {order.restaurant}
              </Text>
            </View>
          </View>

          {/* CUSTOMER */}
          <View className="mt-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="person-outline" size={20} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-textSecondary">CUSTOMER</Text>

              <Text className="mt-1 font-semibold text-text">
                {order.customer}
              </Text>

              <Text className="mt-1 text-xs text-textSecondary">
                {order.address}
              </Text>
            </View>
          </View>

          {/* ITEMS */}
          <View className="mt-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="fast-food-outline" size={20} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-textSecondary">ITEMS</Text>

              <Text className="mt-1 font-semibold text-text">
                {order.items}
              </Text>
            </View>
          </View>

          {/* TIME */}
          <View className="mt-5 flex-row items-center">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="time-outline" size={20} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs text-textSecondary">COMPLETED</Text>

              <Text className="mt-1 font-semibold text-text">
                {order.completedAt}
              </Text>
            </View>
          </View>
        </View>

        {/* SUCCESS MESSAGE */}
        <View className="mx-5 mt-5 rounded-2xl bg-green-50 p-5">
          <View className="flex-row">
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#16A34A"
            />

            <Text className="ml-3 flex-1 text-sm leading-5 text-green-700">
              Great job! The delivery has been recorded and your earnings have
              been added to your rider account.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM ACTIONS */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={() => router.push("/rider/orders")}
          className="h-14 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="text-base font-bold text-white">
            Find Another Delivery
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("../rider")}
          className="mt-3 h-12 items-center justify-center"
        >
          <Text className="font-semibold text-primary">Back to Rider Home</Text>
        </Pressable>
      </View>
    </View>
  );
}
