import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DeliveryCompletedScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="flex-row items-center px-5 pt-14">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <Text className="ml-4 text-xl font-bold text-text">
            Delivery Completed
          </Text>
        </View>

        {/* SUCCESS ICON */}
        <View className="mt-12 items-center px-5">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success">
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>
          </View>

          <Text className="mt-7 text-2xl font-bold text-text">
            Delivery completed!
          </Text>

          <Text className="mt-2 px-8 text-center text-sm leading-6 text-textSecondary">
            Your order has been successfully delivered. We hope you enjoyed your
            meal!
          </Text>
        </View>

        {/* ORDER SUMMARY */}
        <View className="mx-5 mt-9 rounded-2xl border border-border p-5">
          <Text className="text-lg font-bold text-text">Delivery summary</Text>

          <View className="mt-5 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-100">
              <Ionicons name="restaurant-outline" size={21} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">Mama's Kitchen</Text>

              <Text className="mt-1 text-xs text-textSecondary">
                Jollof Rice with Chicken
              </Text>
            </View>
          </View>

          <View className="my-4 h-px bg-border" />

          {/* ORDER NUMBER */}
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Order number</Text>

            <Text className="font-semibold text-text">#AKB-1024</Text>
          </View>

          {/* DELIVERY FEE */}
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>

            <Text className="font-semibold text-text">GH₵10.00</Text>
          </View>

          {/* TOTAL */}
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="font-bold text-text">Total</Text>

            <Text className="text-lg font-bold text-primary">GH₵65.00</Text>
          </View>
        </View>

        {/* RIDER RATING */}
        <View className="mx-5 mt-6 rounded-2xl bg-surface p-5">
          <Text className="text-center text-lg font-bold text-text">
            How was your delivery?
          </Text>

          <Text className="mt-1 text-center text-sm text-textSecondary">
            Rate your delivery experience
          </Text>

          <View className="mt-5 flex-row justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                className="mx-1 h-10 w-10 items-center justify-center"
              >
                <Ionicons name="star-outline" size={29} color="#F59E0B" />
              </Pressable>
            ))}
          </View>
        </View>

        {/* BUTTONS */}
        <View className="mx-5 mt-7">
          <Pressable
            onPress={() => router.push("/")}
            className="h-14 items-center justify-center rounded-xl bg-primary"
          >
            <Text className="font-bold text-white">Back to Home</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/orders")}
            className="mt-3 h-14 items-center justify-center rounded-xl border border-border bg-white"
          >
            <Text className="font-bold text-text">View Order</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
