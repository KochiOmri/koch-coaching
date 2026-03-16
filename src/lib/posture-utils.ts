/**
 * Posture Analysis Utilities
 *
 * MediaPipe Pose Landmark indices (33 landmarks):
 * 0: nose, 1: left eye inner, 2: left eye, 3: left eye outer,
 * 4: right eye inner, 5: right eye, 6: right eye outer,
 * 7: left ear, 8: right ear, 9: mouth left, 10: mouth right,
 * 11: left shoulder, 12: right shoulder, 13: left elbow, 14: right elbow,
 * 15: left wrist, 16: right wrist, 17: left pinky, 18: right pinky,
 * 19: left index, 20: right index, 21: left thumb, 22: right thumb,
 * 23: left hip, 24: right hip, 25: left knee, 26: right knee,
 * 27: left ankle, 28: right ankle, 29: left heel, 30: right heel,
 * 31: left foot index, 32: right foot index
 */

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PostureMeasurements {
  headTiltAngle: number;
  shoulderLevelDiff: number;
  hipLevelDiff: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  leftAnkleAlignment: number;
  rightAnkleAlignment: number;
  anteriorPelvicTilt: number;
  overallSymmetryScore: number;
  forwardHeadAngle: number | null;
  thoracicKyphosisAngle: number | null;
  lumbarLordosisAngle: number | null;
  trunkLateralLean: number;
  shoulderProtraction: number | null;
  qAngleLeft: number;
  qAngleRight: number;
}

export interface MeasurementDetail {
  label: string;
  value: number;
  unit: string;
  severity: Severity;
  description: string;
  category: "head" | "shoulder" | "spine" | "pelvis" | "knee" | "ankle";
}

export interface AnalysisResult {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  viewType: "front" | "side" | "both";
  measurements: PostureMeasurements;
  details: MeasurementDetail[];
  landmarks: Landmark[];
  imageWidth: number;
  imageHeight: number;
  notes: string;
  clinicalSummary?: string;
}

export interface BodyZone {
  id: string;
  label: string;
  severity: Severity;
  issues: string[];
  landmarkIndices: number[];
}

export const LM = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

/**
 * Key landmarks for manual placement mode.
 * These are the essential landmarks a coach would place manually.
 */
export const MANUAL_LANDMARKS = [
  { idx: LM.NOSE, label: "Nose", shortLabel: "N" },
  { idx: LM.LEFT_EAR, label: "Left Ear", shortLabel: "LE" },
  { idx: LM.RIGHT_EAR, label: "Right Ear", shortLabel: "RE" },
  { idx: LM.LEFT_SHOULDER, label: "Left Shoulder", shortLabel: "LS" },
  { idx: LM.RIGHT_SHOULDER, label: "Right Shoulder", shortLabel: "RS" },
  { idx: LM.LEFT_ELBOW, label: "Left Elbow", shortLabel: "LEl" },
  { idx: LM.RIGHT_ELBOW, label: "Right Elbow", shortLabel: "REl" },
  { idx: LM.LEFT_WRIST, label: "Left Wrist", shortLabel: "LW" },
  { idx: LM.RIGHT_WRIST, label: "Right Wrist", shortLabel: "RW" },
  { idx: LM.LEFT_HIP, label: "Left Hip", shortLabel: "LH" },
  { idx: LM.RIGHT_HIP, label: "Right Hip", shortLabel: "RH" },
  { idx: LM.LEFT_KNEE, label: "Left Knee", shortLabel: "LK" },
  { idx: LM.RIGHT_KNEE, label: "Right Knee", shortLabel: "RK" },
  { idx: LM.LEFT_ANKLE, label: "Left Ankle", shortLabel: "LA" },
  { idx: LM.RIGHT_ANKLE, label: "Right Ankle", shortLabel: "RA" },
  { idx: LM.LEFT_HEEL, label: "Left Heel", shortLabel: "LHl" },
  { idx: LM.RIGHT_HEEL, label: "Right Heel", shortLabel: "RHl" },
  { idx: LM.LEFT_FOOT_INDEX, label: "Left Foot", shortLabel: "LF" },
  { idx: LM.RIGHT_FOOT_INDEX, label: "Right Foot", shortLabel: "RF" },
] as const;

