"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const dest = localStorage.getItem("auth_redirect");
    localStorage.removeItem("auth_redirect");
    router.replace(dest || "/");
  }, [router]);

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
