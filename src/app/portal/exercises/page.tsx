"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  LogOut,
  Dumbbell,
  Search,
  Clock,
  Target,
  Play,
  ChevronDown,
  ChevronLeft,
  X,
  ArrowLeft,
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
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
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

const difficultyColor = (d: string) => {
  if (d === "beginner") return { bg: "#10b98120", text: "#10b981" };
  if (d === "intermediate") return { bg: "#f59e0b20", text: "#f59e0b" };
  return { bg: "#ef444420", text: "#ef4444" };
};

const categoryLabel = (c: string) =>
  CATEGORIES.find((cat) => cat.value === c)?.label || c;

export default function PortalExercises() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch("/api/client-auth");
      if (!authRes.ok) {
        router.push("/portal/login");
        return;
      }
      const authData = await authRes.json();
      setClient(authData.client);

      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterDifficulty) params.set("difficulty", filterDifficulty);
      if (searchQuery) params.set("search", searchQuery);
      const exRes = await fetch(`/api/exercises?${params.toString()}`);
      if (exRes.ok) setExercises(await exRes.json());
    } catch {
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [router, filterCategory, filterDifficulty, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogout = async () => {
    await fetch("/api/client-auth", { method: "DELETE" });
    router.push("/portal/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  // Single exercise detail view
  if (selectedExercise) {
    const dc = difficultyColor(selectedExercise.difficulty);
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {/* Header */}
        <header className="border-b" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
            <button
              onClick={() => setSelectedExercise(null)}
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: "var(--primary)" }}
            >
              <ArrowLeft size={16} />
              Back to Exercises
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-red-500/10"
              style={{ color: "var(--muted)" }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {/* Video */}
          {selectedExercise.videoUrl ? (
            <div className="mb-6 overflow-hidden rounded-2xl">
              <video
                src={selectedExercise.videoUrl}
                controls
                className="w-full"
                poster={selectedExercise.thumbnailUrl || undefined}
              />
            </div>
          ) : selectedExercise.thumbnailUrl ? (
            <div className="mb-6 overflow-hidden rounded-2xl">
              <img
                src={selectedExercise.thumbnailUrl}
                alt={selectedExercise.name}
                className="w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="mb-6 flex h-64 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "var(--card-bg)" }}
            >
              <Dumbbell size={48} style={{ color: "var(--card-border)" }} />
            </div>
          )}

          {/* Title + Badges */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase"
              style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
            >
              {categoryLabel(selectedExercise.category)}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
              style={{ backgroundColor: dc.bg, color: dc.text }}
            >
              {selectedExercise.difficulty}
            </span>
            {selectedExercise.duration && (
              <span className="flex items-center gap-1 text-xs" style={{ color: "var(--muted)" }}>
                <Clock size={12} />
                {selectedExercise.duration}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
            {selectedExercise.name}
          </h1>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {selectedExercise.description}
          </p>

          {/* Target Areas */}
          {selectedExercise.targetAreas.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedExercise.targetAreas.map((area) => (
                <span
                  key={area}
                  className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  <Target size={10} />
                  {area}
                </span>
              ))}
            </div>
          )}

          {/* Instructions */}
          {selectedExercise.instructions.length > 0 && (
            <div
              className="mt-8 rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <h2 className="mb-4 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                Instructions
              </h2>
              <div className="space-y-3">
                {selectedExercise.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: "var(--primary)" + "20", color: "var(--primary)" }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {selectedExercise.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {selectedExercise.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md px-2 py-0.5 text-[11px]"
                  style={{ backgroundColor: "var(--background)", color: "var(--muted)", border: "1px solid var(--card-border)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Exercise library grid view
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
              alt="KOCH"
              width={32}
              height={32}
              loading="lazy"
            />
            <div>
              <span className="text-sm font-bold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
                KOCH
              </span>
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                PORTAL
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/portal/dashboard"
              className="flex items-center gap-1 text-sm transition-colors"
              style={{ color: "var(--muted)" }}
            >
              <ChevronLeft size={14} />
              Dashboard
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors hover:bg-red-500/10"
              style={{ color: "var(--muted)" }}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Exercise Library
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Browse and learn the exercises in your training program
          </p>
        </div>

        {/* Filters */}
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

        {/* Exercise Grid */}
        {exercises.length === 0 ? (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <Dumbbell size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
            <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              No exercises found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--muted)" }}>
              {searchQuery || filterCategory || filterDifficulty
                ? "Try adjusting your search or filters"
                : "Your coach will add exercises to your library soon"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => {
              const dc = difficultyColor(ex.difficulty);
              return (
                <button
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="group rounded-2xl border text-left transition-all hover:border-primary/40"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative flex h-36 items-center justify-center overflow-hidden rounded-t-2xl"
                    style={{ backgroundColor: "var(--background)" }}
                  >
                    {ex.thumbnailUrl ? (
                      <img src={ex.thumbnailUrl} alt={ex.name} className="h-full w-full object-cover" />
                    ) : (
                      <Dumbbell size={32} style={{ color: "var(--card-border)" }} />
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
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
