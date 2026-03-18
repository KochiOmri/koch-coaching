"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PortalNav from "@/components/PortalNav";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import {
  CreditCard,
  Package,
  Check,
  Loader2,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Suspense } from "react";

interface PkgOption {
  id: string;
  name: string;
  description: string;
  sessionCount: number;
  price: number;
  currency: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  createdAt: string;
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState<PkgOption[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";

  const loadData = useCallback(async () => {
    try {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal/login"); return; }
      setClientId(user.id);
      setClientEmail(user.email || "");

      const pkgRes = await fetch("/api/packages");
      if (pkgRes.ok) {
        const data = await pkgRes.json();
        setPackages(
          data.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description || "",
            sessionCount: p.sessionCount || p.session_count || 0,
            price: p.price || 0,
            currency: p.currency || "ILS",
          }))
        );
      }
    } catch {
      router.push("/portal/login");
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCheckout(pkgId: string) {
    setCheckoutLoading(pkgId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkgId,
          clientId,
          clientEmail,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Payment not available at this time");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setCheckoutLoading(null);
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4">
          <CheckCircle size={20} className="text-green-500" />
          <p className="text-sm font-medium text-green-400">Payment successful! Your sessions are now active.</p>
        </div>
      )}
      {cancelled && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertCircle size={20} className="text-amber-500" />
          <p className="text-sm font-medium text-amber-400">Payment was cancelled. No charges were made.</p>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          <CreditCard className="mr-2 inline" size={24} style={{ color: "var(--primary)" }} />
          Billing & Packages
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Purchase coaching packages and view payment history
        </p>
      </div>

      {/* Packages */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <Package size={20} style={{ color: "var(--primary)" }} />
          Available Packages
        </h2>
        {packages.length === 0 ? (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <Package size={40} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
            <p className="text-sm" style={{ color: "var(--muted)" }}>No packages available yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col rounded-2xl border p-6 transition-all hover:border-primary/40"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {pkg.name}
                </h3>
                {pkg.description && (
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{pkg.description}</p>
                )}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
                    {pkg.currency === "ILS" ? "₪" : "$"}{pkg.price}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                  <Clock size={14} />
                  {pkg.sessionCount} session{pkg.sessionCount !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={() => handleCheckout(pkg.id)}
                  disabled={checkoutLoading === pkg.id}
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {checkoutLoading === pkg.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                  {checkoutLoading === pkg.id ? "Processing..." : "Purchase"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Payment History */}
      {payments.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
            <Clock size={20} style={{ color: "var(--primary)" }} />
            Payment History
          </h2>
          <div
            className="divide-y rounded-2xl border"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{p.description}</p>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {p.currency === "ILS" ? "₪" : "$"}{p.amount}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: p.status === "succeeded" ? "#10b98120" : "#f59e0b20",
                      color: p.status === "succeeded" ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {p.status === "succeeded" ? <Check size={10} /> : <Clock size={10} />}
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <PortalNav />
      <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} /></div>}>
        <BillingContent />
      </Suspense>
    </div>
  );
}
