import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const orders = [
  {
    id: "1001",
    restaurant: "Mama's Kitchen",
    customer: "Customer",
    pickup: "Akropong Market",
    delivery: "Akropong",
    earnings: "GH₵15",
    distance: "2.4 km",
  },
  {
    id: "1002",
    restaurant: "Pizzamania",
    customer: "Customer",
    pickup: "Akropong",
    delivery: "Akuapem",
    earnings: "GH₵20",
    distance: "3.8 km",
  },
];

export default function RiderOrdersScreen() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-5 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="mt-4 text-2xl font-bold text-text">
          Delivery Requests
        </Text>

        <Text className="mt-1 text-sm text-textSecondary">
          Choose an order to deliver
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
      >
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => router.push(`../rider/order/${order.id}`)}
            className="mb-4 rounded-2xl border border-border bg-white p-5"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-text">
                Order #{order.id}
              </Text>

              <Text className="font-bold text-primary">{order.earnings}</Text>
            </View>

            <Text className="mt-3 font-semibold text-text">
              {order.restaurant}
            </Text>

            <View className="mt-3 flex-row items-center">
              <Ionicons name="location-outline" size={17} color="#E53935" />

              <Text className="ml-2 text-sm text-textSecondary">
                Pickup: {order.pickup}
              </Text>
            </View>

            <View className="mt-2 flex-row items-center">
              <Ionicons name="navigate-outline" size={17} color="#E53935" />

              <Text className="ml-2 text-sm text-textSecondary">
                Deliver to: {order.delivery}
              </Text>
            </View>

            <View className="mt-3 flex-row items-center">
              <Ionicons name="speedometer-outline" size={16} color="#737373" />

              <Text className="ml-2 text-xs text-textSecondary">
                {order.distance}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
