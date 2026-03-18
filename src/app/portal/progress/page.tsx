"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortalNav from "@/components/PortalNav";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  TrendingUp,
  Activity,
  ScanLine,
  FileText,
  Plus,
  Calendar,
} from "lucide-react";

interface PainScore {
  date: string;
  score: number;
}

interface ClientProgress {
  painScores: PainScore[];
  notes: { date: string; text: string }[];
  photos: unknown[];
}

interface SessionNote {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  sessionType: string;
  notes: string;
  painScore: number;
  homework: string[];
  createdAt: string;
}

interface PostureAnalysis {
  id: string;
  clientId: string;
  date: string;
  viewType?: string;
  measurements?: { overallSymmetryScore?: number; viewType?: string };
  savedAt?: string;
}

type Tab = "overview" | "notes" | "posture";

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function scoreGrade(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs Work";
  return "Poor";
}

export default function ProgressPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ClientProgress | null>(null);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [postureAnalyses, setPostureAnalyses] = useState<PostureAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  // Log form state
  const [painScore, setPainScore] = useState(5);
  const [logNote, setLogNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal/login"); return; }
      const cid = user.id;
      setClientId(cid);

      const [progRes, notesRes, postureRes] = await Promise.all([
        fetch(`/api/client-progress?clientId=${cid}`),
        fetch(`/api/session-notes?clientId=${cid}`),
        fetch(`/api/posture-analysis?clientId=${cid}`),
      ]);

      if (progRes.ok) setProgress(await progRes.json());
      if (notesRes.ok) setSessionNotes(await notesRes.json());
      if (postureRes.ok) setPostureAnalyses(await postureRes.json());
    } catch {
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;
    setSubmitting(true);
    try {
      const date = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/client-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          type: "painScore",
          data: { date, score: painScore },
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProgress((p) => ({
          painScores: updated.painScores ?? p?.painScores ?? [],
          notes: updated.notes ?? p?.notes ?? [],
          photos: updated.photos ?? p?.photos ?? [],
        }));
        setPainScore(5);
        setLogNote("");
      }
      if (logNote.trim()) {
        await fetch("/api/client-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId,
            type: "note",
            data: { date, text: logNote.trim() },
          }),
        });
        loadData();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  // Last 30 days for bar chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const painByDate = new Map<string, number>();
  (progress?.painScores ?? []).forEach((p) => painByDate.set(p.date, p.score));

  const maxPain = 10;

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof FileText }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "notes", label: "Session Notes", icon: FileText },
    { id: "posture", label: "Posture", icon: ScanLine },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <PortalNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold sm:text-3xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Progress Tracking
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Track your pain scores, view session notes, and posture analysis results
          </p>
        </div>

        {/* Tabs */}
        <div
          className="mb-6 flex gap-1 rounded-xl border p-1"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all sm:flex-initial"
              style={{
                backgroundColor: tab === id ? "var(--primary)" : "transparent",
                color: tab === id ? "var(--background)" : "var(--muted)",
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-6">
            {/* Pain Score Chart */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Activity size={20} style={{ color: "var(--primary)" }} />
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Pain Score Trend (Last 30 Days)
                </h2>
              </div>
              <div className="flex items-end gap-1 overflow-x-auto pb-8">
                {last30Days.map((date) => {
                  const score = painByDate.get(date) ?? 0;
                  const pct = maxPain > 0 ? (score / maxPain) * 100 : 0;
                  const shortDate = date.slice(5);
                  const barHeight = score ? Math.max(16, (pct / 100) * 80) : 4;
                  return (
                    <div
                      key={date}
                      className="flex min-w-[28px] flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className="flex w-full flex-col justify-end"
                        style={{ height: 80 }}
                      >
                        <div
                          className="w-full min-w-[22px] rounded-t transition-all"
                          style={{
                            height: barHeight,
                            backgroundColor: score
                              ? "var(--primary)"
                              : "var(--card-border)",
                            opacity: score ? 0.6 + (score / maxPain) * 0.4 : 0.3,
                          }}
                          title={`${date}: ${score || "—"}/10`}
                        />
                      </div>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--muted)" }}
                      >
                        {shortDate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Log Form */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <Plus size={20} style={{ color: "var(--primary)" }} />
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Log Daily Pain Score
                </h2>
              </div>
              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Pain level (1–10)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={painScore}
                      onChange={(e) => setPainScore(Number(e.target.value))}
                      className="flex-1"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span
                      className="w-8 text-center font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {painScore}
                    </span>
                  </div>
                </div>
                <div>
                  <label
                    className="mb-2 block text-sm font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    Note (optional)
                  </label>
                  <textarea
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="How are you feeling today?"
                    rows={2}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--background)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Calendar size={16} />
                  )}
                  Log Entry
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Session Notes Tab */}
        {tab === "notes" && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <div className="mb-6 flex items-center gap-2">
              <FileText size={20} style={{ color: "var(--primary)" }} />
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Session Notes History
              </h2>
            </div>

            {sessionNotes.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No session notes yet. Notes from your coaching sessions will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessionNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border p-4"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--primary)" + "20",
                          color: "var(--primary)",
                        }}
                      >
                        <Calendar size={12} />
                        {note.date}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs"
                        style={{
                          backgroundColor: "var(--card-border)",
                          color: "var(--muted)",
                        }}
                      >
                        {note.sessionType}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        Pain: {note.painScore}/10
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                      {note.notes}
                    </p>
                    {note.homework && note.homework.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-medium" style={{ color: "var(--muted)" }}>
                          Homework
                        </p>
                        <ul className="list-inside list-disc space-y-0.5 text-sm" style={{ color: "var(--foreground)" }}>
                          {note.homework.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Posture Tab */}
        {tab === "posture" && (
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <div className="mb-6 flex items-center gap-2">
              <ScanLine size={20} style={{ color: "var(--primary)" }} />
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Posture Analysis Results
              </h2>
            </div>

            {postureAnalyses.length === 0 ? (
              <div className="py-12 text-center">
                <ScanLine size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No posture analyses yet. Your coach will add results after assessments.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {postureAnalyses.map((a) => {
                  const score = a.measurements?.overallSymmetryScore ?? 0;
                  const color = scoreColor(score);
                  const grade = scoreGrade(score);
                  return (
                    <div
                      key={a.id}
                      className="rounded-xl border p-4"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className="flex items-center gap-1 text-sm"
                          style={{ color: "var(--muted)" }}
                        >
                          <Calendar size={14} />
                          {a.date}
                        </span>
                        {(a.viewType || a.measurements?.viewType) && (
                          <span
                            className="rounded px-2 py-0.5 text-[10px] uppercase"
                            style={{
                              backgroundColor: "var(--card-border)",
                              color: "var(--muted)",
                            }}
                          >
                            {a.viewType || a.measurements?.viewType}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold"
                          style={{
                            border: `3px solid ${color}`,
                            color,
                          }}
                        >
                          {score}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ fontFamily: "var(--font-outfit)", color }}>
                            {grade}
                          </p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            / 100 alignment score
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
