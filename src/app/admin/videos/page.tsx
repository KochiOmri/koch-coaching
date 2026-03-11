"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Save, Loader2, Check, RotateCcw } from "lucide-react";

interface VideoConfig {
  hero: string;
  about: string;
  showcase: Array<{ src: string; title: string; tag: string }>;
  method: { step1: string; step2: string; step3: string; step4: string };
  results: Array<{ src: string; title: string; description: string }>;
}

const ALL_VIDEOS = [
  "vid-01.mp4", "vid-02.mp4", "vid-03.mp4", "vid-04.mp4",
  "vid-05.mp4", "vid-06.mp4", "vid-07.mp4", "vid-08.mp4",
  "vid-09.mp4", "vid-10.mp4", "vid-11.mp4", "vid-12.mp4",
];

/* All the slots on the website where a video can go */
interface Slot {
  id: string;
  label: string;
  section: string;
  color: string;
  currentVideo: string;
}

function getFilename(path: string): string {
  return path.split("/").pop() || path;
}

export default function VideoManager() {
  const [config, setConfig] = useState<VideoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/video-config");
      if (res.ok) setConfig(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  if (loading || !config) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  /* Build the list of all slots from the current config */
  const slots: Slot[] = [
    { id: "hero", label: "Hero Background", section: "Hero", color: "#ef4444", currentVideo: config.hero },
    { id: "about", label: "About Section", section: "About", color: "#f59e0b", currentVideo: config.about },
    ...config.showcase.map((v, i) => ({ id: `showcase-${i}`, label: `Showcase #${i + 1} — ${v.title}`, section: "Showcase", color: "#3b82f6", currentVideo: v.src })),
    { id: "method-step1", label: "Method Step 1 — Assessment", section: "Method", color: "#10b981", currentVideo: config.method.step1 },
    { id: "method-step2", label: "Method Step 2 — Protocol", section: "Method", color: "#10b981", currentVideo: config.method.step2 },
    { id: "method-step3", label: "Method Step 3 — Training", section: "Method", color: "#10b981", currentVideo: config.method.step3 },
    { id: "method-step4", label: "Method Step 4 — Results", section: "Method", color: "#10b981", currentVideo: config.method.step4 },
    ...config.results.map((v, i) => ({ id: `results-${i}`, label: `Results #${i + 1} — ${v.title}`, section: "Results", color: "#8b5cf6", currentVideo: v.src })),
  ];

  /* Assign a video file to a slot */
  const assignVideo = (slotId: string, videoFile: string) => {
    const videoPath = `/videos/${videoFile}`;
    const updated = { ...config };

    if (slotId === "hero") updated.hero = videoPath;
    else if (slotId === "about") updated.about = videoPath;
    else if (slotId.startsWith("showcase-")) {
      const idx = parseInt(slotId.split("-")[1]);
      updated.showcase = [...config.showcase];
      updated.showcase[idx] = { ...updated.showcase[idx], src: videoPath };
    } else if (slotId.startsWith("method-")) {
      const key = slotId.replace("method-", "") as keyof typeof config.method;
      updated.method = { ...config.method, [key]: videoPath };
    } else if (slotId.startsWith("results-")) {
      const idx = parseInt(slotId.split("-")[1]);
      updated.results = [...config.results];
      updated.results[idx] = { ...updated.results[idx], src: videoPath };
    }

    setConfig(updated);
    setActiveSlot(null);
    setSaved(false);
  };

  /* Save to server */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/video-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const activeSlotData = slots.find(s => s.id === activeSlot);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />
      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Video Manager</h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Click a slot → pick a video → save
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={fetchConfig} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}>
                <RotateCcw size={14} /> Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold transition-all"
                style={{ backgroundColor: saved ? "#10b981" : "var(--primary)", color: "var(--background)" }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Instruction when a slot is selected */}
          {activeSlot && (
            <div className="mb-6 rounded-xl border-2 p-4 text-center text-sm font-medium" style={{ borderColor: activeSlotData?.color, color: activeSlotData?.color }}>
              Now pick a video below for: <strong>{activeSlotData?.label}</strong>
              <button onClick={() => setActiveSlot(null)} className="ml-3 text-xs underline" style={{ color: "var(--muted)" }}>Cancel</button>
            </div>
          )}

          {/* Slots grid */}
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Website Slots — click one to change its video
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setActiveSlot(activeSlot === slot.id ? null : slot.id)}
                className={`flex items-center gap-4 rounded-xl border p-3 text-left transition-all ${
                  activeSlot === slot.id ? "ring-2 scale-[1.02]" : "hover:border-white/20"
                }`}
                style={{
                  borderColor: activeSlot === slot.id ? slot.color : "var(--card-border)",
                  backgroundColor: "var(--card-bg)",
                  outlineColor: activeSlot === slot.id ? slot.color : "transparent",
                }}
              >
                {/* Mini video preview */}
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                  <video autoPlay muted loop playsInline className="h-full w-full object-cover">
                    <source src={slot.currentVideo} type="video/mp4" />
                  </video>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: slot.color }} />
                    <span className="truncate text-xs font-semibold">{slot.label}</span>
                  </div>
                  <div className="mt-1 text-[11px]" style={{ color: "var(--muted)" }}>
                    {getFilename(slot.currentVideo)}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Video library */}
          <h2 className="mb-4 mt-10 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            {activeSlot ? "Pick a video:" : "Your Videos"}
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {ALL_VIDEOS.map((file) => {
              const videoPath = `/videos/${file}`;
              const isUsedInActiveSlot = activeSlotData?.currentVideo === videoPath;
              return (
                <div
                  key={file}
                  onClick={() => activeSlot && assignVideo(activeSlot, file)}
                  className={`group overflow-hidden rounded-xl border transition-all ${
                    activeSlot
                      ? "cursor-pointer hover:ring-2 hover:scale-[1.03]"
                      : ""
                  } ${isUsedInActiveSlot ? "ring-2" : ""}`}
                  style={{
                    borderColor: isUsedInActiveSlot ? "var(--primary)" : "var(--card-border)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  <div className="aspect-[9/14] overflow-hidden">
                    <video autoPlay muted loop playsInline className="h-full w-full object-cover">
                      <source src={videoPath} type="video/mp4" />
                    </video>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-medium">{file}</div>
                    {isUsedInActiveSlot && (
                      <div className="mt-1 text-[10px] font-semibold" style={{ color: "var(--primary)" }}>Current</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
