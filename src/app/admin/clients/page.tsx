"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Users,
  Mail,
  Phone,
  CalendarDays,
  ChevronLeft,
  Loader2,
  TrendingDown,
  StickyNote,
  ImageIcon,
  Plus,
  X,
  Search,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  programs: string[];
}

interface PainScore {
  date: string;
  score: number;
}
interface ProgressNote {
  date: string;
  text: string;
}
interface Photo {
  date: string;
  beforeUrl: string;
  afterUrl: string;
}
interface ClientProgress {
  painScores: PainScore[];
  notes: ProgressNote[];
  photos: Photo[];
}

function PainScoreChart({ scores }: { scores: PainScore[] }) {
  if (scores.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>No pain scores recorded yet</p>
      </div>
    );
  }

  const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date));
  const maxScore = 10;
  const width = 600;
  const height = 180;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = sorted.map((s, i) => ({
    x: padX + (sorted.length === 1 ? chartW / 2 : (i / (sorted.length - 1)) * chartW),
    y: padY + chartH - (s.score / maxScore) * chartH,
    ...s,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 300 }}>
        {[0, 2, 4, 6, 8, 10].map((v) => {
          const y = padY + chartH - (v / maxScore) * chartH;
          return (
            <g key={v}>
              <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--card-border)" strokeWidth="1" />
              <text x={padX - 8} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="10">{v}</text>
            </g>
          );
        })}
        <defs>
          <linearGradient id="painGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#painGrad)" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--primary)" />
            <circle cx={p.x} cy={p.y} r="6" fill="var(--primary)" fillOpacity="0.2" />
            {sorted.length <= 12 && (
              <text x={p.x} y={padY + chartH + 14} textAnchor="middle" fill="var(--muted)" fontSize="8">
                {p.date.slice(5)}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [progress, setProgress] = useState<ClientProgress>({ painScores: [], notes: [], photos: [] });
  const [progressLoading, setProgressLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [showAddPain, setShowAddPain] = useState(false);
  const [newPainScore, setNewPainScore] = useState(5);
  const [newPainDate, setNewPainDate] = useState(new Date().toISOString().split("T")[0]);

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteDate, setNewNoteDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients");
      if (res.ok) setClients(await res.json());
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const selectClient = async (client: Client) => {
    setSelectedClient(client);
    setProgressLoading(true);
    try {
      const res = await fetch(`/api/client-progress?clientId=${client.id}`);
      if (res.ok) setProgress(await res.json());
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    } finally {
      setProgressLoading(false);
    }
  };

  const addPainScore = async () => {
    if (!selectedClient) return;
    try {
      const res = await fetch("/api/client-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          type: "painScore",
          data: { date: newPainDate, score: newPainScore },
        }),
      });
      if (res.ok) {
        setProgress(await res.json());
        setShowAddPain(false);
        setNewPainScore(5);
      }
    } catch (err) {
      console.error("Failed to add pain score:", err);
    }
  };

  const addNote = async () => {
    if (!selectedClient || !newNoteText.trim()) return;
    try {
      const res = await fetch("/api/client-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          type: "note",
          data: { date: newNoteDate, text: newNoteText },
        }),
      });
      if (res.ok) {
        setProgress(await res.json());
        setShowAddNote(false);
        setNewNoteText("");
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    }
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
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
          <div className="flex items-center gap-3">
            {selectedClient && (
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                style={{ color: "var(--muted)" }}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                {selectedClient ? selectedClient.name : "Clients"}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {selectedClient ? selectedClient.email : `${clients.length} registered client${clients.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {!selectedClient ? (
            <>
              {/* Search bar */}
              <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                <input
                  type="text"
                  placeholder="Search clients by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:ring-2"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              {/* Client list */}
              {filtered.length === 0 ? (
                <div
                  className="rounded-2xl border p-12 text-center"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  <Users size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                  <p className="text-lg font-medium" style={{ fontFamily: "var(--font-outfit)" }}>
                    {clients.length === 0 ? "No clients yet" : "No clients match your search"}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                    {clients.length === 0
                      ? "Clients will appear here when they register through the portal"
                      : "Try a different search term"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => selectClient(client)}
                      className="rounded-2xl border p-5 text-left transition-all hover:scale-[1.01] hover:shadow-lg"
                      style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}>
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>{client.name}</p>
                      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{client.email}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                        <CalendarDays size={12} />
                        Joined {new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Client Detail View */
            <div className="space-y-6">
              {/* Profile Card */}
              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="flex flex-wrap items-start gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold" style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}>
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>{selectedClient.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--muted)" }}>
                      <span className="flex items-center gap-1.5"><Mail size={14} /> {selectedClient.email}</span>
                      {selectedClient.phone && <span className="flex items-center gap-1.5"><Phone size={14} /> {selectedClient.phone}</span>}
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Registered {new Date(selectedClient.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {progressLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin" style={{ color: "var(--primary)" }} />
                </div>
              ) : (
                <>
                  {/* Pain Score History */}
                  <div
                    className="rounded-2xl border p-6"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingDown size={18} style={{ color: "var(--primary)" }} />
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Pain Score History</h3>
                      </div>
                      <button
                        onClick={() => setShowAddPain(!showAddPain)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                      >
                        {showAddPain ? <X size={12} /> : <Plus size={12} />}
                        {showAddPain ? "Cancel" : "Add Score"}
                      </button>
                    </div>

                    {showAddPain && (
                      <div
                        className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border p-4"
                        style={{ borderColor: "var(--card-border)" }}
                      >
                        <div>
                          <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>Date</label>
                          <input
                            type="date"
                            value={newPainDate}
                            onChange={(e) => setNewPainDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                          />
                        </div>
                        <div className="flex-1" style={{ minWidth: 200 }}>
                          <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>
                            Pain Score: <span style={{ color: "var(--primary)" }}>{newPainScore}</span>/10
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={newPainScore}
                            onChange={(e) => setNewPainScore(Number(e.target.value))}
                            className="w-full accent-[var(--primary)]"
                          />
                        </div>
                        <button
                          onClick={addPainScore}
                          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                        >
                          Save
                        </button>
                      </div>
                    )}

                    <PainScoreChart scores={progress.painScores} />
                  </div>

                  {/* Before/After Photos */}
                  <div
                    className="rounded-2xl border p-6"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <ImageIcon size={18} style={{ color: "var(--primary)" }} />
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Before & After Photos</h3>
                    </div>

                    {progress.photos.length === 0 ? (
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed" style={{ borderColor: "var(--card-border)" }}>
                        <div className="text-center">
                          <ImageIcon size={24} className="mx-auto mb-2" style={{ color: "var(--muted)" }} />
                          <p className="text-sm" style={{ color: "var(--muted)" }}>No photos uploaded yet</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {progress.photos.map((photo, i) => (
                          <div key={i} className="rounded-xl border p-3" style={{ borderColor: "var(--card-border)" }}>
                            <p className="mb-2 text-xs" style={{ color: "var(--muted)" }}>{photo.date}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex h-24 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--background)" }}>
                                <span className="text-xs" style={{ color: "var(--muted)" }}>Before</span>
                              </div>
                              <div className="flex h-24 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--background)" }}>
                                <span className="text-xs" style={{ color: "var(--muted)" }}>After</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Notes History */}
                  <div
                    className="rounded-2xl border p-6"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote size={18} style={{ color: "var(--primary)" }} />
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Notes History</h3>
                      </div>
                      <button
                        onClick={() => setShowAddNote(!showAddNote)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                        style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                      >
                        {showAddNote ? <X size={12} /> : <Plus size={12} />}
                        {showAddNote ? "Cancel" : "Add Note"}
                      </button>
                    </div>

                    {showAddNote && (
                      <div
                        className="mb-4 space-y-3 rounded-xl border p-4"
                        style={{ borderColor: "var(--card-border)" }}
                      >
                        <div>
                          <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>Date</label>
                          <input
                            type="date"
                            value={newNoteDate}
                            onChange={(e) => setNewNoteDate(e.target.value)}
                            className="rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>Note</label>
                          <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            rows={3}
                            placeholder="Write a note about this client..."
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                          />
                        </div>
                        <button
                          onClick={addNote}
                          className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                        >
                          Save Note
                        </button>
                      </div>
                    )}

                    {progress.notes.length === 0 ? (
                      <p className="py-4 text-center text-sm" style={{ color: "var(--muted)" }}>No notes yet</p>
                    ) : (
                      <div className="space-y-3">
                        {[...progress.notes].reverse().map((note, i) => (
                          <div key={i} className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
                            <p className="mb-1 text-xs" style={{ color: "var(--muted)" }}>{note.date}</p>
                            <p className="text-sm" style={{ color: "var(--foreground)" }}>{note.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
