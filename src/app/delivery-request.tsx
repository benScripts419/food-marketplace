import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function DeliveryRequestScreen() {
  const [restaurant, setRestaurant] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [orderDetails, setOrderDetails] = useState("");

  const canContinue =
    restaurant.trim() &&
    pickupAddress.trim() &&
    deliveryAddress.trim() &&
    phone.trim();

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-3 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="ml-3 text-xl font-bold text-text">
          Request Delivery
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 120,
        }}
      >
        {/* INTRO */}
        <View className="mt-3 rounded-2xl bg-surface p-5">
          <View className="flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="bicycle-outline" size={24} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">
                Already ordered your food?
              </Text>

              <Text className="mt-1 text-xs leading-5 text-textSecondary">
                Tell us where your food is and where you'd like it delivered.
              </Text>
            </View>
          </View>
        </View>

        {/* RESTAURANT */}
        <View className="mt-6">
          <Text className="mb-2 text-sm font-bold text-text">
            Restaurant name
          </Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="restaurant-outline" size={19} color="#737373" />

            <TextInput
              value={restaurant}
              onChangeText={setRestaurant}
              placeholder="e.g. Mama's Kitchen"
              placeholderTextColor="#737373"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* PICKUP */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Pickup location
          </Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="location-outline" size={19} color="#E53935" />

            <TextInput
              value={pickupAddress}
              onChangeText={setPickupAddress}
              placeholder="Where should the rider pick it up?"
              placeholderTextColor="#737373"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* DELIVERY */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Delivery location
          </Text>

          <View className="flex-row items-start rounded-xl border border-border bg-white px-4">
            <Ionicons
              name="navigate-outline"
              size={19}
              color="#E53935"
              style={{ marginTop: 16 }}
            />

            <TextInput
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              placeholder="Where should we deliver your food?"
              placeholderTextColor="#737373"
              multiline
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* PHONE */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">Phone number</Text>

          <View className="flex-row items-center rounded-xl border border-border bg-white px-4">
            <Ionicons name="call-outline" size={19} color="#737373" />

            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="024 XXX XXXX"
              placeholderTextColor="#737373"
              keyboardType="phone-pad"
              className="ml-3 flex-1 py-4 text-sm text-text"
            />
          </View>
        </View>

        {/* ORDER DETAILS */}
        <View className="mt-5">
          <Text className="mb-2 text-sm font-bold text-text">
            Order details
          </Text>

          <Text className="mb-2 text-xs text-textSecondary">
            Optional — help the restaurant identify your order.
          </Text>

          <View className="rounded-xl border border-border bg-white px-4">
            <TextInput
              value={orderDetails}
              onChangeText={setOrderDetails}
              placeholder="e.g. Jollof with chicken, order #245"
              placeholderTextColor="#737373"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="min-h-[90px] py-4 text-sm text-text"
            />
          </View>
        </View>
      </ScrollView>

      {/* CONTINUE */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-white px-5 pb-7 pt-3">
        <Pressable
          disabled={!canContinue}
          onPress={() =>
            router.push({
              pathname: "/delivery-confirm",
              params: {
                restaurant,
                pickupAddress,
                deliveryAddress,
                phone,
                orderDetails,
              },
            })
          }
          className={`h-14 items-center justify-center rounded-xl ${
            canContinue ? "bg-primary" : "bg-border"
          }`}
        >
          <Text className="font-bold text-white">Continue</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
