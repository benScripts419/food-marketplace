import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

export default function RiderCallbackScreen() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const finishSignIn = async () => {
      try {
        // On web, Supabase's detectSessionInUrl handles the OAuth code on page load.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw userError ?? new Error("Google sign-in could not be completed.");
        }

        const { data: rider, error: riderError } = await supabase
          .from("riders")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (riderError) throw riderError;

        if (!rider) {
          await supabase.auth.signOut();
          throw new Error(
            "This Google account is not linked to a registered rider. Ask an administrator to link your account.",
          );
        }

        if (mounted) router.replace("/rider/dashboard");
      } catch (error) {
        if (mounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Unable to finish Google sign-in.",
          );
        }
      }
    };

    void finishSignIn();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      {message ? (
        <>
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text className="mt-4 text-center text-base font-semibold text-text">
            Rider sign-in failed
          </Text>
          <Text accessibilityRole="alert" className="mt-2 text-center text-sm text-textSecondary">
            {message}
          </Text>
          <Pressable
            onPress={() => router.replace("/rider")}
            className="mt-5 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">Return to rider login</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#E53935" />
          <Text className="mt-4 text-sm text-textSecondary">
            Finishing rider sign-in…
          </Text>
        </>
      )}
    </View>
  );
}
