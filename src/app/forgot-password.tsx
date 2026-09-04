import { Pressable, Text, TextInput, View } from "react-native";

import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  return (
    <View className="flex-1 bg-white px-6 pt-[55px]">
      {/* Back */}

      <Pressable
        className="mb-[35px] h-10 w-10 justify-center"
        onPress={() => router.back()}
      >
        <Text className="text-[36px] leading-9 text-text">‹</Text>
      </Pressable>

      {/* Header */}

      <View className="mb-[35px] items-center">
        <View className="mb-5 h-[70px] w-[70px] items-center justify-center rounded-full bg-[#FFF1F2]">
          <Text className="text-[30px]">🔐</Text>
        </View>

        <Text className="mb-[10px] text-[27px] font-bold text-text">
          Forgot password?
        </Text>

        <Text className="max-w-[320px] text-center text-sm leading-[21px] text-textSecondary">
          Enter your email or phone number and we'll help you reset your
          password.
        </Text>
      </View>

      {/* Input */}

      <View className="mb-[22px]">
        <Text className="mb-2 text-sm font-semibold text-text">
          Email or phone number
        </Text>

        <TextInput
          className="h-[52px] rounded-[10px] border border-border px-[15px] text-[15px] text-text"
          placeholder="Enter your email or phone"
          placeholderTextColor="#737373"
          autoCapitalize="none"
        />
      </View>

      {/* Button */}

      <Pressable className="h-[52px] items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark">
        <Text className="text-[15px] font-bold text-white">
          Send Reset Code
        </Text>
      </Pressable>

      {/* Back */}

      <Pressable
        className="mt-[25px] items-center"
        onPress={() => router.back()}
      >
        <Text className="text-sm font-semibold text-primary">
          Back to Login
        </Text>
      </Pressable>
    </View>
  );
}
