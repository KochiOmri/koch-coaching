"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLogin />
    </Suspense>
  );
}

function AdminLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));

    if (searchParams.get("error")) {
      setError("Authentication failed. Please try again.");
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        setCheckingSession(false);
        return;
      }
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.role === "admin") {
            router.replace("/admin/dashboard");
          } else {
            setCheckingSession(false);
          }
        });
    });
  }, [searchParams, router]);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/admin/dashboard`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) setError(error.message);
    } catch {
      setError("Failed to connect to Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLegacyLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Invalid password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
            alt="KOCH"
            width={60}
            height={60}
            className="mx-auto"
            loading="lazy"
          />
          <h1
            className="mt-4 text-2xl font-bold tracking-wider"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            KOCH ADMIN
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Sign in to access the back office
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
            style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
          >
            {googleLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Sign in with Google"}
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
            <span className="text-xs" style={{ color: "var(--muted)" }}>or</span>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
          </div>

          <button
            onClick={() => setShowLegacy(!showLegacy)}
            className="flex w-full items-center justify-center gap-2 text-xs font-medium transition-colors"
            style={{ color: "var(--muted)" }}
          >
            Sign in with password
            <ChevronDown
              size={14}
              className="transition-transform"
              style={{ transform: showLegacy ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {showLegacy && (
            <form onSubmit={handleLegacyLogin} className="mt-4 space-y-4">
              <div className="relative">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Lock size={14} style={{ color: "var(--primary)" }} />
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--card-border)",
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px]"
                  style={{ color: "var(--muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !password}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
              </button>
            </form>
          )}

          {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm transition-colors hover:underline"
            style={{ color: "var(--muted)" }}
          >
            &larr; Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
