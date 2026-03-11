/* ============================================================
   VIDEO CONFIG - src/lib/video-config.ts
   ============================================================
   THIS IS THE ONE FILE where you control which video
   goes where on the website.
   
   To rearrange videos:
   Just swap the file names between slots.
   For example, if you want showcase-3 as the hero,
   change heroBackground from "hero.mp4" to "showcase-3.mp4"
   
   All 18 of your videos:
   ─────────────────────
   hero.mp4        (18MB - longest)
   showcase-1.mp4  (14MB)
   showcase-2.mp4  (14MB)
   showcase-3.mp4  (13MB)
   showcase-4.mp4  (11MB)
   showcase-5.mp4  (11MB)
   showcase-6.mp4  (9.7MB)
   result-1.mp4    (8.9MB)
   result-2.mp4    (8.3MB)
   result-3.mp4    (8.2MB)
   result-4.mp4    (6.9MB)
   about.mp4       (5.5MB)
   method-1.mp4    (5.2MB)
   method-2.mp4    (5.2MB)
   clip-1.mp4      (4.2MB)
   clip-2.mp4      (3.4MB)
   clip-3.mp4      (2.5MB)
   clip-4.mp4      (1.9MB)
   ============================================================ */

const VIDEO_DIR = "/videos";

function v(name: string) {
  return `${VIDEO_DIR}/${name}`;
}

/* ─── HERO SECTION ─────────────────────────────────── */
export const heroVideo = {
  background: v("hero.mp4"),
};

/* ─── ABOUT SECTION ────────────────────────────────── */
export const aboutVideo = {
  coachingClip: v("about.mp4"),
};

/* ─── VIDEO SHOWCASE GALLERY ───────────────────────── */
export const showcaseVideos = [
  { src: v("showcase-1.mp4"), title: "Movement Correction", tag: "Training" },
  { src: v("showcase-2.mp4"), title: "Gait Pattern Work", tag: "Biomechanics" },
  { src: v("showcase-3.mp4"), title: "Postural Alignment", tag: "Posture" },
  { src: v("showcase-4.mp4"), title: "Functional Training", tag: "Training" },
  { src: v("showcase-5.mp4"), title: "Myofascial Release", tag: "Recovery" },
  { src: v("showcase-6.mp4"), title: "Core Integration", tag: "Training" },
  { src: v("clip-1.mp4"), title: "Quick Drill", tag: "Technique" },
  { src: v("clip-2.mp4"), title: "Movement Flow", tag: "Training" },
];

/* ─── METHOD STEPS ─────────────────────────────────── */
export const methodVideos = {
  step1_assessment: v("method-1.mp4"),
  step2_protocol: v("method-2.mp4"),
  step3_training: v("clip-3.mp4"),
  step4_results: v("clip-4.mp4"),
};

/* ─── RESULTS / TRANSFORMATIONS ────────────────────── */
export const resultVideos = [
  { src: v("result-1.mp4"), title: "Posture Transformation", description: "12-week journey from rounded shoulders to aligned posture" },
  { src: v("result-2.mp4"), title: "Gait Correction", description: "Walking pattern restructured for pain-free movement" },
  { src: v("result-3.mp4"), title: "Pain Elimination", description: "From chronic back pain to full mobility restoration" },
  { src: v("result-4.mp4"), title: "Movement Quality", description: "Fundamental movement patterns rebuilt from the ground up" },
];

/* ─── ALL AVAILABLE VIDEOS (for the admin page) ────── */
export const allVideos = [
  "hero.mp4", "showcase-1.mp4", "showcase-2.mp4", "showcase-3.mp4",
  "showcase-4.mp4", "showcase-5.mp4", "showcase-6.mp4", "result-1.mp4",
  "result-2.mp4", "result-3.mp4", "result-4.mp4", "about.mp4",
  "method-1.mp4", "method-2.mp4", "clip-1.mp4", "clip-2.mp4",
  "clip-3.mp4", "clip-4.mp4",
];
