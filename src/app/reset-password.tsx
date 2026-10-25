import { useEffect, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const prepareRecovery = async () => {
      try {
        // On native, exchange the PKCE code returned by the reset link.
        // On web, Supabase detectSessionInUrl handles the callback URL.
        if (Platform.OS !== "web" && code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active) return;

        if (data.session) {
          setRecoveryReady(true);
        } else {
          setError(
            "This password-reset link is invalid or has expired. Request a new link and try again.",
          );
        }
      } catch (err) {
        console.error("Could not prepare password recovery:", err);
        if (active) {
          setError(
            "This password-reset link is invalid or has expired. Request a new link and try again.",
          );
        }
      } finally {
        if (active) setCheckingLink(false);
      }
    };
    void prepareRecovery();
    return () => {
      active = false;
    };
  }, [code]);

  const handleUpdatePassword = async () => {
    if (saving) return;
    setError(null);

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        setRecoveryReady(false);
        setError(
          "Your reset session has expired. Request a new password-reset link.",
        );
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      // Sign out of the recovery session so the user can log in normally.
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Password update failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't update your password. Please try again.",
      );
    } finally {
      setSaving(false);
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
        <Pressable
          className="mb-[35px] h-10 w-10 justify-center"
          onPress={() => router.replace("/login")}
          accessibilityRole="button"
          accessibilityLabel="Back to login"
        >
          <Text className="text-[36px] leading-9 text-text">‹</Text>
        </Pressable>

        <View className="mb-[35px] items-center">
          <View className="mb-5 h-[70px] w-[70px] items-center justify-center rounded-full bg-[#FFF1F2]">
            <Text className="text-[30px]">🔐</Text>
          </View>
          <Text className="mb-[10px] text-[27px] font-bold text-text">
            Create a new password
          </Text>
          <Text className="max-w-[320px] text-center text-sm leading-[21px] text-textSecondary">
            Choose a strong password for your AkroBite account.
          </Text>
        </View>

        {checkingLink ? (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#E53935" />
            <Text className="mt-3 text-sm text-textSecondary">
              Verifying your reset link...
            </Text>
          </View>
        ) : success ? (
          <View className="rounded-xl border border-green-200 bg-green-50 p-4">
            <Text className="text-base font-bold text-green-800">
              Password updated successfully
            </Text>
            <Text className="mt-2 text-sm leading-5 text-green-800">
              You can now log in using your new password.
            </Text>
            <Pressable
              className="mt-5 h-[52px] items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
              onPress={() => router.replace("/login")}
            >
              <Text className="text-[15px] font-bold text-white">
                Go to Login
              </Text>
            </Pressable>
          </View>
        ) : recoveryReady ? (
          <>
            <View className="mb-5">
              <Text className="mb-2 text-sm font-semibold text-text">
                New password
              </Text>
              <View className="h-[52px] flex-row items-center rounded-[10px] border border-border">
                <TextInput
                  className="h-full min-w-0 flex-1 px-[15px] text-[15px] text-text outline-none focus:border-primary"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#737373"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  editable={!saving}
                  accessibilityLabel="New password"
                />
                <Pressable
                  className="h-full justify-center px-4"
                  onPress={() => setShowPassword((previous) => !previous)}
                  disabled={saving}
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

            <View className="mb-[22px]">
              <Text className="mb-2 text-sm font-semibold text-text">
                Confirm new password
              </Text>
              <TextInput
                className="h-[52px] rounded-[10px] border border-border px-[15px] text-[15px] text-text outline-none focus:border-primary"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Enter your password again"
                placeholderTextColor="#737373"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                editable={!saving}
                returnKeyType="done"
                onSubmitEditing={() => void handleUpdatePassword()}
                accessibilityLabel="Confirm new password"
              />
            </View>

            {error ? (
              <Text
                className="mb-4 text-sm leading-5 text-red-600"
                accessibilityRole="alert"
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              className={`h-[52px] flex-row items-center justify-center rounded-[9px] ${
                saving ? "bg-primary/70" : "bg-primary active:bg-primaryDark"
              }`}
              onPress={() => void handleUpdatePassword()}
              disabled={saving}
              accessibilityRole="button"
            >
              {saving ? (
                <>
                  <ActivityIndicator color="#FFFFFF" />
                  <Text className="ml-2 text-[15px] font-bold text-white">
                    Updating...
                  </Text>
                </>
              ) : (
                <Text className="text-[15px] font-bold text-white">
                  Update Password
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <View>
            <Text
              className="mb-5 text-center text-sm leading-5 text-red-600"
              accessibilityRole="alert"
            >
              {error}
            </Text>
            <Pressable
              className="h-[52px] items-center justify-center rounded-[9px] bg-primary active:bg-primaryDark"
              onPress={() => router.replace("/forgot-password")}
            >
              <Text className="text-[15px] font-bold text-white">
                Request a New Reset Link
              </Text>
            </Pressable>
          </View>
        )}

        {!success ? (
          <Pressable
            className="mt-[25px] items-center py-2"
            onPress={() => router.replace("/login")}
            accessibilityRole="link"
          >
            <Text className="text-sm font-semibold text-primary">
              Back to Login
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
