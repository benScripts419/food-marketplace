import { Image, Text, View } from "react-native";

import { router } from "expo-router";

import Button from "../components/ui/Button";

export default function OnboardingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-5">
      <View className="mb-8">
        <Image
          source={require("../../assets/images/splash-icon.png")}
          className="h-60 w-60"
          resizeMode="contain"
        />
      </View>

      <Text className="mb-[10px] text-center text-2xl font-bold text-text">
        Delicious food delivered to you
      </Text>
      <Text className="mb-[40px] text-center text-md text-textSecondary">
        Order from your favorite restaurants and get it delivered to your
        doorstep.
      </Text>

      <View className="mb-[40px] flex-row justify-center items-center gap-2">
        <View className="h-[10px] w-[10px] rounded-full bg-primary" />
        <View className="h-2 w-2 rounded-full bg-background" />
        <View className="h-2 w-2 rounded-full bg-background" />
      </View>

      <Button title="Next" onPress={() => router.push("/login")} />

      <Text
        className="mt-5 text-base text-primary"
        onPress={() => router.replace("/login")}
      >
        Skip
      </Text>
    </View>
  );
}
