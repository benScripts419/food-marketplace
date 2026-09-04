import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

export default function RiderLoginScreen() {
  return (
    <View className="flex-1 bg-white px-5 pt-16">
      <View className="items-center">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary">
          <Ionicons name="bicycle" size={40} color="#FFFFFF" />
        </View>

        <Text className="mt-5 text-2xl font-bold text-text">Rider Login</Text>

        <Text className="mt-2 text-center text-sm text-textSecondary">
          Sign in to start receiving delivery requests
        </Text>
      </View>

      <View className="mt-10">
        <Text className="mb-2 text-sm font-semibold text-text">
          Phone Number
        </Text>

        <TextInput
          placeholder="Enter phone number"
          placeholderTextColor="#737373"
          keyboardType="phone-pad"
          className="rounded-xl border border-border bg-white px-4 py-4 text-text"
        />

        <Text className="mb-2 mt-5 text-sm font-semibold text-text">
          Password
        </Text>

        <TextInput
          placeholder="Enter password"
          placeholderTextColor="#737373"
          secureTextEntry
          className="rounded-xl border border-border bg-white px-4 py-4 text-text"
        />

        <Pressable className="mt-3 self-end">
          <Text className="text-sm font-semibold text-primary">
            Forgot password?
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/rider/dashboard")}
          className="mt-6 h-12 items-center justify-center rounded-xl bg-primary"
        >
          <Text className="font-bold text-white">Login</Text>
        </Pressable>
      </View>

      <View className="mt-8 flex-row justify-center">
        <Text className="text-sm text-textSecondary">
          Don't have a rider account?{" "}
        </Text>

        <Pressable>
          <Text className="text-sm font-bold text-primary">Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}
