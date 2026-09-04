import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const orders = {
  "1001": {
    id: "1001",
    restaurant: "Mama's Kitchen",
    restaurantAddress: "Akropong Market",
    customer: "Customer",
    customerAddress: "Akropong, Ghana",
    phone: "+233 20 000 0000",
    items: "Jollof Rice with Chicken × 2",
    total: "GH₵110.00",
    deliveryFee: "GH₵15.00",
    distance: "2.4 km",
    estimatedTime: "15–20 min",
  },

  "1002": {
    id: "1002",
    restaurant: "Pizzamania",
    restaurantAddress: "Akropong",
    customer: "Customer",
    customerAddress: "Akuapem, Ghana",
    phone: "+233 24 000 0000",
    items: "Pepperoni Pizza × 1",
    total: "GH₵65.00",
    deliveryFee: "GH₵20.00",
    distance: "3.8 km",
    estimatedTime: "20–30 min",
  },
};

export default function RiderOrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const order = orders[id as keyof typeof orders];

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Ionicons name="alert-circle-outline" size={50} color="#E53935" />

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

  const acceptDelivery = () => {
    router.push({
      pathname: "/rider/active-delivery",
      params: {
        id: order.id,
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        {/* HEADER */}
        <View className="px-5 pt-14">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={23} color="#171717" />
          </Pressable>

          <Text className="mt-4 text-2xl font-bold text-text">
            Delivery Request
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            Order #{order.id}
          </Text>
        </View>

        {/* EARNINGS CARD */}
        <View className="mx-5 mt-6 rounded-2xl bg-primary p-5">
          <Text className="text-sm text-white">Delivery earnings</Text>

          <Text className="mt-1 text-3xl font-extrabold text-white">
            {order.deliveryFee}
          </Text>

          <View className="mt-4 flex-row items-center">
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={17} color="#FFFFFF" />

              <Text className="ml-1 text-sm text-white">{order.distance}</Text>
            </View>

            <Text className="mx-3 text-white">•</Text>

            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={17} color="#FFFFFF" />

              <Text className="ml-1 text-sm text-white">
                {order.estimatedTime}
              </Text>
            </View>
          </View>
        </View>

        {/* ROUTE */}
        <View className="mx-5 mt-6 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery route</Text>

          {/* PICKUP */}
          <View className="mt-5 flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="restaurant-outline" size={18} color="#E53935" />
              </View>

              <View className="mt-1 h-12 w-px bg-border" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">PICK UP</Text>

              <Text className="mt-1 font-bold text-text">
                {order.restaurant}
              </Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {order.restaurantAddress}
              </Text>
            </View>
          </View>

          {/* DELIVERY */}
          <View className="flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="location" size={18} color="#E53935" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">DELIVER TO</Text>

              <Text className="mt-1 font-bold text-text">{order.customer}</Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {order.customerAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* ORDER INFORMATION */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Order information</Text>

          <View className="mt-4">
            <Text className="text-xs text-textSecondary">ITEMS</Text>

            <Text className="mt-1 font-medium text-text">{order.items}</Text>
          </View>

          <View className="mt-4 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Food total</Text>

            <Text className="font-semibold text-text">{order.total}</Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>

            <Text className="font-semibold text-primary">
              {order.deliveryFee}
            </Text>
          </View>
        </View>

        {/* CUSTOMER CONTACT */}
        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Customer</Text>

          <View className="mt-4 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
              <Ionicons name="person-outline" size={21} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">{order.customer}</Text>

              <Text className="mt-1 text-xs text-textSecondary">
                {order.phone}
              </Text>
            </View>

            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Ionicons name="call-outline" size={19} color="#E53935" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* ACCEPT BUTTON */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={acceptDelivery}
          className="h-14 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="text-base font-bold text-white">
            Accept Delivery
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
