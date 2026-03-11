/* ============================================================
   RESULTS SECTION - src/components/Results.tsx
   ============================================================
   Shows client transformation videos and testimonials.
   Videos autoplay on scroll with a clean card design.
   ============================================================ */

"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "David M.",
    issue: "Chronic Lower Back Pain",
    quote:
      "After 10 years of back pain and trying everything, Koch's approach was the first thing that actually addressed WHY I was in pain. After 3 months, I'm pain-free for the first time in a decade.",
    rating: 5,
  },
  {
    name: "Sarah K.",
    issue: "Poor Posture & Neck Pain",
    quote:
      "I sat at a desk for 15 years and my posture was terrible. Koch didn't just give me exercises — he taught me HOW my body should actually move. The change has been incredible.",
    rating: 5,
  },
  {
    name: "Mike R.",
    issue: "Athletic Performance",
    quote:
      "As a runner, I kept getting injured. Functional Patterns showed me my gait was completely dysfunctional. After correcting my patterns, I'm running faster with zero injuries.",
    rating: 5,
  },
];

const transformationVideos = [
  {
    src: "/videos/result-1.mp4",
    title: "Posture Transformation",
    description: "12-week journey from rounded shoulders to aligned posture",
  },
  {
    src: "/videos/result-2.mp4",
    title: "Gait Correction",
    description: "Walking pattern restructured for pain-free movement",
  },
  {
    src: "/videos/result-3.mp4",
    title: "Pain Elimination",
    description: "From chronic back pain to full mobility restoration",
  },
  {
    src: "/videos/result-4.mp4",
    title: "Movement Quality",
    description: "Fundamental movement patterns rebuilt from the ground up",
  },
];

/* --- Hover-to-play video card --- */
function ResultVideo({ video, index }: { video: (typeof transformationVideos)[0]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group overflow-hidden rounded-2xl border border-card-border bg-card-bg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
      onMouseEnter={() => videoRef.current?.play()}
      onMouseLeave={() => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }}
    >
      <div className="relative aspect-video overflow-hidden">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
          <source src={video.src} type="video/mp4" />
        </video>
        {/* Play indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-100 transition-opacity group-hover:opacity-0">
          <div className="rounded-full border-2 border-white/40 p-3">
            <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {video.title}
        </h3>
        <p className="mt-1 text-sm text-muted">{video.description}</p>
      </div>
    </motion.div>
  );
}

export default function Results() {
  return (
    <section id="results" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium tracking-widest text-primary">
            REAL RESULTS
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Client Transformations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Real people, real results. See how biomechanics-based training
            transforms posture, eliminates pain, and improves performance.
          </p>
        </motion.div>

        {/* Transformation Videos Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {transformationVideos.map((video, index) => (
            <ResultVideo key={video.src} video={video} index={index} />
          ))}
        </div>

        {/* Testimonial Cards */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-8 transition-all duration-300 hover:border-primary/30"
            >
              <Quote size={32} className="text-primary/30" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <div className="mt-3">
                <div className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {testimonial.name}
                </div>
                <div className="text-xs text-muted">{testimonial.issue}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
