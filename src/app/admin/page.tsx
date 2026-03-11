/* ============================================================
   ADMIN ROOT PAGE - src/app/admin/page.tsx
   ============================================================
   Redirects /admin to /admin/login.
   This way visitors who go to /admin get the login page. */

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/login");
}
