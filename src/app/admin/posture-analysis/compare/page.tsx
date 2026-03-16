"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  ScanLine,
  Calendar,
  User,
} from "lucide-react";
import {
  type AnalysisResult,
  type Severity,
  severityColor,
  severityLabel,
  scoreColor,
  scoreGrade,
} from "@/lib/posture-utils";

export default function PostureComparePage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedClient, setSelectedClient] = useState("");
  const [clientAnalyses, setClientAnalyses] = useState<AnalysisResult[]>([]);
  const [beforeId, setBeforeId] = useState("");
  const [afterId, setAfterId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/posture-analysis").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([a, c]) => {
        if (Array.isArray(a)) setAnalyses(a);
        if (Array.isArray(c)) setClients(c.map((cl: { id: string; name: string }) => ({ id: cl.id, name: cl.name })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter analyses when client changes
  useEffect(() => {
    if (!selectedClient) {
      setClientAnalyses([]);
      setBeforeId("");
      setAfterId("");
      return;
    }
    const filtered = analyses
      .filter((a) => a.clientId === selectedClient)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setClientAnalyses(filtered);
    setBeforeId("");
    setAfterId("");

    if (filtered.length >= 2) {
      setBeforeId(filtered[0].id);
      setAfterId(filtered[filtered.length - 1].id);
    }
  }, [selectedClient, analyses]);

  const beforeAnalysis = clientAnalyses.find((a) => a.id === beforeId);
  const afterAnalysis = clientAnalyses.find((a) => a.id === afterId);

  // Calculate improvement between two measurements
  function getImprovement(
    label: string,
    beforeVal: number,
    afterVal: number,
    unit: string,
    lowerIsBetter: boolean
  ) {
    const diff = lowerIsBetter ? beforeVal - afterVal : afterVal - beforeVal;
    const absDiff = Math.abs(diff);
    const improved = diff > 0.5;
    const worsened = diff < -0.5;
    return {
      label,
      before: `${beforeVal.toFixed(1)}${unit}`,
      after: `${afterVal.toFixed(1)}${unit}`,
      change: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}${unit}`,
      improved,
      worsened,
      neutral: !improved && !worsened,
      absDiff,
    };
  }

  function buildComparisons() {
    if (!beforeAnalysis || !afterAnalysis) return [];
    const bm = beforeAnalysis.measurements;
    const am = afterAnalysis.measurements;

    const items = [
      getImprovement("Head Tilt", Math.abs(bm.headTiltAngle), Math.abs(am.headTiltAngle), "°", true),
      getImprovement("Shoulder Difference", Math.abs(bm.shoulderLevelDiff), Math.abs(am.shoulderLevelDiff), "mm", true),
      getImprovement("Hip Difference", Math.abs(bm.hipLevelDiff), Math.abs(am.hipLevelDiff), "mm", true),
      getImprovement("Left Knee Alignment", Math.abs(180 - bm.leftKneeAngle), Math.abs(180 - am.leftKneeAngle), "°", true),
      getImprovement("Right Knee Alignment", Math.abs(180 - bm.rightKneeAngle), Math.abs(180 - am.rightKneeAngle), "°", true),
      getImprovement("Pelvic Tilt", Math.abs(bm.anteriorPelvicTilt), Math.abs(am.anteriorPelvicTilt), "°", true),
      getImprovement("Symmetry Score", bm.overallSymmetryScore, am.overallSymmetryScore, "", false),
    ];

    if (bm.forwardHeadAngle !== null && am.forwardHeadAngle !== null) {
      items.push(
        getImprovement("Forward Head", Math.abs(bm.forwardHeadAngle), Math.abs(am.forwardHeadAngle), "°", true)
      );
    }
    if (bm.thoracicKyphosisAngle !== null && am.thoracicKyphosisAngle !== null) {
      items.push(
        getImprovement(
          "Thoracic Kyphosis",
          Math.abs(170 - bm.thoracicKyphosisAngle),
          Math.abs(170 - am.thoracicKyphosisAngle),
          "°",
          true
        )
      );
    }

    return items;
  }

  const comparisons = buildComparisons();
  const improvedCount = comparisons.filter((c) => c.improved).length;
  const worsenedCount = comparisons.filter((c) => c.worsened).length;

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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <AdminSidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header
          className="border-b px-6 py-6"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-4">
            <a
              href="/admin/posture-analysis"
              className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
              style={{ borderColor: "var(--card-border)" }}
            >
              <ArrowLeft size={16} />
            </a>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Progress Comparison
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                Compare posture analyses to track improvement over time
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Client & Analysis Selection */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Client
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                  <select
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    className="w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">Select client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Before (Earlier)
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                  <select
                    value={beforeId}
                    onChange={(e) => setBeforeId(e.target.value)}
                    disabled={clientAnalyses.length === 0}
                    className="w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">Select analysis…</option>
                    {clientAnalyses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {new Date(a.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        — {a.viewType} view — Score: {a.measurements.overallSymmetryScore}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  After (Later)
                </label>
                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                  <select
                    value={afterId}
                    onChange={(e) => setAfterId(e.target.value)}
                    disabled={clientAnalyses.length === 0}
                    className="w-full appearance-none rounded-xl border py-2.5 pl-9 pr-8 text-sm disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="">Select analysis…</option>
                    {clientAnalyses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {new Date(a.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        — {a.viewType} view — Score: {a.measurements.overallSymmetryScore}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted)" }}
                  />
                </div>
              </div>
            </div>

            {selectedClient && clientAnalyses.length < 2 && (
              <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
                <ScanLine size={16} />
                This client has {clientAnalyses.length} analysis(es). At least 2 are needed for comparison.
              </div>
            )}
          </div>

          {/* Comparison Results */}
          {beforeAnalysis && afterAnalysis && (
            <div className="mt-6 space-y-6">
              {/* Progress Summary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                    Score Change
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <span
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "var(--font-outfit)",
                        color: scoreColor(afterAnalysis.measurements.overallSymmetryScore),
                      }}
                    >
                      {afterAnalysis.measurements.overallSymmetryScore}
                    </span>
                    <span className="mb-1 text-sm" style={{ color: "var(--muted)" }}>
                      from {beforeAnalysis.measurements.overallSymmetryScore}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    {afterAnalysis.measurements.overallSymmetryScore >
                    beforeAnalysis.measurements.overallSymmetryScore ? (
                      <>
                        <TrendingUp size={14} className="text-green-500" />
                        <span className="text-xs font-medium text-green-500">
                          +
                          {afterAnalysis.measurements.overallSymmetryScore -
                            beforeAnalysis.measurements.overallSymmetryScore}{" "}
                          points improved
                        </span>
                      </>
                    ) : afterAnalysis.measurements.overallSymmetryScore <
                      beforeAnalysis.measurements.overallSymmetryScore ? (
                      <>
                        <TrendingDown size={14} className="text-red-400" />
                        <span className="text-xs font-medium text-red-400">
                          {afterAnalysis.measurements.overallSymmetryScore -
                            beforeAnalysis.measurements.overallSymmetryScore}{" "}
                          points
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus size={14} style={{ color: "var(--muted)" }} />
                        <span className="text-xs" style={{ color: "var(--muted)" }}>
                          No change
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                    Metrics Improved
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <span
                      className="text-3xl font-bold text-green-500"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      {improvedCount}
                    </span>
                    <span className="mb-1 text-sm" style={{ color: "var(--muted)" }}>
                      of {comparisons.length}
                    </span>
                  </div>
                </div>

                <div
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                    Time Between
                  </p>
                  <div className="mt-2">
                    <span
                      className="text-3xl font-bold"
                      style={{ fontFamily: "var(--font-outfit)", color: "var(--primary)" }}
                    >
                      {Math.round(
                        (new Date(afterAnalysis.date).getTime() -
                          new Date(beforeAnalysis.date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </span>
                    <span className="ml-1 text-sm" style={{ color: "var(--muted)" }}>
                      days
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-side score cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                <ScoreCard
                  label="Before"
                  date={beforeAnalysis.date}
                  score={beforeAnalysis.measurements.overallSymmetryScore}
                  viewType={beforeAnalysis.viewType}
                />
                <ScoreCard
                  label="After"
                  date={afterAnalysis.date}
                  score={afterAnalysis.measurements.overallSymmetryScore}
                  viewType={afterAnalysis.viewType}
                />
              </div>

              {/* Detailed Comparison Table */}
              <div
                className="overflow-hidden rounded-2xl border"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div
                  className="border-b px-6 py-4"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <h3
                    className="text-sm font-bold uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Detailed Comparison
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderColor: "var(--card-border)" }}>
                        <th
                          className="border-b px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                        >
                          Metric
                        </th>
                        <th
                          className="border-b px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                        >
                          Before
                        </th>
                        <th
                          className="border-b px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                        >
                          After
                        </th>
                        <th
                          className="border-b px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                        >
                          Change
                        </th>
                        <th
                          className="border-b px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisons.map((c, i) => (
                        <tr key={i} style={{ borderColor: "var(--card-border)" }}>
                          <td
                            className="border-b px-6 py-3.5 font-medium"
                            style={{ borderColor: "var(--card-border)" }}
                          >
                            {c.label}
                          </td>
                          <td
                            className="border-b px-6 py-3.5 text-center tabular-nums"
                            style={{ color: "var(--muted)", borderColor: "var(--card-border)" }}
                          >
                            {c.before}
                          </td>
                          <td
                            className="border-b px-6 py-3.5 text-center font-semibold tabular-nums"
                            style={{ borderColor: "var(--card-border)" }}
                          >
                            {c.after}
                          </td>
                          <td
                            className="border-b px-6 py-3.5 text-center font-semibold tabular-nums"
                            style={{
                              color: c.improved
                                ? "#22c55e"
                                : c.worsened
                                  ? "#ef4444"
                                  : "var(--muted)",
                              borderColor: "var(--card-border)",
                            }}
                          >
                            {c.change}
                          </td>
                          <td
                            className="border-b px-6 py-3.5 text-center"
                            style={{ borderColor: "var(--card-border)" }}
                          >
                            {c.improved ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
                                <TrendingUp size={12} />
                                Improved
                              </span>
                            ) : c.worsened ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                                <TrendingDown size={12} />
                                Worsened
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                                style={{
                                  backgroundColor: "var(--card-border)",
                                  color: "var(--muted)",
                                }}
                              >
                                <Minus size={12} />
                                Stable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes comparison */}
              {(beforeAnalysis.notes || afterAnalysis.notes) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {beforeAnalysis.notes && (
                    <div
                      className="rounded-2xl border p-5"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                    >
                      <h4
                        className="mb-2 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                      >
                        Before — Notes
                      </h4>
                      <p className="text-sm" style={{ color: "var(--foreground)" }}>
                        {beforeAnalysis.notes}
                      </p>
                    </div>
                  )}
                  {afterAnalysis.notes && (
                    <div
                      className="rounded-2xl border p-5"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                    >
                      <h4
                        className="mb-2 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "var(--muted)" }}
                      >
                        After — Notes
                      </h4>
                      <p className="text-sm" style={{ color: "var(--foreground)" }}>
                        {afterAnalysis.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!beforeAnalysis && !afterAnalysis && !loading && (
            <div
              className="mt-6 flex flex-col items-center rounded-2xl border p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "var(--primary)" + "12" }}
              >
                <ScanLine size={28} style={{ color: "var(--primary)" }} />
              </div>
              <h3
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Select a Client to Compare
              </h3>
              <p className="mt-2 max-w-md text-sm" style={{ color: "var(--muted)" }}>
                Choose a client above and select two posture analyses to see a detailed
                before/after comparison with improvement metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Score Card Component ── */

function ScoreCard({
  label,
  date,
  score,
  viewType,
}: {
  label: string;
  date: string;
  score: number;
  viewType: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--muted)" }}
          >
            {label}
          </span>
          <p className="mt-1 text-sm">
            {new Date(date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs capitalize" style={{ color: "var(--muted)" }}>
            {viewType} view
          </p>
        </div>
        <div className="text-right">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ border: `3px solid ${scoreColor(score)}` }}
          >
            <span
              className="text-2xl font-bold"
              style={{ fontFamily: "var(--font-outfit)", color: scoreColor(score) }}
            >
              {score}
            </span>
          </div>
          <span
            className="mt-1 block text-xs font-medium"
            style={{ color: scoreColor(score) }}
          >
            {scoreGrade(score)}
          </span>
        </div>
      </div>
    </div>
  );
}
