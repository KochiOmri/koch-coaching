/* ============================================================
   ADMIN LAYOUT - src/app/admin/layout.tsx
   ============================================================
   This layout wraps ALL admin pages (dashboard, appointments,
   availability). It provides:
   
   - A sidebar with navigation links
   - A header bar with title and logout button
   - Consistent styling across all admin pages
   
   The login page is excluded (it has its own simple layout).
   ============================================================ */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KOCH Admin | Back Office",
  description: "Manage your coaching appointments and schedule",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
