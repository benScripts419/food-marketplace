import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  Platform,
} from "react-native";
import { supabase } from "@/lib/supabase";

// Send each person to the right part of the app for their account type.
async function routeAfterSignIn(userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Could not read the account type after sign-in:", error);
  }

  if (profile?.role === "rider") {
    router.replace("/rider/dashboard");
  } else if (profile?.role === "admin") {
    router.replace("/admin");
  } else {
    router.replace("/(tabs)");
  }
}

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    error?: string | string[];
    error_description?: string | string[];
  }>();

  const [sessionError, setSessionError] = useState<string | null>(null);
  const handled = useRef(false);

  const getParam = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const code = getParam(params.code);
  const oauthError =
    getParam(params.error_description) || getParam(params.error);

  const callbackError = oauthError || sessionError;

  useEffect(() => {
    let active = true;
    let redirected = false;

    const goNext = async (userId: string) => {
      if (redirected) return;
      redirected = true;
      await routeAfterSignIn(userId);
    };

    const finishAuthentication = async () => {
      if (handled.current) return;

      if (oauthError) {
        handled.current = true;
        setSessionError(oauthError);
        return;
      }

      // On the web the Supabase client may already have picked the sign-in
      // up from the address bar. Only exchange the code if there is no
      // session yet, because a code can only be used once.
      let { data, error } = await supabase.auth.getSession();

      if (!active || redirected) return;

      if (!error && !data.session && Platform.OS === "web" && code) {
        handled.current = true;

        const exchange = await supabase.auth.exchangeCodeForSession(code);

        if (!active) return;

        if (exchange.error) {
          console.error("OAuth code exchange failed:", exchange.error);
          setSessionError(exchange.error.message);
          return;
        }

        ({ data, error } = await supabase.auth.getSession());
        if (!active || redirected) return;
      }

      if (error) {
        setSessionError(error.message);
        return;
      }

      if (data.session) {
        await goNext(data.session.user.id);
      } else {
        setSessionError(
          "No active session was found. Please return to sign in and try again.",
        );
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) {
        void goNext(session.user.id);
      }
    });

    void finishAuthentication().catch((error: unknown) => {
      console.error("Authentication callback failed:", error);

      if (active) {
        setSessionError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during sign-in.",
        );
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [code, oauthError]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {callbackError ? (
        <View className="w-full max-w-[480px] items-center">
          <Text className="mb-3 text-center text-lg font-bold text-text">
            Sign-in could not be completed
          </Text>

          <Text className="mb-6 text-center text-sm leading-5 text-textSecondary">
            {callbackError}
          </Text>

          <Pressable
            onPress={() => router.replace("/login")}
            className="rounded-lg bg-primary px-5 py-3"
            accessibilityRole="button"
          >
            <Text className="font-bold text-white">Return to sign in</Text>
          </Pressable>
        </View>
      ) : (
        <View className="items-center">
          <ActivityIndicator color="#C62828" />
          <Text className="mt-4 text-center text-sm text-textSecondary">
            Completing sign-in...
          </Text>
        </View>
      )}
    </View>
  );
}
