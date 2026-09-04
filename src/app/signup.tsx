import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = () => {
    // Authentication will be connected later.
    // For now, continue to location selection.
    router.replace("/location");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 pb-[45px] pt-[35px]"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}

        <Pressable
          className="mb-2 h-10 w-10 justify-center"
          onPress={() => router.back()}
        >
          <Text className="text-[36px] leading-9 text-text">‹</Text>
        </Pressable>

        {/* Logo */}

        <View className="mb-[38px] items-center">
          <Image
            source={require("../../assets/images/akrobite-logo.png")}
            className="h-[100px] w-[100px]"
            resizeMode="contain"
          />

          <Text className="-mt-8 text-[13px] text-textSecondary">
            Good food, fast delivery
          </Text>
        </View>

        {/* Header */}

        <View className="mb-6">
          <Text className="mb-[7px] text-[26px] font-bold text-text">
            Create your account
          </Text>

          <Text className="text-sm leading-5 text-textSecondary">
            Join AkroBite and discover great food around you.
          </Text>
        </View>

        {/* Full Name */}

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-text">
            Full name
          </Text>

          <TextInput
            className="h-[52px] rounded-[10px] border border-border  px-[15px] text-[15px] text-text"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#737373"
            autoCapitalize="words"
          />
        </View>

        {/* Email / Phone */}

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-text">
            Email or phone number
          </Text>

          <TextInput
            className="h-[52px] rounded-[10px] border border-border px-[15px] text-[15px] text-text"
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="Enter your email or phone"
            placeholderTextColor="#737373"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Password */}

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-text">Password</Text>

          <View className="h-[52px] flex-row items-center rounded-[10px] border border-border">
            <TextInput
              className="h-full flex-1 px-[15px] text-[15px] text-text"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#737373"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />

            <Pressable
              className="h-full justify-center px-[14px]"
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text className="text-lg">{showPassword ? "🙈" : "👁"}</Text>
            </Pressable>
          </View>
        </View>

        {/* Confirm Password */}

        <View className="mb-4">
          <Text className="mb-2 text-sm font-semibold text-text">
            Confirm password
          </Text>

          <View className="h-[52px] flex-row items-center rounded-[10px] border border-border">
            <TextInput
              className="h-full flex-1 px-[15px] text-[15px] text-text"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#737373"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />

            <Pressable
              className="h-full justify-center px-[14px]"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text className="text-lg">
                {showConfirmPassword ? "🙈" : "👁"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Terms */}

        <Text className="mb-5 mt-[2px] text-xs leading-[18px] text-textSecondary">
          By creating an account, you agree to our{" "}
          <Text className="font-semibold text-primary">Terms of Service</Text>{" "}
          and <Text className="font-semibold text-primary">Privacy Policy</Text>
          .
        </Text>

        {/* Sign Up Button */}

        <Pressable
          className="h-[52px] w-full items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
          onPress={handleSignup}
        >
          <Text className="text-[15px] font-bold text-white">
            Create Account
          </Text>
        </Pressable>

        {/* Login */}

        <View className="mt-[25px] flex-row justify-center">
          <Text className="text-sm text-textSecondary">
            Already have an account?
          </Text>

          <Pressable onPress={() => router.replace("/login")}>
            <Text className="ml-[5px] text-sm font-bold text-primary">
              Login
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
