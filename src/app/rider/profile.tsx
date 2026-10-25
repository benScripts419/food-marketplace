import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { supabase } from "@/lib/supabase";

type RiderProfile = {
  id: string;
  full_name: string | null;
  is_online: boolean;
  available: boolean;
};

type RiderOrderSummary = {
  id: string;
  status: string;
  rider_payout_fee: number | string | null;
};

export default function RiderProfileScreen() {
  const [profile, setProfile] = useState<RiderProfile | null>(null);
  const [email, setEmail] = useState("");
  const [deliveriesCompleted, setDeliveriesCompleted] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        router.replace("/rider");
        return;
      }

      setEmail(user.email ?? "");

      const { data: rider, error: riderError } = await supabase
        .from("riders")
        .select("id, full_name, is_online, available")
        .eq("id", user.id)
        .maybeSingle();

      if (riderError) throw riderError;
      if (!rider) {
        setProfile(null);
        setErrorMessage(
          "Your rider profile is not linked to this account. Contact an administrator.",
        );
        return;
      }

      setProfile(rider as RiderProfile);

      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, status, rider_payout_fee")
        .eq("rider_id", user.id);

      if (ordersError) throw ordersError;

      const rows = (orders ?? []) as RiderOrderSummary[];
      const completed = rows.filter(
        (order) => order.status?.toLowerCase() === "delivered",
      );
      const active = rows.find((order) =>
        [
          "assigned",
          "confirmed",
          "accepted",
          "preparing",
          "ready",
          "arrived_at_pickup",
          "picked_up",
          "on_the_way",
          "out_for_delivery",
        ].includes(
          order.status?.toLowerCase() ?? "",
        ),
      );

      setDeliveriesCompleted(completed.length);
      setTotalEarnings(
        completed.reduce(
          (sum, order) => sum + Number(order.rider_payout_fee ?? 0),
          0,
        ),
      );
      setActiveOrderId(active?.id ?? null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your rider profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
      setSigningOut(false);
      return;
    }

    router.replace("/rider");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-3 text-sm text-textSecondary">
          Loading rider profile…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <View className="bg-white px-5 pb-6 pt-14">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={23} color="#171717" />
            </Pressable>
            <Text className="text-2xl font-bold text-text">Profile</Text>
          </View>
        </View>

        {errorMessage ? (
          <View className="mx-5 mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <Text accessibilityRole="alert" className="text-sm text-red-700">
              {errorMessage}
            </Text>
            <Pressable onPress={() => void loadProfile()} className="mt-3 self-start">
              <Text className="font-bold text-primary">Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {profile ? (
          <>
            <View className="mt-4 items-center bg-white px-5 py-6">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-surface">
                <Ionicons name="person" size={48} color="#737373" />
              </View>

              {profile.full_name?.trim() ? (
                <Text className="mt-4 text-xl font-bold text-text">
                  {profile.full_name.trim()}
                </Text>
              ) : null}
              {email ? (
                <Text className="mt-1 text-sm text-textSecondary">{email}</Text>
              ) : null}

              <View
                className={`mt-4 flex-row items-center rounded-full px-4 py-2 ${
                  profile.is_online && profile.available
                    ? "bg-green-100"
                    : "bg-surface"
                }`}
              >
                <View
                  className={`h-2.5 w-2.5 rounded-full ${
                    profile.is_online && profile.available
                      ? "bg-success"
                      : "bg-gray-400"
                  }`}
                />
                <Text
                  className={`ml-2 text-xs font-semibold ${
                    profile.is_online && profile.available
                      ? "text-green-700"
                      : "text-textSecondary"
                  }`}
                >
                  {profile.is_online && profile.available ? "Online and available" : "Offline"}
                </Text>
              </View>
            </View>

            <View className="mx-5 mt-5 flex-row rounded-2xl border border-border bg-white p-4">
              <View className="flex-1 items-center border-r border-border">
                <Text className="text-xl font-bold text-text">
                  {deliveriesCompleted}
                </Text>
                <Text className="mt-1 text-xs text-textSecondary">
                  Completed deliveries
                </Text>
              </View>
              <View className="flex-1 items-center">
                <Text className="text-xl font-bold text-text">
                  GH₵{totalEarnings.toFixed(2)}
                </Text>
                <Text className="mt-1 text-xs text-textSecondary">
                  Recorded earnings
                </Text>
              </View>
            </View>

            <View className="mt-6 px-5">
              <Text className="mb-3 text-lg font-bold text-text">Account</Text>
              <View className="overflow-hidden rounded-2xl border border-border bg-white">
                <Pressable
                  onPress={() => router.push("/rider/payment-details")}
                  className="flex-row items-center p-4"
                >
                  <Ionicons name="card-outline" size={21} color="#737373" />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-text">
                      Mobile Money payout
                    </Text>
                    <Text className="mt-1 text-xs text-textSecondary">
                      View or update your payout account
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#737373" />
                </Pressable>
              </View>
            </View>
          </>
        ) : null}

        <View className="mt-7 px-5">
          <Pressable
            onPress={signOut}
            disabled={signingOut}
            className={`h-14 items-center justify-center rounded-xl border border-primary bg-white ${
              signingOut ? "opacity-60" : ""
            }`}
          >
            {signingOut ? (
              <ActivityIndicator color="#E53935" />
            ) : (
              <Text className="font-bold text-primary">Log Out</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pt-3"
        style={{
          paddingBottom: "max(28px, env(safe-area-inset-bottom))" as any,
        }}
      >
        <Pressable
          onPress={() => router.replace("/rider/dashboard")}
          className="flex-1 items-center"
        >
          <Ionicons name="home-outline" size={21} color="#737373" />
          <Text className="mt-1 text-[10px] text-textSecondary">Home</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/rider/deliveries")}
          className="flex-1 items-center"
        >
          <Ionicons name="receipt-outline" size={21} color="#737373" />
          <Text className="mt-1 text-[10px] text-textSecondary">Deliveries</Text>
        </Pressable>
        {activeOrderId ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/rider/active-delivery",
                params: { id: activeOrderId },
              })
            }
            className="flex-1 items-center"
          >
            <Ionicons name="navigate-outline" size={21} color="#737373" />
            <Text className="mt-1 text-[10px] text-textSecondary">Active</Text>
          </Pressable>
        ) : null}
        <View className="flex-1 items-center">
          <Ionicons name="person" size={21} color="#E53935" />
          <Text className="mt-1 text-[10px] font-bold text-primary">Profile</Text>
        </View>
      </View>
    </View>
  );
}
