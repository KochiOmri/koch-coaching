/**
 * BeforeAfterSlider — Draggable before/after comparison slider for client transformations.
 *
 * Split-view with before video on left, after on right. User drags the center handle or
 * uses mouse/touch to control split position. Each comparison has labels and description.
 * Comparison data is currently hardcoded.
 *
 * CMS/Architecture: No CMS integration yet. Comparisons (beforeVideo, afterVideo, labels,
 * description) are defined in-component. Can be refactored to accept props from CMS.
 */
"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";
import LazyVideo from "./LazyVideo";

interface Comparison {
  beforeLabel: string;
  afterLabel: string;
  beforeVideo: string;
  afterVideo: string;
  description: string;
}

const comparisons: Comparison[] = [
  {
    beforeLabel: "Before",
    afterLabel: "After 12 Weeks",
    beforeVideo: "/videos/vid-01.mp4",
    afterVideo: "/videos/vid-02.mp4",
    description: "Posture realignment through Functional Patterns training",
  },
  {
    beforeLabel: "Before",
    afterLabel: "After 8 Weeks",
    beforeVideo: "/videos/vid-06.mp4",
    afterVideo: "/videos/vid-07.mp4",
    description: "Gait pattern correction and biomechanical restructuring",
  },
];

function Slider({ comparison }: { comparison: Comparison }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !dragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const startDrag = () => { dragging.current = true; };
  const stopDrag = () => { dragging.current = false; };

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden rounded-2xl border border-card-border"
      style={{ aspectRatio: "9/14", maxHeight: "500px" }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseDown={startDrag}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchStart={startDrag}
      onTouchEnd={stopDrag}
    >
      <div className="absolute inset-0">
        <LazyVideo src={comparison.afterVideo} autoPlay muted loop playsInline className="h-full w-full object-cover" />
      </div>

      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <LazyVideo
          src={comparison.beforeVideo}
          autoPlay
          muted
          loop
          playsInline
          className="h-full object-cover"
          style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : "100vw" }}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 z-10 flex cursor-ew-resize items-center"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-0.5 bg-white shadow-lg" />
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/60 backdrop-blur-sm">
          <ArrowLeftRight size={16} className="text-white" />
        </div>
      </div>

      <div className="absolute left-4 top-4 z-10 rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
        {comparison.beforeLabel}
      </div>
      <div className="absolute right-4 top-4 z-10 rounded-full bg-green-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
        {comparison.afterLabel}
      </div>
    </div>
  );
}

export default function BeforeAfterSlider() {
  return (
    <section className="relative py-24 sm:py-32" style={{ backgroundColor: "var(--section-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">See The Difference</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Before & After
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Drag the slider to compare. Real client transformations through Functional Patterns biomechanics coaching.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          {comparisons.map((comp, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <Slider comparison={comp} />
              <p className="mt-3 text-center text-sm text-muted">{comp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
