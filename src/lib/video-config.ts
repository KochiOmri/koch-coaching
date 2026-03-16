/**
 * VIDEO CONFIG — Which video plays where
 *
 * WHAT IT DOES:
 * Manages the mapping of MP4 videos to website sections. Videos live in public/videos/
 * (e.g. vid-01.mp4, vid-02.mp4). This config decides which video appears in each
 * section: hero, about, showcase carousel, method steps, and results grid.
 *
 * ARCHITECTURE:
 * - Data layer: reads/writes data/video-config.json (same pattern as site-content.ts)
 * - Used by: page components that render video players (hero, about, showcase, etc.)
 * - The JSON file is the single source of truth; no hardcoded video paths in components
 *
 * DEV PLAN:
 * - Add new videos by dropping MP4s into public/videos/ and extending allVideoFiles
 * - Admin UI can edit video-config.json to reassign videos without code changes
 * - Consider migrating to a CMS if non-technical editors need to manage videos
 */

import fs from "fs";
import path from "path";

// ─── Types & paths ───────────────────────────────────────────────────────────

export interface VideoConfig {
  hero: string;
  about: string;
  showcase: Array<{ src: string; title: string; tag: string }>;
  method: { step1: string; step2: string; step3: string; step4: string };
  results: Array<{ src: string; title: string; description: string }>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "video-config.json");
const VIDEO_DIR = "/videos";

function v(name: string) {
  return `${VIDEO_DIR}/${name}`;
}

// ─── Default config (used when data/video-config.json doesn't exist yet) ───────

const DEFAULT_CONFIG: VideoConfig = {
  hero: v("vid-02.mp4"),
  about: v("vid-03.mp4"),
  showcase: [
    { src: v("vid-04.mp4"), title: "Movement Correction", tag: "Training" },
    { src: v("vid-05.mp4"), title: "Gait Pattern Work", tag: "Biomechanics" },
    { src: v("vid-06.mp4"), title: "Postural Alignment", tag: "Posture" },
    { src: v("vid-07.mp4"), title: "Functional Training", tag: "Training" },
    { src: v("vid-08.mp4"), title: "Core Integration", tag: "Recovery" },
  ],
  method: {
    step1: v("vid-09.mp4"),
    step2: v("vid-10.mp4"),
    step3: v("vid-11.mp4"),
    step4: v("vid-12.mp4"),
  },
  results: [
    { src: v("vid-01.mp4"), title: "Posture Transformation", description: "12-week posture realignment journey" },
    { src: v("vid-06.mp4"), title: "Gait Correction", description: "Walking pattern restructured" },
    { src: v("vid-07.mp4"), title: "Pain Elimination", description: "Chronic pain to full mobility" },
    { src: v("vid-05.mp4"), title: "Movement Quality", description: "Patterns rebuilt from the ground up" },
  ],
};

// ─── Persistence: ensure data dir exists, bootstrap from defaults if needed ────

function ensureConfig(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getVideoConfig(): VideoConfig {
  ensureConfig();
  const data = fs.readFileSync(CONFIG_FILE, "utf-8");
  return JSON.parse(data);
}

export function saveVideoConfig(config: VideoConfig): void {
  ensureConfig();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Canonical list of all MP4s in public/videos/ — used by admin UI for dropdowns
export const allVideoFiles = [
  "vid-01.mp4", "vid-02.mp4", "vid-03.mp4", "vid-04.mp4",
  "vid-05.mp4", "vid-06.mp4", "vid-07.mp4", "vid-08.mp4",
  "vid-09.mp4", "vid-10.mp4", "vid-11.mp4", "vid-12.mp4",
];
