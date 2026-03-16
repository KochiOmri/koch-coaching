"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Users,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserMinus,
  CalendarDays,
} from "lucide-react";

interface GroupClass {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: string[];
  waitlist: string[];
  price: number;
  isActive: boolean;
  location: string;
  meetLink: string;
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function AdminGroupClasses() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Sunday");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [maxParticipants, setMaxParticipants] = useState(8);
  const [location, setLocation] = useState("Studio");
  const [meetLink, setMeetLink] = useState("");
  const [price, setPrice] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [classRes, clientRes] = await Promise.all([
        fetch("/api/group-classes"),
        fetch("/api/clients"),
      ]);
      if (classRes.ok) setClasses(await classRes.json());
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

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setDayOfWeek("Sunday");
    setTime("10:00");
    setDuration(60);
    setMaxParticipants(8);
    setLocation("Studio");
    setMeetLink("");
    setPrice(0);
    setIsActive(true);
  };

  const startEdit = (gc: GroupClass) => {
    setEditingId(gc.id);
    setName(gc.name);
    setDescription(gc.description);
    setDayOfWeek(gc.dayOfWeek);
    setTime(gc.time);
    setDuration(gc.duration);
    setMaxParticipants(gc.maxParticipants);
    setLocation(gc.location);
    setMeetLink(gc.meetLink);
    setPrice(gc.price);
    setIsActive(gc.isActive);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!name || !dayOfWeek || !time) return;
    setSaving(true);

    const body = { name, description, dayOfWeek, time, duration, maxParticipants, location, meetLink, price, isActive };

    try {
      if (editingId) {
        const res = await fetch(`/api/group-classes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          await fetchData();
          resetForm();
        }
      } else {
        const res = await fetch("/api/group-classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          await fetchData();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/group-classes/${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleRemoveParticipant = async (classId: string, clientId: string) => {
    try {
      const res = await fetch(`/api/group-classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", clientId }),
      });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Remove participant failed:", error);
    }
  };

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || clientId.slice(0, 8) + "...";
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
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Group Classes
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Manage weekly group classes, participants, and waitlists
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                <Plus size={16} />
                New Class
              </button>
            )}
          </div>
        </header>

        <div className="p-6">
          {showForm && (
            <div
              className="mb-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {editingId ? "Edit Class" : "New Group Class"}
                </h2>
                <button onClick={resetForm} style={{ color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Class Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Morning Mobility Flow"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will this class cover?"
                    rows={3}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Max Participants</label>
                  <input
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 8)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Location</label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Studio / Online"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Meet Link (optional)</label>
                  <input
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !dayOfWeek || !time}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? "Update Class" : "Create Class"}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-full border px-6 py-2.5 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {classes.length === 0 && !showForm ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <CalendarDays size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  No group classes yet
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Create your first group class to get started
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  <Plus size={16} />
                  Create Class
                </button>
              </div>
            ) : (
              classes.map((gc) => {
                const isExpanded = expandedClass === gc.id;
                const spotsLeft = gc.maxParticipants - gc.currentParticipants.length;
                const fillPct = (gc.currentParticipants.length / gc.maxParticipants) * 100;

                return (
                  <div
                    key={gc.id}
                    className="rounded-2xl border"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <button
                        onClick={() => setExpandedClass(isExpanded ? null : gc.id)}
                        className="flex flex-1 items-center gap-4 text-left"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: "var(--primary)" + "15" }}
                        >
                          <Users size={18} style={{ color: "var(--primary)" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                              {gc.name}
                            </h3>
                            {!gc.isActive && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--muted)" + "30", color: "var(--muted)" }}>
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} />
                              {gc.dayOfWeek}s
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {gc.time} ({gc.duration}min)
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              {gc.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {gc.currentParticipants.length}/{gc.maxParticipants}
                              {gc.waitlist.length > 0 && ` (+${gc.waitlist.length} waitlisted)`}
                            </span>
                          </div>
                          <div className="mt-2 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${fillPct}%`,
                                backgroundColor: fillPct >= 100 ? "#ef4444" : fillPct >= 75 ? "#f59e0b" : "var(--primary)",
                              }}
                            />
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} style={{ color: "var(--muted)" }} />
                        ) : (
                          <ChevronDown size={18} style={{ color: "var(--muted)" }} />
                        )}
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(gc)}
                          className="rounded-lg p-2 transition-colors hover:bg-white/5"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(gc.id)}
                          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--card-border)" }}>
                        {gc.description && (
                          <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
                            {gc.description}
                          </p>
                        )}

                        <div className="mb-4 flex items-center gap-4 text-sm">
                          <span style={{ color: "var(--muted)" }}>
                            {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} available` : "Class full"}
                          </span>
                          {gc.price > 0 && (
                            <span style={{ color: "var(--primary)" }}>
                              ₪{gc.price}
                            </span>
                          )}
                          {gc.price === 0 && (
                            <span style={{ color: "var(--primary)" }}>
                              Free
                            </span>
                          )}
                        </div>

                        {gc.currentParticipants.length > 0 && (
                          <div className="mb-4">
                            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                              Participants ({gc.currentParticipants.length}/{gc.maxParticipants}):
                            </span>
                            <div className="mt-2 space-y-1">
                              {gc.currentParticipants.map((pid) => (
                                <div
                                  key={pid}
                                  className="flex items-center justify-between rounded-xl p-2 text-sm"
                                  style={{ backgroundColor: "var(--background)" }}
                                >
                                  <span>{getClientName(pid)}</span>
                                  <button
                                    onClick={() => handleRemoveParticipant(gc.id, pid)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                  >
                                    <UserMinus size={12} />
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {gc.waitlist.length > 0 && (
                          <div>
                            <span className="text-xs font-medium" style={{ color: "#f59e0b" }}>
                              Waitlist ({gc.waitlist.length}):
                            </span>
                            <div className="mt-2 space-y-1">
                              {gc.waitlist.map((pid, idx) => (
                                <div
                                  key={pid}
                                  className="flex items-center justify-between rounded-xl p-2 text-sm"
                                  style={{ backgroundColor: "var(--background)" }}
                                >
                                  <span>
                                    <span className="mr-2 text-xs" style={{ color: "var(--muted)" }}>#{idx + 1}</span>
                                    {getClientName(pid)}
                                  </span>
                                  <button
                                    onClick={() => handleRemoveParticipant(gc.id, pid)}
                                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                  >
                                    <UserMinus size={12} />
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {gc.currentParticipants.length === 0 && gc.waitlist.length === 0 && (
                          <p className="text-sm" style={{ color: "var(--muted)" }}>
                            No participants yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
