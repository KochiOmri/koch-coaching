"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  FileText,
  Loader2,
  Plus,
  Search,
  X,
  Tag,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
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

const SESSION_TYPES = [
  "Initial Assessment",
  "1-on-1 Coaching",
  "Follow-Up",
  "Gait Analysis",
  "Program Review",
  "General",
];

export default function AdminSessionNotes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formClientId, setFormClientId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formSessionType, setFormSessionType] = useState("1-on-1 Coaching");
  const [formNotes, setFormNotes] = useState("");
  const [formPainScore, setFormPainScore] = useState(5);
  const [formHomework, setFormHomework] = useState<string[]>([]);
  const [homeworkInput, setHomeworkInput] = useState("");

  // Filter state
  const [filterClient, setFilterClient] = useState("");
  const [filterSearch, setFilterSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [clientsRes, notesRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/session-notes"),
      ]);
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (notesRes.ok) setNotes(await notesRes.json());
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = () => {
    setFormClientId("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormSessionType("1-on-1 Coaching");
    setFormNotes("");
    setFormPainScore(5);
    setFormHomework([]);
    setHomeworkInput("");
  };

  const handleSubmit = async () => {
    if (!formClientId || !formNotes.trim()) return;
    const client = clients.find((c) => c.id === formClientId);
    setSaving(true);
    try {
      const res = await fetch("/api/session-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: formClientId,
          clientName: client?.name || "",
          date: formDate,
          sessionType: formSessionType,
          notes: formNotes,
          painScore: formPainScore,
          homework: formHomework,
        }),
      });
      if (res.ok) {
        const newNote = await res.json();
        setNotes((prev) => [newNote, ...prev]);
        resetForm();
        setShowForm(false);

        // Also record the pain score in client-progress
        await fetch("/api/client-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientId: formClientId,
            type: "painScore",
            data: { date: formDate, score: formPainScore },
          }),
        });
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  };

  const addHomeworkTag = () => {
    const tag = homeworkInput.trim();
    if (tag && !formHomework.includes(tag)) {
      setFormHomework((prev) => [...prev, tag]);
      setHomeworkInput("");
    }
  };

  const removeHomeworkTag = (tag: string) => {
    setFormHomework((prev) => prev.filter((t) => t !== tag));
  };

  const filtered = notes.filter((n) => {
    if (filterClient && n.clientId !== filterClient) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      return (
        n.clientName.toLowerCase().includes(q) ||
        n.notes.toLowerCase().includes(q) ||
        n.sessionType.toLowerCase().includes(q) ||
        n.homework.some((h) => h.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const painColor = (score: number) => {
    if (score <= 3) return "#10b981";
    if (score <= 6) return "#f59e0b";
    return "#ef4444";
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
      <AdminSidebar />

      <div className="md:ml-64">
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Session Notes</h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {notes.length} session note{notes.length !== 1 ? "s" : ""} recorded
              </p>
            </div>
            <button
              onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ backgroundColor: showForm ? "var(--card-bg)" : "var(--primary)", color: showForm ? "var(--foreground)" : "var(--background)", borderColor: "var(--card-border)", borderWidth: showForm ? 1 : 0 }}
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "New Note"}
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* New Session Note Form */}
          {showForm && (
            <div
              className="mb-6 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <h2 className="mb-4 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>New Session Note</h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Client select */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>Client</label>
                  <div className="relative">
                    <select
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      <option value="">Select client...</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>Date</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                </div>

                {/* Session Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>Session Type</label>
                  <div className="relative">
                    <select
                      value={formSessionType}
                      onChange={(e) => setFormSessionType(e.target.value)}
                      className="w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      {SESSION_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  </div>
                </div>
              </div>

              {/* Pain Score Slider */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>
                  Pain Score: <span style={{ color: painColor(formPainScore), fontWeight: 700 }}>{formPainScore}</span>/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formPainScore}
                  onChange={(e) => setFormPainScore(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>No pain</span>
                  <span>Severe</span>
                </div>
              </div>

              {/* Notes textarea */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>Session Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={5}
                  placeholder="Write your notes from this session..."
                  className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>

              {/* Homework tags */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--muted)" }}>Homework / Exercises</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={homeworkInput}
                    onChange={(e) => setHomeworkInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addHomeworkTag(); } }}
                    placeholder="Type an exercise and press Enter..."
                    className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  />
                  <button
                    onClick={addHomeworkTag}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                  >
                    Add
                  </button>
                </div>
                {formHomework.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formHomework.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                        style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}
                      >
                        <Tag size={10} />
                        {tag}
                        <button onClick={() => removeHomeworkTag(tag)} className="ml-0.5 hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={saving || !formClientId || !formNotes.trim()}
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? "Saving..." : "Save Session Note"}
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative flex-1" style={{ minWidth: 200 }}>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search notes..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              />
            </div>
            <div className="relative">
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="appearance-none rounded-xl border px-4 py-2.5 pr-10 text-sm outline-none"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
            </div>
          </div>

          {/* Notes List */}
          {filtered.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <FileText size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <p className="text-lg font-medium" style={{ fontFamily: "var(--font-outfit)" }}>
                {notes.length === 0 ? "No session notes yet" : "No notes match your filters"}
              </p>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {notes.length === 0
                  ? "Click 'New Note' to record your first session"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((note) => (
                <div
                  key={note.id}
                  className="rounded-2xl border p-5 transition-colors"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                        style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                      >
                        {note.clientName.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>{note.clientName}</p>
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                          <Calendar size={11} />
                          {new Date(note.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          <span>•</span>
                          <span>{note.sessionType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: painColor(note.painScore) + "15", color: painColor(note.painScore) }}>
                      Pain: {note.painScore}/10
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                    {note.notes}
                  </p>

                  {note.homework.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {note.homework.map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
