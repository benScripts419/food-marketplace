import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";
import RestaurantPayoutSection from "@/components/admin/RestaurantPayoutSection";

type Restaurant = {
  id: string;
  name: string;
  phone: string | null;
  phone_numbers: string[] | null;
};

const MAX_PHONE_NUMBERS = 5;

// Normalize Ghanaian numbers for validation and duplicate detection.
function normalizeGhanaPhone(value: string): string | null {
  let phone = value.replace(/\D/g, "");

  if (phone.startsWith("00")) {
    phone = phone.slice(2);
  }

  if (phone.startsWith("0")) {
    phone = `233${phone.slice(1)}`;
  }

  return /^233\d{9}$/.test(phone) ? phone : null;
}

function getRestaurantPhones(restaurant: Restaurant): string[] {
  const numbers = restaurant.phone_numbers ?? [];
  const existing = [
    ...numbers,
    ...(restaurant.phone ? [restaurant.phone] : []),
  ];

  const seen = new Set<string>();

  return existing
    .filter((number) => {
      const value = number.trim();
      const normalized = normalizeGhanaPhone(value);

      if (!value || !normalized || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    })
    .slice(0, MAX_PHONE_NUMBERS);
}

export default function RestaurantCallTable() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(
    null,
  );
  const [draftNumbers, setDraftNumbers] = useState<string[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, phone, phone_numbers")
        .order("name", { ascending: true });

      if (error) throw error;

      setRestaurants((data ?? []) as Restaurant[]);
    } catch (error) {
      console.error("Loading restaurants failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load restaurants.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  function startEditing(restaurant: Restaurant) {
    setEditingRestaurantId(restaurant.id);

    const numbers = getRestaurantPhones(restaurant);
    setDraftNumbers(numbers.length > 0 ? numbers : [""]);
    setErrorMessage(null);
  }

  function cancelEditing() {
    setEditingRestaurantId(null);
    setDraftNumbers([]);
    setErrorMessage(null);
  }

  function updateNumber(index: number, value: string) {
    setDraftNumbers((current) =>
      current.map((number, i) => (i === index ? value : number)),
    );
  }

  function addNumber() {
    if (draftNumbers.length >= MAX_PHONE_NUMBERS) return;

    setDraftNumbers((current) => [...current, ""]);
  }

  function removeNumber(index: number) {
    Alert.alert(
      "Remove phone number",
      "Remove this number from the restaurant's contact list? Save your changes to apply the removal.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setDraftNumbers((current) => current.filter((_, i) => i !== index));
          },
        },
      ],
    );
  }

  async function saveNumbers(restaurant: Restaurant) {
    if (savingId) return;

    const numbers = draftNumbers.map((number) => number.trim()).filter(Boolean);

    if (numbers.length > MAX_PHONE_NUMBERS) {
      setErrorMessage("Each restaurant can have at most five numbers.");
      return;
    }

    const normalizedNumbers: string[] = [];

    for (const number of numbers) {
      const normalized = normalizeGhanaPhone(number);

      if (!normalized) {
        setErrorMessage(
          `Invalid Ghanaian phone number: ${number}. Enter a number such as 0241234567 or +233241234567.`,
        );
        return;
      }

      if (normalizedNumbers.includes(normalized)) {
        setErrorMessage("Duplicate phone numbers are not allowed.");
        return;
      }

      normalizedNumbers.push(normalized);
    }

    setSavingId(restaurant.id);
    setErrorMessage(null);

    try {
      // Keep the original phone column synchronized for older app features.
      const { data, error } = await supabase
        .from("restaurants")
        .update({
          phone_numbers: numbers,
          phone: numbers[0] ?? null,
        })
        .eq("id", restaurant.id)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error(
          "No restaurant was updated. Check your admin permissions and Supabase RLS policies.",
        );
      }

      setRestaurants((current) =>
        current.map((item) =>
          item.id === restaurant.id
            ? {
                ...item,
                phone_numbers: numbers,
                phone: numbers[0] ?? null,
              }
            : item,
        ),
      );

      setEditingRestaurantId(null);
      setDraftNumbers([]);

      Alert.alert("Saved", `${restaurant.name}'s phone numbers were updated.`);
    } catch (error) {
      console.error("Saving restaurant phone numbers failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save phone numbers.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function callNumber(restaurantName: string, value: string) {
    const phone = normalizeGhanaPhone(value);

    if (!phone) {
      Alert.alert("Invalid phone number", "Check the saved contact number.");
      return;
    }

    try {
      const url = `tel:+${phone}`;
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(
          "Calling unavailable",
          "This device cannot open the phone dialer.",
        );
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error(`Calling ${restaurantName} failed:`, error);
      Alert.alert("Error", "Unable to open the phone dialer.");
    }
  }

  return (
    <View className="mb-7 rounded-2xl border border-border bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-bold text-text">
            Restaurant Contacts
          </Text>
          <Text className="mt-1 text-xs text-textSecondary">
            Manage up to five phone numbers per restaurant.
          </Text>
        </View>

        <Pressable
          onPress={() => void loadRestaurants()}
          disabled={loading || savingId !== null}
          accessibilityRole="button"
          accessibilityLabel="Refresh restaurant contacts"
          className="h-10 w-10 items-center justify-center rounded-full bg-surface"
        >
          <Ionicons name="refresh" size={19} color="#E53935" />
        </Pressable>
      </View>

      {loading ? (
        <View className="py-8">
          <ActivityIndicator color="#E53935" />
        </View>
      ) : (
        <>
          {errorMessage && (
            <View className="mt-4 rounded-lg bg-red-50 p-3">
              <Text className="text-sm text-red-600">{errorMessage}</Text>

              <Pressable
                onPress={() => void loadRestaurants()}
                className="mt-2 self-start"
              >
                <Text className="font-semibold text-primary">
                  Reload restaurants
                </Text>
              </Pressable>
            </View>
          )}

          {restaurants.length === 0 ? (
            <Text className="mt-5 text-sm text-textSecondary">
              No restaurants found.
            </Text>
          ) : (
            <View className="mt-5">
              {restaurants.map((restaurant) => {
                const isEditing = editingRestaurantId === restaurant.id;
                const isSaving = savingId === restaurant.id;
                const phones = getRestaurantPhones(restaurant);

                return (
                  <View
                    key={restaurant.id}
                    className="mb-3 rounded-xl border border-border p-3"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-2">
                        <Text className="font-semibold text-text">
                          {restaurant.name}
                        </Text>
                        <Text className="mt-1 text-xs text-textSecondary">
                          {phones.length} of {MAX_PHONE_NUMBERS} contact numbers
                        </Text>
                      </View>

                      <Pressable
                        onPress={() =>
                          isEditing ? cancelEditing() : startEditing(restaurant)
                        }
                        disabled={savingId !== null}
                        accessibilityRole="button"
                        accessibilityLabel={`${
                          isEditing ? "Cancel editing" : "Edit"
                        } ${restaurant.name} contacts`}
                        className="flex-row items-center rounded-lg bg-surface px-3 py-2"
                      >
                        <Ionicons
                          name={isEditing ? "close" : "create-outline"}
                          size={16}
                          color="#E53935"
                        />
                        <Text className="ml-1 text-xs font-semibold text-text">
                          {isEditing ? "Cancel" : "Edit"}
                        </Text>
                      </Pressable>
                    </View>

                    {isEditing ? (
                      <View className="mt-4">
                        {draftNumbers.map((number, index) => (
                          <View key={index} className="mb-3">
                            <Text className="mb-1 text-xs font-semibold text-textSecondary">
                              Phone number {index + 1}
                            </Text>

                            <View className="flex-row items-center">
                              <TextInput
                                value={number}
                                onChangeText={(value) =>
                                  updateNumber(index, value)
                                }
                                keyboardType="phone-pad"
                                placeholder="+233 24 123 4567"
                                placeholderTextColor="#9CA3AF"
                                editable={!isSaving}
                                accessibilityLabel={`Phone number ${index + 1} for ${restaurant.name}`}
                                className="min-w-0 flex-1 rounded-lg border border-border px-3 py-3 text-text"
                              />

                              <Pressable
                                onPress={() => removeNumber(index)}
                                disabled={isSaving}
                                accessibilityRole="button"
                                accessibilityLabel={`Remove phone number ${index + 1}`}
                                className="ml-2 h-11 w-11 items-center justify-center rounded-lg bg-red-50"
                              >
                                <Ionicons
                                  name="trash-outline"
                                  size={19}
                                  color="#DC2626"
                                />
                              </Pressable>
                            </View>
                          </View>
                        ))}

                        <Pressable
                          onPress={addNumber}
                          disabled={
                            draftNumbers.length >= MAX_PHONE_NUMBERS || isSaving
                          }
                          className={`mb-3 flex-row items-center justify-center rounded-lg border border-border py-3 ${
                            draftNumbers.length >= MAX_PHONE_NUMBERS
                              ? "opacity-40"
                              : ""
                          }`}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={19}
                            color="#E53935"
                          />
                          <Text className="ml-2 text-sm font-semibold text-text">
                            Add phone number
                          </Text>
                        </Pressable>

                        <Text className="mb-3 text-xs text-textSecondary">
                          {draftNumbers.length}/{MAX_PHONE_NUMBERS} fields.
                          Empty fields will not be saved.
                        </Text>

                        <Pressable
                          onPress={() => void saveNumbers(restaurant)}
                          disabled={savingId !== null}
                          className={`h-12 flex-row items-center justify-center rounded-xl bg-primary ${
                            isSaving ? "opacity-60" : ""
                          }`}
                        >
                          {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <>
                              <Ionicons
                                name="save-outline"
                                size={18}
                                color="#FFFFFF"
                              />
                              <Text className="ml-2 font-bold text-white">
                                Save phone numbers
                              </Text>
                            </>
                          )}
                        </Pressable>
                      </View>
                    ) : (
                      <View className="mt-3">
                        {phones.length === 0 ? (
                          <Text className="text-sm text-textSecondary">
                            No phone numbers recorded.
                          </Text>
                        ) : (
                          phones.map((phone, index) => (
                            <View
                              key={`${restaurant.id}-${phone}`}
                              className="mb-2 flex-row items-center justify-between rounded-lg bg-surface px-3 py-3"
                            >
                              <View className="flex-1 flex-row items-center pr-2">
                                <Ionicons
                                  name="call-outline"
                                  size={17}
                                  color="#737373"
                                />
                                <View className="ml-2 flex-1">
                                  <Text className="text-xs text-textSecondary">
                                    {index === 0
                                      ? "Primary contact"
                                      : `Contact ${index + 1}`}
                                  </Text>
                                  <Text className="mt-1 text-sm font-medium text-text">
                                    {phone}
                                  </Text>
                                </View>
                              </View>

                              <Pressable
                                onPress={() =>
                                  void callNumber(restaurant.name, phone)
                                }
                                accessibilityRole="button"
                                accessibilityLabel={`Call ${restaurant.name} at ${phone}`}
                                className="flex-row items-center rounded-lg bg-green-600 px-3 py-2"
                              >
                                <Ionicons
                                  name="call"
                                  size={14}
                                  color="#FFFFFF"
                                />
                                <Text className="ml-1.5 text-xs font-bold text-white">
                                  Call
                                </Text>
                              </Pressable>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                    <RestaurantPayoutSection
                      restaurantId={restaurant.id}
                      restaurantName={restaurant.name}
                    />
                  </View>
                );
              })}
            </View>
          )}
        </>
      )}

      <Text className="mt-2 text-xs leading-5 text-textSecondary">
        The first saved number remains the primary contact in the existing phone
        column. Calling opens your device's phone dialer.
      </Text>
    </View>
  );
}
