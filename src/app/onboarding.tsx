import { Image, Pressable, ScrollView, Text, View } from "react-native";

import { router } from "expo-router";

export default function OnboardingScreen() {
  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="min-h-full items-center justify-center px-4 py-8 sm:px-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full max-w-[560px] items-center">
        <View className="mb-6 h-48 w-48 sm:h-60 sm:w-60">
          <Image
            source={require("../../assets/images/splash-icon.png")}
            className="h-full w-full"
            resizeMode="contain"
          />
        </View>

        <Text className="mb-[10px] text-center text-2xl font-bold text-text">
          Delicious food delivered to you
        </Text>
        <Text className="mb-8 max-w-[480px] text-center text-base text-textSecondary sm:mb-10">
          Order from your favorite restaurants and get it delivered to your
          doorstep.
        </Text>

        <View className="mb-8 flex-row items-center justify-center gap-2 sm:mb-10">
          <View className="h-[10px] w-[10px] rounded-full bg-primary" />
          <View className="h-2 w-2 rounded-full bg-background" />
          <View className="h-2 w-2 rounded-full bg-background" />
        </View>

        <Pressable
          className="h-[52px] w-full items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
          onPress={() => router.push("/login")}
        >
          <Text className="text-[15px] font-bold text-white">Next</Text>
        </Pressable>

        <Text
          className="mt-5 text-base text-primary"
          onPress={() => router.replace("/login")}
        >
          Skip
        </Text>
      </View>
    </ScrollView>
  );
}
