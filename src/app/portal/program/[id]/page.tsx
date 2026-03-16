"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  ArrowLeft,
  Clock,
  Dumbbell,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Play,
  FileText,
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
}

export default function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));
  }, []);

  // Load completed exercises from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`koch-progress-${id}`);
      if (stored) setCompletedExercises(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, [id]);

  const saveProgress = (newCompleted: Set<string>) => {
    setCompletedExercises(newCompleted);
    localStorage.setItem(`koch-progress-${id}`, JSON.stringify([...newCompleted]));
  };

  const toggleExerciseComplete = (exerciseId: string) => {
    const next = new Set(completedExercises);
    if (next.has(exerciseId)) next.delete(exerciseId);
    else next.add(exerciseId);
    saveProgress(next);
  };

  const toggleExpanded = (exerciseId: string) => {
    setExpandedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  };

  const loadProgram = useCallback(async () => {
    try {
      const authRes = await fetch("/api/client-auth");
      if (!authRes.ok) {
        router.push("/portal/login");
        return;
      }
      const res = await fetch(`/api/programs/${id}`);
      if (res.ok) {
        setProgram(await res.json());
      } else {
        router.push("/portal/dashboard");
      }
    } catch {
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadProgram();
  }, [loadProgram]);

  if (loading || !program) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  const completedCount = program.exercises.filter((e) => completedExercises.has(e.id)).length;
  const progressPct = program.exercises.length > 0 ? Math.round((completedCount / program.exercises.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push("/portal/dashboard")}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition-colors"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>
          <div className="ml-auto flex items-center gap-2">
            <Image
              src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
              alt="KOCH"
              width={24}
              height={24}
              loading="lazy"
            />
            <span className="text-xs font-bold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
              KOCH
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Program Info */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
            {program.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
            {program.description}
          </p>
          <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: "var(--muted)" }}>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {program.duration}
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell size={14} />
              {program.exercises.length} exercises
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="mb-8 rounded-2xl border p-5"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium" style={{ fontFamily: "var(--font-outfit)" }}>
              Progress
            </span>
            <span style={{ color: "var(--primary)" }}>
              {completedCount}/{program.exercises.length} completed
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: "var(--primary)" }}
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {program.exercises.map((exercise, idx) => {
            const isExpanded = expandedExercises.has(exercise.id);
            const isDone = completedExercises.has(exercise.id);

            return (
              <div
                key={exercise.id}
                className="overflow-hidden rounded-2xl border transition-all"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: isDone ? "var(--primary)" : "var(--card-border)",
                  opacity: isDone ? 0.75 : 1,
                }}
              >
                {/* Exercise Header */}
                <button
                  onClick={() => toggleExpanded(exercise.id)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExerciseComplete(exercise.id);
                    }}
                    className="shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 size={22} style={{ color: "var(--primary)" }} />
                    ) : (
                      <Circle size={22} style={{ color: "var(--muted)" }} />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                        #{idx + 1}
                      </span>
                      <h3 className={`font-semibold ${isDone ? "line-through" : ""}`} style={{ fontFamily: "var(--font-outfit)" }}>
                        {exercise.name}
                      </h3>
                    </div>
                    {(exercise.sets || exercise.reps) && (
                      <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                        {exercise.sets && `${exercise.sets} sets`}
                        {exercise.sets && exercise.reps && " × "}
                        {exercise.reps && `${exercise.reps} reps`}
                      </p>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} style={{ color: "var(--muted)" }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: "var(--muted)" }} />
                  )}
                </button>

                {/* Exercise Detail */}
                {isExpanded && (
                  <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--card-border)" }}>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                      {exercise.description}
                    </p>

                    {exercise.videoUrl && (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/40"
                        style={{ borderColor: "var(--card-border)", color: "var(--primary)" }}
                      >
                        <Play size={14} />
                        Watch Video
                      </a>
                    )}

                    {exercise.notes && (
                      <div
                        className="mt-4 rounded-xl p-4 text-sm"
                        style={{ backgroundColor: "var(--background)" }}
                      >
                        <div className="mb-1 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--primary)" }}>
                          <FileText size={12} />
                          Coach Notes
                        </div>
                        <p style={{ color: "var(--muted)" }}>{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
