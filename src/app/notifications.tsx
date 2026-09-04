import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

const notifications = [
  {
    id: "1",
    title: "Welcome to AkroBite 🎉",
    message:
      "Your AkroBite account is ready. Start exploring restaurants near you.",
    time: "Just now",
    icon: "restaurant-outline",
    unread: true,
  },
  {
    id: "2",
    title: "Special offer",
    message: "Get 30% off your first order. Don't miss out!",
    time: "2 hours ago",
    icon: "pricetag-outline",
    unread: true,
  },
  {
    id: "3",
    title: "Discover nearby restaurants",
    message: "Check out restaurants delivering to your location.",
    time: "Yesterday",
    icon: "location-outline",
    unread: false,
  },
];

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-5 pb-4 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={23} color="#171717" />
        </Pressable>

        <Text className="ml-3 text-xl font-bold text-text">Notifications</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            className={`mb-3 flex-row rounded-2xl border border-border p-4 ${
              notification.unread ? "bg-red-50" : "bg-white"
            }`}
          >
            {/* ICON */}
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Ionicons
                name={notification.icon as any}
                size={21}
                color="#E53935"
              />
            </View>

            {/* CONTENT */}
            <View className="ml-3 flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 text-sm font-bold text-text">
                  {notification.title}
                </Text>

                {notification.unread && (
                  <View className="ml-2 h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </View>

              <Text className="mt-1 text-sm leading-5 text-textSecondary">
                {notification.message}
              </Text>

              <Text className="mt-2 text-xs text-textSecondary">
                {notification.time}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
