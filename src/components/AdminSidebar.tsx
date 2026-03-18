"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Clock,
  Film,
  FolderOpen,
  FileText,
  PenLine,
  Users,
  Share2,
  MessageCircle,
  Megaphone,
  Dumbbell,
  Package,
  BookOpen,
  ScanLine,
  Plug,
  Globe,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Gift,
  Palette,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Session Notes", href: "/admin/session-notes", icon: FileText },
  { name: "Intake Forms", href: "/admin/intake", icon: ClipboardList },
  { name: "Availability", href: "/admin/availability", icon: Clock },
  { name: "Videos", href: "/admin/videos", icon: Film },
  { name: "Media Library", href: "/admin/media", icon: FolderOpen },
  { name: "Messages", href: "/admin/messages", icon: MessageCircle },
  { name: "Content", href: "/admin/content", icon: PenLine },
  { name: "WhatsApp", href: "/admin/whatsapp", icon: MessageCircle },
  { name: "Social Media", href: "/admin/social", icon: Share2 },
  { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "Programs", href: "/admin/programs", icon: Dumbbell },
  { name: "Exercises", href: "/admin/exercises", icon: BookOpen },
  { name: "Packages", href: "/admin/packages", icon: Package },
  { name: "Group Classes", href: "/admin/group-classes", icon: Users },
  { name: "Referrals", href: "/admin/referrals", icon: Gift },
  { name: "Posture Analysis", href: "/admin/posture-analysis", icon: ScanLine },
  { name: "Site Designer", href: "/admin/design", icon: Palette },
  { name: "Integrations", href: "/admin/integrations", icon: Plug },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [loading, user, isAdmin, router]);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
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

  if (!user || !isAdmin) {
    return null;
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
        <Image
          src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
          alt="KOCH"
          width={32}
          height={32}
          loading="lazy"
        />
        <div>
          <span className="text-sm font-bold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
            KOCH
          </span>
          <span
            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
          >
            ADMIN
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive ? "text-background" : "hover:text-foreground"
              }`}
              style={{
                backgroundColor: isActive ? "var(--primary)" : "transparent",
                color: isActive ? "var(--background)" : "var(--muted)",
              }}
            >
              <item.icon size={18} />
              {item.name}
            </a>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4" style={{ borderColor: "var(--card-border)" }}>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
          style={{ color: "var(--muted)" }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
        <a
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <Globe size={18} />
          View Website
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border p-2 md:hidden"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--card-bg)",
          borderColor: "var(--card-border)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
