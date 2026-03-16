"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  LogOut,
  Dumbbell,
  Clock,
  ChevronRight,
  CalendarPlus,
  Activity,
  Gift,
  Copy,
  Check,
  Package,
  BookOpen,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  exercises: { id: string }[];
}

interface ClientPackageInfo {
  id: string;
  packageId: string;
  sessionsUsed: number;
  sessionsTotal: number;
  startDate: string;
  expiryDate: string;
  status: "active" | "expired" | "completed";
}

interface PackageInfo {
  id: string;
  name: string;
  duration: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activePackage, setActivePackage] = useState<ClientPackageInfo | null>(null);
  const [packageInfo, setPackageInfo] = useState<PackageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/client-auth");
      if (!authRes.ok) {
        router.push("/portal/login");
        return;
      }
      const authData = await authRes.json();
      setClient(authData.client);

      const progRes = await fetch(`/api/programs?clientId=${authData.client.id}`);
      if (progRes.ok) {
        setPrograms(await progRes.json());
      }

      const cpRes = await fetch(`/api/client-packages?clientId=${authData.client.id}`);
      if (cpRes.ok) {
        const cpData: ClientPackageInfo[] = await cpRes.json();
        const active = cpData.find((cp) => cp.status === "active");
        if (active) {
          setActivePackage(active);
          const pkgRes = await fetch("/api/packages");
          if (pkgRes.ok) {
            const allPkgs: PackageInfo[] = await pkgRes.json();
            setPackageInfo(allPkgs.find((p) => p.id === active.packageId) || null);
          }
        }
      }

      const refRes = await fetch(`/api/referrals?clientId=${authData.client.id}`);
      if (refRes.ok) {
        const refData = await refRes.json();
        if (refData?.referralCode) setReferralCode(refData.referralCode);
      }
    } catch {
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/client-auth", { method: "DELETE" });
    router.push("/portal/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header
        className="border-b"
        style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
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
                PORTAL
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-red-500/10"
            style={{ color: "var(--muted)" }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Welcome back, {client?.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            View your training programs and track your progress
          </p>
        </div>

        {/* Active Package + My Exercises */}
        {(activePackage || true) && (
          <section className="mb-8 grid gap-4 sm:grid-cols-2">
            {/* Active Package */}
            {activePackage && packageInfo && (
              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Package size={18} style={{ color: "var(--primary)" }} />
                  <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                    Active Package
                  </h3>
                </div>
                <p className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {packageInfo.name}
                </p>
                {packageInfo.duration && (
                  <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                    {packageInfo.duration}
                  </p>
                )}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs" style={{ color: "var(--muted)" }}>
                    <span>Sessions used</span>
                    <span className="font-medium" style={{ color: "var(--foreground)" }}>
                      {activePackage.sessionsUsed} / {activePackage.sessionsTotal}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.round((activePackage.sessionsUsed / activePackage.sessionsTotal) * 100)}%`,
                        backgroundColor: "var(--primary)",
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    {activePackage.sessionsTotal - activePackage.sessionsUsed} session{activePackage.sessionsTotal - activePackage.sessionsUsed !== 1 ? "s" : ""} remaining
                  </p>
                </div>
              </div>
            )}

            {/* My Exercises Link */}
            <a
              href="/portal/exercises"
              className="group flex items-center gap-4 rounded-2xl border p-6 transition-all hover:border-primary/40"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--primary)" + "15" }}
              >
                <BookOpen size={22} style={{ color: "var(--primary)" }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  My Exercises
                </h3>
                <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                  Browse your exercise library with video instructions
                </p>
              </div>
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" style={{ color: "var(--muted)" }} />
            </a>
          </section>
        )}

        {/* Programs */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Activity size={20} style={{ color: "var(--primary)" }} />
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              Your Programs
            </h2>
          </div>

          {programs.length === 0 ? (
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <Dumbbell size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                No programs assigned yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--muted)" }}>
                Your coach will assign your training program after your first session. Book a consultation to get started!
              </p>
              <a
                href="/#book"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                <CalendarPlus size={16} />
                Book Your First Session
              </a>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="group rounded-2xl border p-6 transition-all hover:border-primary/40"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                    {program.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm" style={{ color: "var(--muted)" }}>
                    {program.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {program.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell size={12} />
                      {program.exercises.length} exercise{program.exercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <a
                    href={`/portal/program/${program.id}`}
                    className="mt-4 flex items-center gap-1 text-sm font-medium transition-colors"
                    style={{ color: "var(--primary)" }}
                  >
                    View Program
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Refer a Friend */}
        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <Gift size={20} style={{ color: "var(--primary)" }} />
            <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              Refer a Friend
            </h2>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Know someone who could benefit from better movement? Share your referral link and help them get started.
            </p>
            {referralCode ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className="flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-sm font-mono"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                >
                  <span className="truncate" style={{ color: "var(--muted)" }}>
                    {typeof window !== "undefined" ? window.location.origin : ""}/refer/{referralCode}
                  </span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/refer/${referralCode}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)", fontFamily: "var(--font-outfit)" }}
                >
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  if (!client) return;
                  setReferralLoading(true);
                  try {
                    const res = await fetch("/api/referrals", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "generate", clientId: client.id }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      setReferralCode(data.referralCode);
                    }
                  } catch {}
                  setReferralLoading(false);
                }}
                disabled={referralLoading}
                className="mt-4 flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)", fontFamily: "var(--font-outfit)" }}
              >
                {referralLoading ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                Get My Referral Link
              </button>
            )}
          </div>
        </section>

        {/* Book Session CTA */}
        {programs.length > 0 && (
          <section className="mt-12">
            <div
              className="rounded-2xl border p-8 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <CalendarPlus size={32} className="mx-auto mb-3" style={{ color: "var(--primary)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                Book Your Next Session
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--muted)" }}>
                Ready for your next coaching session? Book a time that works for you.
              </p>
              <a
                href="/#book"
                className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                Book Session
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
