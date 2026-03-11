/* ============================================================
   METHOD SECTION - src/components/Method.tsx
   ============================================================
   Explains the 4-step Functional Patterns process.
   Each step now includes a short video clip demonstrating
   the technique, making it much more engaging.
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { methodVideos } from "@/lib/video-config";

const steps = [
  {
    number: "01",
    title: "Assessment",
    description:
      "We begin with a comprehensive biomechanical assessment. I analyze your posture, gait cycle, and movement patterns to identify the root causes of dysfunction — not just the symptoms.",
    detail: "Standing posture analysis • Gait cycle recording • Joint mobility testing • Muscle activation patterns",
    video: methodVideos.step1_assessment,
  },
  {
    number: "02",
    title: "Protocol Design",
    description:
      "Based on your assessment, I design a personalized training protocol. Every exercise targets your specific dysfunctional patterns using the Functional Patterns methodology.",
    detail: "Custom exercise selection • Progressive overload plan • Myofascial release protocol • Movement repatterning",
    video: methodVideos.step2_protocol,
  },
  {
    number: "03",
    title: "Training & Correction",
    description:
      "Through hands-on coaching, we retrain your body's movement patterns. I guide you through each exercise with precise cuing to ensure proper muscle activation and biomechanical alignment.",
    detail: "Hands-on technique correction • Real-time feedback • Neuromuscular re-education • Pattern integration",
    video: methodVideos.step3_training,
  },
  {
    number: "04",
    title: "Integration & Results",
    description:
      "As your body adapts, we integrate the corrected patterns into real-world movement — walking, running, and daily activities. You'll see measurable improvements in posture, pain levels, and performance.",
    detail: "Before/after comparison • Gait re-analysis • Long-term maintenance plan • Continued support",
    video: methodVideos.step4_results,
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex flex-col gap-6 overflow-hidden rounded-2xl border border-card-border bg-card-bg transition-all duration-300 hover:border-primary/30 lg:flex-row"
    >
      {/* Video thumbnail */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden lg:aspect-auto lg:w-72">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
          <source src={step.video} type="video/mp4" />
        </video>
        {/* Step number overlay on the video */}
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-background">
          {step.number}
        </div>
      </div>

      {/* Text content */}
      <div className="flex flex-col justify-center p-6 lg:py-8">
        <h3
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {step.title}
        </h3>
        <p className="mt-3 text-muted">{step.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {step.detail.split(" • ").map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-card-border bg-background px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Method() {
  return (
    <section
      id="method"
      className="relative py-24 sm:py-32"
      style={{ backgroundColor: "var(--section-alt)" }}
    >
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
            THE PROCESS
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            A systematic, science-based approach to correcting your body&apos;s
            movement patterns and eliminating pain at its source.
          </p>
        </motion.div>

        {/* Steps with video */}
        <div className="mt-16 space-y-6">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
