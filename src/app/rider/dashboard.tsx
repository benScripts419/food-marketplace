import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const deliveries = [
  {
    id: "1",
    restaurant: "Mama's Kitchen",
    customer: "Kwame",
    pickup: "Mama's Kitchen, Akropong",
    destination: "Akropong Township",
    amount: "GH₵65.00",
    distance: "1.8 km",
    time: "15–20 min",
  },
  {
    id: "2",
    restaurant: "Pizzamania",
    customer: "Ama",
    pickup: "Pizzamania, Akropong",
    destination: "Akropong Zongo",
    amount: "GH₵82.00",
    distance: "2.4 km",
    time: "20–25 min",
  },
];

export default function RiderDashboard() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        {/* HEADER */}
        <View className="px-5 pb-5 pt-14">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-textSecondary">Welcome back,</Text>

              <Text className="mt-1 text-2xl font-bold text-text">
                Rider 👋
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/rider/profile")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="person-outline" size={22} color="#171717" />
            </Pressable>
          </View>

          {/* ONLINE STATUS */}
          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white p-4">
            <View className="flex-row items-center">
              <View className="h-3 w-3 rounded-full bg-success" />

              <View className="ml-3">
                <Text className="font-bold text-text">You're Online</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  You can receive delivery requests
                </Text>
              </View>
            </View>

            <Pressable className="rounded-full bg-success px-4 py-2">
              <Text className="text-xs font-bold text-white">Online</Text>
            </Pressable>
          </View>
        </View>

        {/* EARNINGS */}
        <View className="mx-5 rounded-2xl bg-primary p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white">Today's Earnings</Text>

              <Text className="mt-2 text-3xl font-extrabold text-white">
                GH₵145.00
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
            </View>
          </View>

          <View className="mt-5 flex-row">
            <View className="flex-1">
              <Text className="text-xs text-white/80">Deliveries</Text>

              <Text className="mt-1 text-lg font-bold text-white">6</Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-white/80">Distance</Text>

              <Text className="mt-1 text-lg font-bold text-white">12.4 km</Text>
            </View>
          </View>
        </View>

        {/* ACTIVE DELIVERY */}
        <View className="mt-7 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text">Active Delivery</Text>

            <Text className="text-sm font-semibold text-success">
              In progress
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/rider/active-delivery")}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <View className="flex-row items-start">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface">
                <Ionicons name="bicycle-outline" size={25} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">Mama's Kitchen</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Deliver to Kwame
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#737373" />
            </View>

            <View className="mt-4 border-t border-border pt-4">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={17} color="#E53935" />

                <Text className="ml-2 flex-1 text-sm text-text">
                  Akropong Township
                </Text>
              </View>

              <View className="mt-3 flex-row items-center">
                <Ionicons name="navigate-outline" size={17} color="#737373" />

                <Text className="ml-2 text-sm text-textSecondary">
                  1.8 km • 15–20 min
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* AVAILABLE DELIVERIES */}
        <View className="mt-8 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text">
              Available Deliveries
            </Text>

            <Pressable onPress={() => router.push("/rider/deliveries")}>
              <Text className="text-sm font-semibold text-primary">
                See all
              </Text>
            </Pressable>
          </View>

          {deliveries.map((delivery) => (
            <Pressable
              key={delivery.id}
              onPress={() => router.push("/rider/active-delivery")}
              className="mb-4 rounded-2xl border border-border bg-white p-4"
            >
              {/* RESTAURANT */}
              <View className="flex-row items-center">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface">
                  <Ionicons
                    name="restaurant-outline"
                    size={22}
                    color="#E53935"
                  />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-bold text-text">
                    {delivery.restaurant}
                  </Text>

                  <Text className="mt-1 text-xs text-textSecondary">
                    Customer: {delivery.customer}
                  </Text>
                </View>

                <Text className="font-bold text-primary">
                  {delivery.amount}
                </Text>
              </View>

              {/* ROUTE */}
              <View className="mt-4">
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={16} color="#E53935" />

                  <Text className="ml-2 text-sm text-text">
                    {delivery.pickup}
                  </Text>
                </View>

                <View className="ml-2 h-4 border-l border-dashed border-border" />

                <View className="flex-row items-center">
                  <Ionicons name="navigate-outline" size={16} color="#171717" />

                  <Text className="ml-2 text-sm text-text">
                    {delivery.destination}
                  </Text>
                </View>
              </View>

              {/* DELIVERY INFO */}
              <View className="mt-4 flex-row items-center border-t border-border pt-3">
                <View className="flex-row items-center">
                  <Ionicons name="navigate-outline" size={14} color="#737373" />

                  <Text className="ml-1 text-xs text-textSecondary">
                    {delivery.distance}
                  </Text>
                </View>

                <Text className="mx-3 text-xs text-border">•</Text>

                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#737373" />

                  <Text className="ml-1 text-xs text-textSecondary">
                    {delivery.time}
                  </Text>
                </View>

                <Pressable className="ml-auto rounded-lg bg-primary px-4 py-2">
                  <Text className="text-xs font-bold text-white">Accept</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* QUICK ACTIONS */}
        <View className="mt-4 px-5">
          <Text className="mb-4 text-lg font-bold text-text">
            Quick Actions
          </Text>

          <View className="flex-row">
            <Pressable
              onPress={() => router.push("/rider/deliveries")}
              className="mr-3 flex-1 items-center rounded-2xl border border-border bg-white p-4"
            >
              <Ionicons name="receipt-outline" size={24} color="#E53935" />

              <Text className="mt-2 text-xs font-semibold text-text">
                My Deliveries
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/rider/active-delivery")}
              className="flex-1 items-center rounded-2xl border border-border bg-white p-4"
            >
              <Ionicons name="map-outline" size={24} color="#E53935" />

              <Text className="mt-2 text-xs font-semibold text-text">
                Open Map
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pb-7 pt-3">
        <Pressable className="flex-1 items-center">
          <Ionicons name="home" size={21} color="#E53935" />

          <Text className="mt-1 text-[10px] font-bold text-primary">Home</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/deliveries")}
          className="flex-1 items-center"
        >
          <Ionicons name="receipt-outline" size={21} color="#737373" />

          <Text className="mt-1 text-[10px] text-textSecondary">
            Deliveries
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/active-delivery")}
          className="flex-1 items-center"
        >
          <Ionicons name="map-outline" size={21} color="#737373" />

          <Text className="mt-1 text-[10px] text-textSecondary">Map</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/profile")}
          className="flex-1 items-center"
        >
          <Ionicons name="person-outline" size={21} color="#737373" />

          <Text className="mt-1 text-[10px] text-textSecondary">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}
