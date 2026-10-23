import { router } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { supabase } from "@/lib/supabase";

type GateState = "checking" | "allowed" | "denied" | "error";

// Wraps the admin screen. Only accounts that Supabase says are admins
// (the same is_admin() check your database rules use) get past this.
export default function AdminGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");

  const check = useCallback(async () => {
    setState("checking");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Not signed in: go to the login screen.
    if (!session) {
      router.replace("/login");
      return;
    }

    const { data, error } = await supabase.rpc("is_admin");

    if (error) {
      console.error("AdminGate: is_admin check failed:", error);
      setState("error");
      return;
    }

    setState(data === true ? "allowed" : "denied");
  }, []);

  useEffect(() => {
    void check();

    // If the person signs out while on this screen, send them away.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });

    return () => subscription.unsubscribe();
  }, [check]);

  if (state === "allowed") {
    return <>{children}</>;
  }

  if (state === "checking") {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#E53935" />
        <Text className="mt-3 text-sm text-gray-500">Checking access...</Text>
      </View>
    );
  }

  if (state === "error") {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-lg font-bold text-gray-900">
          Couldn't check admin access
        </Text>
        <Text className="mt-2 text-center text-sm text-gray-600">
          Check your connection and try again. If this keeps happening, the
          admin setup may not be finished in Supabase.
        </Text>
        <Pressable
          onPress={() => void check()}
          className="mt-6 rounded-xl bg-red-600 px-6 py-3"
        >
          <Text className="font-bold text-white">Try again</Text>
        </Pressable>
      </View>
    );
  }

  // denied
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="text-lg font-bold text-gray-900">Admins only</Text>
      <Text className="mt-2 text-center text-sm text-gray-600">
        This account isn't registered as an admin.
      </Text>
      <Pressable
        onPress={() => router.replace("/(tabs)")}
        className="mt-6 rounded-xl bg-red-600 px-6 py-3"
      >
        <Text className="font-bold text-white">Go to home</Text>
      </Pressable>
    </View>
  );
}
