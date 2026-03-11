/* ============================================================
   ADMIN SIDEBAR - src/components/AdminSidebar.tsx
   ============================================================
   Navigation sidebar for the admin panel.
   Shows on the left side of every admin page.
   
   Links:
   - Dashboard (calendar overview)
   - Appointments (list + manage bookings)
   - Availability (set your working hours)
   - Back to Website
   - Logout
   ============================================================ */

"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Globe,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

/* --- Sidebar Navigation Links --- */
const navItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarDays },
  { name: "Availability", href: "/admin/availability", icon: Clock },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  /* --- Logout Handler ---
     Calls DELETE /api/auth to clear the session cookie,
     then redirects to the login page. */
  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo area */}
      <div className="flex items-center gap-3 border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
        <Image src="/logo.png" alt="KOCH" width={32} height={32} />
        <div>
          <span className="text-sm font-bold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
            KOCH
          </span>
          <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}>
            ADMIN
          </span>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "text-background"
                  : "hover:text-foreground"
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

      {/* Bottom section: links + logout */}
      <div className="border-t px-3 py-4" style={{ borderColor: "var(--card-border)" }}>
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
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-xl border p-2 md:hidden"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide in */}
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
