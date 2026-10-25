import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { initializeDeliveryPayment } from "@/lib/deliveryPayment";
import { loadDeliveryLocation } from "@/lib/deliveryLocation";
import { goBack } from "@/lib/goBack";
import { openCheckout } from "@/lib/openCheckout";
import { verifyPaystackPayment } from "@/lib/paystack";

type Params = {
  restaurant?: string | string[];
  customerName?: string | string[];
  pickupKey?: string | string[];
  pickupAddress?: string | string[];
  pickupTown?: string | string[];
  phone?: string | string[];
  orderDetails?: string | string[];
  deliveryAddress?: string | string[];
  itemCount?: string | string[];
  deliveryFee?: string | string[];
  deliveryTown?: string | string[];
  distanceKm?: string | string[];
  serviceFee?: string | string[];
  total?: string | string[];
};

const one = (value?: string | string[]): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

const isWeb = Platform.OS === "web";

export default function DeliveryConfirmScreen() {
  const params = useLocalSearchParams<Params>();

  const restaurant = one(params.restaurant).trim();
  const customerName = one(params.customerName).trim();
  const pickupKey = one(params.pickupKey);
  const pickupAddress = one(params.pickupAddress).trim();
  const pickupTown = one(params.pickupTown);
  const phone = one(params.phone).trim();
  const orderDetails = one(params.orderDetails).trim();
  const deliveryAddress = one(params.deliveryAddress);
  const deliveryTown = one(params.deliveryTown);
  const itemCount = Math.max(1, parseInt(one(params.itemCount), 10) || 1);

  // What the customer was shown on the previous screen. The server works out
  // the real amount again before anything is charged.
  const deliveryFee = Number(one(params.deliveryFee)) || 0;
  const serviceFee = Number(one(params.serviceFee)) || 0;
  const expectedTotal = Number(one(params.total)) || deliveryFee + serviceFee;

  const paymentLock = useRef(false);

  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // Alert.alert does nothing on the web, so messages are shown on the page.
  const [error, setError] = useState<string | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Set when the server's total differs from the one the customer saw.
  const [mismatch, setMismatch] = useState<{
    url: string;
    total: number;
  } | null>(null);

  const openPayment = (url: string) => {
    setPaymentUrl(url);

    if (isWeb) {
      openCheckout(url);
    }
  };

  const startPayment = async () => {
    if (paymentLock.current || paying || paymentUrl) return;

    paymentLock.current = true;
    setPaying(true);
    setError(null);

    try {
      const deliveryLocation = await loadDeliveryLocation();

      if (!deliveryLocation) {
        throw new Error("Choose your delivery location first.");
      }

      const result = await initializeDeliveryPayment({
        pickupKey,
        pickupAddress,
        restaurantName: restaurant || undefined,
        orderDetails: orderDetails || undefined,
        itemCount,
        deliveryLocation,
        customer: { name: customerName, phone },
      });

      const serverTotal = Number(result.total);

      if (
        !Number.isFinite(serverTotal) ||
        serverTotal <= 0 ||
        result.currency !== "GHS"
      ) {
        throw new Error(
          "The server returned an invalid payment amount. Please try again.",
        );
      }

      if (!result.authorization_url.startsWith("https://")) {
        throw new Error("Paystack did not return a valid payment URL.");
      }

      setOrderId(result.orderId);
      setReference(result.reference);

      // If the verified total is different, the customer has to agree to it.
      if (Math.abs(serverTotal - expectedTotal) > 0.01) {
        setMismatch({ url: result.authorization_url, total: serverTotal });
        return;
      }

      openPayment(result.authorization_url);
    } catch (caught) {
      console.error("Failed to start the delivery payment:", caught);
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to start payment. Please try again.",
      );
    } finally {
      setPaying(false);
      paymentLock.current = false;
    }
  };

  const confirmPayment = async () => {
    if (!reference || !orderId || verifying) return;

    setVerifying(true);
    setError(null);

    try {
      const result = await verifyPaystackPayment(reference, orderId);

      if (result.paid) {
        router.replace({
          pathname: "/orders/[id]",
          params: { id: result.orderId },
        });
      } else {
        setError(
          "Paystack has not confirmed this payment yet. If you completed it, wait a moment and try again.",
        );
      }
    } catch (caught) {
      console.error("Delivery payment verification failed:", caught);
      setError(
        caught instanceof Error
          ? caught.message
          : "We could not confirm your payment yet.",
      );
    } finally {
      setVerifying(false);
    }
  };

  // ---------- Paystack on a phone: shown inside the app ----------
  if (paymentUrl && !isWeb) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center border-b border-border px-4 pb-3 pt-12">
          <Pressable
            onPress={() => setPaymentUrl(null)}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-surface"
            accessibilityRole="button"
            accessibilityLabel="Return to the delivery summary"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <View className="flex-1">
            <Text className="text-lg font-bold text-text">Paystack</Text>
            <Text className="text-sm text-textSecondary">
              Complete your payment
            </Text>
          </View>
        </View>

        <WebView
          source={{ uri: paymentUrl }}
          startInLoadingState
          renderLoading={() => (
            <View className="absolute inset-0 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="#E53935" />
              <Text className="mt-3 text-textSecondary">
                Loading payment...
              </Text>
            </View>
          )}
        />

        <View className="border-t border-border bg-white p-4">
          {error ? (
            <Text
              accessibilityRole="alert"
              className="mb-3 text-xs text-primary"
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void confirmPayment()}
            disabled={verifying}
            className={`items-center rounded-xl bg-primary py-4 ${
              verifying ? "opacity-60" : ""
            }`}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">
                I Have Completed Payment
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------- Paystack on the web: opened in a new tab ----------
  if (paymentUrl && isWeb) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-full max-w-[480px] items-center">
          <Ionicons name="card-outline" size={44} color="#E53935" />

          <Text className="mt-4 text-center text-lg font-bold text-text">
            Complete your payment
          </Text>

          <Text className="mt-2 text-center text-sm leading-5 text-textSecondary">
            Taking you to Paystack. If nothing happens, tap "Open the payment
            page" below. After you pay, you will come back here.
          </Text>

          {error ? (
            <Text
              accessibilityRole="alert"
              className="mt-4 text-center text-xs text-primary"
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void confirmPayment()}
            disabled={verifying}
            className={`mt-6 w-full items-center rounded-xl bg-primary py-4 ${
              verifying ? "opacity-60" : ""
            }`}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">
                I Have Completed Payment
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => openCheckout(paymentUrl)}
            className="mt-4 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-primary">
              Open the payment page
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---------- Summary ----------
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-3 pt-14">
        <Pressable
          onPress={() => goBack("/delivery-request")}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="ml-3 text-xl font-bold text-text">
          Confirm Delivery
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 150,
        }}
      >
        {/* ROUTE */}
        <View className="mt-5 rounded-2xl border border-border bg-white p-5">
          <Text className="text-lg font-bold text-text">Delivery route</Text>

          <View className="mt-5 flex-row">
            <View className="items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="bag-handle-outline" size={18} color="#E53935" />
              </View>

              <View className="h-10 w-[1px] bg-border" />

              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <Ionicons name="location" size={18} color="#E53935" />
              </View>
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-xs text-textSecondary">PICKUP</Text>

              <Text className="mt-1 font-semibold text-text">
                {restaurant || pickupTown || "Pickup point"}
              </Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {pickupAddress}
                {pickupTown && restaurant ? ` (${pickupTown})` : ""}
              </Text>

              <View className="h-6" />

              <Text className="text-xs text-textSecondary">DELIVERY</Text>

              <Text className="mt-1 font-semibold text-text">
                {deliveryTown || "Your destination"}
              </Text>

              <Text className="mt-1 text-sm text-textSecondary">
                {deliveryAddress}
              </Text>
            </View>
          </View>

          {orderDetails ? (
            <Text className="mt-4 text-sm text-textSecondary">
              To collect: {orderDetails}
            </Text>
          ) : null}
        </View>

        {/* CUSTOMER */}
        <View className="mt-5 rounded-2xl bg-surface p-5">
          <Text className="text-lg font-bold text-text">
            Contact information
          </Text>

          <View className="mt-4 flex-row items-center">
            <Ionicons name="person-outline" size={19} color="#737373" />
            <Text className="ml-3 text-sm text-text">{customerName}</Text>
          </View>

          <View className="mt-3 flex-row items-center">
            <Ionicons name="call-outline" size={19} color="#737373" />
            <Text className="ml-3 text-sm text-text">{phone}</Text>
          </View>
        </View>

        {/* FEES */}
        <View className="mt-5 rounded-2xl border border-border p-5">
          <Text className="text-lg font-bold text-text">Charges</Text>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Delivery fee</Text>
            <Text className="font-bold text-text">
              GH₵{deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-textSecondary">Service fee</Text>
            <Text className="font-bold text-text">
              GH₵{serviceFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-4 border-t border-border pt-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-text">Total</Text>
              <Text className="text-xl font-bold text-primary">
                GH₵{expectedTotal.toFixed(2)}
              </Text>
            </View>

            <Text className="mt-2 text-xs text-textSecondary">
              The final amount is checked by AkroBite before you pay. You pay
              for the delivery only. Your food was already paid for.
            </Text>
          </View>
        </View>

        {/* THE TOTAL CHANGED */}
        {mismatch ? (
          <View className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <Text className="font-bold text-amber-800">Total updated</Text>

            <Text className="mt-1 text-sm leading-5 text-amber-800">
              You saw GH₵{expectedTotal.toFixed(2)}, but the checked total is
              GH₵{mismatch.total.toFixed(2)}. Continue with the checked amount?
            </Text>

            <View className="mt-4 flex-row">
              <Pressable
                onPress={() => {
                  setMismatch(null);
                  setOrderId(null);
                  setReference(null);
                }}
                className="mr-2 flex-1 items-center rounded-xl bg-white py-3"
              >
                <Text className="font-bold text-text">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => openPayment(mismatch.url)}
                className="flex-1 items-center rounded-xl bg-primary py-3"
              >
                <Text className="font-bold text-white">Continue</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* PAY */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        {error ? (
          <Text accessibilityRole="alert" className="mb-3 text-xs text-primary">
            {error}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void startPayment()}
          disabled={paying || mismatch !== null}
          className={`h-14 flex-row items-center justify-center rounded-xl bg-primary ${
            paying || mismatch !== null ? "opacity-50" : ""
          }`}
        >
          {paying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text className="font-bold text-white">Pay now</Text>

              <Text className="ml-3 font-bold text-white">
                GH₵{expectedTotal.toFixed(2)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
