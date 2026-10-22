import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function check(userId: string | undefined) {
      if (!userId) {
        if (isMounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (isMounted) {
        setIsAdmin(data?.role === "admin");
        setLoading(false);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => check(user?.id));

    // Re-check on sign in / sign out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isAdmin, loading };
}