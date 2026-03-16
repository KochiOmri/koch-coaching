"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Loader2,
  Gift,
  Users,
  Copy,
  Check,
  TrendingUp,
  Award,
  Link2,
} from "lucide-react";

interface ReferredClient {
  name: string;
  email: string;
  bookedAt: string;
  status: "booked" | "completed";
}

interface Referral {
  id: string;
  referrerId: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referredClients: ReferredClient[];
  rewardsEarned: number;
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [refRes, clientRes] = await Promise.all([
        fetch("/api/referrals"),
        fetch("/api/clients"),
      ]);
      if (refRes.ok) setReferrals(await refRes.json());
      if (clientRes.ok) setClients(await clientRes.json());
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (!selectedClient) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", clientId: selectedClient }),
      });
      if (res.ok) {
        await fetchData();
        setSelectedClient("");
      }
    } catch (error) {
      console.error("Generate failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    const url = `${window.location.origin}/refer/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const totalReferrals = referrals.length;
  const totalReferred = referrals.reduce((sum, r) => sum + r.referredClients.length, 0);
  const totalCompleted = referrals.reduce(
    (sum, r) => sum + r.referredClients.filter((rc) => rc.status === "completed").length,
    0
  );
  const topReferrer = referrals.reduce(
    (top, r) => (r.referredClients.length > (top?.referredClients.length || 0) ? r : top),
    null as Referral | null
  );

  const clientsWithoutCode = clients.filter(
    (c) => !referrals.some((r) => r.referrerId === c.id)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Referral Program
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Track referral codes, referred clients, and top referrers
          </p>
        </header>

        <div className="p-6">
          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Active Codes", value: totalReferrals, icon: Link2 },
              { label: "Total Referred", value: totalReferred, icon: Users },
              { label: "Completed", value: totalCompleted, icon: TrendingUp },
              { label: "Top Referrer", value: topReferrer?.referrerName || "—", icon: Award },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-5"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "var(--primary)" + "15" }}
                  >
                    <stat.icon size={18} style={{ color: "var(--primary)" }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{stat.label}</p>
                    <p className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Generate Code */}
          {clientsWithoutCode.length > 0 && (
            <div
              className="mb-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                <Gift size={20} style={{ color: "var(--primary)" }} />
                Generate Referral Code
              </h2>
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1">
                  <label className="mb-1.5 block text-sm font-medium">Select Client</label>
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  >
                    <option value="">Choose a client...</option>
                    {clientsWithoutCode.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!selectedClient || generating}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                  Generate Code
                </button>
              </div>
            </div>
          )}

          {/* Referrals Table */}
          {referrals.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <Gift size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                No referral codes yet
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Generate a referral code for a client to get started
              </p>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-2xl border"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderColor: "var(--card-border)" }} className="border-b">
                      <th className="px-5 py-4 text-left font-medium" style={{ color: "var(--muted)" }}>Client</th>
                      <th className="px-5 py-4 text-left font-medium" style={{ color: "var(--muted)" }}>Code</th>
                      <th className="px-5 py-4 text-left font-medium" style={{ color: "var(--muted)" }}>Referred</th>
                      <th className="px-5 py-4 text-left font-medium" style={{ color: "var(--muted)" }}>Status</th>
                      <th className="px-5 py-4 text-left font-medium" style={{ color: "var(--muted)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <tr key={ref.id} className="border-b last:border-0" style={{ borderColor: "var(--card-border)" }}>
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium">{ref.referrerName}</p>
                            <p className="text-xs" style={{ color: "var(--muted)" }}>{ref.referrerEmail}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <code
                            className="rounded-lg px-2 py-1 text-xs font-mono font-medium"
                            style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                          >
                            {ref.referralCode}
                          </code>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold">{ref.referredClients.length}</span>
                          {ref.referredClients.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {ref.referredClients.map((rc, i) => (
                                <p key={i} className="text-xs" style={{ color: "var(--muted)" }}>
                                  {rc.name} — {rc.status}
                                </p>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: ref.referredClients.length > 0 ? "var(--primary)" + "15" : "var(--muted)" + "20",
                              color: ref.referredClients.length > 0 ? "var(--primary)" : "var(--muted)",
                            }}
                          >
                            {ref.referredClients.length > 0 ? "Active" : "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => copyCode(ref.referralCode)}
                            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                            style={{ color: "var(--primary)" }}
                          >
                            {copiedCode === ref.referralCode ? (
                              <>
                                <Check size={14} />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                Copy Link
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
