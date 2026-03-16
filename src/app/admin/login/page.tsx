/* ============================================================
   ADMIN LOGIN PAGE - src/app/admin/login/page.tsx
   ============================================================
   Simple password-only login page for the admin panel.
   
   How it works:
   1. Admin enters the password
   2. Password is sent to POST /api/auth
   3. If correct, a session cookie is set
   4. User is redirected to /admin/dashboard
   
   Default password: "koch2024" (change in .env.local)
   ============================================================ */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  /* --- Handle Login Form Submission ---
     Sends the password to the auth API.
     If successful, redirects to the admin dashboard. */
  const handleSubmit = async (e: React.FormEvent) => {
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
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo and title */}
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
            Enter your password to access the back office
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
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
                borderColor: error ? "#ef4444" : "var(--card-border)",
              }}
              autoFocus
            />
            {/* Show/hide password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px]"
              style={{ color: "var(--muted)" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--background)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Back to website link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm transition-colors hover:underline"
            style={{ color: "var(--muted)" }}
          >
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
