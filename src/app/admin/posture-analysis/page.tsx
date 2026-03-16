"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Upload,
  Camera,
  Loader2,
  Save,
  Download,
  RotateCcw,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
  User,
  ScanLine,
  Eye,
  EyeOff,
  MousePointer,
  Grid3X3,
  Move,
  ZoomIn,
  ZoomOut,
  Hand,
  Crosshair,
  Maximize2,
} from "lucide-react";
import {
  type Landmark,
  type PostureMeasurements,
  type MeasurementDetail,
  type Severity,
  type BodyZone,
  SKELETON_CONNECTIONS,
  MANUAL_LANDMARKS,
  LM,
  analyzePosture,
  severityColor,
  severityBgColor,
  severityLabel,
  scoreColor,
  scoreGrade,
  getSegmentSeverity,
  classifyAngle,
} from "@/lib/posture-utils";

/* ── Types ── */

interface ClientOption {
  id: string;
  name: string;
}

type ViewType = "front" | "side";
type ToolMode = "select" | "place" | "measure" | "pan";
type DetectionStatus = "idle" | "loading" | "ready" | "error" | "detecting";

/* ── MediaPipe type stubs ── */
interface PoseLandmarkerResult {
  landmarks: { x: number; y: number; z: number; visibility?: number }[][];
}
interface PoseLandmarkerInstance {
  detect(image: HTMLImageElement): PoseLandmarkerResult;
}

/* ── Default landmark template (normalized 0-1 for manual placement) ── */

function createEmptyLandmarks(): Landmark[] {
  const lm: Landmark[] = [];
  for (let i = 0; i < 33; i++) {
    lm.push({ x: -1, y: -1, z: 0, visibility: 0 });
  }
  return lm;
}

/* ── Main Component ── */

