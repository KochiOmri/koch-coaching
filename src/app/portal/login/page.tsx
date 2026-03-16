"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

type Tab = "login" | "register";

export default function ClientLogin() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body =
        tab === "register"
          ? { action: "register", name, email, password }
          : { action: "login", email, password };

      const res = await fetch("/api/client-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/portal/dashboard");
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  const canSubmit = tab === "register" ? name && email && password : email && password;

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
            CLIENT PORTAL
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Access your training programs and track your progress
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          {/* Tabs */}
          <div className="mb-6 flex rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor: tab === t ? "var(--primary)" : "transparent",
                  color: tab === t ? "var(--background)" : "var(--muted)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <User size={14} style={{ color: "var(--primary)" }} />
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--card-border)",
                  }}
                />
              </div>
            )}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Mail size={14} style={{ color: "var(--primary)" }} />
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--card-border)",
                }}
              />
            </div>

            <div className="relative">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Lock size={14} style={{ color: "var(--primary)" }} />
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "Create a password" : "Enter your password"}
                className="w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "var(--background)",
                  borderColor: error ? "#ef4444" : "var(--card-border)",
                }}
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

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--background)",
                fontFamily: "var(--font-outfit)",
              }}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : tab === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

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
