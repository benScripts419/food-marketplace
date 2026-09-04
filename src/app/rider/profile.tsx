import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function RiderProfileScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* HEADER */}
        <View className="bg-white px-5 pb-6 pt-14">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-3 h-10 w-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={23} color="#171717" />
            </Pressable>

            <Text className="text-2xl font-bold text-text">Profile</Text>
          </View>
        </View>

        {/* PROFILE */}
        <View className="mt-4 items-center bg-white px-5 py-6">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-surface">
            <Ionicons name="person" size={48} color="#737373" />
          </View>

          <Text className="mt-4 text-xl font-bold text-text">Rider</Text>

          <Text className="mt-1 text-sm text-textSecondary">
            AkroBite Delivery Rider
          </Text>

          <View className="mt-4 flex-row items-center rounded-full bg-green-100 px-4 py-2">
            <View className="h-2.5 w-2.5 rounded-full bg-success" />

            <Text className="ml-2 text-xs font-semibold text-green-700">
              Active Rider
            </Text>
          </View>
        </View>

        {/* STATISTICS */}
        <View className="mx-5 mt-5 flex-row rounded-2xl border border-border bg-white p-4">
          <View className="flex-1 items-center border-r border-border">
            <Text className="text-xl font-bold text-text">48</Text>

            <Text className="mt-1 text-xs text-textSecondary">Deliveries</Text>
          </View>

          <View className="flex-1 items-center border-r border-border">
            <Text className="text-xl font-bold text-text">4.9</Text>

            <Text className="mt-1 text-xs text-textSecondary">Rating</Text>
          </View>

          <View className="flex-1 items-center">
            <Text className="text-xl font-bold text-text">GH₵1.2k</Text>

            <Text className="mt-1 text-xs text-textSecondary">Earnings</Text>
          </View>
        </View>

        {/* ACCOUNT */}
        <View className="mt-6 px-5">
          <Text className="mb-3 text-lg font-bold text-text">Account</Text>

          <View className="overflow-hidden rounded-2xl border border-border bg-white">
            <Pressable className="flex-row items-center border-b border-border p-4">
              <Ionicons name="person-outline" size={21} color="#737373" />

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text">
                  Personal Information
                </Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Manage your rider information
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#737373" />
            </Pressable>

            <Pressable className="flex-row items-center border-b border-border p-4">
              <Ionicons name="wallet-outline" size={21} color="#737373" />

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text">Earnings</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  View your earnings and payouts
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#737373" />
            </Pressable>

            <Pressable className="flex-row items-center p-4">
              <Ionicons name="card-outline" size={21} color="#737373" />

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text">Payment Details</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Manage your payout method
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#737373" />
            </Pressable>
          </View>
        </View>

        {/* RIDER PORTAL */}
        <View className="mt-6 px-5">
          <Pressable
            onPress={() => router.push("/rider")}
            className="flex-row items-center rounded-2xl border border-border bg-white p-4"
          >
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-surface">
              <Ionicons name="bicycle-outline" size={22} color="#E53935" />
            </View>

            <View className="ml-3 flex-1">
              <Text className="font-semibold text-text">Rider Portal</Text>

              <Text className="mt-1 text-xs text-textSecondary">
                Access your AkroBite rider account
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </Pressable>
        </View>

        {/* SETTINGS */}
        <View className="mt-6 px-5">
          <Text className="mb-3 text-lg font-bold text-text">Settings</Text>

          <View className="overflow-hidden rounded-2xl border border-border bg-white">
            <Pressable className="flex-row items-center border-b border-border p-4">
              <Ionicons
                name="notifications-outline"
                size={21}
                color="#737373"
              />

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text">Notifications</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Manage delivery notifications
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#737373" />
            </Pressable>

            <Pressable className="flex-row items-center p-4">
              <Ionicons name="help-circle-outline" size={21} color="#737373" />

              <View className="ml-3 flex-1">
                <Text className="font-semibold text-text">Help & Support</Text>

                <Text className="mt-1 text-xs text-textSecondary">
                  Get help with your deliveries
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#737373" />
            </Pressable>
          </View>
        </View>

        {/* LOGOUT */}
        <View className="mt-7 px-5">
          <Pressable
            onPress={() => router.replace("/rider")}
            className="h-14 items-center justify-center rounded-xl border border-primary bg-white"
          >
            <Text className="font-bold text-primary">Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View className="absolute bottom-0 left-0 right-0 flex-row border-t border-border bg-white px-4 pb-7 pt-3">
        <Pressable
          onPress={() => router.push("/rider/dashboard")}
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

          <Text className="mt-1 text-[10px] text-textSecondary">
            Deliveries
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/rider/active-delivery")}
          className="flex-1 items-center"
        >
          <Ionicons name="map-outline" size={21} color="#737373" />

          <Text className="mt-1 text-[10px] text-textSecondary">Map</Text>
        </Pressable>

        <Pressable className="flex-1 items-center">
          <Ionicons name="person" size={21} color="#E53935" />

          <Text className="mt-1 text-[10px] font-bold text-primary">
            Profile
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
