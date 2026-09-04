import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-white px-5 pt-6">
      <Text className="text-2xl font-bold text-text">My Profile</Text>

      {/* PROFILE */}
      <View className="mt-6 flex-row items-center">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Text className="text-xl font-bold text-white">A</Text>
        </View>

        <View className="ml-4">
          <Text className="text-lg font-bold text-text">Ama</Text>

          <Text className="text-sm text-textSecondary">ama@example.com</Text>
        </View>
      </View>

      {/* OPTIONS */}
      <View className="mt-8">
        {[
          {
            icon: "person-outline",
            title: "Personal Information",
          },
          {
            icon: "location-outline",
            title: "Saved Addresses",
          },
          {
            icon: "card-outline",
            title: "Payment Methods",
          },
          {
            icon: "help-circle-outline",
            title: "Help & Support",
          },
          {
            icon: "settings-outline",
            title: "Settings",
          },
        ].map((item) => (
          <TouchableOpacity
            key={item.title}
            className="flex-row items-center border-b border-border py-5"
          >
            <Ionicons name={item.icon as any} size={22} color="#171717" />

            <Text className="ml-4 flex-1 text-sm font-medium text-text">
              {item.title}
            </Text>

            <Ionicons name="chevron-forward" size={18} color="#737373" />
          </TouchableOpacity>
        ))}

        {/* RIDER PORTAL */}
        <TouchableOpacity
          onPress={() => router.push("/rider")}
          className="mt-2 flex-row items-center border-b border-border py-5"
        >
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-red-50">
            <Ionicons name="bicycle-outline" size={21} color="#E53935" />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-sm font-bold text-text">Rider Portal</Text>

            <Text className="mt-1 text-xs text-textSecondary">
              Access your AkroBite rider account
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#737373" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
