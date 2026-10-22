import type { Session } from "@supabase/supabase-js";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AUTH_SCREENS = [
  "",
  "index",
  "(auth)",
  "login",
  "signup",
  "forgot-password",
  "auth",
  "onboarding",
  "splash",
  "+not-found",
];

export default function AuthRedirect() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (mounted && !error) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!navigationState?.key || session === undefined) {
      return;
    }

    const firstSegment = (segments[0] as string | undefined) ?? "";

    if (session && AUTH_SCREENS.includes(firstSegment)) {
      router.replace("/(tabs)");
    }
  }, [session, segments, navigationState?.key, router]);

  return null;
}
