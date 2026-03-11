/* ============================================================
   RESULTS SECTION - src/components/Results.tsx
   ============================================================
   This section showcases client transformations and testimonials.
   
   Why this matters:
   Social proof is the #1 factor in converting visitors to clients.
   Before/after results and testimonials build trust.
   
   Layout:
   - Video placeholders for before/after transformations
   - Testimonial cards with client quotes
   - Responsive grid layout
   
   TODO: Replace placeholders with real client results and testimonials.
   Make sure you get permission from clients before using their content!
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

/* --- Testimonials Data ---
   Each testimonial has: client name, their issue, the quote, and star rating.
   Replace these with REAL testimonials as you get them! */
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

/* --- Video Placeholders ---
   Before/After transformation examples.
   Replace with actual video embeds or images of client results. */
const transformations = [
  {
    title: "Posture Correction",
    description: "12-week posture transformation using FP methodology",
  },
  {
    title: "Gait Correction",
    description: "Walking pattern restructured for pain-free movement",
  },
];

export default function Results() {
  return (
    <section id="results" className="relative py-24 sm:py-32">
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

        {/* --- Before/After Video Placeholders ---
            Two cards showing transformation videos.
            Replace these with actual before/after content. */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {transformations.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group overflow-hidden rounded-2xl border border-card-border bg-card-bg"
            >
              {/* Video/Image placeholder area */}
              <div className="relative aspect-video bg-secondary">
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 text-primary transition-all group-hover:border-primary group-hover:bg-primary/10">
                    <svg
                      className="ml-1 h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted">
                    Add your before/after video here
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Testimonial Cards ---
            Three client testimonials in a grid.
            Each card has a quote icon, the testimonial text,
            star rating, and client info. */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="flex flex-col rounded-2xl border border-card-border bg-card-bg p-8 transition-all duration-300 hover:border-primary/30"
            >
              {/* Quote icon */}
              <Quote size={32} className="text-primary/30" />

              {/* Testimonial text */}
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Star rating */}
              <div className="mt-6 flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Client info */}
              <div className="mt-3">
                <div
                  className="font-semibold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
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
