import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function DeliveryTrackingScreen() {
  return (
    <View className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}
        <View className="flex-row items-center px-5 pt-14">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          >
            <Ionicons name="arrow-back" size={22} color="#171717" />
          </Pressable>

          <Text className="ml-4 text-xl font-bold text-text">
            Delivery Tracking
          </Text>
        </View>

        {/* STATUS */}
        <View className="mx-5 mt-7 rounded-2xl bg-primary p-5">
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <Ionicons name="bicycle" size={26} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="text-xs font-medium text-white">
                DELIVERY IN PROGRESS
              </Text>

              <Text className="mt-1 text-lg font-bold text-white">
                Your delivery is on the way
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-sm leading-5 text-white">
            Your AkroBite rider has picked up your order and is heading to your
            delivery location.
          </Text>
        </View>

        {/* DELIVERY DETAILS */}
        <View className="mx-5 mt-6">
          <Text className="text-lg font-bold text-text">Delivery details</Text>

          <View className="mt-4 rounded-2xl border border-border bg-white p-5">
            {/* PICKUP */}
            <View className="flex-row">
              <View className="items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color="#E53935"
                  />
                </View>

                <View className="h-10 w-px bg-border" />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-xs text-textSecondary">PICKUP</Text>

                <Text className="mt-1 font-bold text-text">Mama's Kitchen</Text>

                <Text className="mt-1 text-sm text-textSecondary">
                  Restaurant pickup
                </Text>
              </View>
            </View>

            {/* DELIVERY LOCATION */}
            <View className="flex-row">
              <View className="items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="location" size={18} color="#E53935" />
                </View>
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-xs text-textSecondary">
                  DELIVERING TO
                </Text>

                <Text className="mt-1 font-bold text-text">
                  Akropong, Ghana
                </Text>

                <Text className="mt-1 text-sm text-textSecondary">
                  Your selected delivery address
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RIDER */}
        <View className="mx-5 mt-6">
          <Text className="text-lg font-bold text-text">
            Your delivery rider
          </Text>

          <View className="mt-4 flex-row items-center rounded-2xl border border-border p-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <Ionicons name="person" size={28} color="#737373" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-bold text-text">Kwame</Text>

              <View className="mt-1 flex-row items-center">
                <Ionicons name="star" size={13} color="#F59E0B" />

                <Text className="ml-1 text-xs text-textSecondary">4.9</Text>

                <Text className="mx-2 text-xs text-border">•</Text>

                <Text className="text-xs text-textSecondary">
                  AkroBite Rider
                </Text>
              </View>
            </View>

            <Pressable className="h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Ionicons name="call-outline" size={19} color="#E53935" />
            </Pressable>
          </View>
        </View>

        {/* ESTIMATED ARRIVAL */}
        <View className="mx-5 mt-6 rounded-2xl bg-surface p-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-textSecondary">
                ESTIMATED ARRIVAL
              </Text>

              <Text className="mt-1 text-2xl font-bold text-text">
                15–20 min
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
              <Ionicons name="time-outline" size={25} color="#E53935" />
            </View>
          </View>
        </View>

        {/* TRACKING STEPS */}
        <View className="mx-5 mt-6">
          <Text className="text-lg font-bold text-text">Delivery status</Text>

          <View className="mt-4">
            {/* STEP 1 */}
            <View className="flex-row">
              <View className="items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                </View>

                <View className="h-9 w-px bg-primary" />
              </View>

              <View className="ml-3">
                <Text className="font-bold text-text">Delivery requested</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Your request has been received
                </Text>
              </View>
            </View>

            {/* STEP 2 */}
            <View className="flex-row">
              <View className="items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary">
                  <Ionicons name="checkmark" size={19} color="#FFFFFF" />
                </View>

                <View className="h-9 w-px bg-primary" />
              </View>

              <View className="ml-3">
                <Text className="font-bold text-text">Order picked up</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Rider collected your order
                </Text>
              </View>
            </View>

            {/* STEP 3 */}
            <View className="flex-row">
              <View className="items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-red-100">
                  <Ionicons name="bicycle" size={18} color="#E53935" />
                </View>
              </View>

              <View className="ml-3">
                <Text className="font-bold text-primary">On the way</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Your order is being delivered
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
