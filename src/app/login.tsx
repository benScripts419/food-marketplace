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

import { useSocialAuth } from "@/hooks/use-social-auth";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    error: socialAuthError,
    loadingProvider,
    signInWithGoogle,
  } = useSocialAuth();

  const busy = loggingIn || loadingProvider !== null;

  const handleSocialLogin = async () => {
    if (busy) return;

    setLoginError(null);

    const signedIn = await signInWithGoogle();

    if (signedIn) {
      router.replace("/(tabs)");
    }
  };

  const handleLogin = async () => {
    if (busy) return;

    setLoginError(null);

    const email = emailOrPhone.trim().toLowerCase();

    if (!email || !password) {
      setLoginError("Enter your email and password.");
      return;
    }

    if (!email.includes("@")) {
      setLoginError("Phone login isn't available yet. Please use your email.");
      return;
    }

    setLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setLoginError(
            "Incorrect email or password. Check your details and try again.",
          );
        } else if (
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setLoginError("Please verify your email address before logging in.");
        } else {
          setLoginError(error.message);
        }

        return;
      }

      if (!data.session) {
        setLoginError("Login did not create a session. Please try again.");
        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Email login failed:", error);

      setLoginError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[460px] rounded-2xl border border-gray-100 bg-white px-5 py-7 shadow-sm sm:px-9 sm:py-9 lg:px-10">
          {/* Logo */}
          <View className="mb-5 w-full items-center">
            <Image
              source={require("../../assets/images/akrobite-logo.png")}
              resizeMode="contain"
              style={{
                width: 136,
                height: 44,
                maxWidth: "100%",
                flexGrow: 0,
                flexShrink: 0,
              }}
              accessibilityLabel="AkroBite logo"
            />
          </View>

          {/* Heading */}
          <View className="mb-7">
            <Text className="mb-2 text-2xl font-bold text-text sm:text-3xl">
              Welcome back!
            </Text>

            <Text className="text-sm leading-6 text-textSecondary sm:text-base">
              Log in to discover restaurants and order your favourite meals.
            </Text>
          </View>

          {/* Email */}
          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-text">Email</Text>

            <TextInput
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-text outline-none focus:border-primary"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Enter your email"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!busy}
              returnKeyType="next"
              accessibilityLabel="Email address"
            />
          </View>

          {/* Password */}
          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-text">
              Password
            </Text>

            <View className="h-12 w-full flex-row items-center rounded-lg border border-border bg-white focus-within:border-primary">
              <TextInput
                className="h-full min-w-0 flex-1 px-4 text-base text-text outline-none"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#737373"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                editable={!busy}
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
                accessibilityLabel="Password"
              />

              <Pressable
                className="h-full justify-center px-4"
                onPress={() => setShowPassword((previous) => !previous)}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Text className="text-base text-textSecondary">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Forgot password */}
          <Pressable
            className="mb-6 self-end py-2"
            onPress={() => router.push("/forgot-password")}
            disabled={busy}
            accessibilityRole="link"
          >
            <Text className="text-sm font-semibold text-primary">
              Forgot password?
            </Text>
          </Pressable>

          {/* Login button */}
          <Pressable
            className={`h-12 w-full items-center justify-center rounded-lg ${
              busy ? "bg-gray-400" : "bg-primary"
            }`}
            disabled={busy}
            onPress={() => void handleLogin()}
            accessibilityRole="button"
          >
            <Text className="text-base font-bold text-white">
              {loggingIn ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          {/* Email login error */}
          {loginError ? (
            <Text
              className="mt-3 text-center text-sm leading-5 text-red-600"
              accessibilityRole="alert"
            >
              {loginError}
            </Text>
          ) : null}

          {/* Divider */}
          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-3 text-xs text-textSecondary">
              OR CONTINUE WITH
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          {/* Google sign-in */}
          <Pressable
            className={`h-12 w-full flex-row items-center justify-center rounded-lg border border-border bg-white ${
              busy ? "opacity-50" : ""
            }`}
            disabled={busy}
            onPress={() => void handleSocialLogin()}
            accessibilityRole="button"
            accessibilityLabel="Sign in with Google"
          >
            <Image
              source={require("../../assets/images/google-logo.png")}
              resizeMode="contain"
              style={{
                width: 20,
                height: 20,
                flexGrow: 0,
                flexShrink: 0,
                marginRight: 10,
              }}
            />

            <Text className="text-sm font-semibold text-text sm:text-base">
              {loadingProvider === "google"
                ? "Connecting to Google..."
                : "Sign in with Google"}
            </Text>
          </Pressable>

          {/* Google sign-in status */}
          {socialAuthError ? (
            <Text
              className="mt-3 text-center text-sm leading-5 text-red-600"
              accessibilityRole="alert"
            >
              {socialAuthError}
            </Text>
          ) : null}

          {/* Sign up */}
          <View className="mt-7 flex-row flex-wrap justify-center">
            <Text className="text-sm text-textSecondary">
              Don't have an account?
            </Text>

            <Pressable
              className="ml-1"
              onPress={() => router.push("/signup")}
              disabled={busy}
              accessibilityRole="link"
            >
              <Text className="text-sm font-bold text-primary">Sign up</Text>
            </Pressable>
          </View>
        </View>

        {/* Footer note */}
        <Text className="mt-6 text-center text-xs text-textSecondary">
          © {new Date().getFullYear()} AkroBite. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
