"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Undo2,
  Redo2,
  Download,
  RefreshCw,
  Sun,
  Contrast,
  Droplets,
} from "lucide-react";

interface ImageEditorProps {
  filePath: string;
  fileName: string;
}

interface EditorState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
}

interface HistoryEntry {
  state: EditorState;
  sourceDataUrl: string;
}

const DEFAULT_STATE: EditorState = {
  rotation: 0,
  flipH: false,
  flipV: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  filter: "none",
};

const FILTERS = [
  { name: "none", value: "", label: "Original" },
  { name: "grayscale", value: "grayscale(100%)", label: "Grayscale" },
  { name: "sepia", value: "sepia(100%)", label: "Sepia" },
  { name: "high-contrast", value: "contrast(150%) saturate(120%)", label: "High Contrast" },
  { name: "warm", value: "sepia(30%) saturate(140%)", label: "Warm" },
  { name: "cool", value: "hue-rotate(180deg) saturate(80%)", label: "Cool" },
];

export default function ImageEditor({ filePath, fileName }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [state, setState] = useState<EditorState>({ ...DEFAULT_STATE });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(800);

  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropEnd, setCropEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  const isRotated90 = state.rotation === 90 || state.rotation === 270;
  const canvasLogicalW = isRotated90 ? imgHeight : imgWidth;
  const canvasLogicalH = isRotated90 ? imgWidth : imgHeight;

  const { canvasDisplayW, canvasDisplayH } = useMemo(() => {
    if (!canvasLogicalW || !canvasLogicalH) return { canvasDisplayW: 0, canvasDisplayH: 0 };
    const maxW = containerWidth;
    const maxH = typeof window !== "undefined" ? window.innerHeight * 0.55 : 500;
    const scale = Math.min(maxW / canvasLogicalW, maxH / canvasLogicalH, 1);
    return {
      canvasDisplayW: Math.round(canvasLogicalW * scale),
      canvasDisplayH: Math.round(canvasLogicalH * scale),
    };
  }, [canvasLogicalW, canvasLogicalH, containerWidth]);

  // Track container width via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(container);
    setContainerWidth(container.clientWidth);
    return () => observer.disconnect();
  }, []);

  const renderCanvas = useCallback(
    (editorState: EditorState, srcCanvas?: HTMLCanvasElement) => {
      const canvas = canvasRef.current;
      const src = srcCanvas || sourceCanvasRef.current;
      if (!canvas || !src) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rotated90 = editorState.rotation === 90 || editorState.rotation === 270;
      const srcW = src.width;
      const srcH = src.height;

      const canvasW = rotated90 ? srcH : srcW;
      const canvasH = rotated90 ? srcW : srcH;

      canvas.width = canvasW;
      canvas.height = canvasH;

      ctx.save();

      const brightness = editorState.brightness + 100;
      const contrast = editorState.contrast + 100;
      const saturation = editorState.saturation + 100;
      let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      const namedFilter = FILTERS.find((f) => f.name === editorState.filter);
      if (namedFilter?.value) {
        filterStr += ` ${namedFilter.value}`;
      }

      ctx.filter = filterStr;

      ctx.translate(canvasW / 2, canvasH / 2);
      ctx.rotate((editorState.rotation * Math.PI) / 180);
      ctx.scale(editorState.flipH ? -1 : 1, editorState.flipV ? -1 : 1);
      ctx.drawImage(src, -srcW / 2, -srcH / 2, srcW, srcH);

      ctx.restore();
    },
    [],
  );

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      originalImageRef.current = img;
      setImgWidth(img.naturalWidth);
      setImgHeight(img.naturalHeight);

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width = img.naturalWidth;
      srcCanvas.height = img.naturalHeight;
      const srcCtx = srcCanvas.getContext("2d")!;
      srcCtx.drawImage(img, 0, 0);
      sourceCanvasRef.current = srcCanvas;

      const initialState = { ...DEFAULT_STATE };
      const initialEntry: HistoryEntry = {
        state: initialState,
        sourceDataUrl: srcCanvas.toDataURL(),
      };
      setHistory([initialEntry]);
      setHistoryIndex(0);

      renderCanvas(initialState, srcCanvas);
    };
    img.src = filePath;
  }, [filePath, renderCanvas]);

  // Re-render on state change
  useEffect(() => {
    renderCanvas(state);
  }, [state, renderCanvas]);

  const pushHistory = useCallback(
    (newState: EditorState, srcCanvas?: HTMLCanvasElement) => {
      const src = srcCanvas || sourceCanvasRef.current;
      if (!src) return;

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const entry: HistoryEntry = {
          state: { ...newState },
          sourceDataUrl: src.toDataURL(),
        };
        return [...sliced, entry];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  const updateState = useCallback(
    (partial: Partial<EditorState>) => {
      setState((prev) => {
        const newState = { ...prev, ...partial };
        pushHistory(newState);
        return newState;
      });
    },
    [pushHistory],
  );

  const restoreHistoryEntry = useCallback(
    (entry: HistoryEntry) => {
      const img = new Image();
      img.onload = () => {
        const srcCanvas = document.createElement("canvas");
        srcCanvas.width = img.naturalWidth;
        srcCanvas.height = img.naturalHeight;
        const ctx = srcCanvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        sourceCanvasRef.current = srcCanvas;
        setImgWidth(srcCanvas.width);
        setImgHeight(srcCanvas.height);
        setState(entry.state);
        renderCanvas(entry.state, srcCanvas);
      };
      img.src = entry.sourceDataUrl;
    },
    [renderCanvas],
  );

  const undo = () => {
    if (historyIndex <= 0) return;
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    restoreHistoryEntry(history[prevIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    restoreHistoryEntry(history[nextIndex]);
  };

  const resetAll = () => {
    const img = originalImageRef.current;
    if (!img) return;

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = img.naturalWidth;
    srcCanvas.height = img.naturalHeight;
    const ctx = srcCanvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    sourceCanvasRef.current = srcCanvas;

    const resetState = { ...DEFAULT_STATE };
    setState(resetState);
    setImgWidth(img.naturalWidth);
    setImgHeight(img.naturalHeight);
    pushHistory(resetState, srcCanvas);
    renderCanvas(resetState, srcCanvas);
  };

  const rotateLeft = () => updateState({ rotation: (state.rotation + 270) % 360 });
  const rotateRight = () => updateState({ rotation: (state.rotation + 90) % 360 });
  const flipHorizontal = () => updateState({ flipH: !state.flipH });
  const flipVertical = () => updateState({ flipV: !state.flipV });

  // --- Crop ---
  const startCropMode = () => {
    setIsCropping(true);
    setCropStart(null);
    setCropEnd(null);
  };

  const cancelCrop = () => {
    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  };

  const canvasToLocal = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.max(0, Math.min(canvas.width, (clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(canvas.height, (clientY - rect.top) * scaleY)),
    };
  };

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!isCropping) return;
    const pt = canvasToLocal(e.clientX, e.clientY);
    setCropStart(pt);
    setCropEnd(pt);
    setIsDraggingCrop(true);
  };

  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrop || !isCropping) return;
    setCropEnd(canvasToLocal(e.clientX, e.clientY));
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const applyCrop = () => {
    if (!cropStart || !cropEnd) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = Math.round(Math.min(cropStart.x, cropEnd.x));
    const y = Math.round(Math.min(cropStart.y, cropEnd.y));
    const w = Math.round(Math.abs(cropEnd.x - cropStart.x));
    const h = Math.round(Math.abs(cropEnd.y - cropStart.y));

    if (w < 10 || h < 10) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(x, y, w, h);
    const newSrc = document.createElement("canvas");
    newSrc.width = w;
    newSrc.height = h;
    newSrc.getContext("2d")!.putImageData(imageData, 0, 0);

    sourceCanvasRef.current = newSrc;
    setImgWidth(w);
    setImgHeight(h);

    const newState: EditorState = { ...DEFAULT_STATE };
    setState(newState);
    pushHistory(newState, newSrc);
    renderCanvas(newState, newSrc);

    setIsCropping(false);
    setCropStart(null);
    setCropEnd(null);
  };

  // --- Save ---
  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ext = fileName.split(".").pop()?.toLowerCase();
    const isJpg = ext === "jpg" || ext === "jpeg";
    const mimeType = isJpg ? "image/jpeg" : "image/png";
    const fileExt = isJpg ? "jpg" : "png";

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited-${fileName.replace(/\.[^.]+$/, "")}.${fileExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      mimeType,
      0.95,
    );
  };

  const cropOverlay = (() => {
    if (!cropStart || !cropEnd || !canvasLogicalW || !canvasLogicalH || !canvasDisplayW || !canvasDisplayH) return null;
    const scaleX = canvasDisplayW / canvasLogicalW;
    const scaleY = canvasDisplayH / canvasLogicalH;

    return {
      left: Math.min(cropStart.x, cropEnd.x) * scaleX,
      top: Math.min(cropStart.y, cropEnd.y) * scaleY,
      width: Math.abs(cropEnd.x - cropStart.x) * scaleX,
      height: Math.abs(cropEnd.y - cropStart.y) * scaleY,
    };
  })();

  return (
    <div className="p-6">
      {/* File Info */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--muted)" }}>
        <span className="font-medium" style={{ color: "var(--foreground)" }}>
          {fileName}
        </span>
        {imgWidth > 0 && (
          <span className="rounded-lg px-2 py-0.5" style={{ backgroundColor: "var(--card-bg)" }}>
            {imgWidth} × {imgHeight}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Canvas Area */}
        <div>
          <div
            ref={containerRef}
            className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl border"
            style={{ borderColor: "var(--card-border)", backgroundColor: "#000" }}
            onMouseDown={handleCropMouseDown}
            onMouseMove={handleCropMouseMove}
            onMouseUp={handleCropMouseUp}
            onMouseLeave={handleCropMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="block"
              style={{
                width: canvasDisplayW || undefined,
                height: canvasDisplayH || undefined,
                cursor: isCropping ? "crosshair" : "default",
              }}
            />

            {isCropping && cropOverlay && cropOverlay.width > 3 && (
              <>
                {/* Dark overlay outside crop */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                />
                {/* Bright crop region */}
                <div
                  className="pointer-events-none absolute border-2"
                  style={{
                    left: cropOverlay.left,
                    top: cropOverlay.top,
                    width: cropOverlay.width,
                    height: cropOverlay.height,
                    borderColor: "var(--primary)",
                    boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                    backgroundColor: "transparent",
                  }}
                />
                {/* Crop dimensions */}
                {cropStart && cropEnd && (
                  <div
                    className="pointer-events-none absolute rounded px-2 py-0.5 text-[10px] font-mono font-semibold"
                    style={{
                      left: cropOverlay.left,
                      top: Math.max(0, cropOverlay.top - 22),
                      backgroundColor: "var(--primary)",
                      color: "var(--background)",
                    }}
                  >
                    {Math.round(Math.abs(cropEnd.x - cropStart.x))} × {Math.round(Math.abs(cropEnd.y - cropStart.y))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Crop actions */}
          {isCropping && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={applyCrop}
                className="rounded-xl px-5 py-2 text-sm font-semibold"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
              >
                Apply Crop
              </button>
              <button
                onClick={cancelCrop}
                className="rounded-xl border px-5 py-2 text-sm font-medium"
                style={{ borderColor: "var(--card-border)" }}
              >
                Cancel
              </button>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Drag on the image to select the area
              </span>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ToolButton onClick={rotateLeft} icon={<RotateCcw size={15} />} label="90° Left" />
            <ToolButton onClick={rotateRight} icon={<RotateCw size={15} />} label="90° Right" />

            <div className="mx-1 h-6 w-px" style={{ backgroundColor: "var(--card-border)" }} />

            <ToolButton onClick={flipHorizontal} icon={<FlipHorizontal size={15} />} label="Flip H" />
            <ToolButton onClick={flipVertical} icon={<FlipVertical size={15} />} label="Flip V" />

            <div className="mx-1 h-6 w-px" style={{ backgroundColor: "var(--card-border)" }} />

            <ToolButton
              onClick={startCropMode}
              icon={<Crop size={15} />}
              label="Crop"
              active={isCropping}
            />

            <div className="flex-1" />

            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="rounded-xl border p-2.5 text-sm disabled:opacity-30"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
              title="Undo"
            >
              <Undo2 size={15} />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="rounded-xl border p-2.5 text-sm disabled:opacity-30"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
              title="Redo"
            >
              <Redo2 size={15} />
            </button>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)", color: "#ef4444" }}
              title="Reset All"
            >
              <RefreshCw size={15} />
              Reset
            </button>
            <button
              onClick={saveImage}
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              <Download size={15} />
              Save
            </button>
          </div>
        </div>

        {/* Right Sidebar — Adjustments & Filters */}
        <div className="space-y-5">
          {/* Adjustments */}
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h3
              className="mb-5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Adjustments
            </h3>

            <SliderControl
              icon={<Sun size={14} />}
              label="Brightness"
              value={state.brightness}
              onChange={(v) => updateState({ brightness: v })}
            />
            <SliderControl
              icon={<Contrast size={14} />}
              label="Contrast"
              value={state.contrast}
              onChange={(v) => updateState({ contrast: v })}
            />
            <SliderControl
              icon={<Droplets size={14} />}
              label="Saturation"
              value={state.saturation}
              onChange={(v) => updateState({ saturation: v })}
            />
          </div>

          {/* Filters */}
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--muted)" }}
            >
              Filters
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => updateState({ filter: f.name })}
                  className="rounded-xl px-3 py-2.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: state.filter === f.name ? "var(--primary)" : "var(--background)",
                    color: state.filter === f.name ? "var(--background)" : "var(--foreground)",
                    border: "1px solid",
                    borderColor: state.filter === f.name ? "var(--primary)" : "var(--card-border)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ToolButton({
  onClick,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
        active ? "ring-2" : ""
      }`}
      style={{
        borderColor: active ? "var(--primary)" : "var(--card-border)",
        backgroundColor: "var(--card-bg)",
        outlineColor: active ? "var(--primary)" : undefined,
        outlineStyle: active ? "solid" : undefined,
        outlineWidth: active ? "2px" : undefined,
        outlineOffset: "2px",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SliderControl({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
          {icon} {label}
        </span>
        <span className="rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold" style={{ backgroundColor: "var(--background)" }}>
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        style={{
          background: `linear-gradient(to right, var(--muted) 0%, var(--primary) ${(value + 100) / 2}%, var(--muted) 100%)`,
          accentColor: "var(--primary)",
        }}
      />
    </div>
  );
}
