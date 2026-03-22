"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  TrendingUp,
  MessageCircle,
  CreditCard,
  LogOut,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/portal/appointments", icon: CalendarDays },
  { name: "Exercises", href: "/portal/exercises", icon: BookOpen },
  { name: "Progress", href: "/portal/progress", icon: TrendingUp },
  { name: "Messages", href: "/portal/messages", icon: MessageCircle },
  { name: "Billing", href: "/portal/billing", icon: CreditCard },
];

export default function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/portal/login");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
            alt="KOCH"
            width={28}
            height={28}
            loading="lazy"
          />
          <span className="text-sm font-bold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
            KOCH
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
          >
            PORTAL
          </span>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "transparent",
                  color: active ? "var(--primary)" : "var(--muted)",
                }}
              >
                <Icon size={16} />
                {item.name}
              </a>
            );
          })}
          <span className="ml-2 hidden truncate text-xs lg:inline" style={{ color: "var(--muted)", maxWidth: 140 }}>
            {profile?.name || user?.email?.split("@")[0]}
          </span>
          <button
            onClick={handleLogout}
            className="ml-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-70"
            style={{ color: "var(--muted)" }}
          >
            <LogOut size={16} />
          </button>
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden"
          style={{ color: "var(--foreground)" }}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t px-4 py-4 sm:hidden" style={{ borderColor: "var(--card-border)" }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"
                style={{
                  backgroundColor: active ? "color-mix(in srgb, var(--primary) 15%, transparent)" : "transparent",
                  color: active ? "var(--primary)" : "var(--muted)",
                }}
              >
                <Icon size={18} />
                {item.name}
              </a>
            );
          })}
          <div className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: "var(--card-bg)" }}>
            <p className="truncate text-xs font-medium" style={{ color: "var(--foreground)" }}>
              {profile?.name || user?.email?.split("@")[0]}
            </p>
            <p className="truncate text-[11px]" style={{ color: "var(--muted)" }}>
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-red-500"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
}
