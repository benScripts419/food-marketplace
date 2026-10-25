import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  saveRiderPayoutMethod,
  type MobileMoneyProvider,
} from "@/lib/riderPayout";
import { supabase } from "@/lib/supabase";

const providers: { id: MobileMoneyProvider; label: string }[] = [
  { id: "mtn", label: "MTN MoMo" },
  { id: "telecel", label: "Telecel Cash" },
  { id: "at", label: "AT Money" },
];

export default function RiderPaymentDetailsScreen() {
  const [provider, setProvider] = useState<MobileMoneyProvider>("mtn");
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadPayoutMethod = async () => {
      const { data, error } = await supabase
        .from("rider_payout_accounts")
        .select("provider, account_name, phone_number")
        .maybeSingle();

      if (error) {
        console.error("Failed to load rider payout method:", error);
        setFeedback({ type: "error", text: error.message });
      } else if (mounted && data) {
        setProvider(data.provider as MobileMoneyProvider);
        setAccountName(data.account_name);
        setPhoneNumber(data.phone_number);
      }
      if (mounted) setLoading(false);
    };

    void loadPayoutMethod();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    if (saving) return;
    if (!accountName.trim() || !phoneNumber.trim()) {
      setFeedback({
        type: "error",
        text: "Enter the Mobile Money account name and phone number.",
      });
      return;
    }

    setFeedback(null);
    setSaving(true);
    try {
      await saveRiderPayoutMethod({
        provider,
        accountName: accountName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setFeedback({
        type: "success",
        text: "Your Mobile Money account is ready for automatic delivery payouts.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-white px-5 pb-5 pt-14">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={23} color="#171717" />
            </Pressable>
            <Text className="text-2xl font-bold text-text">
              Mobile Money payout
            </Text>
          </View>
        </View>

        {feedback ? (
          <View
            className={`mx-5 mt-5 rounded-xl border p-4 ${
              feedback.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <Text
              accessibilityRole="alert"
              className={`text-sm ${
                feedback.type === "success" ? "text-green-800" : "text-red-700"
              }`}
            >
              {feedback.text}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator className="mt-10" color="#E53935" />
        ) : (
          <View className="mx-5 mt-5 rounded-2xl border border-border bg-white p-5">
            <Text className="text-sm leading-5 text-textSecondary">
              AkroBite pays riders 80% of the delivery fee.
            </Text>

            <Text className="mb-2 mt-6 font-semibold text-text">
              Mobile Money network
            </Text>
            <View className="flex-row flex-wrap">
              {providers.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setProvider(option.id)}
                  className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                    provider === option.id
                      ? "border-primary bg-red-50"
                      : "border-border bg-white"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      provider === option.id ? "text-primary" : "text-text"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text className="mb-2 mt-4 font-semibold text-text">
              Account holder name
            </Text>
            <TextInput
              value={accountName}
              onChangeText={setAccountName}
              autoCapitalize="words"
              placeholder="Name registered to the wallet"
              className="rounded-xl border border-border px-4 py-3 text-text"
            />

            <Text className="mb-2 mt-4 font-semibold text-text">
              Ghana Mobile Money number
            </Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder="05X XXX XXXX"
              className="rounded-xl border border-border px-4 py-3 text-text"
            />

            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              className={`mt-6 h-12 items-center justify-center rounded-xl bg-primary ${
                saving ? "opacity-60" : ""
              }`}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="font-bold text-white">Save payout method</Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
