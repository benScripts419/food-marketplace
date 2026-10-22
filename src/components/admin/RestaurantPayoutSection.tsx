import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  loadRestaurantPayoutAccount,
  saveRestaurantPayoutAccount,
  type RestaurantPayoutAccount,
} from "@/lib/adminRestaurantPayout";
import type { MobileMoneyProvider } from "@/lib/riderPayout";

const providers: { id: MobileMoneyProvider; label: string }[] = [
  { id: "mtn", label: "MTN MoMo" },
  { id: "telecel", label: "Telecel Cash" },
  { id: "at", label: "AT Money" },
];

function providerLabel(id: string) {
  return providers.find((provider) => provider.id === id)?.label ?? id;
}

export default function RestaurantPayoutSection({
  restaurantId,
  restaurantName,
}: {
  restaurantId: string;
  restaurantName: string;
}) {
  const [account, setAccount] = useState<RestaurantPayoutAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [provider, setProvider] = useState<MobileMoneyProvider>("mtn");
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      setAccount(await loadRestaurantPayoutAccount(restaurantId));
    } catch (error) {
      console.error("Loading restaurant payout account failed:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load the payout account.",
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const startEditing = () => {
    setProvider(account?.provider ?? "mtn");
    setAccountName(account?.account_name ?? "");
    setPhoneNumber(account?.phone_number ?? "");
    setEditing(true);
  };

  const save = async () => {
    if (saving) return;

    if (!accountName.trim() || !phoneNumber.trim()) {
      Alert.alert(
        "Missing details",
        "Enter the Mobile Money account name and phone number.",
      );
      return;
    }

    setSaving(true);

    try {
      await saveRestaurantPayoutAccount({
        restaurantId,
        provider,
        accountName: accountName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setEditing(false);
      await loadAccount();
      Alert.alert(
        "Payout account saved",
        `${restaurantName} will be paid to this Mobile Money account.`,
      );
    } catch (error) {
      Alert.alert(
        "Unable to save payout account",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="mt-3 rounded-lg border border-border p-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text className="text-xs font-semibold text-textSecondary">
            MOBILE MONEY PAYOUT
          </Text>

          {loading ? (
            <ActivityIndicator className="mt-2 self-start" color="#E53935" />
          ) : loadError ? (
            <Text className="mt-1 text-xs text-red-600">{loadError}</Text>
          ) : account ? (
            <Text className="mt-1 text-sm font-medium text-text">
              {providerLabel(account.provider)} · {account.account_name} ·{" "}
              {account.phone_number}
            </Text>
          ) : (
            <Text className="mt-1 text-sm text-amber-600">
              Not set up. This restaurant can't be paid until you add an
              account.
            </Text>
          )}
        </View>

        {!loading ? (
          <Pressable
            onPress={() => (editing ? setEditing(false) : startEditing())}
            disabled={saving}
            className="flex-row items-center rounded-lg bg-surface px-3 py-2"
          >
            <Ionicons
              name={editing ? "close" : "wallet-outline"}
              size={16}
              color="#E53935"
            />
            <Text className="ml-1 text-xs font-semibold text-text">
              {editing ? "Cancel" : account ? "Change" : "Set up"}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {editing ? (
        <View className="mt-4">
          <Text className="mb-2 text-xs font-semibold text-textSecondary">
            Mobile Money network
          </Text>
          <View className="flex-row flex-wrap">
            {providers.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setProvider(option.id)}
                disabled={saving}
                className={`mb-2 mr-2 rounded-full border px-4 py-2 ${
                  provider === option.id
                    ? "border-primary bg-red-50"
                    : "border-border bg-white"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    provider === option.id ? "text-primary" : "text-text"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="mb-1 mt-2 text-xs font-semibold text-textSecondary">
            Account holder name
          </Text>
          <TextInput
            value={accountName}
            onChangeText={setAccountName}
            autoCapitalize="words"
            editable={!saving}
            placeholder="Name registered to the wallet"
            placeholderTextColor="#9CA3AF"
            className="rounded-lg border border-border px-3 py-3 text-text"
          />

          <Text className="mb-1 mt-3 text-xs font-semibold text-textSecondary">
            Mobile Money number
          </Text>
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            editable={!saving}
            placeholder="024 123 4567"
            placeholderTextColor="#9CA3AF"
            className="rounded-lg border border-border px-3 py-3 text-text"
          />

          <Pressable
            onPress={() => void save()}
            disabled={saving}
            className={`mt-4 h-12 items-center justify-center rounded-xl bg-primary ${
              saving ? "opacity-60" : ""
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">Save payout account</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
