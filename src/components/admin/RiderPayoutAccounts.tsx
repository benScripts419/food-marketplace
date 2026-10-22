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
  loadAdminRiderPayouts,
  saveAdminRiderPayout,
  type AdminRiderPayoutAccount,
  type AdminRiderPayoutProfile,
} from "@/lib/adminRiderPayout";
import type { MobileMoneyProvider } from "@/lib/riderPayout";

const providers: { id: MobileMoneyProvider; label: string }[] = [
  { id: "mtn", label: "MTN MoMo" },
  { id: "telecel", label: "Telecel Cash" },
  { id: "at", label: "AT Money" },
];

function providerLabel(id: string) {
  return providers.find((provider) => provider.id === id)?.label ?? id;
}

export default function RiderPayoutAccounts() {
  const [riders, setRiders] = useState<AdminRiderPayoutProfile[]>([]);
  const [accounts, setAccounts] = useState<AdminRiderPayoutAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [provider, setProvider] = useState<MobileMoneyProvider>("mtn");
  const [accountName, setAccountName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const data = await loadAdminRiderPayouts();
      setRiders(data.riders);
      setAccounts(data.accounts);
    } catch (error) {
      console.error("Loading rider payout accounts failed:", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load payout accounts.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const accountFor = (riderId: string) =>
    accounts.find((account) => account.rider_id === riderId);

  const startEditing = (rider: AdminRiderPayoutProfile) => {
    const existing = accountFor(rider.id);
    setEditingId(rider.id);
    setProvider(existing?.provider ?? "mtn");
    setAccountName(existing?.account_name ?? rider.full_name ?? "");
    setPhoneNumber(existing?.phone_number ?? rider.phone ?? "");
  };

  const save = async (rider: AdminRiderPayoutProfile) => {
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
      await saveAdminRiderPayout({
        riderId: rider.id,
        provider,
        accountName: accountName.trim(),
        phoneNumber: phoneNumber.trim(),
      });
      setEditingId(null);
      await load();
      Alert.alert(
        "Payout account saved",
        `${rider.full_name ?? "The rider"} can now be paid by Mobile Money.`,
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
    <View className="mb-6 rounded-2xl border border-border bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-text">
          Rider payout accounts
        </Text>
        <Pressable
          onPress={() => void load()}
          disabled={loading || saving}
          accessibilityLabel="Refresh payout accounts"
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="refresh-outline" size={19} color="#E53935" />
        </Pressable>
      </View>

      <Text className="mt-1 text-xs leading-5 text-textSecondary">
        Riders are paid 80% of the delivery fee to this Mobile Money account. A
        rider without one can't accept deliveries.
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-4" color="#E53935" />
      ) : loadError ? (
        <View className="mt-3 rounded-lg bg-red-50 p-3">
          <Text className="text-xs text-red-700">
            Couldn't load payout accounts: {loadError}
          </Text>
        </View>
      ) : riders.length === 0 ? (
        <Text className="mt-4 text-sm text-textSecondary">
          No rider accounts yet. Riders appear here after they sign up in the
          rider app.
        </Text>
      ) : (
        riders.map((rider) => {
          const account = accountFor(rider.id);
          const editing = editingId === rider.id;

          return (
            <View
              key={rider.id}
              className="mt-3 rounded-xl border border-border p-3"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-2">
                  <Text className="font-semibold text-text">
                    {rider.full_name ?? "Rider"}
                  </Text>
                  <Text className="mt-0.5 text-xs text-textSecondary">
                    {rider.phone ?? "No phone number"}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    editing ? setEditingId(null) : startEditing(rider)
                  }
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
              </View>

              <Text
                className={`mt-2 text-xs font-semibold ${
                  account ? "text-green-700" : "text-amber-600"
                }`}
              >
                {account
                  ? `${providerLabel(account.provider)} · ${account.account_name} · ${account.phone_number}`
                  : "No payout account yet"}
              </Text>

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
                            provider === option.id
                              ? "text-primary"
                              : "text-text"
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
                    onPress={() => void save(rider)}
                    disabled={saving}
                    className={`mt-4 h-12 items-center justify-center rounded-xl bg-primary ${
                      saving ? "opacity-60" : ""
                    }`}
                  >
                    {saving ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text className="font-bold text-white">
                        Save payout account
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}
