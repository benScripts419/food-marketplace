import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { useCart } from "@/context/CartContext";
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from "@/lib/paystack";

type DeliveryOption = "standard" | "express";

export default function PaymentScreen() {
  const { cartTotal, cartItems, placeOrder } = useCart();

  const { deliveryOption: deliveryParam } =
    useLocalSearchParams<{ deliveryOption?: string }>();

  const deliveryOption: DeliveryOption =
    deliveryParam === "express" ? "express" : "standard";

  const deliveryFee = deliveryOption === "express" ? 20 : 10;
  const serviceFee = cartItems.length > 0 ? 5 : 0;
  const total = cartTotal + deliveryFee + serviceFee;

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startPayment = async () => {
    if (isProcessing) return;

    if (cartItems.length === 0) {
      Alert.alert("Cart is empty", "Add an item before making a payment.");
      return;
    }

    try {
      setIsProcessing(true);

      const payment = await initializePaystackPayment({
        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        })),
        deliveryFee,
        serviceFee,
        deliveryOption,
      });

      setOrderId(payment.orderId);
      setReference(payment.reference);
      setCheckoutUrl(payment.authorization_url);
    } catch (error) {
      Alert.alert(
        "Payment Error",
        error instanceof Error ? error.message : "Unable to start payment.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const finishPayment = async () => {
    if (!reference || !orderId) return;

    try {
      setIsProcessing(true);

      await verifyPaystackPayment(reference, orderId);

      // Your existing CartContext clears the cart here only after
      // server-side payment verification succeeds.
      placeOrder(deliveryFee, serviceFee);

      router.replace("/order-tracking");
    } catch (error) {
      Alert.alert(
        "Payment not confirmed",
        error instanceof Error
          ? error.message
          : "Your payment has not been confirmed yet.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (checkoutUrl) {
    return (
      <View className="flex-1 bg-white">
        <View className="flex-row items-center border-b border-border px-5 pb-4 pt-14">
          <Pressable
            onPress={() => setCheckoutUrl(null)}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#171717" />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-text">
            Pay with Paystack
          </Text>
        </View>

        <WebView
          source={{ uri: checkoutUrl }}
          startInLoadingState
          renderLoading={() => (
            <View className="flex-1 items-center justify-center bg-white">
              <ActivityIndicator size="large" color="#E53935" />
              <Text className="mt-3 text-sm text-textSecondary">
                Loading secure checkout...
              </Text>
            </View>
          )}
        />

        <View className="border-t border-border bg-white px-5 pb-7 pt-3">
          <Pressable
            onPress={finishPayment}
            disabled={isProcessing}
            className={`h-14 items-center justify-center rounded-xl ${
              isProcessing ? "bg-gray-400" : "bg-primary"
            }`}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="font-bold text-white">
                I have completed payment
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pb-4 pt-14">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <Text className="ml-3 text-xl font-bold text-text">Payment</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
      >
        <View className="mt-3">
          <Text className="mb-3 text-sm font-bold text-text">
            Payment Method
          </Text>

          <View className="rounded-xl border border-border bg-white p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                <Ionicons name="card-outline" size={20} color="#171717" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-text">Paystack</Text>
                <Text className="mt-1 text-xs text-textSecondary">
                  Card, Mobile Money, Bank and other supported channels
                </Text>
              </View>

              <Ionicons name="checkmark-circle" size={23} color="#E53935" />
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-xl border border-border bg-white p-4">
          <Text className="text-sm font-bold text-text">Order Summary</Text>

          <View className="mt-4 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Subtotal</Text>
            <Text className="text-sm font-semibold text-text">
              GH₵{cartTotal.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Delivery</Text>
            <Text className="text-sm font-semibold text-text">
              GH₵{deliveryFee.toFixed(2)}
            </Text>
          </View>

          <View className="mt-3 flex-row justify-between">
            <Text className="text-sm text-textSecondary">Service fee</Text>
            <Text className="text-sm font-semibold text-text">
              GH₵{serviceFee.toFixed(2)}
            </Text>
          </View>

          <View className="my-4 border-t border-border" />

          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-text">Total</Text>
            <Text className="text-base font-bold text-primary">
              GH₵{total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row items-center justify-center">
          <Ionicons name="lock-closed-outline" size={14} color="#737373" />
          <Text className="ml-2 text-[11px] text-textSecondary">
            Your payment is securely processed by Paystack
          </Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={startPayment}
          disabled={isProcessing}
          className={`h-14 flex-row items-center justify-center rounded-xl ${
            isProcessing ? "bg-gray-400" : "bg-primary"
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-sm font-bold text-white">
              Pay GH₵{total.toFixed(2)}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
