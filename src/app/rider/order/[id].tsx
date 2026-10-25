import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import DeliveryMap from "@/components/DeliveryMap";
import type { Coordinates } from "@/lib/deliveryLocation";
import { supabase } from "@/lib/supabase";

type OrderItem = {
  id?: string;
  menu_item_id?: string;
  name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  restaurant: string;
  restaurant_address?: string;
  customer: string;
  customer_address?: string;
  customer_latitude?: number | null;
  customer_longitude?: number | null;
  phone?: string;
  subtotal: number;
  delivery_fee: number;
  rider_payout_fee: number;
  total: number;
  status: string;
  payment_status: string;
  order_items: OrderItem[];
  rider_id?: string | null;
};

export default function RiderOrderDetailsScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const { id, assignmentId } = useLocalSearchParams<{
    id: string;
    assignmentId?: string;
  }>();

  const canAccept =
    order !== null &&
    order.payment_status === "paid" &&
    ["pending", "confirmed", "preparing", "ready"].includes(order.status) &&
    (Boolean(assignmentId) || !order.rider_id);
  // --------------------------------------------------
  // LOAD ORDER
  // --------------------------------------------------

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(*)
        `,
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to load order:", error);
        setOrder(null);
        return;
      }

      setOrder(data as Order);
    } catch (error) {
      console.error("Unexpected order error:", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // --------------------------------------------------
  // ACCEPT DELIVERY
  // --------------------------------------------------

  const goToPayoutSetup = (message: string) => {
    Alert.alert("Set up your payout account", message, [
      { text: "Not now", style: "cancel" },
      {
        text: "Set up Mobile Money",
        onPress: () => router.push("/rider/payment-details"),
      },
    ]);
  };

  const acceptDelivery = async () => {
    if (!id) {
      Alert.alert(
        "Unable to accept",
        "The order ID is missing. Go back and open the order again.",
      );
      return;
    }

    try {
      setAccepting(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert(
          "Session expired",
          "Please log in again before accepting a delivery.",
        );
        router.replace("/rider");
        return;
      }

      if (assignmentId) {
        // The admin offered this order to this rider.
        const { data, error } = await supabase.rpc(
          "respond_to_driver_order_offer",
          {
            p_assignment_id: assignmentId,
            p_driver_phone: user.phone ?? "",
            p_response: "accept",
          },
        );

        if (error) {
          console.error("Accept offer RPC error:", error);
          Alert.alert("Could not accept delivery", error.message);
          return;
        }

        if (data === "payout_required") {
          goToPayoutSetup(
            "You need an active Mobile Money payout account before you can accept deliveries.",
          );
          return;
        }

        if (data !== "accepted") {
          Alert.alert(
            "Offer not accepted",
            "This delivery offer may no longer be available.",
          );
          return;
        }
      } else {
        // The rider chose this order from the list.
        const { error } = await supabase.rpc("accept_order", {
          p_order_id: id,
        });

        if (error) {
          console.error("Accept order RPC error:", error);
          if (error.message.includes("payout account")) {
            goToPayoutSetup(error.message);
          } else {
            Alert.alert("Could not accept delivery", error.message);
          }
          return;
        }
      }

      Alert.alert(
        "Delivery accepted",
        "The order has been assigned to you. Go to the restaurant and tap 'I have arrived' when you get there.",
        [
          {
            text: "View active delivery",
            onPress: () =>
              router.replace({
                pathname: "/rider/active-delivery",
                params: { id },
              }),
          },
        ],
      );
    } catch (error) {
      console.error("Unexpected accept error:", error);
      Alert.alert(
        "Error",
        "Something went wrong while accepting this delivery.",
      );
    } finally {
      setAccepting(false);
    }
  };

  const confirmDecline = async () => {
    if (!id) return;

    try {
      setDeclining(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        Alert.alert("Session expired", "Please log in again.");
        router.replace("/rider");
        return;
      }

      if (assignmentId) {
        // An offer from the admin: the admin will offer it to someone else.
        const { data, error } = await supabase.rpc(
          "respond_to_driver_order_offer",
          {
            p_assignment_id: assignmentId,
            p_driver_phone: user.phone ?? "",
            p_response: "decline",
          },
        );

        if (error) {
          Alert.alert("Could not decline", error.message);
          return;
        }
        if (data !== "declined") {
          Alert.alert(
            "Could not decline",
            "This offer may no longer be available.",
          );
          return;
        }
      } else {
        // An order from the list: hide it for this rider only.
        const { error } = await supabase
          .from("rider_order_declines")
          .upsert(
            { order_id: id, rider_id: user.id },
            { onConflict: "order_id,rider_id", ignoreDuplicates: true },
          );

        if (error) {
          Alert.alert("Could not decline", error.message);
          return;
        }
      }

      router.replace("/rider/deliveries");
    } catch (error) {
      console.error("Unexpected decline error:", error);
      Alert.alert("Error", "Something went wrong while declining.");
    } finally {
      setDeclining(false);
    }
  };

  const declineDelivery = () => {
    Alert.alert(
      "Decline this delivery?",
      assignmentId
        ? "The admin will offer it to another rider."
        : "It will be hidden from your list. Other riders can still take it.",
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => void confirmDecline(),
        },
      ],
    );
  };
  // --------------------------------------------------
  // CALL CUSTOMER
  // --------------------------------------------------

  const callCustomer = async () => {
    if (!order?.phone) {
      Alert.alert(
        "Phone number unavailable",
        "This customer's phone number is not available.",
      );
      return;
    }

    const phoneUrl = `tel:${order.phone}`;

    try {
      await Linking.openURL(phoneUrl);
    } catch {
      Alert.alert(
        "Unable to call",
        "Your device could not open the phone application.",
      );
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#E53935" />

        <Text className="mt-3 text-sm text-textSecondary">
          Loading delivery...
        </Text>
      </View>
    );
  }

  // --------------------------------------------------
  // ORDER NOT FOUND
  // --------------------------------------------------

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Ionicons name="alert-circle-outline" size={50} color="#E53935" />

        <Text className="mt-4 text-xl font-bold text-text">
          Order not found
        </Text>

        <Text className="mt-2 text-center text-sm text-textSecondary">
          This delivery may have been removed or is no longer available.
        </Text>

        <Pressable
          onPress={() => router.back()}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // --------------------------------------------------
  // FORMAT VALUES
  // --------------------------------------------------

  const deliveryFee = Number(order.rider_payout_fee ?? 0);
  const subtotal = Number(order.subtotal ?? 0);
  const total = Number(order.total ?? 0);
  const customerLocation: Coordinates | null =
    typeof order.customer_latitude === "number" &&
    typeof order.customer_longitude === "number"
      ? {
          latitude: order.customer_latitude,
          longitude: order.customer_longitude,
        }
      : null;

  const itemsText =
    order.order_items?.length > 0
      ? order.order_items
          .map((item) => `${item.name} ×${item.quantity}`)
          .join(", ")
      : "No items available";

  // --------------------------------------------------
  // SCREEN
  // --------------------------------------------------

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 130,
        }}
      >
        {/* HEADER */}

        <View className="px-5 pt-14">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={23} color="#171717" />
          </Pressable>

          <Text className="mt-4 text-2xl font-bold text-text">
            Delivery Request
          </Text>

          <Text className="mt-1 text-sm text-textSecondary">
            Order #{order.id}
          </Text>
        </View>

        {/* RIDER PAYOUT CARD */}

        <View className="mx-5 mt-6 rounded-2xl bg-primary p-5">
          <Text className="text-sm text-white">
            Your earnings (80% of the delivery fee)
          </Text>

          <Text className="mt-1 text-3xl font-extrabold text-white">
            GH₵{deliveryFee.toFixed(2)}
          </Text>

          <View className="mt-4 flex-row items-center">
            <Ionicons name="bicycle-outline" size={17} color="#FFFFFF" />

            <Text className="ml-1 text-sm text-white">Delivery</Text>

            <Text className="mx-3 text-white">•</Text>

            <Ionicons name="time-outline" size={17} color="#FFFFFF" />

            <Text className="ml-1 text-sm text-white">New order</Text>
          </View>
        </View>

        {/* ROUTE */}

        <View className="mx-5 mt-6 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery route</Text>
          {customerLocation ? (
            <View className="mt-4 overflow-hidden rounded-xl">
              <DeliveryMap
                destination={customerLocation}
                riderLocation={null}
                style={{ height: 230, width: "100%" }}
              />
            </View>
          ) : null}

          {/* PICKUP */}

          <View className="mt-5 flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="restaurant-outline" size={18} color="#E53935" />
              </View>

              <View className="mt-1 h-12 w-px bg-border" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">PICK UP</Text>

              {order.restaurant ? (
                <Text className="mt-1 font-bold text-text">
                  {order.restaurant}
                </Text>
              ) : null}

              {order.restaurant_address ? (
                <Text className="mt-1 text-sm text-textSecondary">
                  {order.restaurant_address}
                </Text>
              ) : null}
            </View>
          </View>

          {/* DELIVERY */}

          <View className="flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="location" size={18} color="#E53935" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">DELIVER TO</Text>

              {order.customer ? (
                <Text className="mt-1 font-bold text-text">{order.customer}</Text>
              ) : null}

              {order.customer_address ? (
                <Text className="mt-1 text-sm text-textSecondary">
                  {order.customer_address}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ORDER INFORMATION */}

        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Order information</Text>

          <View className="mt-4">
            <Text className="text-xs text-textSecondary">ITEMS</Text>

            <View className="mt-3">
              {order.order_items?.map((item, index) => (
                <View
                  key={item.id ?? item.menu_item_id ?? `${item.name}-${index}`}
                  className="mb-3 flex-row items-center justify-between"
                >
                  <View className="flex-1 pr-3">
                    <Text className="font-medium text-text">{item.name}</Text>

                    <Text className="mt-1 text-xs text-textSecondary">
                      Quantity: {item.quantity}
                    </Text>
                  </View>

                  <Text className="font-semibold text-text">
                    GH₵
                    {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-2 flex-row justify-between border-t border-border pt-4">
            <Text className="text-sm text-textSecondary">Food total</Text>

            <Text className="font-semibold text-text">
              GH₵{subtotal.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Your earnings</Text>

            <Text className="font-semibold text-primary">
              GH₵{deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between border-t border-border pt-3">
            <Text className="font-bold text-text">Customer paid</Text>

            <Text className="text-lg font-bold text-text">
              GH₵{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* CUSTOMER CONTACT */}

        <View className="mx-5 mt-5 rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-text">Customer</Text>

          <View className="mt-4 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-surface">
              <Ionicons name="person-outline" size={21} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">{order.customer}</Text>

              {order.phone ? (
                <Text className="mt-1 text-xs text-textSecondary">
                  {order.phone}
                </Text>
              ) : null}
            </View>

            <Pressable
              onPress={callCustomer}
              disabled={!order.phone}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface"
            >
              <Ionicons
                name="call-outline"
                size={19}
                color={order.phone ? "#E53935" : "#A3A3A3"}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* ACCEPT / DECLINE */}

      <View
        className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-5 pt-3"
        style={{
          paddingBottom: "max(28px, env(safe-area-inset-bottom))" as any,
        }}
      >
        {canAccept ? (
          <Pressable
            onPress={declineDelivery}
            disabled={accepting || declining}
            style={{
              flex: 1,
              marginRight: 10,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#DC2626",
              opacity: accepting || declining ? 0.6 : 1,
            }}
          >
            {declining ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text style={{ color: "#DC2626", fontWeight: "700" }}>
                Decline
              </Text>
            )}
          </Pressable>
        ) : null}

        <Pressable
          onPress={acceptDelivery}
          disabled={!canAccept || accepting || declining}
          style={{
            flex: 1,
            backgroundColor:
              !canAccept || accepting || declining ? "#999" : "#16A34A",
            padding: 16,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          {accepting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {canAccept ? "Accept delivery" : "Offer unavailable"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
