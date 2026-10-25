import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DeliveryCompletedScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    payoutAmount?: string;
    payoutStatus?: string;
  }>();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const rawAmount = Array.isArray(params.payoutAmount)
    ? params.payoutAmount[0]
    : params.payoutAmount;
  const payoutAmount = Number(rawAmount);
  const payoutStatus = Array.isArray(params.payoutStatus)
    ? params.payoutStatus[0]
    : params.payoutStatus;

  const payoutMessage =
    payoutStatus === "success"
      ? "Your Mobile Money transfer is complete."
      : payoutStatus === "failed"
        ? "Your delivery is complete, but the transfer needs attention. Contact support."
        : payoutStatus === "processing"
          ? "Your Mobile Money transfer is awaiting confirmation."
          : "Check your payout details for the latest transfer status."; 
  const hasPayoutAmount =
    rawAmount !== undefined && rawAmount.trim() !== "" && Number.isFinite(payoutAmount);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingBottom: 120,
        }}
      >
        <View className="items-center px-5 pt-10">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-success">
              <Ionicons name="checkmark" size={38} color="#FFFFFF" />
            </View>
          </View>

          <Text className="mt-6 text-2xl font-extrabold text-text">
            Delivery Completed
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
            {orderId
              ? `Order #${orderId} has been marked delivered.`
              : "Your delivery has been marked delivered."}
          </Text>
        </View>

        <View className="mx-5 mt-8 rounded-2xl bg-primary p-6">
          <View className="items-center">
            <Text className="text-sm text-white">
              Your payout (80% of the delivery fee)
            </Text>
            {hasPayoutAmount ? (
              <Text className="mt-1 text-4xl font-extrabold text-white">
                GH₵{payoutAmount.toFixed(2)}
              </Text>
            ) : null}
            <Text className="mt-3 text-center text-sm leading-5 text-white">
              {payoutMessage}
            </Text>
          </View>
        </View>

        <View className="mx-5 mt-5 rounded-2xl border border-border bg-white p-5">
          <Text className="text-lg font-bold text-text">Payout details</Text>
          <View className="mt-4 flex-row items-center">
            <Ionicons name="wallet-outline" size={21} color="#E53935" />
            <Text className="ml-3 flex-1 text-sm text-textSecondary">
              Mobile Money ·{" "}
              {payoutStatus === "success"
                ? "Paid"
                : payoutStatus === "failed"
                  ? "Needs attention"
                  : payoutStatus === "processing"
                    ? "Processing"
                    : "Check status"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pt-3"
        style={{
          paddingBottom: "max(28px, env(safe-area-inset-bottom))" as any,
        }}
      >
        <Pressable
          onPress={() => router.replace("/rider/deliveries")}
          className="h-14 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="text-base font-bold text-white">
            Find Another Delivery
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace("/rider")}
          className="mt-3 h-12 items-center justify-center"
        >
          <Text className="font-semibold text-primary">Back to Rider Home</Text>
        </Pressable>
      </View>
    </View>
  );
}
