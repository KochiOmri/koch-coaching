"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { onAuthRefresh } from "@/lib/auth-events";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  role: string;
  name: string | null;
  email: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
}

const supabase = createClient();

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setState({ user: null, profile: null, loading: false, isAdmin: false });
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role, name, email")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setState({
          user,
          profile: profile ?? null,
          loading: false,
          isAdmin: profile?.role === "admin",
        });
      } catch {
        if (!cancelled) {
          setState({ user: null, profile: null, loading: false, isAdmin: false });
        }
      }
    }

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, loading: false, isAdmin: false });
        return;
      }
      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        syncSession();
      }
    });

    const offRefresh = onAuthRefresh(() => {
      if (!cancelled) syncSession();
    });

    return () => {
      cancelled = true;
      offRefresh();
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
