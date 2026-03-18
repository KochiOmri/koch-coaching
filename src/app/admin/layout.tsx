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
