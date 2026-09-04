import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DeliveryConfirmScreen() {
  const { restaurant, pickupAddress, deliveryAddress, phone } =
    useLocalSearchParams<{
      restaurant: string;
      pickupAddress: string;
      deliveryAddress: string;
      phone: string;
    }>();

  const deliveryFee = 15;

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-3 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="ml-3 text-xl font-bold text-text">
          Confirm Delivery
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 130,
        }}
      >
        {/* ROUTE */}
        <View className="mt-5 rounded-2xl border border-border bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery route</Text>

          <View className="mt-5 flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="restaurant-outline" size={18} color="#E53935" />
              </View>

              <View className="h-10 w-[1px] bg-border" />

              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="location" size={18} color="#E53935" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">PICKUP</Text>

              <Text className="mt-1 font-semibold text-text">{restaurant}</Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {pickupAddress}
              </Text>

              <View className="h-6" />

              <Text className="text-xs text-textSecondary">DELIVERY</Text>

              <Text className="mt-1 font-semibold text-text">
                Your destination
              </Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {deliveryAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* CUSTOMER */}
        <View className="mt-5 rounded-2xl bg-surface p-5">
          <Text className="text-lg font-bold text-text">
            Contact information
          </Text>

          <View className="mt-4 flex-row items-center">
            <Ionicons name="call-outline" size={19} color="#737373" />

            <Text className="ml-3 text-sm text-text">{phone}</Text>
          </View>
        </View>

        {/* FEE */}
        <View className="mt-5 rounded-2xl border border-border p-5">
          <Text className="text-lg font-bold text-text">Delivery fee</Text>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Delivery service</Text>

            <Text className="font-bold text-text">
              GH₵{deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-4 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-text">Total</Text>

              <Text className="text-xl font-bold text-primary">
                GH₵{deliveryFee.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CONFIRM */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={() => router.push("/payment")}
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Continue to Payment</Text>

          <Text className="ml-3 font-bold text-white">
            GH₵{deliveryFee.toFixed(2)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
