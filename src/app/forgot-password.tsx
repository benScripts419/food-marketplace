import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (loading) return;

    setMessage(null);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isSupabaseConfigured) {
      setError(
        "Password recovery is temporarily unavailable. Please try again later.",
      );
      return;
    }

    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/reset-password`
        : makeRedirectUri({
            scheme: "food-marketplace",
            path: "reset-password",
          });

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        },
      );

      if (resetError) {
        console.error("Password reset request failed:", resetError.message);
        setError(
          "We couldn't send the reset email. Please check your details and try again.",
        );
        return;
      }

      setMessage(
        "If an account exists for that email, a password-reset link will be sent. Check your inbox and spam folder.",
      );
    } catch (err) {
      console.error("Password reset failed:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow px-6 pb-10 pt-[55px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable
          className="mb-[35px] h-10 w-10 justify-center"
          onPress={() => router.replace("/login")}
          accessibilityRole="button"
          accessibilityLabel="Back to login"
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
            Enter your email address and we'll send you a link to reset your
            password.
          </Text>
        </View>

        {/* Email input */}
        <View className="mb-[22px]">
          <Text className="mb-2 text-sm font-semibold text-text">
            Email address
          </Text>

          <TextInput
            className="h-[52px] rounded-[10px] border border-border px-[15px] text-[15px] text-text outline-none focus:border-primary"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError(null);
              setMessage(null);
            }}
            placeholder="Enter your email"
            placeholderTextColor="#737373"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={() => void handleResetPassword()}
            accessibilityLabel="Email address"
          />
        </View>

        {/* Error */}
        {error ? (
          <Text
            className="mb-4 text-sm leading-5 text-red-600"
            accessibilityRole="alert"
          >
            {error}
          </Text>
        ) : null}

        {/* Success */}
        {message ? (
          <View className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <Text className="text-sm leading-5 text-green-800">{message}</Text>
          </View>
        ) : null}

        {/* Send reset email */}
        <Pressable
          className={`h-[52px] flex-row items-center justify-center rounded-[9px] ${
            loading ? "bg-primary/70" : "bg-primary active:bg-primaryDark"
          }`}
          onPress={() => void handleResetPassword()}
          disabled={loading}
          accessibilityRole="button"
        >
          {loading ? (
            <>
              <ActivityIndicator color="#FFFFFF" />
              <Text className="ml-2 text-[15px] font-bold text-white">
                Sending...
              </Text>
            </>
          ) : (
            <Text className="text-[15px] font-bold text-white">
              Send Reset Link
            </Text>
          )}
        </Pressable>

        {/* Back to Login */}
        <Pressable
          className="mt-[25px] items-center py-2"
          onPress={() => router.replace("/login")}
          disabled={loading}
          accessibilityRole="link"
        >
          <Text className="text-sm font-semibold text-primary">
            Back to Login
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
