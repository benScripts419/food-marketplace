
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.XPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.XPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey,
);

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
  {
    auth: {
      storage:
        Platform.OS === "web"
          ? undefined
          : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === "web",
      flowType: "pkce",
    },
  },
);

export async function logCurrentSupabaseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase session debug failed:", error);
    return null;
  }

  const token = data.session?.access_token ?? null;

  console.log("Supabase auth session:", data.session);
  console.log("Supabase JWT:", token);

  return token;
}