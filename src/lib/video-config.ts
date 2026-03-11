/* ============================================================
   VIDEO CONFIG - src/lib/video-config.ts
   ============================================================
   THIS IS THE ONE FILE where you control which video
   goes where on the website.
   
   To rearrange: just swap the file names between slots.
   
   Your 12 videos:
   ─────────────────
   vid-01.mp4  (18MB)
   vid-02.mp4  (15MB)
   vid-03.mp4  (14MB)
   vid-04.mp4  (10MB)
   vid-05.mp4  (10MB)
   vid-06.mp4  (8.7MB)
   vid-07.mp4  (7.9MB)
   vid-08.mp4  (3.4MB)
   vid-09.mp4  (3.4MB)
   vid-10.mp4  (2.8MB)
   vid-11.mp4  (2.1MB)
   vid-12.mp4  (2.0MB)
   ============================================================ */

const VIDEO_DIR = "/videos";

function v(name: string) {
  return `${VIDEO_DIR}/${name}`;
}

/* ─── HERO SECTION (background video) ──────────────── */
export const heroVideo = {
  background: v("vid-01.mp4"),
};

/* ─── ABOUT SECTION (your coaching clip) ───────────── */
export const aboutVideo = {
  coachingClip: v("vid-02.mp4"),
};

/* ─── VIDEO SHOWCASE GALLERY ───────────────────────── */
export const showcaseVideos = [
  { src: v("vid-03.mp4"), title: "Movement Correction", tag: "Training" },
  { src: v("vid-04.mp4"), title: "Gait Pattern Work", tag: "Biomechanics" },
  { src: v("vid-05.mp4"), title: "Postural Alignment", tag: "Posture" },
  { src: v("vid-06.mp4"), title: "Functional Training", tag: "Training" },
  { src: v("vid-07.mp4"), title: "Core Integration", tag: "Recovery" },
];

/* ─── METHOD STEPS ─────────────────────────────────── */
export const methodVideos = {
  step1_assessment: v("vid-08.mp4"),
  step2_protocol: v("vid-09.mp4"),
  step3_training: v("vid-10.mp4"),
  step4_results: v("vid-11.mp4"),
};

/* ─── RESULTS / TRANSFORMATIONS ────────────────────── */
export const resultVideos = [
  { src: v("vid-06.mp4"), title: "Posture Transformation", description: "12-week journey from rounded shoulders to aligned posture" },
  { src: v("vid-07.mp4"), title: "Gait Correction", description: "Walking pattern restructured for pain-free movement" },
  { src: v("vid-12.mp4"), title: "Pain Elimination", description: "From chronic back pain to full mobility restoration" },
  { src: v("vid-03.mp4"), title: "Movement Quality", description: "Fundamental movement patterns rebuilt from the ground up" },
];

/* ─── ALL AVAILABLE VIDEOS (for the admin page) ────── */
export const allVideos = [
  "vid-01.mp4", "vid-02.mp4", "vid-03.mp4", "vid-04.mp4",
  "vid-05.mp4", "vid-06.mp4", "vid-07.mp4", "vid-08.mp4",
  "vid-09.mp4", "vid-10.mp4", "vid-11.mp4", "vid-12.mp4",
];
