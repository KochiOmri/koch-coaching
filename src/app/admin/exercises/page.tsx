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
  Search,
  Dumbbell,
  Play,
  Clock,
  Target,
  ChevronDown,
} from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  difficulty: string;
  targetAreas: string[];
  duration: string;
  tags: string[];
  instructions: string[];
  createdAt: string;
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "hip", label: "Hip" },
  { value: "shoulder", label: "Shoulder" },
  { value: "gait", label: "Gait" },
  { value: "core", label: "Core" },
  { value: "spine", label: "Spine" },
  { value: "full-body", label: "Full Body" },
];

const DIFFICULTIES = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TARGET_AREA_OPTIONS = [
  "lower back", "hip", "pelvis", "glutes", "core", "shoulders",
  "thoracic spine", "spine", "posture", "ankle", "knee",
  "hip flexors", "QL", "fascia", "neck",
];

const difficultyColor = (d: string) => {
  if (d === "beginner") return { bg: "#10b98120", text: "#10b981" };
  if (d === "intermediate") return { bg: "#f59e0b20", text: "#f59e0b" };
  return { bg: "#ef444420", text: "#ef4444" };
};

const categoryLabel = (c: string) =>
  CATEGORIES.find((cat) => cat.value === c)?.label || c;

export default function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [category, setCategory] = useState("hip");
  const [difficulty, setDifficulty] = useState("beginner");
  const [targetAreas, setTargetAreas] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [tags, setTags] = useState("");
  const [instructions, setInstructions] = useState<string[]>([""]);

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterDifficulty) params.set("difficulty", filterDifficulty);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/exercises?${params.toString()}`);
      if (res.ok) setExercises(await res.json());
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterDifficulty, searchQuery]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setVideoUrl("");
    setThumbnailUrl("");
    setCategory("hip");
    setDifficulty("beginner");
    setTargetAreas([]);
    setDuration("");
    setTags("");
    setInstructions([""]);
  };

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setName(ex.name);
    setDescription(ex.description);
    setVideoUrl(ex.videoUrl);
    setThumbnailUrl(ex.thumbnailUrl);
    setCategory(ex.category);
    setDifficulty(ex.difficulty);
    setTargetAreas(ex.targetAreas);
    setDuration(ex.duration);
    setTags(ex.tags.join(", "));
    setInstructions(ex.instructions.length > 0 ? ex.instructions : [""]);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!name || !category || !difficulty) return;
    setSaving(true);

    const body = {
      name,
      description,
      videoUrl,
      thumbnailUrl,
      category,
      difficulty,
      targetAreas,
      duration,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      instructions: instructions.filter((s) => s.trim()),
    };

    try {
      const url = editingId ? `/api/exercises/${editingId}` : "/api/exercises";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchExercises();
        resetForm();
      }
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exercise? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
      if (res.ok) await fetchExercises();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const toggleTargetArea = (area: string) => {
    setTargetAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const updateInstruction = (idx: number, value: string) => {
    setInstructions((prev) => prev.map((s, i) => (i === idx ? value : s)));
  };

  const removeInstruction = (idx: number) => {
    if (instructions.length <= 1) return;
    setInstructions((prev) => prev.filter((_, i) => i !== idx));
  };

  if (loading && exercises.length === 0) {
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
                Exercise Library
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Manage your Functional Patterns exercise collection
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                <Plus size={16} />
                Add Exercise
              </button>
            )}
          </div>
        </header>

        <div className="p-6">
          {/* Filters */}
          {!showForm && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1" style={{ minWidth: 200 }}>
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                />
              </div>
              <div className="relative">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none rounded-xl border py-2.5 pl-4 pr-10 text-sm outline-none"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              </div>
              <div className="relative">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="appearance-none rounded-xl border py-2.5 pl-4 pr-10 text-sm outline-none"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              </div>
            </div>
          )}

          {/* Create / Edit Form */}
          {showForm && (
            <div
              className="mb-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {editingId ? "Edit Exercise" : "New Exercise"}
                </h2>
                <button onClick={resetForm} style={{ color: "var(--muted)" }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Standing Decompression"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the exercise and its benefits..."
                    rows={3}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Video URL</label>
                  <input
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://... or /videos/..."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Thumbnail URL</label>
                  <input
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder="https://... or /images/..."
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      {CATEGORIES.filter((c) => c.value).map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Difficulty</label>
                  <div className="relative">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full appearance-none rounded-xl border px-4 py-3 text-sm outline-none"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                    >
                      {DIFFICULTIES.filter((d) => d.value).map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Duration</label>
                  <input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 60s, 2 min"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Tags (comma-separated)</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., FP Big 4, standing, corrective"
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                </div>
              </div>

              {/* Target Areas */}
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Target Areas</label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_AREA_OPTIONS.map((area) => {
                    const selected = targetAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => toggleTargetArea(area)}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          backgroundColor: selected ? "var(--primary)" : "transparent",
                          color: selected ? "var(--background)" : "var(--muted)",
                          borderColor: selected ? "var(--primary)" : "var(--card-border)",
                        }}
                      >
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium">Step-by-Step Instructions</label>
                  <button
                    onClick={() => setInstructions([...instructions, ""])}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: "var(--primary)" }}
                  >
                    <Plus size={14} />
                    Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span
                        className="mt-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}
                      >
                        {idx + 1}
                      </span>
                      <input
                        value={step}
                        onChange={(e) => updateInstruction(idx, e.target.value)}
                        placeholder={`Step ${idx + 1}...`}
                        className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none"
                        style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                      />
                      {instructions.length > 1 && (
                        <button
                          onClick={() => removeInstruction(idx)}
                          className="mt-2.5 text-red-400 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !name || !category || !difficulty}
                  className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {editingId ? "Update Exercise" : "Create Exercise"}
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

          {/* Exercise Grid */}
          {exercises.length === 0 && !showForm ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <Dumbbell size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                No exercises found
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                {searchQuery || filterCategory || filterDifficulty
                  ? "Try adjusting your filters"
                  : "Add your first exercise to the library"}
              </p>
              {!searchQuery && !filterCategory && !filterDifficulty && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                >
                  <Plus size={16} />
                  Add Exercise
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exercises.map((ex) => {
                const dc = difficultyColor(ex.difficulty);
                return (
                  <div
                    key={ex.id}
                    className="group rounded-2xl border transition-all hover:border-primary/40"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                  >
                    {/* Thumbnail / Video Preview */}
                    <div
                      className="relative flex h-40 items-center justify-center overflow-hidden rounded-t-2xl"
                      style={{ backgroundColor: "var(--background)" }}
                    >
                      {ex.thumbnailUrl ? (
                        <img
                          src={ex.thumbnailUrl}
                          alt={ex.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Dumbbell size={36} style={{ color: "var(--card-border)" }} />
                      )}
                      {ex.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: "var(--primary)" }}
                          >
                            <Play size={18} fill="var(--background)" style={{ color: "var(--background)" }} />
                          </div>
                        </div>
                      )}
                      {/* Duration badge */}
                      {ex.duration && (
                        <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-medium text-white">
                          <Clock size={10} />
                          {ex.duration}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                          style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                        >
                          {categoryLabel(ex.category)}
                        </span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize"
                          style={{ backgroundColor: dc.bg, color: dc.text }}
                        >
                          {ex.difficulty}
                        </span>
                      </div>

                      <h3 className="font-semibold leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                        {ex.name}
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-xs" style={{ color: "var(--muted)" }}>
                        {ex.description}
                      </p>

                      {ex.targetAreas.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {ex.targetAreas.slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]"
                              style={{ backgroundColor: "var(--background)", color: "var(--muted)" }}
                            >
                              <Target size={8} />
                              {area}
                            </span>
                          ))}
                          {ex.targetAreas.length > 3 && (
                            <span className="rounded-md px-1.5 py-0.5 text-[10px]" style={{ color: "var(--muted)" }}>
                              +{ex.targetAreas.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-4 flex gap-1 border-t pt-3" style={{ borderColor: "var(--card-border)" }}>
                        <button
                          onClick={() => startEdit(ex)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors hover:bg-white/5"
                          style={{ color: "var(--muted)" }}
                        >
                          <Edit3 size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ex.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
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
