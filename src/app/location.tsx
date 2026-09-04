import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function LocationScreen() {
  return (
    <View className="flex-1 bg-white px-6">
      <View className="flex-1 justify-center">
        {/* Location icon */}

        <View className="mb-[25px] h-[90px] w-[90px] self-center items-center justify-center rounded-full bg-[#FFF1F2]">
          <Text className="text-[42px]">📍</Text>
        </View>

        {/* Header */}

        <Text className="mb-[10px] text-center text-[28px] font-bold text-text">
          Where are you?
        </Text>

        <Text className="mb-8 text-center text-[15px] leading-[22px] text-textSecondary">
          Choose your location so AkroBite can show you restaurants and food
          available near you.
        </Text>

        {/* Current location */}

        <Pressable className="h-[54px] flex-row items-center justify-center rounded-[10px] bg-primary active:bg-primaryDark">
          <Text className="mr-[10px] text-xl">📍</Text>

          <Text className="text-[15px] font-bold text-white">
            Use my current location
          </Text>
        </Pressable>

        {/* OR */}

        <View className="my-6 flex-row items-center">
          <View className="h-px flex-1 bg-border" />

          <Text className="mx-3 text-xs text-textSecondary">OR</Text>

          <View className="h-px flex-1 bg-border" />
        </View>

        {/* Search */}

        <Pressable className="h-[54px] flex-row items-center justify-center rounded-[10px] border border-border">
          <Text className="mr-[10px] text-lg">🔍</Text>

          <Text className="text-[15px] font-semibold text-text">
            Search for a location
          </Text>
        </Pressable>

        {/* Continue */}

        <Pressable
          className="mt-5 h-[52px] items-center justify-center"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-[15px] font-bold text-primary">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