export default function PostureAnalysisPage() {
  // Image
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [viewType, setViewType] = useState<ViewType>("front");
  const [imageLoaded, setImageLoaded] = useState(false);

  // Detection
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>("idle");
  const [detectionMessage, setDetectionMessage] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null);
  const [measurements, setMeasurements] = useState<PostureMeasurements | null>(null);
  const [details, setDetails] = useState<MeasurementDetail[]>([]);
  const [bodyZones, setBodyZones] = useState<BodyZone[]>([]);
  const [clinicalSummary, setClinicalSummary] = useState<string>("");

  // Overlay controls
  const [showOverlay, setShowOverlay] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showGuideLines, setShowGuideLines] = useState(true);

  // Tool mode
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [manualPlaceIndex, setManualPlaceIndex] = useState(0);
  const [draggingLandmark, setDraggingLandmark] = useState<number | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<number | null>(null);

  // Canvas zoom/pan
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Client / save
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Tab for results panel
  const [resultsTab, setResultsTab] = useState<"measurements" | "zones" | "summary">("measurements");

  // Camera
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarkerInstance | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch clients
  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data.map((c: ClientOption) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, []);

  // Load MediaPipe with retry logic
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;
    const maxAttempts = 3;

    async function loadMediaPipe() {
      if (poseLandmarkerRef.current) {
        setDetectionStatus("ready");
        return;
      }

      setDetectionStatus("loading");
      setDetectionMessage("Loading AI pose detection model...");

      while (attempt < maxAttempts && !cancelled) {
        attempt++;
        try {
          setDetectionMessage(`Loading pose model (attempt ${attempt}/${maxAttempts})...`);

          const cdnUrl = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/vision_bundle.mjs";
          // eslint-disable-next-line no-new-func
          const vision: Record<string, any> = await Function(`return import("${cdnUrl}")`)();
          const { PoseLandmarker, FilesetResolver } = vision;

          const resolver = await (FilesetResolver as any).forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
          );

          const landmarker = await (PoseLandmarker as any).createFromOptions(resolver, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/latest/pose_landmarker_heavy.task",
              delegate: "GPU",
            },
            runningMode: "IMAGE",
            numPoses: 1,
          });

          if (!cancelled) {
            poseLandmarkerRef.current = landmarker;
            setDetectionStatus("ready");
            setDetectionMessage("AI model loaded successfully");
          }
          return;
        } catch (err) {
          console.error(`MediaPipe load attempt ${attempt} failed:`, err);
          if (attempt >= maxAttempts && !cancelled) {
            setDetectionStatus("error");
            setDetectionMessage(
              "Auto-detection unavailable. You can still use Manual Mode to place landmarks by hand."
            );
          } else {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
    }

    loadMediaPipe();
    return () => { cancelled = true; };
  }, []);

  // ── Canvas drawing ──

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const containerWidth = containerRef.current?.clientWidth || img.naturalWidth;
    const scale = containerWidth / img.naturalWidth;

    canvas.width = img.naturalWidth * scale * zoom;
    canvas.height = img.naturalHeight * scale * zoom;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale * zoom, scale * zoom);
    ctx.drawImage(img, 0, 0);

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // Grid overlay
    if (showGrid) {
      ctx.setLineDash([]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
      const gridSize = Math.min(w, h) / 12;
      for (let x = gridSize; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = gridSize; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center line (thicker)
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(234, 179, 8, 0.4)";
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();
    }

    if (!landmarks || !showOverlay) {
      ctx.restore();
      // Show manual placement target if in place mode
      if (toolMode === "place") {
        drawPlacementHint(ctx, w * scale * zoom, h * scale * zoom);
      }
      return;
    }

    // Guide lines
    if (showGuideLines) {
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";

      if (landmarks[LM.NOSE].visibility !== undefined && landmarks[LM.NOSE].visibility! > 0.1) {
        const noseX = landmarks[LM.NOSE].x * w;
        ctx.beginPath();
        ctx.moveTo(noseX, 0);
        ctx.lineTo(noseX, h);
        ctx.stroke();
      }

      if (landmarks[LM.LEFT_SHOULDER].visibility! > 0.1 && landmarks[LM.RIGHT_SHOULDER].visibility! > 0.1) {
        const shoulderY = ((landmarks[LM.LEFT_SHOULDER].y + landmarks[LM.RIGHT_SHOULDER].y) / 2) * h;
        ctx.beginPath();
        ctx.moveTo(0, shoulderY);
        ctx.lineTo(w, shoulderY);
        ctx.stroke();

        const hipY = ((landmarks[LM.LEFT_HIP].y + landmarks[LM.RIGHT_HIP].y) / 2) * h;
        ctx.beginPath();
        ctx.moveTo(0, hipY);
        ctx.lineTo(w, hipY);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Skeleton connections
    ctx.lineWidth = Math.max(3, w * 0.004);
    for (const [startIdx, endIdx] of SKELETON_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (!start || !end) continue;
      if ((start.visibility ?? 0) < 0.1 || (end.visibility ?? 0) < 0.1) continue;
      if (start.x < 0 || end.x < 0) continue;

      const severity = measurements ? getSegmentSeverity(startIdx, endIdx, measurements) : "good";
      ctx.strokeStyle = severityColor(severity);
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.moveTo(start.x * w, start.y * h);
      ctx.lineTo(end.x * w, end.y * h);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Joint circles
    const jointRadius = Math.max(5, w * 0.006);
    const majorJoints = MANUAL_LANDMARKS.map(l => l.idx);

    for (const lmDef of MANUAL_LANDMARKS) {
      const idx = lmDef.idx;
      const lm = landmarks[idx];
      if (!lm || lm.x < 0 || (lm.visibility ?? 0) < 0.1) continue;

      const isHovered = hoveredLandmark === idx;
      const isDragging = draggingLandmark === idx;
      const r = (isHovered || isDragging) ? jointRadius * 1.6 : jointRadius;

      // Glow effect for draggable landmarks in select/place mode
      if ((toolMode === "select" || toolMode === "place") && isHovered) {
        ctx.beginPath();
        ctx.arc(lm.x * w, lm.y * h, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(234, 179, 8, 0.25)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(lm.x * w, lm.y * h, r, 0, Math.PI * 2);
      ctx.fillStyle = isDragging ? "rgba(234, 179, 8, 0.9)" : "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.lineWidth = isDragging ? 3 : 2;

      const jSev = measurements ? getJointSeverity(idx, measurements) : "good";
      ctx.strokeStyle = isDragging ? "#eab308" : severityColor(jSev);
      ctx.stroke();

      // Labels
      if (showLabels) {
        const fontSize = Math.max(9, w * 0.01);
        ctx.font = `600 ${fontSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,0.7)";

        const textX = lm.x * w;
        const textY = lm.y * h - r - 4;
        const text = lmDef.shortLabel;
        const tm = ctx.measureText(text);
        const pad = 3;

        ctx.beginPath();
        ctx.roundRect(textX - tm.width / 2 - pad, textY - fontSize - pad, tm.width + pad * 2, fontSize + pad * 2, 3);
        ctx.fill();

        ctx.fillStyle = "#fff";
        ctx.fillText(text, textX, textY);
      }
    }

    // Angle annotations
    if (measurements) {
      const annoFont = Math.max(11, w * 0.014);
      ctx.font = `bold ${annoFont}px sans-serif`;
      ctx.textAlign = "left";

      if ((landmarks[LM.NOSE].visibility ?? 0) > 0.3) {
        drawAngleLabel(ctx, landmarks[LM.NOSE].x * w + jointRadius + 6, landmarks[LM.NOSE].y * h - 10,
          `${measurements.headTiltAngle.toFixed(1)}°`,
          severityColor(classifyAngle(measurements.headTiltAngle, 3, 7)));
      }

      if ((landmarks[LM.LEFT_KNEE].visibility ?? 0) > 0.3) {
        drawAngleLabel(ctx, landmarks[LM.LEFT_KNEE].x * w + jointRadius + 6, landmarks[LM.LEFT_KNEE].y * h,
          `${measurements.leftKneeAngle.toFixed(1)}°`,
          severityColor(classifyAngle(Math.abs(180 - measurements.leftKneeAngle), 5, 12)));
      }

      if ((landmarks[LM.RIGHT_KNEE].visibility ?? 0) > 0.3) {
        drawAngleLabel(ctx, landmarks[LM.RIGHT_KNEE].x * w - 70, landmarks[LM.RIGHT_KNEE].y * h,
          `${measurements.rightKneeAngle.toFixed(1)}°`,
          severityColor(classifyAngle(Math.abs(180 - measurements.rightKneeAngle), 5, 12)));
      }
    }

    ctx.restore();
  }, [landmarks, measurements, imageLoaded, showOverlay, showGuideLines, showGrid, showLabels, toolMode, hoveredLandmark, draggingLandmark, zoom, panOffset]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);

  // ── Canvas mouse interaction ──

  function canvasToImageCoords(e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return null;

    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;

    const containerWidth = containerRef.current?.clientWidth || img.naturalWidth;
    const scale = containerWidth / img.naturalWidth;

    const imgX = (canvasX - panOffset.x) / (scale * zoom) / img.naturalWidth;
    const imgY = (canvasY - panOffset.y) / (scale * zoom) / img.naturalHeight;

    return { x: Math.max(0, Math.min(1, imgX)), y: Math.max(0, Math.min(1, imgY)) };
  }

  function findNearestLandmark(imgCoords: { x: number; y: number }): number | null {
    if (!landmarks) return null;
    let nearest = -1;
    let minDist = Infinity;

    for (const lmDef of MANUAL_LANDMARKS) {
      const lm = landmarks[lmDef.idx];
      if (!lm || lm.x < 0) continue;
      const d = Math.sqrt((lm.x - imgCoords.x) ** 2 + (lm.y - imgCoords.y) ** 2);
      if (d < minDist) { minDist = d; nearest = lmDef.idx; }
    }

    return minDist < 0.03 ? nearest : null;
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const coords = canvasToImageCoords(e);
    if (!coords) return;

    if (toolMode === "pan") {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
      return;
    }

    if (toolMode === "place") {
      const lms = landmarks ? [...landmarks] : createEmptyLandmarks();
      const target = MANUAL_LANDMARKS[manualPlaceIndex];
      if (target) {
        lms[target.idx] = { x: coords.x, y: coords.y, z: 0, visibility: 1 };
        setLandmarks(lms);
        if (manualPlaceIndex < MANUAL_LANDMARKS.length - 1) {
          setManualPlaceIndex(manualPlaceIndex + 1);
        }
      }
      return;
    }

    if (toolMode === "select") {
      const nearest = findNearestLandmark(coords);
      if (nearest !== null) {
        setDraggingLandmark(nearest);
      }
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (isPanning && toolMode === "pan") {
      setPanOffset({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
      return;
    }

    const coords = canvasToImageCoords(e);
    if (!coords) return;

    if (draggingLandmark !== null && landmarks) {
      const lms = [...landmarks];
      lms[draggingLandmark] = { ...lms[draggingLandmark], x: coords.x, y: coords.y, visibility: 1 };
      setLandmarks(lms);
      return;
    }

    if (toolMode === "select") {
      const nearest = findNearestLandmark(coords);
      setHoveredLandmark(nearest);
    }
  }

  function handleCanvasMouseUp() {
    if (draggingLandmark !== null) {
      setDraggingLandmark(null);
      recalculateFromLandmarks();
    }
    setIsPanning(false);
  }

  function recalculateFromLandmarks() {
    if (!landmarks || !imgRef.current) return;
    const hasEnoughLandmarks = MANUAL_LANDMARKS.filter(l => {
      const lm = landmarks[l.idx];
      return lm && lm.x >= 0 && (lm.visibility ?? 0) > 0;
    }).length >= 10;

    if (hasEnoughLandmarks) {
      const { measurements: m, details: d, bodyZones: bz, clinicalSummary: cs } = analyzePosture(
        landmarks, imgRef.current.naturalWidth, imgRef.current.naturalHeight, viewType
      );
      setMeasurements(m);
      setDetails(d);
      setBodyZones(bz);
      setClinicalSummary(cs);
    }
  }

  // ── File upload ──

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    resetResults();
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCameraActive(false);
    stopCamera();
  }

  // ── Camera ──

  async function startCamera() {
    resetResults();
    setImageSrc(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Camera access denied.");
      setCameraActive(false);
    }
  }

  function capturePhoto() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      setImageSrc(URL.createObjectURL(blob));
      stopCamera();
      setCameraActive(false);
    }, "image/jpeg", 0.92);
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function resetResults() {
    setLandmarks(null);
    setMeasurements(null);
    setDetails([]);
    setBodyZones([]);
    setClinicalSummary("");
    setSaved(false);
    setError(null);
    setManualPlaceIndex(0);
  }

  function resetAll() {
    resetResults();
    setImageSrc(null);
    setImageLoaded(false);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setToolMode("select");
    stopCamera();
    setCameraActive(false);
  }

  // ── Auto detection ──

  async function runAutoDetection() {
    if (!poseLandmarkerRef.current || !imgRef.current) {
      setError("AI model not loaded. Use Manual Mode instead.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setSaved(false);
    try {
      const result: PoseLandmarkerResult = poseLandmarkerRef.current.detect(imgRef.current);
      if (!result.landmarks || result.landmarks.length === 0) {
        setError("No person detected. Try a clearer full-body photo, or use Manual Mode to place landmarks yourself.");
        setAnalyzing(false);
        return;
      }
      const lm = result.landmarks[0] as Landmark[];
      setLandmarks(lm);
      setToolMode("select");

      const { measurements: m, details: d, bodyZones: bz, clinicalSummary: cs } = analyzePosture(
        lm, imgRef.current.naturalWidth, imgRef.current.naturalHeight, viewType
      );
      setMeasurements(m);
      setDetails(d);
      setBodyZones(bz);
      setClinicalSummary(cs);
    } catch (err) {
      console.error("Detection error:", err);
      setError("Auto-detection failed. Switch to Manual Mode to place landmarks by hand.");
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Manual mode ──

  function startManualMode() {
    setToolMode("place");
    setManualPlaceIndex(0);
    if (!landmarks) setLandmarks(createEmptyLandmarks());
    setError(null);
  }

  function finishManualPlacement() {
    setToolMode("select");
    recalculateFromLandmarks();
  }

  // ── Save ──

  async function saveAnalysis() {
    if (!measurements || !landmarks || !selectedClient) return;
    setSaving(true);
    try {
      const client = clients.find((c) => c.id === selectedClient);
      const analysis = {
        id: crypto.randomUUID(),
        clientId: selectedClient,
        clientName: client?.name || "Unknown",
        date: new Date().toISOString(),
        viewType,
        measurements,
        details,
        landmarks,
        imageWidth: imgRef.current?.naturalWidth || 0,
        imageHeight: imgRef.current?.naturalHeight || 0,
        notes,
        clinicalSummary,
      };
      const res = await fetch("/api/posture-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(analysis),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 4000); }
      else setError("Failed to save analysis.");
    } catch { setError("Network error while saving."); }
    finally { setSaving(false); }
  }

  // ── Report ──

  function generateReport() {
    if (!measurements || !details) return;
    const client = clients.find((c) => c.id === selectedClient);
    const reportWindow = window.open("", "_blank");
    if (!reportWindow) return;

    const detailRows = details.map((d) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-weight:500;">${d.label}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <span style="font-weight:700;font-size:1.1em;">${d.value.toFixed(1)}${d.unit}</span>
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;text-align:center;">
          <span style="display:inline-block;padding:3px 12px;border-radius:100px;font-size:0.8em;font-weight:600;
            background:${d.severity === "good" ? "#dcfce7" : d.severity === "mild" ? "#fef9c3" : "#fee2e2"};
            color:${d.severity === "good" ? "#166534" : d.severity === "mild" ? "#854d0e" : "#991b1b"};"
          >${severityLabel(d.severity)}</span>
        </td>
        <td style="padding:10px 14px;border-bottom:1px solid #e5e7eb;font-size:0.9em;color:#555;">${d.description}</td>
      </tr>`).join("");

    const sColor = scoreColor(measurements.overallSymmetryScore);
    const summaryHtml = clinicalSummary.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>");

    reportWindow.document.write(`<!DOCTYPE html>
<html><head><title>Posture Analysis Report</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Segoe UI',system-ui,sans-serif; color:#1a1a1a; background:#fff; padding:40px; max-width:900px; margin:0 auto; }
  h1 { font-size:1.8em; margin-bottom:4px; }
  .meta { color:#666; font-size:0.9em; margin-bottom:30px; }
  .score-card { display:flex; align-items:center; gap:24px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; padding:24px; margin-bottom:30px; }
  .score-circle { width:100px; height:100px; border-radius:50%; border:6px solid ${sColor}; display:flex; align-items:center; justify-content:center; flex-direction:column; flex-shrink:0; }
  .score-num { font-size:2em; font-weight:800; color:${sColor}; line-height:1; }
  .score-label { font-size:0.7em; color:#888; margin-top:2px; }
  .grade { font-size:1.3em; font-weight:700; color:${sColor}; }
  table { width:100%; border-collapse:collapse; margin-top:20px; }
  th { text-align:left; padding:10px 14px; background:#f1f5f9; font-weight:600; font-size:0.85em; text-transform:uppercase; letter-spacing:0.05em; color:#475569; }
  .summary { margin-top:30px; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; line-height:1.7; font-size:0.9em; }
  .footer { margin-top:40px; padding-top:20px; border-top:1px solid #e5e7eb; color:#999; font-size:0.8em; text-align:center; }
  @media print { body { padding:20px; } }
</style></head>
<body>
  <h1>Posture Analysis Report</h1>
  <p class="meta">
    Client: <strong>${client?.name || "—"}</strong> &nbsp;|&nbsp;
    Date: <strong>${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong> &nbsp;|&nbsp;
    View: <strong>${viewType === "front" ? "Front View" : "Side View"}</strong>
  </p>
  <div class="score-card">
    <div class="score-circle"><div class="score-num">${measurements.overallSymmetryScore}</div><div class="score-label">/ 100</div></div>
    <div><div class="grade">${scoreGrade(measurements.overallSymmetryScore)}</div><p style="color:#666;font-size:0.9em;margin-top:4px;">Overall alignment and symmetry score</p></div>
  </div>
  <table><thead><tr><th>Measurement</th><th style="text-align:center;">Value</th><th style="text-align:center;">Status</th><th>Clinical Note</th></tr></thead><tbody>${detailRows}</tbody></table>
  <div class="summary"><h3 style="margin-bottom:12px;">Clinical Summary</h3>${summaryHtml}</div>
  ${notes ? `<div style="margin-top:20px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;"><strong>Coach Notes:</strong><p style="margin-top:8px;color:#555;">${notes}</p></div>` : ""}
  <div class="footer">Koch Functional Patterns &nbsp;•&nbsp; ${new Date().toISOString().split("T")[0]}</div>
</body></html>`);
    reportWindow.document.close();
    reportWindow.print();
  }

  // Helper severity for individual joints
  function getJointSeverity(idx: number, m: PostureMeasurements): Severity {
    if ([0,1,2,3,4,5,6,7,8,9,10].includes(idx)) return classifyAngle(m.headTiltAngle, 3, 7);
    if ([11,12].includes(idx)) return classifyAngle(m.shoulderLevelDiff, 10, 25);
    if ([23,24].includes(idx)) return classifyAngle(m.hipLevelDiff, 8, 20);
    if ([25].includes(idx)) return classifyAngle(Math.abs(180 - m.leftKneeAngle), 5, 12);
    if ([26].includes(idx)) return classifyAngle(Math.abs(180 - m.rightKneeAngle), 5, 12);
    return "good";
  }

  const manualTarget = toolMode === "place" ? MANUAL_LANDMARKS[manualPlaceIndex] : null;
  const placedCount = landmarks ? MANUAL_LANDMARKS.filter(l => landmarks[l.idx] && landmarks[l.idx].x >= 0).length : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b px-6 py-5" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--primary)" + "15" }}>
                <ScanLine size={20} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Posture Analysis</h1>
                <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                  AI-powered detection + manual landmark editing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {measurements && (
                <a href="/admin/posture-analysis/compare"
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                  style={{ border: "1px solid var(--card-border)", color: "var(--foreground)" }}>
                  Compare <ChevronRight size={14} />
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Status bar */}
          {detectionStatus === "loading" && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border p-4"
              style={{ backgroundColor: "var(--primary)" + "08", borderColor: "var(--primary)" + "30" }}>
              <Loader2 size={18} className="animate-spin" style={{ color: "var(--primary)" }} />
              <span className="text-sm" style={{ color: "var(--primary)" }}>{detectionMessage}</span>
            </div>
          )}

          {detectionStatus === "error" && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <AlertTriangle size={18} className="text-amber-400" />
              <span className="text-sm text-amber-400">{detectionMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <AlertTriangle size={18} className="text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {saved && (
            <div className="mb-4 flex items-center gap-3 rounded-xl border p-4"
              style={{ backgroundColor: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.2)" }}>
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-sm text-green-500">Analysis saved successfully!</span>
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-3">
            {/* ═══ Left: Image + Canvas ═══ */}
            <div className="xl:col-span-2">
              {/* Upload area */}
              {!imageSrc && !cameraActive && (
                <div className="rounded-2xl border-2 border-dashed p-12 text-center" style={{ borderColor: "var(--card-border)" }}>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "var(--primary)" + "12" }}>
                    <ScanLine size={36} style={{ color: "var(--primary)" }} />
                  </div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Upload or Capture Photo</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: "var(--muted)" }}>
                    Take or upload a full-body photo. The AI will auto-detect landmarks, or you can place them manually.
                  </p>
                  <div className="mt-8 flex items-center justify-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "var(--background)" }}>
                      <Upload size={18} /> Upload Photo
                    </button>
                    <button onClick={startCamera}
                      className="flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold"
                      style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                      <Camera size={18} /> Take Photo
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="mx-auto mt-6 max-w-lg">
                    <div className="flex items-start gap-2 text-left">
                      <Info size={16} className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }} />
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        For best results, ensure the full body is visible and the person stands naturally against a plain background.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Camera */}
              {cameraActive && (
                <div className="overflow-hidden rounded-2xl border" style={{ borderColor: "var(--card-border)" }}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full"
                    style={{ maxHeight: "70vh", objectFit: "contain", backgroundColor: "#000" }} />
                  <div className="flex items-center justify-center gap-4 border-t p-4"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                    <button onClick={capturePhoto}
                      className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "var(--background)" }}>
                      <Camera size={18} /> Capture
                    </button>
                    <button onClick={() => { stopCamera(); setCameraActive(false); }}
                      className="rounded-xl border px-6 py-3 text-sm font-semibold"
                      style={{ borderColor: "var(--card-border)" }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Canvas with tools */}
              {imageSrc && !cameraActive && (
                <div>
                  {/* Toolbar */}
                  <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border p-2"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>

                    {/* Detection buttons */}
                    <button onClick={runAutoDetection}
                      disabled={detectionStatus !== "ready" || analyzing}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all disabled:opacity-30"
                      style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "var(--background)" }}>
                      {analyzing ? <Loader2 size={14} className="animate-spin" /> : <ScanLine size={14} />}
                      {analyzing ? "Detecting..." : "Auto Detect"}
                    </button>

                    <button onClick={toolMode === "place" ? finishManualPlacement : startManualMode}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors"
                      style={{
                        borderColor: toolMode === "place" ? "var(--primary)" : "var(--card-border)",
                        backgroundColor: toolMode === "place" ? "var(--primary)" + "15" : "transparent",
                        color: toolMode === "place" ? "var(--primary)" : "var(--foreground)",
                      }}>
                      <Crosshair size={14} />
                      {toolMode === "place" ? `Finish (${placedCount}/${MANUAL_LANDMARKS.length})` : "Manual Mode"}
                    </button>

                    <div className="mx-1 h-6 w-px" style={{ backgroundColor: "var(--card-border)" }} />

                    {/* Tool modes */}
                    {([
                      { mode: "select" as ToolMode, icon: <MousePointer size={14} />, label: "Select" },
                      { mode: "pan" as ToolMode, icon: <Hand size={14} />, label: "Pan" },
                    ]).map(({ mode, icon, label }) => (
                      <button key={mode} onClick={() => setToolMode(mode)}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: toolMode === mode ? "var(--primary)" + "15" : "transparent",
                          color: toolMode === mode ? "var(--primary)" : "var(--muted)",
                        }}>
                        {icon} {label}
                      </button>
                    ))}

                    <div className="mx-1 h-6 w-px" style={{ backgroundColor: "var(--card-border)" }} />

                    {/* View toggles */}
                    <button onClick={() => setShowOverlay(!showOverlay)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                      style={{ color: showOverlay ? "var(--primary)" : "var(--muted)" }}>
                      {showOverlay ? <Eye size={14} /> : <EyeOff size={14} />} Skeleton
                    </button>
                    <button onClick={() => setShowGrid(!showGrid)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                      style={{ color: showGrid ? "var(--primary)" : "var(--muted)" }}>
                      <Grid3X3 size={14} /> Grid
                    </button>
                    <button onClick={() => setShowLabels(!showLabels)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
                      style={{ color: showLabels ? "var(--primary)" : "var(--muted)" }}>
                      <Info size={14} /> Labels
                    </button>

                    <div className="mx-1 h-6 w-px" style={{ backgroundColor: "var(--card-border)" }} />

                    {/* Zoom */}
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="rounded-lg p-2 text-xs" style={{ color: "var(--muted)" }}>
                      <ZoomOut size={14} />
                    </button>
                    <span className="min-w-[3ch] text-center text-xs font-medium" style={{ color: "var(--muted)" }}>{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="rounded-lg p-2 text-xs" style={{ color: "var(--muted)" }}>
                      <ZoomIn size={14} />
                    </button>
                    <button onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
                      className="rounded-lg p-1.5 text-xs" style={{ color: "var(--muted)" }} title="Reset view">
                      <Maximize2 size={14} />
                    </button>

                    {/* View type + Reset */}
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--card-border)" }}>
                        {(["front", "side"] as ViewType[]).map((v) => (
                          <button key={v} onClick={() => setViewType(v)}
                            className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors"
                            style={{
                              backgroundColor: viewType === v ? "var(--primary)" : "var(--card-bg)",
                              color: viewType === v ? "var(--background)" : "var(--muted)",
                            }}>{v}</button>
                        ))}
                      </div>
                      <button onClick={resetAll}
                        className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium"
                        style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}>
                        <RotateCcw size={12} /> Reset
                      </button>
                    </div>
                  </div>

                  {/* Manual mode status bar */}
                  {toolMode === "place" && (
                    <div className="mb-3 flex items-center gap-3 rounded-xl border p-3"
                      style={{ backgroundColor: "rgba(234,179,8,0.06)", borderColor: "rgba(234,179,8,0.2)" }}>
                      <Crosshair size={16} className="text-amber-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-400">
                          Manual Mode — Click to place: <strong>{manualTarget?.label || "Done"}</strong>
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                          Click on the image to place each landmark. {placedCount}/{MANUAL_LANDMARKS.length} placed.
                          You can skip landmarks or finish early.
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {manualPlaceIndex > 0 && (
                          <button onClick={() => setManualPlaceIndex(manualPlaceIndex - 1)}
                            className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: "var(--card-border)" }}>
                            Back
                          </button>
                        )}
                        {manualPlaceIndex < MANUAL_LANDMARKS.length - 1 && (
                          <button onClick={() => setManualPlaceIndex(manualPlaceIndex + 1)}
                            className="rounded-lg border px-2 py-1 text-xs" style={{ borderColor: "var(--card-border)" }}>
                            Skip
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Canvas container */}
                  <div ref={containerRef}
                    className="relative overflow-hidden rounded-2xl border"
                    style={{ borderColor: "var(--card-border)", cursor: toolMode === "pan" ? "grab" : toolMode === "place" ? "crosshair" : "default" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img ref={imgRef} src={imageSrc} alt="Posture" crossOrigin="anonymous" className="hidden"
                      onLoad={() => { setImageLoaded(true); drawCanvas(); }} />
                    <canvas ref={canvasRef} className="w-full"
                      style={{ maxHeight: "75vh", objectFit: "contain" }}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp} />

                    {/* Floating score badge */}
                    {measurements && (
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl px-4 py-2 backdrop-blur-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.65)" }}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                          style={{ border: `3px solid ${scoreColor(measurements.overallSymmetryScore)}`, color: scoreColor(measurements.overallSymmetryScore) }}>
                          {measurements.overallSymmetryScore}
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: scoreColor(measurements.overallSymmetryScore) }}>
                            {scoreGrade(measurements.overallSymmetryScore)}
                          </div>
                          <div className="text-[10px] text-gray-400">Posture Score</div>
                        </div>
                      </div>
                    )}

                    {/* Drag hint */}
                    {toolMode === "select" && landmarks && !draggingLandmark && (
                      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-[10px] text-gray-300 backdrop-blur-sm">
                        <Move size={10} className="mr-1 inline" /> Drag landmarks to adjust positions
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ═══ Right: Results Panel ═══ */}
            <div className="space-y-4">
              {/* Score card */}
              {measurements && (
                <div className="rounded-2xl border p-6" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl"
                      style={{ border: `4px solid ${scoreColor(measurements.overallSymmetryScore)}` }}>
                      <div className="text-center">
                        <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)", color: scoreColor(measurements.overallSymmetryScore) }}>
                          {measurements.overallSymmetryScore}
                        </div>
                        <div className="text-[10px]" style={{ color: "var(--muted)" }}>/100</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)", color: scoreColor(measurements.overallSymmetryScore) }}>
                        {scoreGrade(measurements.overallSymmetryScore)}
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--muted)" }}>
                        Based on {details.length} measurements
                      </p>
                      <div className="mt-2 flex gap-1.5">
                        {(["good", "mild", "significant"] as Severity[]).map(s => {
                          const count = details.filter(d => d.severity === s).length;
                          return count > 0 && (
                            <span key={s} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: severityBgColor(s), color: severityColor(s) }}>
                              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: severityColor(s) }} />
                              {count}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Results tabs */}
              {measurements && (
                <div className="rounded-2xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="flex border-b" style={{ borderColor: "var(--card-border)" }}>
                    {([
                      { key: "measurements" as const, label: "Measurements" },
                      { key: "zones" as const, label: "Body Zones" },
                      { key: "summary" as const, label: "Summary" },
                    ]).map(({ key, label }) => (
                      <button key={key} onClick={() => setResultsTab(key)}
                        className="flex-1 border-b-2 px-3 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
                        style={{
                          borderColor: resultsTab === key ? "var(--primary)" : "transparent",
                          color: resultsTab === key ? "var(--primary)" : "var(--muted)",
                        }}>{label}</button>
                    ))}
                  </div>

                  {/* Measurements tab */}
                  {resultsTab === "measurements" && (
                    <div className="divide-y max-h-[50vh] overflow-y-auto" style={{ borderColor: "var(--card-border)" }}>
                      {details.map((d, i) => (
                        <div key={i} className="px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: severityColor(d.severity) }} />
                              <span className="text-sm font-medium">{d.label}</span>
                            </div>
                            <span className="text-sm font-bold tabular-nums" style={{ color: severityColor(d.severity) }}>
                              {d.value.toFixed(1)}{d.unit}
                            </span>
                          </div>
                          <p className="mt-1 pl-4 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{d.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Body zones tab */}
                  {resultsTab === "zones" && (
                    <div className="space-y-3 p-4">
                      {bodyZones.map((zone) => (
                        <div key={zone.id} className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: severityColor(zone.severity) }} />
                              <span className="text-sm font-bold">{zone.label}</span>
                            </div>
                            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                              style={{ backgroundColor: severityBgColor(zone.severity), color: severityColor(zone.severity) }}>
                              {severityLabel(zone.severity)}
                            </span>
                          </div>
                          {zone.issues.length > 0 && (
                            <ul className="mt-2 space-y-1 pl-5">
                              {zone.issues.map((issue, i) => (
                                <li key={i} className="text-xs" style={{ color: "var(--muted)" }}>• {issue}</li>
                              ))}
                            </ul>
                          )}
                          {zone.issues.length === 0 && (
                            <p className="mt-1 pl-5 text-xs" style={{ color: "var(--muted)" }}>No issues detected.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary tab */}
                  {resultsTab === "summary" && (
                    <div className="max-h-[50vh] overflow-y-auto p-4">
                      <div className="prose prose-sm text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>
                        {clinicalSummary.split("\n").map((line, i) => {
                          if (line.startsWith("**") && line.endsWith("**")) {
                            return <p key={i} className="mt-3 text-sm font-bold" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*/g, "") }} />;
                          }
                          if (line.startsWith("**")) {
                            return <p key={i} className="mt-2 font-semibold" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*/g, "<strong>").replace(/\*\*/g, "</strong>") }} />;
                          }
                          if (line.startsWith("- ")) {
                            const content = line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                            return <p key={i} className="ml-3 mt-0.5" dangerouslySetInnerHTML={{ __html: "• " + content }} />;
                          }
                          if (line.trim() === "") return <br key={i} />;
                          return <p key={i} className="mt-1" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Legend */}
              {measurements && (
                <div className="rounded-2xl border p-4" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-outfit)" }}>Legend</h3>
                  </div>
                  <div className="mt-2 flex gap-4">
                    {([["#22c55e", "Normal"], ["#eab308", "Mild"], ["#ef4444", "Significant"]] as const).map(([color, label]) => (
                      <div key={color} className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[11px]" style={{ color: "var(--muted)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save / Report */}
              {measurements && (
                <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "var(--font-outfit)" }}>
                    Save Analysis
                  </h3>
                  <div className="space-y-3">
                    <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                      <option value="">Select client…</option>
                      {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                      placeholder="Notes…"
                      className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)", color: "var(--foreground)" }} />
                    <div className="flex gap-2">
                      <button onClick={saveAnalysis} disabled={!selectedClient || saving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "var(--background)" }}>
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={generateReport}
                        className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
                        style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>
                        <Download size={16} /> Report
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!measurements && !analyzing && (
                <div className="flex flex-col items-center rounded-2xl border p-8 text-center"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: "var(--primary)" + "12" }}>
                    <User size={24} style={{ color: "var(--primary)" }} />
                  </div>
                  <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-outfit)" }}>No Analysis Yet</h3>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                    Upload a photo, then use <strong>Auto Detect</strong> or <strong>Manual Mode</strong> to analyze posture.
                  </p>
                  <div className="mt-4 space-y-2 text-left">
                    <div className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                      <ScanLine size={14} className="mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
                      <span><strong>Auto Detect</strong> — AI finds landmarks automatically</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                      <Crosshair size={14} className="mt-0.5 shrink-0" style={{ color: "#eab308" }} />
                      <span><strong>Manual Mode</strong> — Click to place each landmark by hand</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs" style={{ color: "var(--muted)" }}>
                      <Move size={14} className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }} />
                      <span><strong>Drag to Adjust</strong> — Fine-tune any landmark position</span>
                    </div>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="flex flex-col items-center rounded-2xl border p-8 text-center"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                  <Loader2 size={32} className="mb-4 animate-spin" style={{ color: "var(--primary)" }} />
                  <h3 className="text-sm font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Analyzing Posture…</h3>
                  <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>Detecting body landmarks and calculating alignment metrics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Canvas helpers ── */

function drawAngleLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color: string) {
  const padding = 4;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  const textHeight = parseInt(ctx.font, 10) || 14;

  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.beginPath();
  ctx.roundRect(x - padding, y - textHeight - padding, textWidth + padding * 2, textHeight + padding * 2, 4);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawPlacementHint(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = "rgba(234, 179, 8, 0.08)";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(234, 179, 8, 0.3)";
  ctx.setLineDash([6, 6]);
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, h / 3);
  ctx.lineTo(w, h / 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, h * 2 / 3);
  ctx.lineTo(w, h * 2 / 3);
  ctx.stroke();

  ctx.restore();
}
