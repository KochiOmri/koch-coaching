/**
 * Method — Four-step process section with alternating video/text layout.
 *
 * Each step shows a portrait video and text (title, description, tags). Layout alternates:
 * odd steps have video left, even steps have video right. Videos are assigned via a separate
 * `videos` config (step1–step4), while step content comes from the CMS.
 *
 * CMS/Architecture: Receives `videos` (step1–step4 URLs) from video config and `content`
 * (tagline, headline, steps array) from CMS. Video URLs and step content are decoupled.
 */
"use client";

import { motion } from "framer-motion";
import LazyVideo from "./LazyVideo";

interface MethodVideos {
  step1: string;
  step2: string;
  step3: string;
  step4: string;
}

interface MethodContent {
  tagline: string;
  headline: string;
  steps: Array<{
    number: string;
    title: string;
    description: string;
    tags: string[];
  }>;
}

const stepKeys = ["step1", "step2", "step3", "step4"] as const;

export default function Method({ videos, content }: { videos: MethodVideos; content: MethodContent }) {
  return (
    <section id="method" className="relative py-24 sm:py-32" style={{ backgroundColor: "var(--section-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{content.tagline}</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
            {content.headline}
          </h2>
        </motion.div>

        <div className="mt-20 space-y-12">
          {content.steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className={`flex flex-col items-center gap-8 rounded-3xl border border-card-border bg-card-bg p-6 sm:p-8 lg:p-10 ${
                index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <div className="relative flex w-full shrink-0 justify-center lg:w-auto">
                <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl bg-black">
                  <LazyVideo
                    src={videos[stepKeys[index]]}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full"
                    style={{ aspectRatio: "9/16" }}
                  />
                  <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-background" style={{ fontFamily: "var(--font-outfit)" }}>
                    {step.number}
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col justify-center text-center lg:text-left">
                <h3
                  className="text-3xl font-extrabold lg:text-4xl"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
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
