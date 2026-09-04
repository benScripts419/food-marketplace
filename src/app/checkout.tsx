import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type DeliveryOption = "standard" | "express";

export default function CheckoutScreen() {
  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOption>("standard");

  const { cartTotal, cartItems } = useCart();

  const subtotal = cartTotal;
  const deliveryFee = deliveryOption === "standard" ? 10 : 20;
  const serviceFee = 5;
  const total = subtotal + deliveryFee + serviceFee;

  // Prevent checkout with an empty cart
  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="text-lg font-bold text-text">Your cart is empty</Text>

        <Pressable
          onPress={() => router.replace("/restaurants")}
          className="mt-5 rounded-xl bg-primary px-6 py-3"
        >
          <Text className="font-bold text-white">Browse Restaurants</Text>
        </Pressable>
      </View>
    );
  }

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

          <Text className="ml-3 text-xl font-bold text-text">Checkout</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 130,
        }}
      >
        {/* DELIVERY ADDRESS */}
        <View className="mt-3">
          <Text className="mb-3 text-sm font-bold text-text">
            Delivery Address
          </Text>

          <View className="rounded-xl border border-border bg-white p-4">
            <View className="flex-row items-start">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-red-50">
                <Ionicons name="location-outline" size={19} color="#E53935" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-text">Home</Text>

                <Text className="mt-1 text-xs leading-4 text-textSecondary">
                  15 Third Close, East Legon
                  {"\n"}
                  Accra, Ghana
                </Text>
              </View>

              <Pressable onPress={() => router.push("/location")}>
                <Text className="text-xs font-bold text-primary">Change</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* DELIVERY OPTION */}
        <View className="mt-6">
          <Text className="mb-3 text-sm font-bold text-text">
            Delivery Option
          </Text>

          {/* STANDARD */}
          <Pressable
            onPress={() => setDeliveryOption("standard")}
            className={`mb-3 rounded-xl border p-4 ${
              deliveryOption === "standard" ? "border-primary" : "border-border"
            }`}
          >
            <View className="flex-row items-center">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  deliveryOption === "standard"
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {deliveryOption === "standard" && (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-text">
                  Standard Delivery
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  20–30 min
                </Text>
              </View>

              <Text className="text-xs font-bold text-text">GH₵10.00</Text>
            </View>
          </Pressable>

          {/* EXPRESS */}
          <Pressable
            onPress={() => setDeliveryOption("express")}
            className={`rounded-xl border p-4 ${
              deliveryOption === "express" ? "border-primary" : "border-border"
            }`}
          >
            <View className="flex-row items-center">
              <View
                className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                  deliveryOption === "express"
                    ? "border-primary"
                    : "border-border"
                }`}
              >
                {deliveryOption === "express" && (
                  <View className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-text">
                  Express Delivery
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  10–15 min
                </Text>
              </View>

              <Text className="text-xs font-bold text-text">GH₵20.00</Text>
            </View>
          </Pressable>
        </View>

        {/* ORDER SUMMARY */}
        <View className="mt-6">
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
      </ScrollView>

      {/* CONTINUE TO PAYMENT */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/payment",
              params: {
                deliveryOption,
              },
            })
          }
          className="h-14 flex-row items-center justify-center rounded-xl bg-primary"
        >
          <Text className="text-sm font-bold text-white">
            Continue to Payment
          </Text>

          <Text className="ml-3 text-sm font-bold text-white">
            GH₵{total.toFixed(2)}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
