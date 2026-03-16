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
  Dumbbell,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string;
  sets?: number;
  reps?: number;
  notes?: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  duration: string;
  exercises: Exercise[];
  assignedTo: string[];
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

const emptyExercise = (): Exercise => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  videoUrl: "",
  sets: undefined,
  reps: undefined,
  notes: "",
});

export default function AdminPrograms() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([emptyExercise()]);
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [progRes, clientRes] = await Promise.all([
        fetch("/api/programs"),
        fetch("/api/clients"),
      ]);
      if (progRes.ok) setPrograms(await progRes.json());
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
    setTitle("");
    setDescription("");
    setDuration("");
    setExercises([emptyExercise()]);
    setAssignedTo([]);
  };

  const startEdit = (program: Program) => {
    setEditingId(program.id);
    setTitle(program.title);
    setDescription(program.description);
    setDuration(program.duration);
    setExercises(program.exercises.length > 0 ? program.exercises : [emptyExercise()]);
    setAssignedTo(program.assignedTo);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!title || !description || !duration) return;
    setSaving(true);

    const validExercises = exercises.filter((e) => e.name.trim());

    const body = { title, description, duration, exercises: validExercises, assignedTo };

    try {
      if (editingId) {
        const res = await fetch(`/api/programs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          await fetchData();
          resetForm();
        }
      } else {
        const res = await fetch("/api/programs", {
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
    if (!confirm("Delete this program? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const updateExercise = (idx: number, field: string, value: string | number) => {
    setExercises((prev) => prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e)));
  };

  const removeExercise = (idx: number) => {
    if (exercises.length <= 1) return;
    setExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleClientAssignment = (clientId: string) => {
    setAssignedTo((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
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
                Programs
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Create and manage training programs for your clients
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                <Plus size={16} />
                New Program
              </button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* Create / Edit Form */}
          {showForm && (
            <div
              className="mb-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {editingId ? "Edit Program" : "New Program"}
                </h2>
                <button onClick={resetForm} style={{ color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Foundation Movement Program"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the program goals and focus areas..."
                    rows={3}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Duration</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 8 weeks"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
              </div>

              {/* Exercises */}
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Dumbbell size={16} style={{ color: "var(--primary)" }} />
                    Exercises
                  </h3>
                  <button
                    onClick={() => setExercises([...exercises, emptyExercise()])}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                    style={{ color: "var(--primary)" }}
                  >
                    <Plus size={14} />
                    Add Exercise
                  </button>
                </div>

                <div className="space-y-3">
                  {exercises.map((exercise, idx) => (
                    <div
                      key={exercise.id}
                      className="rounded-xl border p-4"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} style={{ color: "var(--muted)" }} />
                          <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                            Exercise #{idx + 1}
                          </span>
                        </div>
                        {exercises.length > 1 && (
                          <button
                            onClick={() => removeExercise(idx)}
                            className="text-red-400 transition-colors hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <input
                            value={exercise.name}
                            onChange={(e) => updateExercise(idx, "name", e.target.value)}
                            placeholder="Exercise name"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={exercise.sets || ""}
                            onChange={(e) => updateExercise(idx, "sets", parseInt(e.target.value) || 0)}
                            placeholder="Sets"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                          <input
                            type="number"
                            value={exercise.reps || ""}
                            onChange={(e) => updateExercise(idx, "reps", parseInt(e.target.value) || 0)}
                            placeholder="Reps"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <textarea
                            value={exercise.description}
                            onChange={(e) => updateExercise(idx, "description", e.target.value)}
                            placeholder="Description / instructions"
                            rows={2}
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                        </div>
                        <div>
                          <input
                            value={exercise.videoUrl || ""}
                            onChange={(e) => updateExercise(idx, "videoUrl", e.target.value)}
                            placeholder="Video URL (optional)"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                        </div>
                        <div>
                          <input
                            value={exercise.notes || ""}
                            onChange={(e) => updateExercise(idx, "notes", e.target.value)}
                            placeholder="Coach notes (optional)"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                            style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assign to Clients */}
              {clients.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Users size={16} style={{ color: "var(--primary)" }} />
                    Assign to Clients
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {clients.map((client) => {
                      const isSelected = assignedTo.includes(client.id);
                      return (
                        <button
                          key={client.id}
                          onClick={() => toggleClientAssignment(client.id)}
                          className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                          style={{
                            backgroundColor: isSelected ? "var(--primary)" : "transparent",
                            color: isSelected ? "var(--background)" : "var(--muted)",
                            borderColor: isSelected ? "var(--primary)" : "var(--card-border)",
                          }}
                        >
                          {client.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !title || !description || !duration}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? "Update Program" : "Create Program"}
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

          {/* Programs List */}
          <div className="space-y-4">
            {programs.length === 0 && !showForm ? (
              <div
                className="rounded-2xl border p-12 text-center"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <Dumbbell size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  No programs yet
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                  Create your first training program for your clients
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  <Plus size={16} />
                  Create Program
                </button>
              </div>
            ) : (
              programs.map((program) => {
                const isExpanded = expandedProgram === program.id;
                const assignedClients = clients.filter((c) => program.assignedTo.includes(c.id));
                return (
                  <div
                    key={program.id}
                    className="rounded-2xl border"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    <div className="flex items-center gap-4 p-5">
                      <button
                        onClick={() => setExpandedProgram(isExpanded ? null : program.id)}
                        className="flex flex-1 items-center gap-4 text-left"
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: "var(--primary)" + "15" }}
                        >
                          <Dumbbell size={18} style={{ color: "var(--primary)" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                            {program.title}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--muted)" }}>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {program.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Dumbbell size={12} />
                              {program.exercises.length} exercises
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {assignedClients.length} client{assignedClients.length !== 1 ? "s" : ""}
                            </span>
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
                          onClick={() => startEdit(program)}
                          className="rounded-lg p-2 transition-colors hover:bg-white/5"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(program.id)}
                          className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--card-border)" }}>
                        <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
                          {program.description}
                        </p>

                        {assignedClients.length > 0 && (
                          <div className="mb-4">
                            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
                              Assigned to:
                            </span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {assignedClients.map((c) => (
                                <span
                                  key={c.id}
                                  className="rounded-full px-2 py-0.5 text-xs"
                                  style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {program.exercises.length > 0 && (
                          <div className="space-y-2">
                            {program.exercises.map((ex, i) => (
                              <div
                                key={ex.id}
                                className="flex items-center gap-3 rounded-xl p-3 text-sm"
                                style={{ backgroundColor: "var(--background)" }}
                              >
                                <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                                  {i + 1}.
                                </span>
                                <span className="flex-1 font-medium">{ex.name}</span>
                                {(ex.sets || ex.reps) && (
                                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                                    {ex.sets && `${ex.sets}×`}{ex.reps}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
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