export const SKELETON_CONNECTIONS: [number, number][] = [
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  [LM.LEFT_ANKLE, LM.LEFT_HEEL],
  [LM.LEFT_ANKLE, LM.LEFT_FOOT_INDEX],
  [LM.LEFT_HEEL, LM.LEFT_FOOT_INDEX],
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
  [LM.RIGHT_ANKLE, LM.RIGHT_HEEL],
  [LM.RIGHT_ANKLE, LM.RIGHT_FOOT_INDEX],
  [LM.RIGHT_HEEL, LM.RIGHT_FOOT_INDEX],
  [LM.LEFT_EAR, LM.LEFT_EYE_OUTER],
  [LM.LEFT_EYE_OUTER, LM.LEFT_EYE],
  [LM.LEFT_EYE, LM.LEFT_EYE_INNER],
  [LM.LEFT_EYE_INNER, LM.NOSE],
  [LM.NOSE, LM.RIGHT_EYE_INNER],
  [LM.RIGHT_EYE_INNER, LM.RIGHT_EYE],
  [LM.RIGHT_EYE, LM.RIGHT_EYE_OUTER],
  [LM.RIGHT_EYE_OUTER, LM.RIGHT_EAR],
  [LM.MOUTH_LEFT, LM.MOUTH_RIGHT],
];

// ── Math helpers ──

