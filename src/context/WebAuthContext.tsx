import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/lib/supabase";

type WebAuthContextValue = {
  user: User | null;
  displayName: string;
  loading: boolean;
};

const WebAuthContext = createContext<WebAuthContextValue | null>(null);

function getFallbackName(user: User) {
  const metadata = user.user_metadata ?? {};
  return String(
    metadata.full_name ||
      metadata.name ||
      metadata.first_name ||
      user.email?.split("@")[0] ||
      "My profile",
  );
}

export function WebAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Failed to read web auth session:", error);
      if (mounted) {
        setUser(data.session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load web profile name:", error);
          return;
        }
        if (active && data?.full_name) {
          setProfileName({ userId: user.id, name: data.full_name });
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  const displayName =
    user && profileName?.userId === user.id
      ? profileName.name
      : user
        ? getFallbackName(user)
        : "";

  return (
    <WebAuthContext.Provider value={{ user, displayName, loading }}>
      {children}
    </WebAuthContext.Provider>
  );
}

export function useWebAuth() {
  const context = useContext(WebAuthContext);
  if (!context) {
    throw new Error("useWebAuth must be used within WebAuthProvider.");
  }
  return context;
}
