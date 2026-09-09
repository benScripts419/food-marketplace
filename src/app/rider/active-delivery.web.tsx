import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

type Delivery = {
  id: string;
  restaurant: string;
  restaurantAddress: string;
  customerAddress: string;
  items: string;
  earnings: string;
  distanceToRestaurant: string;
  distanceToCustomer: string;
  restaurantTime: string;
  customerTime: string;
};

const deliveries: Record<string, Delivery> = {
  "1001": {
    id: "1001",
    restaurant: "Mama's Kitchen",
    restaurantAddress: "Akropong Market",
    customerAddress: "Akropong, Ghana",
    items: "Jollof Rice with Chicken x 2",
    earnings: "GH₵15.00",
    distanceToRestaurant: "1.2 km",
    distanceToCustomer: "2.4 km",
    restaurantTime: "5-8 min",
    customerTime: "10-15 min",
  },
  "1002": {
    id: "1002",
    restaurant: "Pizzamania",
    restaurantAddress: "Akropong",
    customerAddress: "Akuapem, Ghana",
    items: "Pepperoni Pizza x 1",
    earnings: "GH₵20.00",
    distanceToRestaurant: "1.5 km",
    distanceToCustomer: "3.8 km",
    restaurantTime: "5-10 min",
    customerTime: "15-20 min",
  },
};

export default function ActiveDeliveryWebScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const delivery = deliveries[id as string] ?? deliveries["1001"];

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="relative h-[260px] w-full items-center justify-center bg-surface px-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-white">
            <Ionicons name="map-outline" size={48} color="#E53935" />
          </View>
          <Text className="mt-4 text-center text-base font-semibold text-text">
            Live map tracking is available in the mobile app
          </Text>
          <Text className="mt-1 text-center text-sm text-textSecondary">
            Your delivery details are still available below.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="absolute left-5 top-6 h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>
          <View className="absolute right-5 top-7 rounded-full bg-white px-4 py-2">
            <Text className="text-xs font-bold text-text">
              Order #{delivery.id}
            </Text>
          </View>
        </View>

        <View className="w-full max-w-[760px] self-center px-4 pt-5 sm:px-6">
          <Text className="text-2xl font-bold text-text">Active delivery</Text>
          <Text className="mt-1 text-sm text-textSecondary">
            {delivery.items}
          </Text>

          <View className="mt-6 rounded-2xl border border-border bg-white p-4">
            <View className="flex-row items-start">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Ionicons name="restaurant" size={18} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">Pick up at</Text>
                <Text className="mt-1 text-sm text-textSecondary">
                  {delivery.restaurant}
                </Text>
                <Text className="text-sm text-textSecondary">
                  {delivery.restaurantAddress}
                </Text>
                <Text className="mt-2 text-xs font-semibold text-primary">
                  {delivery.distanceToRestaurant} · {delivery.restaurantTime}
                </Text>
              </View>
            </View>

            <View className="my-4 ml-5 h-6 border-l border-dashed border-border" />

            <View className="flex-row items-start">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Ionicons name="location" size={18} color="#FFFFFF" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">Deliver to</Text>
                <Text className="mt-1 text-sm text-textSecondary">
                  {delivery.customerAddress}
                </Text>
                <Text className="mt-2 text-xs font-semibold text-primary">
                  {delivery.distanceToCustomer} · {delivery.customerTime}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between rounded-2xl bg-white p-4">
            <Text className="font-semibold text-text">Your earnings</Text>
            <Text className="text-lg font-bold text-primary">
              {delivery.earnings}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/rider/delivery-completed",
                params: { id: delivery.id },
              })
            }
            className="mt-6 h-12 items-center justify-center rounded-xl bg-primary"
          >
            <Text className="font-bold text-white">Mark as delivered</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
