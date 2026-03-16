"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Search,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  AlertCircle,
  Stethoscope,
  Activity,
} from "lucide-react";

interface IntakeSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: string;
  occupation: string;
  painConditions: string[];
  mainConcern: string;
  previousInjuries: string;
  surgeries: string;
  currentMedications: string;
  allergies: string;
  activityLevel: string;
  hoursSitting: string;
  exerciseFrequency: string;
  sportsActivities: string;
  goals: string;
  submittedAt: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-2">
      <dt className="text-xs font-medium" style={{ color: "var(--muted)" }}>
        {label}
      </dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm">{value}</dd>
    </div>
  );
}

export default function AdminIntakePage() {
  const [submissions, setSubmissions] = useState<IntakeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/intake");
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const filtered = submissions
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.painConditions.some((c) =>
          c.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <AdminSidebar />

      <div className="md:ml-64">
        <header
          className="border-b px-6 py-6"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Intake Forms
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {submissions.length} total submissions
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or condition..."
              className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            />
          </div>

          {/* Submissions list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--primary)" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="py-20 text-center text-sm"
              style={{ color: "var(--muted)" }}
            >
              {searchQuery
                ? "No submissions match your search"
                : "No intake forms submitted yet. They'll appear here when clients fill out the questionnaire."}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {filtered.map((sub) => {
                const isOpen = expandedId === sub.id;
                return (
                  <div
                    key={sub.id}
                    className="overflow-hidden rounded-xl border transition-all"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    {/* Summary row */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : sub.id)}
                      className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--background)",
                          }}
                        >
                          {sub.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{sub.name}</div>
                          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                            <span>{sub.email}</span>
                            <span>Age {sub.age}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden flex-wrap justify-end gap-1 sm:flex">
                          {sub.painConditions.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "var(--background)",
                                opacity: 0.85,
                              }}
                            >
                              {c}
                            </span>
                          ))}
                          {sub.painConditions.length > 3 && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                              style={{ color: "var(--muted)" }}
                            >
                              +{sub.painConditions.length - 3}
                            </span>
                          )}
                        </div>
                        <span
                          className="hidden text-xs sm:block"
                          style={{ color: "var(--muted)" }}
                        >
                          {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {isOpen ? (
                          <ChevronUp size={18} style={{ color: "var(--muted)" }} />
                        ) : (
                          <ChevronDown size={18} style={{ color: "var(--muted)" }} />
                        )}
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div
                        className="border-t px-5 py-5"
                        style={{ borderColor: "var(--card-border)" }}
                      >
                        <div className="grid gap-6 md:grid-cols-3">
                          {/* Personal */}
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                              <User size={14} /> Personal
                            </h4>
                            <dl className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                              <DetailRow label="Name" value={sub.name} />
                              <DetailRow label="Email" value={sub.email} />
                              <DetailRow label="Phone" value={sub.phone} />
                              <DetailRow label="Age" value={sub.age} />
                              <DetailRow label="Occupation" value={sub.occupation} />
                            </dl>
                          </div>

                          {/* Pain & Medical */}
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                              <AlertCircle size={14} /> Pain & Medical
                            </h4>
                            <dl className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                              <div className="py-2">
                                <dt className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                                  Conditions
                                </dt>
                                <dd className="mt-1 flex flex-wrap gap-1">
                                  {sub.painConditions.map((c) => (
                                    <span
                                      key={c}
                                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                                      style={{
                                        backgroundColor: "var(--primary)",
                                        color: "var(--background)",
                                        opacity: 0.85,
                                      }}
                                    >
                                      {c}
                                    </span>
                                  ))}
                                </dd>
                              </div>
                              <DetailRow label="Main Concern" value={sub.mainConcern} />
                              <DetailRow label="Previous Injuries" value={sub.previousInjuries} />
                              <DetailRow label="Surgeries" value={sub.surgeries} />
                              <DetailRow label="Medications" value={sub.currentMedications} />
                              <DetailRow label="Allergies" value={sub.allergies} />
                            </dl>
                          </div>

                          {/* Lifestyle */}
                          <div>
                            <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
                              <Activity size={14} /> Lifestyle
                            </h4>
                            <dl className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                              <DetailRow label="Activity Level" value={sub.activityLevel} />
                              <DetailRow label="Hours Sitting/Day" value={sub.hoursSitting} />
                              <DetailRow label="Exercise Frequency" value={sub.exerciseFrequency} />
                              <DetailRow label="Sports / Activities" value={sub.sportsActivities} />
                              <DetailRow label="Goals" value={sub.goals} />
                            </dl>
                          </div>
                        </div>

                        <div
                          className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                          style={{
                            backgroundColor: "var(--background)",
                            color: "var(--muted)",
                          }}
                        >
                          <Mail size={12} />
                          <a
                            href={`mailto:${sub.email}`}
                            className="transition-colors hover:underline"
                            style={{ color: "var(--primary)" }}
                          >
                            Email {sub.name.split(" ")[0]}
                          </a>
                          <span className="mx-1">·</span>
                          <Phone size={12} />
                          <a
                            href={`tel:${sub.phone}`}
                            className="transition-colors hover:underline"
                            style={{ color: "var(--primary)" }}
                          >
                            Call
                          </a>
                          <span className="mx-1">·</span>
                          <Stethoscope size={12} />
                          <span>
                            Submitted{" "}
                            {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(sub.submittedAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
