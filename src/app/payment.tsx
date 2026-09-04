import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { useCart } from "@/context/CartContext";

type PaymentMethod = "mobile-money" | "card" | "ussd" | "cash";
type DeliveryOption = "standard" | "express";

export default function PaymentScreen() {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("mobile-money");

  const [provider, setProvider] = useState("MTN Mobile Money");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [cardNumber, setCardNumber] = useState("");

  const [expiryDate, setExpiryDate] = useState("");

  const [cvv, setCvv] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  const { cartTotal, cartItems, placeOrder } = useCart();

  const { deliveryOption: deliveryParam } = useLocalSearchParams<{
    deliveryOption?: string;
  }>();

  const deliveryOption: DeliveryOption =
    deliveryParam === "express" ? "express" : "standard";

  const subtotal = cartTotal;

  const deliveryFee = deliveryOption === "express" ? 20 : 10;

  const serviceFee = cartItems.length > 0 ? 5 : 0;

  const total = subtotal + deliveryFee + serviceFee;

  const handlePayment = () => {
    if (isProcessing) return;

    setIsProcessing(true);

    // In your current app, reaching this point
    // represents a successful payment.
    const newOrder = placeOrder(deliveryFee, serviceFee);

    if (!newOrder) {
      setIsProcessing(false);
      return;
    }

    // Open tracking for the exact order that was just created
    router.replace({
      pathname: "/order-tracking",
      params: {
        orderId: newOrder.id,
      },
    });
  };

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
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
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 130,
        }}
      >
        {/* PAYMENT METHOD */}
        <View className="mt-3">
          <Text className="mb-3 text-sm font-bold text-text">
            Payment Method
          </Text>

          <View className="rounded-xl border border-border bg-white p-3">
            <PaymentOption
              title="Mobile Money"
              icon="phone-portrait-outline"
              selected={paymentMethod === "mobile-money"}
              onPress={() => setPaymentMethod("mobile-money")}
            />

            <PaymentOption
              title="Card Payment"
              icon="card-outline"
              selected={paymentMethod === "card"}
              onPress={() => setPaymentMethod("card")}
            />

            <PaymentOption
              title="Pay with USSD"
              icon="keypad-outline"
              selected={paymentMethod === "ussd"}
              onPress={() => setPaymentMethod("ussd")}
            />

            <PaymentOption
              title="Cash on Delivery"
              icon="cash-outline"
              selected={paymentMethod === "cash"}
              onPress={() => setPaymentMethod("cash")}
              last
            />
          </View>
        </View>

        {/* MOBILE MONEY */}
        {paymentMethod === "mobile-money" && (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold text-text">
              Mobile Money
            </Text>

            {/* PROVIDER */}
            <View className="rounded-xl border border-border bg-white px-4 py-3">
              <Text className="mb-1 text-xs text-textSecondary">
                Mobile Money Provider
              </Text>

              <Pressable
                onPress={() =>
                  setProvider(
                    provider === "MTN Mobile Money"
                      ? "Telecel Cash"
                      : "MTN Mobile Money",
                  )
                }
                className="flex-row items-center justify-between"
              >
                <Text className="text-sm font-medium text-text">
                  {provider}
                </Text>

                <Ionicons name="chevron-down" size={18} color="#737373" />
              </Pressable>
            </View>

            {/* PHONE NUMBER */}
            <View className="mt-3 rounded-xl border border-border bg-white px-4 py-3">
              <Text className="mb-1 text-xs text-textSecondary">
                Mobile Money Number
              </Text>

              <TextInput
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                placeholder="055 123 4567"
                placeholderTextColor="#A3A3A3"
                className="text-sm font-medium text-text"
              />
            </View>
          </View>
        )}

        {/* CARD */}
        {paymentMethod === "card" && (
          <View className="mt-6">
            <Text className="mb-3 text-sm font-bold text-text">
              Card Details
            </Text>

            <View className="rounded-xl border border-border px-4 py-3">
              <Text className="mb-1 text-xs text-textSecondary">
                Card Number
              </Text>

              <TextInput
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#A3A3A3"
                keyboardType="number-pad"
                className="text-sm text-text"
              />
            </View>

            <View className="mt-3 flex-row">
              <View className="mr-2 flex-1 rounded-xl border border-border px-4 py-3">
                <Text className="mb-1 text-xs text-textSecondary">
                  Expiry Date
                </Text>

                <TextInput
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="MM/YY"
                  placeholderTextColor="#A3A3A3"
                  className="text-sm text-text"
                />
              </View>

              <View className="ml-2 flex-1 rounded-xl border border-border px-4 py-3">
                <Text className="mb-1 text-xs text-textSecondary">CVV</Text>

                <TextInput
                  value={cvv}
                  onChangeText={setCvv}
                  placeholder="123"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="number-pad"
                  secureTextEntry
                  className="text-sm text-text"
                />
              </View>
            </View>
          </View>
        )}

        {/* USSD */}
        {paymentMethod === "ussd" && (
          <View className="mt-6 rounded-xl border border-border p-4">
            <Text className="text-sm font-bold text-text">Pay with USSD</Text>

            <Text className="mt-2 text-xs leading-5 text-textSecondary">
              You will receive instructions to complete your payment using your
              mobile network&apos;s USSD service.
            </Text>
          </View>
        )}

        {/* CASH */}
        {paymentMethod === "cash" && (
          <View className="mt-6 rounded-xl border border-border p-4">
            <View className="flex-row items-center">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="cash-outline" size={20} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-text">
                  Cash on Delivery
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Pay the rider when your order arrives.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ORDER SUMMARY */}
        <View className="mt-7">
          <Text className="mb-3 text-sm font-bold text-text">
            Order Summary
          </Text>

          <View className="rounded-xl border border-border p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Subtotal</Text>

              <Text className="text-xs text-text">
                GH₵{subtotal.toFixed(2)}
              </Text>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Delivery Fee</Text>

              <Text className="text-xs text-text">
                GH₵{deliveryFee.toFixed(2)}
              </Text>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-textSecondary">Service Fee</Text>

              <Text className="text-xs text-text">
                GH₵{serviceFee.toFixed(2)}
              </Text>
            </View>

            <View className="my-4 border-t border-border" />

            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-text">Total</Text>

              <Text className="text-base font-bold text-text">
                GH₵{total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* SECURITY NOTE */}
        <View className="mt-5 flex-row items-center justify-center">
          <Ionicons name="lock-closed-outline" size={14} color="#737373" />

          <Text className="ml-2 text-[11px] text-textSecondary">
            Your payment information is secure
          </Text>
        </View>
      </ScrollView>

      {/* PAY BUTTON */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={handlePayment}
          disabled={isProcessing}
          className={`h-14 flex-row items-center justify-center rounded-xl ${
            isProcessing ? "bg-gray-400" : "bg-primary"
          }`}
        >
          <Text className="text-sm font-bold text-white">
            {isProcessing ? "Processing..." : `Pay GH₵${total.toFixed(2)}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* PAYMENT OPTION */

function PaymentOption({
  title,
  icon,
  selected,
  onPress,
  last = false,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3 ${
        !last ? "border-b border-border" : ""
      }`}
    >
      {/* RADIO */}
      <View
        className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <View className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </View>

      {/* ICON */}
      <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-surface">
        <Ionicons name={icon} size={17} color="#171717" />
      </View>

      {/* TITLE */}
      <Text className="ml-3 flex-1 text-sm font-medium text-text">{title}</Text>
    </Pressable>
  );
}
