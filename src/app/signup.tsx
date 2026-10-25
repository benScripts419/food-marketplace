import { router } from "expo-router";
import { makeRedirectUri } from "expo-auth-session";
import { useState } from "react";
import {
  ActivityIndicator,
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

async function routeAfterSignup(userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not load profile after signup:", error);
  }

  if (profile?.role === "admin") {
    router.replace("/admin");
  } else if (profile?.role === "rider") {
    router.replace("/rider/dashboard");
  } else {
    router.replace("/(tabs)");
  }
}

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const {
    error: socialAuthError,
    loadingProvider,
    signInWithGoogle,
    signInWithApple,
  } = useSocialAuth();

  const busy = isSubmitting || loadingProvider !== null;

  const handleSignup = async () => {
    if (busy) return;

    setSignupError(null);
    setSignupMessage(null);

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setSignupError("Please enter your full name.");
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setSignupError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setSignupError("Your password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setSignupError("Your passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const redirectTo =
        Platform.OS === "web" && typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : makeRedirectUri({
              scheme: "food-marketplace",
              path: "auth/callback",
            });

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: normalizedName,
            role: "customer",
          },
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        const message = error.message.toLowerCase();

        if (
          message.includes("already registered") ||
          message.includes("already exists")
        ) {
          setSignupMessage(
            "We couldn't create a new account with this email. If you already have an account, try logging in or resetting your password.",
          );
        } else {
          setSignupError(error.message);
        }

        return;
      }

      if (data.user && data.user.identities?.length === 0) {
        setSignupMessage(
          "We couldn't create a new account with this email. If you already have an account, try logging in or resetting your password.",
        );
        return;
      }

      // Supabase may create the account but require email verification
      // before it creates an authenticated session.
      if (!data.session) {
        setSignupMessage(
          "Your account has been created. Check your email and open the verification link before logging in. If you don't see it, check your spam folder.",
        );
        return;
      }

      await routeAfterSignup(data.session.user.id);
    } catch (error) {
      console.error("AkroBite signup failed:", error);
      setSignupError(
        error instanceof Error
          ? error.message
          : "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignup = async (provider: "google" | "apple") => {
    if (busy) return;

    setSignupError(null);
    setSignupMessage(null);

    const signedIn =
      provider === "google"
        ? await signInWithGoogle()
        : await signInWithApple();

    if (signedIn) {
      // The OAuth callback should complete authentication and route the user.
      // This fallback preserves the existing social-auth behavior.
      router.replace("/(tabs)");
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

          <View className="mb-7">
            <Text className="mb-2 text-2xl font-bold text-text sm:text-3xl">
              Create your account
            </Text>
            <Text className="text-sm leading-6 text-textSecondary sm:text-base">
              Join AkroBite to discover restaurants and order your favourite
              meals.
            </Text>
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-text">
              Full name
            </Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-text"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#737373"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              editable={!busy}
              returnKeyType="next"
            />
          </View>

          <View className="mb-5">
            <Text className="mb-2 text-sm font-semibold text-text">Email</Text>
            <TextInput
              className="h-12 w-full rounded-lg border border-border bg-white px-4 text-base text-text"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#737373"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!busy}
              returnKeyType="next"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-2 text-sm font-semibold text-text">
              Password
            </Text>
            <View className="h-12 w-full flex-row items-center rounded-lg border border-border bg-white">
              <TextInput
                className="h-full min-w-0 flex-1 px-4 text-base text-text"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#737373"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!busy}
                returnKeyType="next"
              />
              <Pressable
                className="h-full justify-center px-4"
                onPress={() => setShowPassword((value) => !value)}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Text className="text-sm text-textSecondary">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mb-3">
            <Text className="mb-2 text-sm font-semibold text-text">
              Confirm password
            </Text>
            <View className="h-12 w-full flex-row items-center rounded-lg border border-border bg-white">
              <TextInput
                className="h-full min-w-0 flex-1 px-4 text-base text-text"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#737373"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!busy}
                returnKeyType="done"
                onSubmitEditing={() => void handleSignup()}
              />
              <Pressable
                className="h-full justify-center px-4"
                onPress={() => setShowConfirmPassword((value) => !value)}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <Text className="text-sm text-textSecondary">
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
          </View>

          <Text className="mb-5 mt-2 text-xs leading-5 text-textSecondary">
            By creating an account, you agree to our{" "}
            <Text className="font-semibold text-primary">Terms of Service</Text>{" "}
            and{" "}
            <Text className="font-semibold text-primary">Privacy Policy</Text>.
          </Text>

          <Pressable
            className={`h-12 w-full items-center justify-center rounded-lg ${
              busy ? "bg-gray-400" : "bg-primary"
            }`}
            onPress={() => void handleSignup()}
            disabled={busy}
            accessibilityRole="button"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-bold text-white">
                Create account
              </Text>
            )}
          </Pressable>

          {signupError ? (
            <Text
              className="mt-3 text-center text-sm leading-5 text-red-600"
              accessibilityRole="alert"
            >
              {signupError}
            </Text>
          ) : null}

          {signupMessage ? (
            <View className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <Text className="text-sm leading-5 text-green-800">
                {signupMessage}
              </Text>
              <Pressable
                className="mt-3 self-center"
                onPress={() => router.replace("/login")}
                accessibilityRole="link"
              >
                <Text className="text-sm font-bold text-primary">
                  Go to login
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View className="my-6 flex-row items-center">
            <View className="h-px flex-1 bg-border" />
            <Text className="mx-3 text-xs text-textSecondary">
              OR CONTINUE WITH
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>

          <View className="gap-3">
            <Pressable
              className={`h-12 w-full flex-row items-center justify-center rounded-lg border border-border bg-white ${
                busy ? "opacity-50" : ""
              }`}
              disabled={busy}
              onPress={() => void handleSocialSignup("google")}
              accessibilityRole="button"
            >
              <Image
                source={require("../../assets/images/google-logo.png")}
                resizeMode="contain"
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text className="text-sm font-semibold text-text sm:text-base">
                {loadingProvider === "google"
                  ? "Connecting to Google..."
                  : "Continue with Google"}
              </Text>
            </Pressable>

            <Pressable
              className={`h-12 w-full flex-row items-center justify-center rounded-lg border border-border bg-white ${
                busy ? "opacity-50" : ""
              }`}
              disabled={busy}
              onPress={() => void handleSocialSignup("apple")}
              accessibilityRole="button"
            >
              <Image
                source={require("../../assets/images/apple-logo.png")}
                resizeMode="contain"
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text className="text-sm font-semibold text-text sm:text-base">
                {loadingProvider === "apple"
                  ? "Connecting to Apple..."
                  : "Continue with Apple"}
              </Text>
            </Pressable>
          </View>

          {socialAuthError ? (
            <Text
              className="mt-3 text-center text-sm leading-5 text-red-600"
              accessibilityRole="alert"
            >
              {socialAuthError}
            </Text>
          ) : null}

          <View className="mt-7 flex-row flex-wrap justify-center">
            <Text className="text-sm text-textSecondary">
              Already have an account?
            </Text>
            <Pressable
              className="ml-1"
              onPress={() => router.replace("/login")}
              disabled={busy}
              accessibilityRole="link"
            >
              <Text className="text-sm font-bold text-primary">Log in</Text>
            </Pressable>
          </View>
        </View>

        <Text className="mt-6 text-center text-xs text-textSecondary">
          © {new Date().getFullYear()} AkroBite. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
