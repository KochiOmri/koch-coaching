"use client";

import { useEffect, useRef, useCallback } from "react";
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
  GripVertical,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_NAV_ITEMS = [
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

const NAV_MAP = Object.fromEntries(DEFAULT_NAV_ITEMS.map((item) => [item.href, item]));

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
    fetch("/api/nav-order")
      .then((r) => r.json())
      .then((order: string[]) => {
        if (Array.isArray(order) && order.length > 0) {
          const ordered = order
            .map((href) => NAV_MAP[href])
            .filter(Boolean);
          const missing = DEFAULT_NAV_ITEMS.filter((i) => !order.includes(i.href));
          setNavItems([...ordered, ...missing]);
        }
      })
      .catch(() => {});
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOver.current === null) return;
    const items = [...navItems];
    const dragged = items.splice(dragItem.current, 1)[0];
    items.splice(dragOver.current, 0, dragged);
    dragItem.current = null;
    dragOver.current = null;
    setNavItems(items);
    fetch("/api/nav-order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items.map((i) => i.href)),
    }).catch(() => {});
  }, [navItems]);

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
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <div
              key={item.href}
              draggable
              onDragStart={() => { dragItem.current = idx; }}
              onDragEnter={() => { dragOver.current = idx; }}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="group/drag"
            >
              <a
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
                <GripVertical
                  size={14}
                  className="shrink-0 cursor-grab opacity-0 transition-opacity group-hover/drag:opacity-40"
                />
                <item.icon size={18} className="shrink-0" />
                {item.name}
              </a>
            </div>
          );
        })}
      </nav>

      <div className="border-t px-3 py-4" style={{ borderColor: "var(--card-border)" }}>
        {/* Logged-in user identity */}
        <div className="mb-3 rounded-xl px-4 py-3" style={{ backgroundColor: "var(--background)" }}>
          <p className="truncate text-xs font-semibold" style={{ color: "var(--foreground)" }}>
            {profile?.name || user?.email?.split("@")[0] || "Admin"}
          </p>
          <p className="truncate text-[11px]" style={{ color: "var(--muted)" }}>
            {user?.email}
          </p>
        </div>
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
