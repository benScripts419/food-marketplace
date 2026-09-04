import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function OrderCompletedScreen() {
  return (
    <View className="flex-1 bg-white px-5">
      {/* CONTENT */}
      <View className="flex-1 items-center justify-center">
        {/* SUCCESS ICON */}
        <View className="h-28 w-28 items-center justify-center rounded-full bg-green-100">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-success">
            <Ionicons name="checkmark" size={45} color="#FFFFFF" />
          </View>
        </View>

        {/* TITLE */}
        <Text className="mt-8 text-center text-2xl font-bold text-text">
          Order Completed!
        </Text>

        {/* DESCRIPTION */}
        <Text className="mt-3 max-w-[320px] text-center text-sm leading-6 text-textSecondary">
          Your order has been placed successfully. The restaurant is preparing
          your food now.
        </Text>

        {/* ORDER NUMBER */}
        <View className="mt-7 w-full rounded-2xl bg-surface px-5 py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Order number</Text>

            <Text className="text-sm font-bold text-text">#AKB-10245</Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">
              Estimated delivery
            </Text>

            <Text className="text-sm font-bold text-text">20–30 min</Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Total</Text>

            <Text className="text-sm font-bold text-primary">GH₵55.00</Text>
          </View>
        </View>
      </View>

      {/* BUTTONS */}
      <View className="pb-8">
        {/* TRACK ORDER */}
        <Pressable
          onPress={() => router.push("/order-tracking")}
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />

          <Text className="ml-2 font-bold text-white">Track Order</Text>
        </Pressable>

        {/* CONTINUE SHOPPING */}
        <Pressable
          onPress={() => router.push("/")}
          className="mt-3 h-14 items-center justify-center rounded-xl border border-border bg-white"
        >
          <Text className="font-bold text-text">Continue Shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}
