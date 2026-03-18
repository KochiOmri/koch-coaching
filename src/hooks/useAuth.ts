"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const checked = useRef(false);

  const checkAuth = useCallback(async () => {
    if (checked.current) return;
    checked.current = true;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setState({ user: null, profile: null, loading: false, isAdmin: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, name, email")
        .eq("id", user.id)
        .single();

      setState({
        user,
        profile: profile ?? null,
        loading: false,
        isAdmin: profile?.role === "admin",
      });
    } catch {
      setState({ user: null, profile: null, loading: false, isAdmin: false });
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setState({ user: null, profile: null, loading: false, isAdmin: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAuth]);

  return state;
}
