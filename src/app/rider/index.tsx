import { Ionicons } from "@expo/vector-icons";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import { supabase } from "@/lib/supabase";

const redirectUri = makeRedirectUri({
  scheme: "food-marketplace",
  path: "auth/callback",
});

WebBrowser.maybeCompleteAuthSession();

export default function RiderLoginScreen() {
  const [loading, setLoading] = useState(false);
  // Alert.alert does nothing on web, so errors are shown on screen instead.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // WEB: Supabase sends this whole page to Google. Google returns to
      // /rider/callback, which finishes sign-in and checks the rider profile.
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${window.location.origin}/rider/callback` },
        });

        if (error) throw error;
        return;
      }

      // NATIVE: open an in-app browser and finish here.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUri, skipBrowserRedirect: true },
      });

      if (error) throw error;

      if (!data.url) {
        throw new Error("Google sign-in URL was not returned.");
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      if (result.type !== "success" || !result.url) {
        return;
      }

      const callback = Linking.parse(result.url);
      const code = callback.queryParams?.code;

      if (typeof code !== "string") {
        throw new Error(
          "Authentication code was not returned. Check your redirect URL configuration.",
        );
      }

      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (sessionError) throw sessionError;

      const user = sessionData.user;

      if (!user) {
        throw new Error("Google authentication returned no user.");
      }

      // Only allow accounts linked to a rider profile.
      const { data: rider, error: riderError } = await supabase
        .from("riders")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (riderError) {
        await supabase.auth.signOut();
        throw riderError;
      }

      if (!rider) {
        await supabase.auth.signOut();

        setErrorMessage(
          "This Google account is not linked to a registered rider. Ask an administrator to link your account.",
        );

        return;
      }

      router.replace("/rider/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in with Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <View className="mb-8 items-center">
        <Ionicons name="bicycle-outline" size={58} color="#16A34A" />

        <Text className="mt-4 text-3xl font-bold text-gray-900">
          Rider Login
        </Text>

        <Text className="mt-2 text-center text-gray-500">
          Sign in with your registered Google account to manage deliveries.
        </Text>
      </View>

      <Pressable
        onPress={handleGoogleLogin}
        disabled={loading}
        className="h-14 flex-row items-center justify-center rounded-xl border border-gray-300 bg-white"
      >
        {loading ? (
          <ActivityIndicator color="#16A34A" />
        ) : (
          <>
            <Ionicons name="logo-google" size={21} color="#4285F4" />

            <Text className="ml-3 font-semibold text-gray-800">
              Continue with Google
            </Text>
          </>
        )}
      </Pressable>

      {errorMessage ? (
        <Text className="mt-4 text-center text-sm text-red-600">
          {errorMessage}
        </Text>
      ) : null}

      <Text className="mt-5 text-center text-xs text-gray-500">
        Access is restricted to registered rider accounts.
      </Text>
    </View>
  );
}
