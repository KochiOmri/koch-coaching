/* ============================================================
   VIDEO MANAGER - src/app/admin/videos/page.tsx
   ============================================================
   Visual admin page to preview all your videos and see
   which video is assigned to which section of the website.
   
   Shows:
   - All 18 videos with preview thumbnails
   - Which section each video is currently assigned to
   - The file path to edit (video-config.ts)
   - Instructions on how to swap videos
   ============================================================ */

"use client";

import { useState, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Play, Pause, Film } from "lucide-react";

/* --- All videos with their current assignments --- */
const videoAssignments = [
  { file: "vid-01.mp4", section: "Hero Background", size: "18MB" },
  { file: "vid-02.mp4", section: "About Section", size: "15MB" },
  { file: "vid-03.mp4", section: "Showcase #1 + Results #4", size: "14MB" },
  { file: "vid-04.mp4", section: "Showcase #2", size: "10MB" },
  { file: "vid-05.mp4", section: "Showcase #3", size: "10MB" },
  { file: "vid-06.mp4", section: "Showcase #4 + Results #1", size: "8.7MB" },
  { file: "vid-07.mp4", section: "Showcase #5 + Results #2", size: "7.9MB" },
  { file: "vid-08.mp4", section: "Method Step 1 (Assessment)", size: "3.4MB" },
  { file: "vid-09.mp4", section: "Method Step 2 (Protocol)", size: "3.4MB" },
  { file: "vid-10.mp4", section: "Method Step 3 (Training)", size: "2.8MB" },
  { file: "vid-11.mp4", section: "Method Step 4 (Results)", size: "2.1MB" },
  { file: "vid-12.mp4", section: "Results #3 (Pain)", size: "2.0MB" },
];

/* --- Section color coding --- */
const sectionColors: Record<string, string> = {
  Hero: "#ef4444",
  About: "#f59e0b",
  Showcase: "#3b82f6",
  Method: "#10b981",
  Results: "#8b5cf6",
};

function getSectionColor(section: string): string {
  for (const [key, color] of Object.entries(sectionColors)) {
    if (section.includes(key)) return color;
  }
  return "#6b7280";
}

/* --- Video Preview Card --- */
function VideoPreview({ video }: { video: (typeof videoAssignments)[0] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div
      className="overflow-hidden rounded-xl border transition-all hover:shadow-lg"
      style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
    >
      {/* Video preview */}
      <div className="relative aspect-video cursor-pointer" onClick={togglePlay}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        >
          <source src={`/videos/${video.file}`} type="video/mp4" />
        </video>
        {/* Play/pause overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playing ? "opacity-0 hover:opacity-100" : "opacity-100"}`}>
          <div className="rounded-full bg-black/40 p-3 backdrop-blur-sm">
            {playing ? (
              <Pause size={20} className="text-white" />
            ) : (
              <Play size={20} className="ml-0.5 text-white" />
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <code className="text-sm font-medium">{video.file}</code>
          <span className="text-xs" style={{ color: "var(--muted)" }}>{video.size}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: getSectionColor(video.section) }}
          />
          <span className="text-xs font-medium" style={{ color: getSectionColor(video.section) }}>
            {video.section}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VideoManager() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-3">
            <Film size={24} style={{ color: "var(--primary)" }} />
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Video Manager
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Preview all 12 videos and see where each one appears on the website
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Instructions box */}
          <div
            className="mb-8 rounded-xl border p-5"
            style={{ backgroundColor: "var(--primary)" + "10", borderColor: "var(--primary)" + "30" }}
          >
            <h3 className="font-semibold" style={{ color: "var(--primary)", fontFamily: "var(--font-outfit)" }}>
              How to Rearrange Videos
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              To swap videos between sections, edit the file:{" "}
              <code className="rounded px-2 py-0.5 text-xs" style={{ backgroundColor: "var(--card-bg)" }}>
                src/lib/video-config.ts
              </code>
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Just change the file name in any slot. For example, to use <code className="text-xs">showcase-3.mp4</code> as 
              the hero background, change <code className="text-xs">hero.mp4</code> to <code className="text-xs">showcase-3.mp4</code> in 
              the <code className="text-xs">heroVideo</code> section.
            </p>
          </div>

          {/* Color legend */}
          <div className="mb-6 flex flex-wrap gap-4">
            {Object.entries(sectionColors).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium">{name}</span>
              </div>
            ))}
          </div>

          {/* Video grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videoAssignments.map((video) => (
              <VideoPreview key={video.file} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
