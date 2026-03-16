"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { ArrowLeft, Film, ImageIcon, AlertCircle } from "lucide-react";
import VideoEditor from "./VideoEditor";
import ImageEditor from "./ImageEditor";

const VIDEO_EXT = new Set(["mp4", "webm", "mov", "avi", "mkv", "ogv"]);
const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]);

function getFileType(path: string): "video" | "image" | "unknown" {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  if (VIDEO_EXT.has(ext)) return "video";
  if (IMAGE_EXT.has(ext)) return "image";
  return "unknown";
}

function getFileName(path: string): string {
  return path.split("/").pop() || path;
}

function MediaEditorContent() {
  const searchParams = useSearchParams();
  const filePath = searchParams.get("file") || "";
  const fileType = getFileType(filePath);
  const fileName = getFileName(filePath);

  if (!filePath) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <AlertCircle size={28} style={{ color: "var(--muted)" }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
            No file specified
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Open a file from the media library to start editing
          </p>
        </div>
        <a
          href="/admin/videos"
          className="mt-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
        >
          Go to Media Library
        </a>
      </div>
    );
  }

  if (fileType === "unknown") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "var(--card-bg)" }}
        >
          <AlertCircle size={28} style={{ color: "#ef4444" }} />
        </div>
        <p className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          Unsupported file type
        </p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Only video and image files can be edited.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mode badge */}
      <div className="flex items-center gap-2 border-b px-6 py-3" style={{ borderColor: "var(--card-border)" }}>
        <div
          className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: fileType === "video" ? "rgba(59,130,246,0.15)" : "rgba(168,85,247,0.15)",
            color: fileType === "video" ? "#60a5fa" : "#a855f7",
          }}
        >
          {fileType === "video" ? <Film size={13} /> : <ImageIcon size={13} />}
          {fileType === "video" ? "Video Editor" : "Image Editor"}
        </div>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {filePath}
        </span>
      </div>

      {fileType === "video" ? (
        <VideoEditor filePath={filePath} fileName={fileName} />
      ) : (
        <ImageEditor filePath={filePath} fileName={fileName} />
      )}
    </>
  );
}

export default function MediaEditPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-4">
            <a
              href="/admin/videos"
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              <ArrowLeft size={16} />
              Back to Library
            </a>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Media Editor
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                Trim videos and edit images in the browser
              </p>
            </div>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }}
              />
            </div>
          }
        >
          <MediaEditorContent />
        </Suspense>
      </div>
    </div>
  );
}
