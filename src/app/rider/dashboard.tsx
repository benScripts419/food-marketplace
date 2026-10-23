import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";
import { supabase } from "@/lib/supabase";

type Rider = {
  id: string;
  full_name: string | null;
  is_online: boolean;
  available: boolean;
};

type OrderSummary = {
  id: string;
  restaurant: string | null;
  customer: string | null;
  restaurant_address: string | null;
  customer_address: string | null;
  rider_payout_fee: number | null;
  payment_status: string | null;
  status: string;
  total: number | null;
  delivered_at?: string | null;
};

type Assignment = {
  id: string;
  order_id: string;
  driver_id: string;
  status: string;
  offered_at: string;
  orders: OrderSummary | OrderSummary[] | null;
};

const ACTIVE_STATUSES = [
  "confirmed",
  "accepted",
  "preparing",
  "ready",
  "arrived_at_pickup",
  "picked_up",
  "on_the_way",
];

const formatMoney = (value: number) => `GH₵${value.toFixed(2)}`;

export default function RiderDashboard() {
  const [rider, setRider] = useState<Rider | null>(null);
  const [offers, setOffers] = useState<Assignment[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderSummary[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [payoutReady, setPayoutReady] = useState(true);

  const toggleAvailability = useCallback(
    async (value: boolean) => {
      if (updatingAvailability) return;

      setUpdatingAvailability(true);

      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError) throw authError;

        const user = authData.user;

        if (!user) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        const { data, error } = await supabase
          .from("riders")
          .update({
            is_online: value,
            available: value,
          })
          .eq("id", user.id)
          .select("id, full_name, is_online, available")
          .single();

        if (error) throw error;

        setRider(data as Rider);

        Alert.alert(
          value ? "You're online" : "You're offline",
          value
            ? "You can now receive delivery offers."
            : "You will no longer receive new delivery offers.",
        );
      } catch (error) {
        console.error("Availability update failed:", error);

        Alert.alert(
          "Unable to update availability",
          error instanceof Error ? error.message : "Please try again.",
        );
      } finally {
        setUpdatingAvailability(false);
      }
    },
    [updatingAvailability],
  );

  const loadDashboard = useCallback(async () => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        setRider(null);
        setOffers([]);
        setActiveOrders([]);
        router.replace("/rider");
        return;
      }

      const user = authData.user;
      console.log("Rider auth UUID:", user.id);

      // 1. Load the rider profile.
      const { data: riderData, error: riderError } = await supabase
        .from("riders")
        .select("id, full_name, is_online, available")
        .eq("id", user.id)
        .maybeSingle();

      if (riderError) throw riderError;

      if (!riderData) {
        setRider(null);
        setOffers([]);
        setActiveOrders([]);

        Alert.alert(
          "Rider profile not found",
          "Contact the administrator to link your rider account.",
        );
        return;
      }

      setRider(riderData as Rider);

      const { data: payoutAccount } = await supabase
        .from("rider_payout_accounts")
        .select("recipient_code")
        .eq("rider_id", user.id)
        .maybeSingle();

      setPayoutReady(Boolean(payoutAccount?.recipient_code));

      // 2. Find the driver's database ID for this rider.
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("id")
        .eq("rider_id", user.id)
        .maybeSingle();

      if (driverError) throw driverError;

      const driverId = driverData?.id;
      console.log("Mapped driver ID:", driverId);

      // 3. Load delivery offers using drivers.id.
      if (driverId) {
        const { data: assignmentData, error: assignmentError } = await supabase
          .from("order_assignments")
          .select(
            `
      id,
      order_id,
      driver_id,
      status,
      offered_at,
      orders (
        id,
        restaurant,
        customer,
        restaurant_address,
        customer_address,
        rider_payout_fee,
        payment_status,
        status,
        total
      )
    `,
          )
          .eq("driver_id", driverId)
          .eq("status", "offered")
          .order("offered_at", { ascending: false });

        if (assignmentError) throw assignmentError;

        const assignments = (assignmentData ?? []) as unknown as Assignment[];

        const validOffers = assignments.filter((assignment) => {
          const order = Array.isArray(assignment.orders)
            ? assignment.orders[0]
            : assignment.orders;

          if (!order) {
            console.warn(
              "Order details unavailable for assignment:",
              assignment.id,
            );
            return false;
          }

          return (
            order.payment_status?.toLowerCase() === "paid" &&
            ["pending", "confirmed", "preparing", "ready"].includes(
              order.status.toLowerCase(),
            )
          );
        });

        console.log("Driver ID:", driverId);
        console.log("Assignments returned:", assignments.length);
        console.log("Valid delivery offers:", validOffers.length);

        setOffers(validOffers);
      }

      // 4. Load orders assigned to this rider.
      const { data: activeData, error: activeError } = await supabase
        .from("orders")
        .select(
          `
        id,
        restaurant,
        customer,
        restaurant_address,
        customer_address,
        rider_payout_fee,
        payment_status,
        status,
        total
      `,
        )
        .eq("rider_id", user.id)
        .in("status", ACTIVE_STATUSES)
        .order("updated_at", { ascending: false });

      if (activeError) throw activeError;

      setActiveOrders((activeData ?? []) as OrderSummary[]);

      // 5. Calculate today's completed deliveries.
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).toISOString();

      const { data: completedData, error: completedError } = await supabase
        .from("orders")
        .select("id, rider_payout_fee")
        .eq("rider_id", user.id)
        .eq("status", "delivered")
        .gte("delivered_at", startOfDay);

      if (completedError) throw completedError;

      const completedOrders = completedData ?? [];

      setTodayDeliveries(completedOrders.length);

      setTodayEarnings(
        completedOrders.reduce(
          (sum, order) => sum + Number(order.rider_payout_fee ?? 0),
          0,
        ),
      );
    } catch (error) {
      console.error("Rider dashboard load failed:", error);

      Alert.alert(
        "Unable to load dashboard",
        error instanceof Error
          ? error.message
          : "Please check your connection and try again.",
      );
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadDashboard();
      } finally {
        setLoading(false);
      }
    })();
  }, [loadDashboard]);

  const refreshDashboard = async () => {
    setRefreshing(true);
    try {
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const getOrder = (assignment: Assignment) =>
    Array.isArray(assignment.orders) ? assignment.orders[0] : assignment.orders;

  const openOrder = (orderId: string, assignmentId?: string) => {
    router.push({
      pathname: "/rider/order/[id]",
      params: {
        id: orderId,
        ...(assignmentId ? { assignmentId } : {}),
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-3 text-sm text-textSecondary">
          Loading rider dashboard...
        </Text>
      </View>
    );
  }

  if (!rider) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Ionicons name="person-circle-outline" size={54} color="#737373" />
        <Text className="mt-4 text-xl font-bold text-text">
          Rider profile unavailable
        </Text>
        <Text className="mt-2 text-center text-sm text-textSecondary">
          Sign in with your rider account and make sure your rider profile has
          been created.
        </Text>
        <Pressable
          onPress={() => router.replace("/rider")}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Return to login</Text>
        </Pressable>
      </View>
    );
  }

  const isOnline = rider.is_online && rider.available;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshDashboard}
          />
        }
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* HEADER */}
        <View className="px-5 pb-5 pt-14">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm text-textSecondary">Welcome back,</Text>
              <Text className="mt-1 text-2xl font-bold text-text">
                {rider.full_name || "Rider"} 👋
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/rider/profile")}
              className="h-11 w-11 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="person-outline" size={22} color="#171717" />
            </Pressable>
          </View>

          {/* ONLINE STATUS */}
          <View className="mt-5 flex-row items-center justify-between rounded-2xl bg-white p-4">
            <View className="flex-1 flex-row items-center">
              <View
                className={`h-3 w-3 rounded-full ${
                  isOnline ? "bg-success" : "bg-gray-400"
                }`}
              />
              <View className="ml-3 flex-1">
                <Text className="font-bold text-text">
                  {isOnline ? "You're Online" : "You're Offline"}
                </Text>
                <Text className="mt-1 text-xs text-textSecondary">
                  {isOnline
                    ? "You can receive delivery requests"
                    : "You won't receive new delivery requests"}
                </Text>
              </View>
            </View>

            {updatingAvailability ? (
              <ActivityIndicator color="#E53935" />
            ) : (
              <Switch
                value={isOnline}
                onValueChange={toggleAvailability}
                trackColor={{ false: "#D4D4D4", true: "#86C98B" }}
                thumbColor={isOnline ? "#258B36" : "#F5F5F5"}
                accessibilityLabel="Toggle rider availability"
              />
            )}
          </View>
        </View>

        {!payoutReady ? (
          <View className="mx-5 mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Text className="font-bold text-amber-800">
              Set up your payout account
            </Text>
            <Text className="mt-1 text-sm text-amber-800">
              You can't accept deliveries until your Mobile Money account is
              active.
            </Text>
            <Pressable
              onPress={() => router.push("/rider/payment-details")}
              className="mt-3 self-start rounded-lg bg-primary px-4 py-2"
            >
              <Text className="font-bold text-white">Set up Mobile Money</Text>
            </Pressable>
          </View>
        ) : null}

        {/* TODAY'S SUMMARY */}
        <View className="mx-5 rounded-2xl bg-primary p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-white">
                Today's Estimated Earnings
              </Text>
              <Text className="mt-2 text-3xl font-extrabold text-white">
                {formatMoney(todayEarnings)}
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Ionicons name="wallet-outline" size={25} color="#FFFFFF" />
            </View>
          </View>

          <View className="mt-5 flex-row">
            <View className="flex-1">
              <Text className="text-xs text-white/80">Completed today</Text>
              <Text className="mt-1 text-lg font-bold text-white">
                {todayDeliveries}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs text-white/80">Active deliveries</Text>
              <Text className="mt-1 text-lg font-bold text-white">
                {activeOrders.length}
              </Text>
            </View>
          </View>
        </View>

        {/* ACTIVE DELIVERY */}
        <View className="mt-6 px-6">
          <Text className="mb-3 text-xl font-bold text-gray-900">
            Active Deliveries
          </Text>

          {activeOrders.length === 0 ? (
            <View className="rounded-xl border border-gray-200 bg-white p-4">
              <Text className="text-gray-500">No active deliveries yet.</Text>
            </View>
          ) : (
            activeOrders.map((order) => (
              <Pressable
                key={order.id}
                onPress={() =>
                  router.push({
                    pathname: "/rider/active-delivery",
                    params: { id: order.id },
                  })
                }
                className="mb-3 rounded-xl border border-gray-200 bg-white p-4"
              >
                <Text className="font-semibold text-gray-900">
                  Order #{order.id.slice(0, 8)}
                </Text>

                <Text className="mt-1 text-gray-600">
                  {order.restaurant ?? "Restaurant"}
                </Text>

                <Text className="mt-1 text-sm text-gray-500">
                  Status: {order.status.replace(/_/g, " ")}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        {/* AVAILABLE OFFERS */}
        <View className="mt-8 px-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text">Delivery Offers</Text>
            <Text className="text-sm font-semibold text-primary">
              {offers.length} available
            </Text>
          </View>

          {offers.length === 0 ? (
            <View className="items-center rounded-2xl border border-border bg-white p-6">
              <Ionicons name="receipt-outline" size={34} color="#737373" />
              <Text className="mt-3 font-semibold text-text">
                No delivery offers
              </Text>
              <Text className="mt-1 text-center text-sm text-textSecondary">
                New offers assigned to you will appear here.
              </Text>
            </View>
          ) : (
            offers.map((assignment) => {
              const order = getOrder(assignment);

              if (!order) return null;

              const payout = Number(order.rider_payout_fee ?? 0);

              return (
                <Pressable
                  key={assignment.id}
                  onPress={() => openOrder(order.id, assignment.id)}
                  className="mb-4 rounded-2xl border border-border bg-white p-4"
                >
                  <View className="flex-row items-center">
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface">
                      <Ionicons
                        name="restaurant-outline"
                        size={22}
                        color="#E53935"
                      />
                    </View>

                    <View className="ml-3 flex-1">
                      <Text className="font-bold text-text">
                        {order.restaurant || "Restaurant"}
                      </Text>
                      <Text className="mt-1 text-xs text-textSecondary">
                        Customer: {order.customer || "Customer"}
                      </Text>
                    </View>

                    <Text className="font-bold text-primary">
                      {formatMoney(payout)}
                    </Text>
                  </View>

                  <View className="mt-4 flex-row items-start">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#E53935"
                    />
                    <Text className="ml-2 flex-1 text-sm text-text">
                      {order.restaurant_address || "Pickup address unavailable"}
                    </Text>
                  </View>

                  <View className="mt-2 flex-row items-start">
                    <Ionicons
                      name="navigate-outline"
                      size={16}
                      color="#171717"
                    />
                    <Text className="ml-2 flex-1 text-sm text-text">
                      {order.customer_address || "Delivery address unavailable"}
                    </Text>
                  </View>

                  <View className="mt-4 flex-row items-center justify-between border-t border-border pt-3">
                    <Text className="text-xs text-textSecondary">
                      Paid order · View details
                    </Text>
                    <View className="flex-row items-center rounded-lg bg-primary px-4 py-2">
                      <Text className="text-xs font-bold text-white">
                        View offer
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View className="mt-4 px-5">
          <Text className="mb-4 text-lg font-bold text-text">
            Quick Actions
          </Text>

          <Pressable
            onPress={() => router.push("/rider/deliveries")}
            className="mb-3 flex-row items-center justify-center rounded-2xl border border-border bg-white p-4"
          >
            <Ionicons name="bicycle-outline" size={22} color="#E53935" />
            <Text className="ml-2 text-sm font-semibold text-text">
              Browse delivery requests
            </Text>
          </Pressable>

          <View className="flex-row">
            <Pressable
              onPress={() => router.push("/rider/deliveries")}
              className="mr-3 flex-1 items-center rounded-2xl border border-border bg-white p-4"
            >
              <Ionicons name="receipt-outline" size={24} color="#E53935" />
              <Text className="mt-2 text-xs font-semibold text-text">
                My Deliveries
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                if (activeOrders[0]) {
                  router.push({
                    pathname: "/rider/active-delivery",
                    params: { id: activeOrders[0].id },
                  });
                } else {
                  Alert.alert(
                    "No active delivery",
                    "You don't have an active delivery to open yet.",
                  );
                }
              }}
              className="flex-1 items-center rounded-2xl border border-border bg-white p-4"
            >
              <Ionicons name="map-outline" size={24} color="#E53935" />
              <Text className="mt-2 text-xs font-semibold text-text">
                Open Map
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pb-7 pt-3">
        <Pressable className="flex-1 items-center">
          <Ionicons name="home" size={21} color="#E53935" />
          <Text className="mt-1 text-[10px] font-bold text-primary">Home</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/deliveries")}
          className="flex-1 items-center"
        >
          <Ionicons name="receipt-outline" size={21} color="#737373" />
          <Text className="mt-1 text-[10px] text-textSecondary">
            Deliveries
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (activeOrders[0]) {
              router.push({
                pathname: "/rider/active-delivery",
                params: { id: activeOrders[0].id },
              });
            } else {
              Alert.alert(
                "No active delivery",
                "Accept an offer before opening the delivery map.",
              );
            }
          }}
          className="flex-1 items-center"
        >
          <Ionicons name="map-outline" size={21} color="#737373" />
          <Text className="mt-1 text-[10px] text-textSecondary">Map</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/profile")}
          className="flex-1 items-center"
        >
          <Ionicons name="person-outline" size={21} color="#737373" />
          <Text className="mt-1 text-[10px] text-textSecondary">Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}
