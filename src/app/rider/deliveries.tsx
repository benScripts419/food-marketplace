import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const deliveries = [
  {
    id: "1",
    restaurant: "Mama's Kitchen",
    customer: "Customer",
    pickup: "East Legon",
    dropoff: "15 Third Close, East Legon",
    distance: "3.2 km",
    fee: "GH₵15.00",
  },
  {
    id: "2",
    restaurant: "Pizzamania",
    customer: "Customer",
    pickup: "Akropong",
    dropoff: "Main Street",
    distance: "4.5 km",
    fee: "GH₵18.00",
  },
];

export default function RiderDeliveriesScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={21} color="#171717" />
          </Pressable>

          <View>
            <Text className="text-2xl font-bold text-text">
              Available Deliveries
            </Text>

            <Text className="mt-1 text-sm text-textSecondary">
              Choose a delivery request
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
      >
        {deliveries.map((delivery) => (
          <View
            key={delivery.id}
            className="mb-4 rounded-2xl border border-border bg-white p-4"
          >
            <View className="flex-row items-center">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                <Ionicons name="restaurant-outline" size={22} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">
                  {delivery.restaurant}
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  New delivery request
                </Text>
              </View>

              <Text className="font-bold text-primary">{delivery.fee}</Text>
            </View>

            <View className="mt-4">
              <View className="flex-row items-center">
                <Ionicons name="location" size={17} color="#E53935" />

                <Text className="ml-2 text-sm text-text">
                  Pickup: {delivery.pickup}
                </Text>
              </View>

              <View className="my-2 ml-2 h-4 border-l border-border" />

              <View className="flex-row items-center">
                <Ionicons name="navigate" size={17} color="#E53935" />

                <Text className="ml-2 flex-1 text-sm text-text">
                  Drop-off: {delivery.dropoff}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">
                Distance: {delivery.distance}
              </Text>

              <Pressable
                onPress={() => router.push("/rider/active-delivery")}
                className="rounded-xl bg-primary px-5 py-3"
              >
                <Text className="font-bold text-white">Accept</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
