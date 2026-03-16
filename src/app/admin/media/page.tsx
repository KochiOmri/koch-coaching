/**
 * Media Library — Admin Page
 *
 * Upload, browse, and manage video and image files. Drag-and-drop or click
 * to upload. Grid view with thumbnails, metadata, copy-URL, and delete.
 * Uses POST/GET/DELETE on /api/upload.
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Upload,
  Loader2,
  Trash2,
  Copy,
  Check,
  Search,
  Film,
  ImageIcon,
  Play,
  Pencil,
  AlertTriangle,
} from "lucide-react";

void Play;

interface MediaFile {
  name: string;
  url: string;
  size: number;
  type: string;
  category: "video" | "image";
  uploadDate: string;
  source?: "existing" | "uploaded";
}

type Tab = "videos" | "images";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VideoThumbnail({ url }: { url: string }) {
  return (
    <video
      src={url}
      autoPlay
      muted
      loop
      playsInline
      className="h-full w-full object-cover"
    />
  );
}

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("videos");
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/upload");
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch media:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | File[]) => {
    const arr = Array.from(fileList);
    if (!arr.length) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    arr.forEach((f) => formData.append("files", f));

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Upload network error"));
        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      });

      await fetchFiles();
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: deleteTarget }),
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.name !== deleteTarget));
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = files
    .filter((f) => f.category === (tab === "videos" ? "video" : "image"))
    .filter((f) =>
      search ? f.name.toLowerCase().includes(search.toLowerCase()) : true
    );

  const acceptTypes =
    tab === "videos"
      ? "video/mp4,video/webm,video/quicktime"
      : "image/jpeg,image/png,image/webp,image/gif";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <AdminSidebar />
      <div className="md:ml-64">
        {/* Header */}
        <header
          className="border-b px-6 py-5"
          style={{ borderColor: "var(--card-border)" }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Media Library
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Upload and manage your videos and images
          </p>
        </header>

        <div className="p-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {(["videos", "images"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    tab === t ? "var(--primary)" : "var(--card-bg)",
                  color:
                    tab === t ? "var(--background)" : "var(--muted)",
                  border:
                    tab === t
                      ? "1px solid transparent"
                      : "1px solid var(--card-border)",
                }}
              >
                {t === "videos" ? <Film size={16} /> : <ImageIcon size={16} />}
                {t === "videos" ? "Videos" : "Images"}
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor:
                      tab === t
                        ? "rgba(0,0,0,0.2)"
                        : "var(--card-border)",
                  }}
                >
                  {files.filter(
                    (f) =>
                      f.category === (t === "videos" ? "video" : "image")
                  ).length}
                </span>
              </button>
            ))}
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="mb-6 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all"
            style={{
              borderColor: dragOver
                ? "var(--primary)"
                : "var(--card-border)",
              backgroundColor: dragOver
                ? "rgba(var(--primary-rgb, 168,162,158), 0.05)"
                : "var(--card-bg)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptTypes}
              className="hidden"
              onChange={(e) =>
                e.target.files && handleUpload(e.target.files)
              }
            />
            <Upload
              size={32}
              className="mx-auto mb-3"
              style={{
                color: dragOver ? "var(--primary)" : "var(--muted)",
              }}
            />
            <p className="text-sm font-medium">
              {dragOver
                ? "Drop files here"
                : `Drag & drop ${tab} here, or click to browse`}
            </p>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--muted)" }}
            >
              {tab === "videos"
                ? "MP4, WebM, MOV — Max 100MB per file"
                : "JPG, PNG, WebP, GIF — Max 10MB per file"}
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6 rounded-xl border p-4" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--primary)" }} />
                Uploading... {uploadProgress}%
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                    backgroundColor: "var(--primary)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: "var(--muted)" }}
            />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:ring-1"
              style={{
                borderColor: "var(--card-border)",
                backgroundColor: "var(--card-bg)",
                color: "var(--foreground)",
              }}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--primary)" }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "var(--card-bg)" }}
              >
                {tab === "videos" ? (
                  <Film size={28} style={{ color: "var(--muted)" }} />
                ) : (
                  <ImageIcon size={28} style={{ color: "var(--muted)" }} />
                )}
              </div>
              <p className="text-sm font-medium">
                {search ? "No files match your search" : `No ${tab} uploaded yet`}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                {search
                  ? "Try a different search term"
                  : "Upload your first file to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((file) => (
                <div
                  key={file.name}
                  className="group overflow-hidden rounded-2xl border transition-all hover:border-white/20"
                  style={{
                    borderColor: "var(--card-border)",
                    backgroundColor: "var(--card-bg)",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-black/40">
                    {file.category === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <VideoThumbnail url={file.url} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p
                      className="truncate text-xs font-medium"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: "var(--muted)" }}
                    >
                      {formatSize(file.size)} · {formatDate(file.uploadDate)}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex gap-1.5">
                      <button
                        onClick={() => handleCopy(file.url)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors"
                        style={{
                          backgroundColor: "var(--card-border)",
                          color:
                            copiedUrl === file.url
                              ? "#10b981"
                              : "var(--foreground)",
                        }}
                      >
                        {copiedUrl === file.url ? (
                          <Check size={12} />
                        ) : (
                          <Copy size={12} />
                        )}
                        {copiedUrl === file.url ? "Copied" : "Copy URL"}
                      </button>

                      <a
                        href={`/admin/media/edit?file=${encodeURIComponent(file.url)}`}
                        className="flex items-center justify-center rounded-lg px-2.5 py-1.5 transition-colors"
                        style={{ backgroundColor: "var(--card-border)" }}
                        title={file.category === "video" ? "Trim / Edit Video" : "Edit Image"}
                      >
                        <Pencil size={12} />
                      </a>

                      <button
                        onClick={() => setDeleteTarget(file.name)}
                        className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--card-border)",
            }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Delete File</h3>
                <p
                  className="text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="mb-5 text-xs" style={{ color: "var(--muted)" }}>
              Are you sure you want to delete{" "}
              <span style={{ color: "var(--foreground)" }}>{deleteTarget}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: "var(--card-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
