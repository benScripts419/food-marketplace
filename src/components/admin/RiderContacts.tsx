import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { loadAdminRiderPayouts } from "@/lib/adminRiderPayout";
import { supabase } from "@/lib/supabase";

export type RiderContact = {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
};

type DriverRow = RiderContact & { rider_id: string | null };

// 024 357 1180, +233 24 357 1180 and 233243571180 all become 233243571180
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith("233")) {
    // already has the Ghana country code
  } else if (digits.startsWith("0")) {
    digits = `233${digits.slice(1)}`;
  } else if (digits.length === 9) {
    digits = `233${digits}`;
  }

  if (digits.startsWith("233") && digits.length !== 12) return null;
  if (digits.length < 11 || digits.length > 15) return null;

  return digits;
}

function formatPhone(phone: string) {
  if (phone.startsWith("233") && phone.length === 12) {
    return `+233 ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  }
  return `+${phone}`;
}

type Props = {
  // Kept so the Riders tab can still pass it. This screen now loads the
  // driver contacts itself, because that is the table it edits.
  riders?: readonly object[];
  onChanged: () => void | Promise<void>;
};

export default function RiderContacts({ onChanged }: Props) {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [payoutRiderIds, setPayoutRiderIds] = useState<Set<string> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeCount = drivers.filter((d) => d.is_active).length;

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    const { data, error } = await supabase
      .from("drivers")
      .select("id, name, phone, is_active, rider_id")
      .order("name", { ascending: true });

    if (error) {
      console.error("Loading drivers failed:", error);
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    setDrivers((data ?? []) as DriverRow[]);

    // Which riders have a payout account. If this can't be loaded the list
    // still works; the payout line is just left out.
    try {
      const payouts = await loadAdminRiderPayouts();
      setPayoutRiderIds(
        new Set(payouts.accounts.map((account) => account.rider_id)),
      );
    } catch (error) {
      console.error("Loading rider payout accounts failed:", error);
      setPayoutRiderIds(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  async function refreshAll() {
    await loadDrivers();
    await onChanged();
  }

  function resetForm() {
    setName("");
    setPhone("");
    setEditingId(null);
  }

  function startEdit(driver: DriverRow) {
    setEditingId(driver.id);
    setName(driver.name);
    setPhone(driver.phone);
    setConfirmRemoveId(null);
    setMessage(null);
  }

  async function save() {
    if (saving) return;

    const cleanName = name.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName) {
      setMessage("Enter the rider's name.");
      return;
    }
    if (!cleanPhone) {
      setMessage(
        "That doesn't look like a valid WhatsApp number. Example: 024 357 1180",
      );
      return;
    }

    setSaving(true);
    setMessage(null);

    const result = editingId
      ? await supabase
          .from("drivers")
          .update({ name: cleanName, phone: cleanPhone })
          .eq("id", editingId)
      : await supabase
          .from("drivers")
          .insert({ name: cleanName, phone: cleanPhone, is_active: true });

    setSaving(false);

    if (result.error) {
      console.error("Saving rider contact failed:", result.error);
      setMessage(
        result.error.code === "23505"
          ? "A rider with that number is already saved."
          : result.error.message,
      );
      return;
    }

    setMessage(
      editingId
        ? `${cleanName} updated.`
        : `${cleanName} saved. They are linked to their rider account once they sign up in the rider app with this same number.`,
    );
    resetForm();
    await refreshAll();
  }

  async function setActive(driver: DriverRow, next: boolean) {
    setWorkingId(driver.id);
    setMessage(null);

    const { error } = await supabase
      .from("drivers")
      .update({ is_active: next })
      .eq("id", driver.id);

    setWorkingId(null);

    if (error) {
      console.error("Updating rider status failed:", error);
      setMessage(error.message);
      return;
    }

    await refreshAll();
  }

  async function remove(driver: DriverRow) {
    setWorkingId(driver.id);
    setMessage(null);

    const { error } = await supabase
      .from("drivers")
      .delete()
      .eq("id", driver.id);

    setWorkingId(null);
    setConfirmRemoveId(null);

    if (error) {
      console.error("Removing rider failed:", error);
      setMessage(
        error.code === "23503"
          ? `${driver.name} has past delivery offers, so they can't be deleted. Switch them off instead.`
          : error.message,
      );
      return;
    }

    if (editingId === driver.id) resetForm();
    setMessage(`${driver.name} removed.`);
    await refreshAll();
  }

  return (
    <View className="mb-6 rounded-2xl border border-border bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-text">Rider contacts</Text>
        <View className="flex-row items-center">
          <View className="rounded-full bg-green-100 px-3 py-1">
            <Text className="text-xs font-bold text-green-700">
              {activeCount} active
            </Text>
          </View>
          <Pressable
            onPress={() => void loadDrivers()}
            disabled={loading}
            accessibilityLabel="Refresh rider contacts"
            className="ml-2 h-9 w-9 items-center justify-center"
          >
            <Ionicons name="refresh-outline" size={19} color="#E53935" />
          </Pressable>
        </View>
      </View>

      <Text className="mt-1 text-xs leading-5 text-textSecondary">
        Save each rider's WhatsApp number. A rider can only accept orders once
        their contact is linked to a rider account and they have an active
        payout account.
      </Text>

      {message ? (
        <View className="mt-3 rounded-lg bg-surface p-3">
          <Text className="text-xs text-text">{message}</Text>
        </View>
      ) : null}

      {/* ADD / EDIT FORM */}
      <Text className="mb-2 mt-4 text-xs font-semibold text-textSecondary">
        {editingId ? "EDIT RIDER" : "ADD A RIDER"}
      </Text>

      <TextInput
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholder="Rider name"
        placeholderTextColor="#737373"
        className="rounded-xl border border-border px-4 py-3 text-text"
      />

      <TextInput
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholder="WhatsApp number, e.g. 024 357 1180"
        placeholderTextColor="#737373"
        className="mt-3 rounded-xl border border-border px-4 py-3 text-text"
      />

      <View className="mt-3 flex-row">
        <Pressable
          onPress={() => void save()}
          disabled={saving}
          className={`h-11 flex-1 items-center justify-center rounded-xl bg-primary ${
            saving ? "opacity-60" : ""
          }`}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="font-bold text-white">
              {editingId ? "Save changes" : "Save rider"}
            </Text>
          )}
        </Pressable>

        {editingId ? (
          <Pressable
            onPress={resetForm}
            className="ml-2 h-11 items-center justify-center rounded-xl border border-border px-4"
          >
            <Text className="font-bold text-text">Cancel</Text>
          </Pressable>
        ) : null}
      </View>

      {/* SAVED RIDERS */}
      <Text className="mb-2 mt-6 text-xs font-semibold text-textSecondary">
        SAVED RIDERS ({drivers.length})
      </Text>

      {loading ? (
        <ActivityIndicator className="mt-2" color="#E53935" />
      ) : loadError ? (
        <View className="rounded-lg bg-red-50 p-3">
          <Text className="text-xs text-red-700">
            Couldn't load riders: {loadError}
          </Text>
        </View>
      ) : drivers.length === 0 ? (
        <Text className="text-sm text-textSecondary">
          No riders saved yet. Add one above.
        </Text>
      ) : (
        drivers.map((driver) => {
          const working = workingId === driver.id;
          const confirming = confirmRemoveId === driver.id;
          const linked = Boolean(driver.rider_id);
          const hasPayout =
            linked && payoutRiderIds !== null
              ? payoutRiderIds.has(driver.rider_id as string)
              : null;

          return (
            <View
              key={driver.id}
              className="mb-2 rounded-xl border border-border bg-white p-3"
              style={{ opacity: driver.is_active ? 1 : 0.6 }}
            >
              <View className="flex-row items-center">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                </View>

                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-text" numberOfLines={1}>
                    {driver.name}
                  </Text>
                  <Text className="mt-0.5 text-xs text-textSecondary">
                    {formatPhone(driver.phone)}
                  </Text>
                </View>

                {working ? (
                  <ActivityIndicator color="#E53935" />
                ) : (
                  <Switch
                    value={driver.is_active}
                    onValueChange={(next) => void setActive(driver, next)}
                    trackColor={{ true: "#E53935", false: "#D4D4D4" }}
                    accessibilityLabel={`${driver.name} active`}
                  />
                )}
              </View>

              {/* Account and payout status */}
              <View className="mt-2">
                <Text
                  className={`text-xs font-semibold ${
                    linked ? "text-green-700" : "text-amber-600"
                  }`}
                >
                  {linked
                    ? "Rider app account linked"
                    : "Not linked: the rider must sign up in the rider app with this same number"}
                </Text>

                {hasPayout !== null ? (
                  <Text
                    className={`mt-0.5 text-xs font-semibold ${
                      hasPayout ? "text-green-700" : "text-amber-600"
                    }`}
                  >
                    {hasPayout
                      ? "Mobile Money payout account set"
                      : "No payout account yet"}
                  </Text>
                ) : null}
              </View>

              {confirming ? (
                <View className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <Text className="text-xs font-semibold text-text">
                    Remove {driver.name} from your saved riders?
                  </Text>
                  <View className="mt-2 flex-row">
                    <Pressable
                      onPress={() => void remove(driver)}
                      className="mr-2 flex-1 items-center rounded-lg bg-primary py-2"
                    >
                      <Text className="text-xs font-bold text-white">
                        Remove
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setConfirmRemoveId(null)}
                      className="flex-1 items-center rounded-lg border border-border bg-white py-2"
                    >
                      <Text className="text-xs font-bold text-text">Keep</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View className="mt-3 flex-row border-t border-border pt-2">
                  <Pressable
                    onPress={() => startEdit(driver)}
                    className="mr-5 flex-row items-center py-1"
                  >
                    <Ionicons name="create-outline" size={16} color="#171717" />
                    <Text className="ml-1 text-xs font-semibold text-text">
                      Edit
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setConfirmRemoveId(driver.id)}
                    className="flex-row items-center py-1"
                  >
                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    <Text className="ml-1 text-xs font-semibold text-red-600">
                      Remove
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}
