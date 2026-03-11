/* ============================================================
   METHOD SECTION - src/components/Method.tsx
   ============================================================
   This section explains HOW Functional Patterns works.
   
   It breaks down the coaching process into 4 clear steps,
   making it easy for potential clients to understand your method.
   
   Layout:
   - Numbered steps in a vertical timeline-like layout
   - Each step has: number, title, description
   - Alternating layout on desktop (zigzag pattern)
   
   This is important for building trust — clients want to
   know what they're signing up for before booking.
   ============================================================ */

"use client";

import { motion } from "framer-motion";

/* --- Method Steps ---
   The four phases of your coaching process.
   Update these descriptions with your real methodology! */
const steps = [
  {
    number: "01",
    title: "Assessment",
    description:
      "We begin with a comprehensive biomechanical assessment. I analyze your posture, gait cycle, and movement patterns to identify the root causes of dysfunction — not just the symptoms.",
    detail: "Standing posture analysis • Gait cycle recording • Joint mobility testing • Muscle activation patterns",
  },
  {
    number: "02",
    title: "Protocol Design",
    description:
      "Based on your assessment, I design a personalized training protocol. Every exercise targets your specific dysfunctional patterns using the Functional Patterns methodology.",
    detail: "Custom exercise selection • Progressive overload plan • Myofascial release protocol • Movement repatterning",
  },
  {
    number: "03",
    title: "Training & Correction",
    description:
      "Through hands-on coaching, we retrain your body's movement patterns. I guide you through each exercise with precise cuing to ensure proper muscle activation and biomechanical alignment.",
    detail: "Hands-on technique correction • Real-time feedback • Neuromuscular re-education • Pattern integration",
  },
  {
    number: "04",
    title: "Integration & Results",
    description:
      "As your body adapts, we integrate the corrected patterns into real-world movement — walking, running, and daily activities. You'll see measurable improvements in posture, pain levels, and performance.",
    detail: "Before/after comparison • Gait re-analysis • Long-term maintenance plan • Continued support",
  },
];

export default function Method() {
  return (
    <section
      id="method"
      className="relative py-24 sm:py-32"
      style={{ backgroundColor: "var(--section-alt)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
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

        {/* --- Steps Timeline ---
            Each step appears as a card with a large number on one side
            and the content on the other. */}
        <div className="mt-16 space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col gap-8 rounded-2xl border border-card-border bg-card-bg p-8 transition-all duration-300 hover:border-primary/30 sm:flex-row sm:items-center sm:p-10"
            >
              {/* --- Step Number ---
                  Large number displayed prominently.
                  Uses the primary color for visual hierarchy. */}
              <div className="shrink-0">
                <span
                  className="text-7xl font-bold text-primary/20 transition-colors group-hover:text-primary/40"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {step.number}
                </span>
              </div>

              {/* --- Step Content ---
                  Title, description, and detail tags. */}
              <div>
                <h3
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-muted">{step.description}</p>
                {/* Detail tags - small labels showing specific techniques */}
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
          ))}
        </div>
      </div>
    </section>
  );
}
