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

import { useSocialAuth } from "@/hooks/use-social-auth";
import { router } from "expo-router";

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    error: socialAuthError,
    loadingProvider,
    signInWithApple,
    signInWithGoogle,
  } = useSocialAuth();

  const handleLogin = () => {
    // Authentication will be connected later.
    router.replace("/(tabs)");
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    const signedIn =
      provider === "google"
        ? await signInWithGoogle()
        : await signInWithApple();

    if (signedIn) router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white pt-20"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow items-center px-4 pb-10 pt-8 sm:px-6 sm:pt-[45px]"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full max-w-[560px]">
          {/* Logo */}

          <View className="mb-[38px] items-center">
            <Image
              source={require("../../assets/images/akrobite-logo.png")}
              className="h-14 w-40 sm:h-16 sm:w-44 md:h-20 md:w-52"
              resizeMode="contain"
            />
          </View>

          {/* Header */}

          <View className="mb-[25px]">
            <Text className="mb-[6px] text-[27px] font-bold text-text">
              Welcome back!
            </Text>

            <Text className="text-[15px] text-textSecondary">
              Login to continue
            </Text>
          </View>

          {/* Email / Phone */}

          <View className="mb-[18px]">
            <Text className="mb-2 text-sm font-semibold text-text">
              Email or phone number
            </Text>

            <TextInput
              className="h-[52px] rounded-[10px] border border-border bg-white px-[15px] text-[15px] text-text"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Enter your email or phone"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}

          <View className="mb-[18px]">
            <Text className="mb-2 text-sm font-semibold text-text">
              Password
            </Text>

            <View className="h-[52px] flex-row items-center rounded-[10px] border border-border">
              <TextInput
                className="h-full flex-1 px-[15px] text-[15px] text-text"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#737373"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <Pressable
                className="h-full items-center justify-center px-[14px]"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-lg">{showPassword ? "🙈" : "👁"}</Text>
              </Pressable>
            </View>
          </View>

          {/* Forgot password */}

          <Pressable
            className="mb-[22px] self-end"
            onPress={() => router.push("/forgot-password")}
          >
            <Text className="text-[13px] font-semibold text-primary">
              Forgot password?
            </Text>
          </Pressable>

          {/* Login button */}

          <Pressable
            className="h-[52px] w-full items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
            onPress={handleLogin}
          >
            <Text className="text-[15px] font-bold text-white">Login</Text>
          </Pressable>

          {/* Divider */}

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-border" />

            <Text className="mx-3 text-xs text-textSecondary">
              or continue with
            </Text>

            <View className="h-px flex-1 bg-border" />
          </View>

          {/* Social buttons */}

          <View className="flex-row items-center justify-center gap-6">
            <Pressable
              className="items-center justify-center"
              disabled={loadingProvider !== null}
              onPress={() => void handleSocialLogin("google")}
            >
              <Image
                source={require("../../assets/images/google-logo.png")}
                className="h-10 w-10 rounded-lg border border-border sm:h-11 sm:w-11 md:h-12 md:w-12"
                resizeMode="contain"
              />

              <Text className="mt-[8px] text-[11px] text-textSecondary">
                Google
              </Text>
            </Pressable>

            <Pressable
              className="items-center justify-center"
              disabled={loadingProvider !== null}
              onPress={() => void handleSocialLogin("apple")}
            >
              <Image
                source={require("../../assets/images/apple-logo.png")}
                className="h-10 w-10 rounded-lg border border-border sm:h-11 sm:w-11 md:h-12 md:w-12"
                resizeMode="contain"
              />

              <Text className="mt-[8px] text-[11px] text-textSecondary">
                Apple
              </Text>
            </Pressable>
          </View>

          {loadingProvider ? (
            <Text className="mt-4 text-center text-sm text-textSecondary">
              Connecting to {loadingProvider === "google" ? "Google" : "Apple"}
              ...
            </Text>
          ) : null}

          {socialAuthError ? (
            <Text className="mt-4 text-center text-sm text-primary">
              {socialAuthError}
            </Text>
          ) : null}

          {/* Sign up */}

          <View className="mt-[30px] flex-row justify-center">
            <Text className="text-sm text-textSecondary">
              Don't have an account?
            </Text>

            <Pressable onPress={() => router.push("/signup")}>
              <Text className="ml-[5px] text-sm font-bold text-primary">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