export function angleBetweenPoints(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (magAB === 0 || magCB === 0) return 0;
  const cosAngle = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

export function angleBetweenTwoPoints(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}

function midpoint(a: Landmark, b: Landmark): Landmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

// ── Severity classification ──

export type Severity = "good" | "mild" | "significant";

export function classifyAngle(
  value: number,
  goodMax: number,
  mildMax: number
): Severity {
  const abs = Math.abs(value);
  if (abs <= goodMax) return "good";
  if (abs <= mildMax) return "mild";
  return "significant";
}

export function severityColor(severity: Severity): string {
  switch (severity) {
    case "good": return "#22c55e";
    case "mild": return "#eab308";
    case "significant": return "#ef4444";
  }
}

export function severityBgColor(severity: Severity): string {
  switch (severity) {
    case "good": return "rgba(34,197,94,0.15)";
    case "mild": return "rgba(234,179,8,0.15)";
    case "significant": return "rgba(239,68,68,0.15)";
  }
}

export function severityLabel(severity: Severity): string {
  switch (severity) {
    case "good": return "Normal";
    case "mild": return "Mild deviation";
    case "significant": return "Significant deviation";
  }
}

// ── Measurement functions ──

export function calculateHeadTilt(landmarks: Landmark[]): number {
  return angleBetweenTwoPoints(landmarks[LM.RIGHT_EAR], landmarks[LM.LEFT_EAR]);
}

export function calculateShoulderDiff(landmarks: Landmark[], imageHeight: number): number {
  const left = landmarks[LM.LEFT_SHOULDER];
  const right = landmarks[LM.RIGHT_SHOULDER];
  return ((left.y - right.y) * imageHeight / imageHeight) * 1800;
}

export function calculateHipDiff(landmarks: Landmark[], imageHeight: number): number {
  const left = landmarks[LM.LEFT_HIP];
  const right = landmarks[LM.RIGHT_HIP];
  return ((left.y - right.y) * imageHeight / imageHeight) * 1800;
}

export function calculateKneeAngle(landmarks: Landmark[], side: "left" | "right"): number {
  if (side === "left") {
    return angleBetweenPoints(landmarks[LM.LEFT_HIP], landmarks[LM.LEFT_KNEE], landmarks[LM.LEFT_ANKLE]);
  }
  return angleBetweenPoints(landmarks[LM.RIGHT_HIP], landmarks[LM.RIGHT_KNEE], landmarks[LM.RIGHT_ANKLE]);
}

export function calculateAnkleAlignment(landmarks: Landmark[], side: "left" | "right"): number {
  const knee = side === "left" ? landmarks[LM.LEFT_KNEE] : landmarks[LM.RIGHT_KNEE];
  const ankle = side === "left" ? landmarks[LM.LEFT_ANKLE] : landmarks[LM.RIGHT_ANKLE];
  const foot = side === "left" ? landmarks[LM.LEFT_FOOT_INDEX] : landmarks[LM.RIGHT_FOOT_INDEX];
  return angleBetweenPoints(knee, ankle, foot);
}

export function calculateAnteriorPelvicTilt(landmarks: Landmark[]): number {
  const hipMid = midpoint(landmarks[LM.LEFT_HIP], landmarks[LM.RIGHT_HIP]);
  const shoulderMid = midpoint(landmarks[LM.LEFT_SHOULDER], landmarks[LM.RIGHT_SHOULDER]);
  return angleBetweenTwoPoints(hipMid, shoulderMid) + 90;
}

export function calculateTrunkLateralLean(landmarks: Landmark[]): number {
  const shoulderMid = midpoint(landmarks[LM.LEFT_SHOULDER], landmarks[LM.RIGHT_SHOULDER]);
  const hipMid = midpoint(landmarks[LM.LEFT_HIP], landmarks[LM.RIGHT_HIP]);
  return (shoulderMid.x - hipMid.x) * 100;
}

export function calculateQAngle(landmarks: Landmark[], side: "left" | "right"): number {
  const hip = side === "left" ? landmarks[LM.LEFT_HIP] : landmarks[LM.RIGHT_HIP];
  const knee = side === "left" ? landmarks[LM.LEFT_KNEE] : landmarks[LM.RIGHT_KNEE];
  const ankle = side === "left" ? landmarks[LM.LEFT_ANKLE] : landmarks[LM.RIGHT_ANKLE];
  const hipToKnee = angleBetweenTwoPoints(hip, knee);
  const ankleToKnee = angleBetweenTwoPoints(ankle, knee);
  return Math.abs(hipToKnee - ankleToKnee);
}

export function calculateForwardHead(landmarks: Landmark[]): number {
  const ear = (landmarks[LM.LEFT_EAR].visibility ?? 0) > (landmarks[LM.RIGHT_EAR].visibility ?? 0)
    ? landmarks[LM.LEFT_EAR] : landmarks[LM.RIGHT_EAR];
  const shoulder = (landmarks[LM.LEFT_SHOULDER].visibility ?? 0) > (landmarks[LM.RIGHT_SHOULDER].visibility ?? 0)
    ? landmarks[LM.LEFT_SHOULDER] : landmarks[LM.RIGHT_SHOULDER];
  return (Math.atan2(ear.x - shoulder.x, -(ear.y - shoulder.y)) * 180) / Math.PI;
}

export function calculateThoracicKyphosis(landmarks: Landmark[]): number {
  const shoulder = (landmarks[LM.LEFT_SHOULDER].visibility ?? 0) > (landmarks[LM.RIGHT_SHOULDER].visibility ?? 0)
    ? landmarks[LM.LEFT_SHOULDER] : landmarks[LM.RIGHT_SHOULDER];
  const hip = (landmarks[LM.LEFT_HIP].visibility ?? 0) > (landmarks[LM.RIGHT_HIP].visibility ?? 0)
    ? landmarks[LM.LEFT_HIP] : landmarks[LM.RIGHT_HIP];
  const ear = (landmarks[LM.LEFT_EAR].visibility ?? 0) > (landmarks[LM.RIGHT_EAR].visibility ?? 0)
    ? landmarks[LM.LEFT_EAR] : landmarks[LM.RIGHT_EAR];
  return angleBetweenPoints(ear, shoulder, hip);
}

export function calculateLumbarLordosis(landmarks: Landmark[]): number {
  const shoulder = (landmarks[LM.LEFT_SHOULDER].visibility ?? 0) > (landmarks[LM.RIGHT_SHOULDER].visibility ?? 0)
    ? landmarks[LM.LEFT_SHOULDER] : landmarks[LM.RIGHT_SHOULDER];
  const hip = (landmarks[LM.LEFT_HIP].visibility ?? 0) > (landmarks[LM.RIGHT_HIP].visibility ?? 0)
    ? landmarks[LM.LEFT_HIP] : landmarks[LM.RIGHT_HIP];
  const knee = (landmarks[LM.LEFT_KNEE].visibility ?? 0) > (landmarks[LM.RIGHT_KNEE].visibility ?? 0)
    ? landmarks[LM.LEFT_KNEE] : landmarks[LM.RIGHT_KNEE];
  return angleBetweenPoints(shoulder, hip, knee);
}

// ── Score ──

export function calculateSymmetryScore(m: PostureMeasurements): number {
  let score = 100;
  score -= Math.min(Math.abs(m.headTiltAngle) * 2, 15);
  score -= Math.min(Math.abs(m.shoulderLevelDiff) * 0.5, 15);
  score -= Math.min(Math.abs(m.hipLevelDiff) * 0.5, 15);
  const leftKneeD = Math.abs(180 - m.leftKneeAngle);
  const rightKneeD = Math.abs(180 - m.rightKneeAngle);
  score -= Math.min((leftKneeD + rightKneeD) * 0.3, 15);
  score -= Math.min(Math.abs(m.anteriorPelvicTilt) * 1.5, 15);
  score -= Math.min(Math.abs(m.trunkLateralLean) * 0.8, 8);
  if (m.forwardHeadAngle !== null) score -= Math.min(Math.abs(m.forwardHeadAngle) * 1.2, 10);
  if (m.thoracicKyphosisAngle !== null) score -= Math.min(Math.abs(m.thoracicKyphosisAngle - 170) * 0.5, 10);
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Full analysis ──

export function analyzePosture(
  landmarks: Landmark[],
  imageWidth: number,
  imageHeight: number,
  viewType: "front" | "side" | "both"
): { measurements: PostureMeasurements; details: MeasurementDetail[]; bodyZones: BodyZone[]; clinicalSummary: string } {
  const headTilt = calculateHeadTilt(landmarks);
  const shoulderDiff = calculateShoulderDiff(landmarks, imageHeight);
  const hipDiff = calculateHipDiff(landmarks, imageHeight);
  const leftKnee = calculateKneeAngle(landmarks, "left");
  const rightKnee = calculateKneeAngle(landmarks, "right");
  const leftAnkle = calculateAnkleAlignment(landmarks, "left");
  const rightAnkle = calculateAnkleAlignment(landmarks, "right");
  const pelvicTilt = calculateAnteriorPelvicTilt(landmarks);
  const trunkLean = calculateTrunkLateralLean(landmarks);
  const qAngleL = calculateQAngle(landmarks, "left");
  const qAngleR = calculateQAngle(landmarks, "right");

  const isSide = viewType === "side" || viewType === "both";
  const forwardHead = isSide ? calculateForwardHead(landmarks) : null;
  const thoracicKyphosis = isSide ? calculateThoracicKyphosis(landmarks) : null;
  const lumbarLordosis = isSide ? calculateLumbarLordosis(landmarks) : null;

  const r = (v: number) => Math.round(v * 10) / 10;

  const measurements: PostureMeasurements = {
    headTiltAngle: r(headTilt),
    shoulderLevelDiff: r(shoulderDiff),
    hipLevelDiff: r(hipDiff),
    leftKneeAngle: r(leftKnee),
    rightKneeAngle: r(rightKnee),
    leftAnkleAlignment: r(leftAnkle),
    rightAnkleAlignment: r(rightAnkle),
    anteriorPelvicTilt: r(pelvicTilt),
    overallSymmetryScore: 0,
    forwardHeadAngle: forwardHead !== null ? r(forwardHead) : null,
    thoracicKyphosisAngle: thoracicKyphosis !== null ? r(thoracicKyphosis) : null,
    lumbarLordosisAngle: lumbarLordosis !== null ? r(lumbarLordosis) : null,
    trunkLateralLean: r(trunkLean),
    shoulderProtraction: null,
    qAngleLeft: r(qAngleL),
    qAngleRight: r(qAngleR),
  };

  measurements.overallSymmetryScore = calculateSymmetryScore(measurements);

  const details: MeasurementDetail[] = [
    {
      label: "Head Tilt",
      value: measurements.headTiltAngle,
      unit: "°",
      severity: classifyAngle(measurements.headTiltAngle, 3, 7),
      description: describeHeadTilt(measurements.headTiltAngle),
      category: "head",
    },
    {
      label: "Shoulder Level Difference",
      value: measurements.shoulderLevelDiff,
      unit: "mm",
      severity: classifyAngle(measurements.shoulderLevelDiff, 10, 25),
      description: describeShoulderDiff(measurements.shoulderLevelDiff),
      category: "shoulder",
    },
    {
      label: "Hip Level Difference",
      value: measurements.hipLevelDiff,
      unit: "mm",
      severity: classifyAngle(measurements.hipLevelDiff, 8, 20),
      description: describeHipDiff(measurements.hipLevelDiff),
      category: "pelvis",
    },
    {
      label: "Trunk Lateral Lean",
      value: measurements.trunkLateralLean,
      unit: "%",
      severity: classifyAngle(measurements.trunkLateralLean, 2, 5),
      description: describeTrunkLean(measurements.trunkLateralLean),
      category: "spine",
    },
    {
      label: "Left Knee Angle",
      value: measurements.leftKneeAngle,
      unit: "°",
      severity: classifyKnee(measurements.leftKneeAngle),
      description: describeKnee(measurements.leftKneeAngle, "left"),
      category: "knee",
    },
    {
      label: "Right Knee Angle",
      value: measurements.rightKneeAngle,
      unit: "°",
      severity: classifyKnee(measurements.rightKneeAngle),
      description: describeKnee(measurements.rightKneeAngle, "right"),
      category: "knee",
    },
    {
      label: "Q-Angle Left",
      value: measurements.qAngleLeft,
      unit: "°",
      severity: classifyAngle(measurements.qAngleLeft - 14, 4, 8),
      description: describeQAngle(measurements.qAngleLeft, "left"),
      category: "knee",
    },
    {
      label: "Q-Angle Right",
      value: measurements.qAngleRight,
      unit: "°",
      severity: classifyAngle(measurements.qAngleRight - 14, 4, 8),
      description: describeQAngle(measurements.qAngleRight, "right"),
      category: "knee",
    },
    {
      label: "Anterior Pelvic Tilt",
      value: measurements.anteriorPelvicTilt,
      unit: "°",
      severity: classifyAngle(measurements.anteriorPelvicTilt, 5, 12),
      description: describePelvicTilt(measurements.anteriorPelvicTilt),
      category: "pelvis",
    },
  ];

  if (measurements.forwardHeadAngle !== null) {
    details.push({
      label: "Forward Head Posture",
      value: measurements.forwardHeadAngle,
      unit: "°",
      severity: classifyAngle(measurements.forwardHeadAngle, 5, 15),
      description: describeForwardHead(measurements.forwardHeadAngle),
      category: "head",
    });
  }

  if (measurements.thoracicKyphosisAngle !== null) {
    details.push({
      label: "Thoracic Kyphosis",
      value: measurements.thoracicKyphosisAngle,
      unit: "°",
      severity: classifyKyphosis(measurements.thoracicKyphosisAngle),
      description: describeKyphosis(measurements.thoracicKyphosisAngle),
      category: "spine",
    });
  }

  if (measurements.lumbarLordosisAngle !== null) {
    details.push({
      label: "Lumbar Lordosis",
      value: measurements.lumbarLordosisAngle,
      unit: "°",
      severity: classifyLordosis(measurements.lumbarLordosisAngle),
      description: describeLordosis(measurements.lumbarLordosisAngle),
      category: "spine",
    });
  }

  const bodyZones = computeBodyZones(measurements, details);
  const clinicalSummary = generateClinicalSummary(measurements, details, bodyZones, viewType);

  return { measurements, details, bodyZones, clinicalSummary };
}

// ── Body zones for heatmap ──

function computeBodyZones(m: PostureMeasurements, details: MeasurementDetail[]): BodyZone[] {
  const zones: BodyZone[] = [];

  const headDetails = details.filter(d => d.category === "head");
  const headIssues = headDetails.filter(d => d.severity !== "good").map(d => d.description);
  const headSev = worstSeverity(headDetails.map(d => d.severity));
  zones.push({ id: "head", label: "Head & Neck", severity: headSev, issues: headIssues, landmarkIndices: [0,1,2,3,4,5,6,7,8,9,10] });

  const shoulderDetails = details.filter(d => d.category === "shoulder");
  const shoulderIssues = shoulderDetails.filter(d => d.severity !== "good").map(d => d.description);
  const shoulderSev = worstSeverity(shoulderDetails.map(d => d.severity));
  zones.push({ id: "shoulders", label: "Shoulders", severity: shoulderSev, issues: shoulderIssues, landmarkIndices: [11,12,13,14,15,16] });

  const spineDetails = details.filter(d => d.category === "spine");
  const spineIssues = spineDetails.filter(d => d.severity !== "good").map(d => d.description);
  const spineSev = worstSeverity(spineDetails.map(d => d.severity));
  zones.push({ id: "spine", label: "Spine & Trunk", severity: spineSev, issues: spineIssues, landmarkIndices: [] });

  const pelvisDetails = details.filter(d => d.category === "pelvis");
  const pelvisIssues = pelvisDetails.filter(d => d.severity !== "good").map(d => d.description);
  const pelvisSev = worstSeverity(pelvisDetails.map(d => d.severity));
  zones.push({ id: "pelvis", label: "Pelvis & Hips", severity: pelvisSev, issues: pelvisIssues, landmarkIndices: [23,24] });

  const kneeDetails = details.filter(d => d.category === "knee");
  const kneeIssues = kneeDetails.filter(d => d.severity !== "good").map(d => d.description);
  const kneeSev = worstSeverity(kneeDetails.map(d => d.severity));
  zones.push({ id: "knees", label: "Knees", severity: kneeSev, issues: kneeIssues, landmarkIndices: [25,26] });

  return zones;
}

function worstSeverity(sevs: Severity[]): Severity {
  if (sevs.includes("significant")) return "significant";
  if (sevs.includes("mild")) return "mild";
  return "good";
}

// ── Clinical summary generator ──

function generateClinicalSummary(
  m: PostureMeasurements,
  details: MeasurementDetail[],
  zones: BodyZone[],
  viewType: string
): string {
  const significant = details.filter(d => d.severity === "significant");
  const mild = details.filter(d => d.severity === "mild");
  const good = details.filter(d => d.severity === "good");

  let summary = `**Posture Assessment Summary** (${viewType} view)\n\n`;
  summary += `**Overall Score: ${m.overallSymmetryScore}/100** — ${scoreGrade(m.overallSymmetryScore)}\n\n`;

  if (significant.length === 0 && mild.length === 0) {
    summary += "All measurements fall within normal ranges. The client demonstrates good postural alignment. ";
    summary += "Continue current maintenance program and monitor for changes over time.\n";
    return summary;
  }

  if (significant.length > 0) {
    summary += `**Priority Areas (${significant.length}):**\n`;
    for (const d of significant) {
      summary += `- **${d.label}** (${d.value}${d.unit}): ${d.description}\n`;
    }
    summary += "\n";
  }

  if (mild.length > 0) {
    summary += `**Monitor (${mild.length}):**\n`;
    for (const d of mild) {
      summary += `- ${d.label} (${d.value}${d.unit}): ${d.description}\n`;
    }
    summary += "\n";
  }

  summary += `**Normal (${good.length}):** ${good.map(d => d.label).join(", ")}\n\n`;

  summary += "**Recommended Focus:**\n";

  const problemZones = zones.filter(z => z.severity !== "good");
  for (const z of problemZones) {
    summary += `- ${z.label}: ${getZoneRecommendation(z)}\n`;
  }

  if (Math.abs(m.headTiltAngle) > 5 && Math.abs(m.shoulderLevelDiff) > 15) {
    summary += "\n**Pattern Detected:** Head tilt combined with shoulder drop may indicate upper cross syndrome or cervical compensation. Consider integrated neck-shoulder rehabilitation.\n";
  }

  if (Math.abs(m.anteriorPelvicTilt) > 8 && m.forwardHeadAngle !== null && Math.abs(m.forwardHeadAngle) > 10) {
    summary += "\n**Pattern Detected:** Anterior pelvic tilt with forward head posture suggests lower cross syndrome. Address hip flexor tightness, core stability, and cervical retraction together.\n";
  }

  return summary;
}

function getZoneRecommendation(zone: BodyZone): string {
  switch (zone.id) {
    case "head": return "Cervical mobility, chin tucks, neck strengthening exercises.";
    case "shoulders": return "Scapular stabilization, postural awareness drills, thoracic extension.";
    case "spine": return "Core stability work, spinal mobility, breathing exercises.";
    case "pelvis": return "Hip flexor stretching, glute activation, pelvic floor awareness.";
    case "knees": return "VMO strengthening, hip stability work, foot mechanics assessment.";
    default: return "Targeted corrective exercises recommended.";
  }
}

// ── Classification helpers ──

function classifyKnee(angle: number): Severity {
  const d = Math.abs(180 - angle);
  if (d <= 5) return "good";
  if (d <= 12) return "mild";
  return "significant";
}

function classifyKyphosis(angle: number): Severity {
  if (angle >= 155 && angle <= 180) return "good";
  if (angle >= 140 && angle < 155) return "mild";
  return "significant";
}

function classifyLordosis(angle: number): Severity {
  if (angle >= 155 && angle <= 180) return "good";
  if (angle >= 140 && angle < 155) return "mild";
  return "significant";
}

// ── Description generators ──

function describeHeadTilt(angle: number): string {
  const abs = Math.abs(angle);
  if (abs <= 3) return "Head is well-centered and aligned.";
  const dir = angle > 0 ? "left" : "right";
  if (abs <= 7) return `Mild head tilt to the ${dir} (${abs.toFixed(1)}°). Monitor and incorporate lateral neck stretches.`;
  return `Significant head tilt to the ${dir} (${abs.toFixed(1)}°). May indicate cervical imbalance or upper trapezius tension asymmetry.`;
}

function describeShoulderDiff(diff: number): string {
  const abs = Math.abs(diff);
  if (abs <= 10) return "Shoulders are level and well-aligned.";
  const side = diff > 0 ? "left shoulder is lower" : "right shoulder is lower";
  if (abs <= 25) return `Mild asymmetry — ${side} by ${abs.toFixed(1)}mm. Common with dominant-hand activities.`;
  return `Significant shoulder drop — ${side} by ${abs.toFixed(1)}mm. Check for compensatory patterns and scoliotic tendency.`;
}

function describeHipDiff(diff: number): string {
  const abs = Math.abs(diff);
  if (abs <= 8) return "Hips are level and balanced.";
  const side = diff > 0 ? "left hip is lower" : "right hip is lower";
  if (abs <= 20) return `Mild pelvic obliquity — ${side} by ${abs.toFixed(1)}mm. May relate to stance habit.`;
  return `Significant hip imbalance — ${side} by ${abs.toFixed(1)}mm. Assess for functional or structural leg length discrepancy.`;
}

function describeTrunkLean(lean: number): string {
  const abs = Math.abs(lean);
  if (abs <= 2) return "Trunk is well-centered over the pelvis.";
  const dir = lean > 0 ? "right" : "left";
  if (abs <= 5) return `Mild lateral trunk lean to the ${dir}. May be habitual or compensatory.`;
  return `Significant lateral lean to the ${dir}. Assess core lateral stability and hip abductor strength.`;
}

function describeKnee(angle: number, side: string): string {
  const d = 180 - angle;
  const label = side === "left" ? "Left" : "Right";
  if (Math.abs(d) <= 5) return `${label} knee alignment is within normal range.`;
  if (d > 5) return `${label} knee shows flexion tendency (${d.toFixed(1)}°). May indicate hamstring tightness or quadriceps weakness.`;
  return `${label} knee shows hyperextension tendency (${Math.abs(d).toFixed(1)}°). Focus on proprioception and controlled ROM.`;
}

function describeQAngle(angle: number, side: string): string {
  const label = side === "left" ? "Left" : "Right";
  if (angle >= 10 && angle <= 18) return `${label} Q-angle is within normal range (${angle.toFixed(1)}°).`;
  if (angle < 10) return `${label} Q-angle is below normal (${angle.toFixed(1)}°). May indicate varus alignment.`;
  return `${label} Q-angle is elevated (${angle.toFixed(1)}°). Increased risk of patellofemoral issues. Assess hip and foot mechanics.`;
}

function describePelvicTilt(angle: number): string {
  const abs = Math.abs(angle);
  if (abs <= 5) return "Pelvis is in a neutral position.";
  if (angle > 0) {
    if (abs <= 12) return `Mild anterior pelvic tilt (${abs.toFixed(1)}°). Common with prolonged sitting and tight hip flexors.`;
    return `Significant anterior pelvic tilt (${abs.toFixed(1)}°). Prioritize hip flexor lengthening, glute activation, and core stability.`;
  }
  if (abs <= 12) return `Mild posterior pelvic tilt (${abs.toFixed(1)}°). Check hamstring flexibility.`;
  return `Significant posterior pelvic tilt (${abs.toFixed(1)}°). Assess lumbar mobility and hip flexor function.`;
}

function describeForwardHead(angle: number): string {
  const abs = Math.abs(angle);
  if (abs <= 5) return "Head is well-aligned over the shoulders.";
  if (abs <= 15) return `Mild forward head posture (${abs.toFixed(1)}°). Chin tuck exercises and thoracic extension recommended.`;
  return `Significant forward head posture (${abs.toFixed(1)}°). Associated with cervicogenic headache risk. Deep neck flexor retraining needed.`;
}

function describeKyphosis(angle: number): string {
  if (angle >= 155) return "Thoracic curve is within normal range.";
  if (angle >= 140) return "Mild increase in thoracic kyphosis. Thoracic extension and scapular retraction exercises recommended.";
  return "Excessive thoracic kyphosis detected. Comprehensive upper-back extension and postural retraining program needed.";
}

function describeLordosis(angle: number): string {
  if (angle >= 155) return "Lumbar curve is within normal range.";
  if (angle >= 140) return "Mild increase in lumbar lordosis. Core stabilization and hip flexor stretching advised.";
  return "Excessive lumbar lordosis detected. Focus on pelvic neutral training and transverse abdominus activation.";
}

// ── Segment severity for skeleton coloring ──

export function getSegmentSeverity(startIdx: number, endIdx: number, measurements: PostureMeasurements): Severity {
  const isHead = [0,1,2,3,4,5,6,7,8,9,10].includes(startIdx) || [0,1,2,3,4,5,6,7,8,9,10].includes(endIdx);
  const isShoulder = [11,12].includes(startIdx) && [11,12].includes(endIdx);
  const isLeftLeg = [23,25,27,29,31].includes(startIdx) && [23,25,27,29,31].includes(endIdx);
  const isRightLeg = [24,26,28,30,32].includes(startIdx) && [24,26,28,30,32].includes(endIdx);
  const isHip = [23,24].includes(startIdx) && [23,24].includes(endIdx);

  if (isHead) return classifyAngle(measurements.headTiltAngle, 3, 7);
  if (isShoulder) return classifyAngle(measurements.shoulderLevelDiff, 10, 25);
  if (isHip) return classifyAngle(measurements.hipLevelDiff, 8, 20);
  if (isLeftLeg) return classifyKnee(measurements.leftKneeAngle);
  if (isRightLeg) return classifyKnee(measurements.rightKneeAngle);
  return "good";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

export function scoreGrade(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 65) return "Fair";
  if (score >= 50) return "Needs Improvement";
  return "Poor";
}
