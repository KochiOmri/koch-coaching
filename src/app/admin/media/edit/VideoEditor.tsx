"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Scissors,
  Download,
  Gauge,
  Loader2,
} from "lucide-react";

interface VideoEditorProps {
  filePath: string;
  fileName: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}

export default function VideoEditor({ filePath, fileName }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const [dragging, setDragging] = useState<"start" | "end" | "playhead" | null>(null);
  const [isPlayingSelection, setIsPlayingSelection] = useState(false);

  const draggingRef = useRef(dragging);
  const trimStartRef = useRef(trimStart);
  const trimEndRef = useRef(trimEnd);
  const durationRef = useRef(duration);

  useEffect(() => { draggingRef.current = dragging; }, [dragging]);
  useEffect(() => { trimStartRef.current = trimStart; }, [trimStart]);
  useEffect(() => { trimEndRef.current = trimEnd; }, [trimEnd]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setTrimEnd(video.duration);
    setVideoWidth(video.videoWidth);
    setVideoHeight(video.videoHeight);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsPlayingSelection(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  // Selection playback boundary enforcement
  useEffect(() => {
    if (!isPlayingSelection) return;
    const video = videoRef.current;
    if (!video) return;

    const interval = setInterval(() => {
      if (video.currentTime >= trimEnd) {
        video.pause();
        video.currentTime = trimEnd;
        setIsPlaying(false);
        setIsPlayingSelection(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isPlayingSelection, trimEnd]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    setIsPlayingSelection(false);
  };

  const playSelection = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = trimStart;
    video.play();
    setIsPlaying(true);
    setIsPlayingSelection(true);
  };

  const changeSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const getTimeFromPosition = useCallback((clientX: number): number => {
    const timeline = timelineRef.current;
    if (!timeline || !durationRef.current) return 0;
    const rect = timeline.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * durationRef.current;
  }, []);

  const handleTimelineMouseDown = (e: React.MouseEvent, type: "start" | "end" | "playhead") => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
  };

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (dragging) return;
    const time = getTimeFromPosition(e.clientX);
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromPosition(e.clientX);
      const d = draggingRef.current;
      if (d === "start") {
        setTrimStart(Math.max(0, Math.min(time, trimEndRef.current - 0.1)));
      } else if (d === "end") {
        setTrimEnd(Math.min(durationRef.current, Math.max(time, trimStartRef.current + 0.1)));
      } else if (d === "playhead") {
        const video = videoRef.current;
        if (video) {
          video.currentTime = time;
          setCurrentTime(time);
        }
      }
    };

    const handleMouseUp = () => setDragging(null);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, getTimeFromPosition]);

  const exportTrimmedVideo = async () => {
    const video = videoRef.current;
    if (!video) return;

    setIsExporting(true);
    setExportProgress(0);

    const wasPlaying = !video.paused;
    if (wasPlaying) video.pause();
    const originalRate = video.playbackRate;
    const originalMuted = video.muted;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      video.currentTime = trimStart;
      video.playbackRate = 1;
      video.muted = false;

      await new Promise<void>((resolve) => {
        const handler = () => { video.removeEventListener("seeked", handler); resolve(); };
        video.addEventListener("seeked", handler);
      });

      const canvasStream = canvas.captureStream(30);
      let combinedStream: MediaStream;

      try {
        const vidStream = (video as HTMLVideoElement & { captureStream: () => MediaStream }).captureStream();
        const audioTracks = vidStream.getAudioTracks();
        if (audioTracks.length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioTracks,
          ]);
        } else {
          combinedStream = canvasStream;
        }
      } catch {
        combinedStream = canvasStream;
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
          ? "video/webm;codecs=vp8,opus"
          : "video/webm";

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: 5_000_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const exportPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      });

      recorder.start(100);
      await video.play();

      const totalDuration = trimEnd - trimStart;

      const drawFrame = () => {
        if (video.currentTime >= trimEnd || video.paused) {
          video.pause();
          if (recorder.state === "recording") recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const progress = ((video.currentTime - trimStart) / totalDuration) * 100;
        setExportProgress(Math.min(progress, 100));
        requestAnimationFrame(drawFrame);
      };
      requestAnimationFrame(drawFrame);

      const blob = await exportPromise;
      setExportProgress(100);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trimmed-${fileName.replace(/\.[^.]+$/, "")}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      video.playbackRate = originalRate;
      video.muted = originalMuted;
      setIsExporting(false);
      setExportProgress(0);
      setIsPlaying(false);
    }
  };

  const trimDuration = trimEnd - trimStart;
  const startPct = duration > 0 ? (trimStart / duration) * 100 : 0;
  const endPct = duration > 0 ? (trimEnd / duration) * 100 : 100;
  const currentPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-6">
      {/* File Info */}
      <div
        className="mb-4 flex flex-wrap items-center gap-3 text-sm"
        style={{ color: "var(--muted)" }}
      >
        <span className="font-medium" style={{ color: "var(--foreground)" }}>
          {fileName}
        </span>
        {videoWidth > 0 && (
          <span className="rounded-lg px-2 py-0.5" style={{ backgroundColor: "var(--card-bg)" }}>
            {videoWidth} × {videoHeight}
          </span>
        )}
        {duration > 0 && (
          <span className="rounded-lg px-2 py-0.5" style={{ backgroundColor: "var(--card-bg)" }}>
            {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Video Preview */}
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--card-border)", backgroundColor: "#000" }}
      >
        <video
          ref={videoRef}
          src={filePath}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="mx-auto max-h-[55vh] w-full object-contain"
          playsInline
          crossOrigin="anonymous"
        />
      </div>

      {/* Timeline */}
      <div
        className="mt-6 rounded-2xl border p-5"
        style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
      >
        <div
          className="mb-2 flex items-center justify-between text-xs font-mono"
          style={{ color: "var(--muted)" }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Timeline bar */}
        <div
          ref={timelineRef}
          className="relative h-14 cursor-pointer select-none rounded-xl"
          style={{ backgroundColor: "var(--background)" }}
          onClick={handleTimelineClick}
        >
          {/* Full track background ticks */}
          <div className="absolute inset-0 flex items-end px-1 opacity-20">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 mx-px"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  backgroundColor: "var(--muted)",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>

          {/* Selected range highlight */}
          <div
            className="absolute top-0 h-full rounded-lg"
            style={{
              left: `${startPct}%`,
              width: `${endPct - startPct}%`,
              backgroundColor: "var(--primary)",
              opacity: 0.2,
            }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 z-10 h-full cursor-ew-resize"
            style={{ left: `calc(${currentPct}% - 1px)`, width: 2 }}
            onMouseDown={(e) => handleTimelineMouseDown(e, "playhead")}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: "var(--foreground)" }}
            />
            <div
              className="absolute -left-[5px] -top-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: "var(--foreground)" }}
            />
          </div>

          {/* Start trim handle */}
          <div
            className="absolute top-0 z-20 h-full cursor-ew-resize"
            style={{ left: `calc(${startPct}% - 6px)`, width: 12 }}
            onMouseDown={(e) => handleTimelineMouseDown(e, "start")}
          >
            <div
              className="mx-auto h-full w-[3px] rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md px-1 py-3 text-[9px] font-black leading-none"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              ‹
            </div>
          </div>

          {/* End trim handle */}
          <div
            className="absolute top-0 z-20 h-full cursor-ew-resize"
            style={{ left: `calc(${endPct}% - 6px)`, width: 12 }}
            onMouseDown={(e) => handleTimelineMouseDown(e, "end")}
          >
            <div
              className="mx-auto h-full w-[3px] rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md px-1 py-3 text-[9px] font-black leading-none"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              ›
            </div>
          </div>
        </div>

        {/* Time info cards */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Start", value: formatTime(trimStart) },
            { label: "End", value: formatTime(trimEnd) },
            { label: "Selection", value: formatTime(trimDuration) },
            { label: "Current", value: formatTime(currentTime) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: "var(--background)" }}
            >
              <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {item.label}
              </div>
              <div className="mt-1 font-mono text-sm font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          onClick={playSelection}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
        >
          <Scissors size={16} />
          Play Selection
        </button>

        {/* Speed control */}
        <div
          className="flex items-center gap-1 rounded-xl border px-2 py-1.5"
          style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
        >
          <Gauge size={14} style={{ color: "var(--muted)" }} />
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => changeSpeed(rate)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
              style={{
                backgroundColor: playbackRate === rate ? "var(--primary)" : "transparent",
                color: playbackRate === rate ? "var(--background)" : "var(--muted)",
              }}
            >
              {rate}x
            </button>
          ))}
        </div>

        <button
          onClick={toggleMute}
          className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors"
          style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div className="flex-1" />

        <button
          onClick={exportTrimmedVideo}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--background)",
          }}
        >
          {isExporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Exporting {Math.round(exportProgress)}%
            </>
          ) : (
            <>
              <Download size={16} />
              Export Trimmed Video
            </>
          )}
        </button>
      </div>

      {/* Export progress bar */}
      {isExporting && (
        <div
          className="mt-3 overflow-hidden rounded-full h-2"
          style={{ backgroundColor: "var(--card-border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${exportProgress}%`,
              backgroundColor: "var(--primary)",
            }}
          />
        </div>
      )}
    </div>
  );
}
