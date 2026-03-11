"use client";

import { motion } from "framer-motion";

interface MethodVideos { step1: string; step2: string; step3: string; step4: string }

const stepData = [
  { number: "01", title: "Assessment", key: "step1" as const, description: "Comprehensive biomechanical assessment. I analyze your posture, gait cycle, and movement patterns to identify the root causes of dysfunction.", tags: ["Posture Analysis", "Gait Recording", "Joint Mobility", "Muscle Activation"] },
  { number: "02", title: "Protocol Design", key: "step2" as const, description: "Personalized training protocol based on your assessment. Every exercise targets your specific dysfunctional patterns.", tags: ["Custom Exercises", "Progressive Overload", "Myofascial Release", "Repatterning"] },
  { number: "03", title: "Training & Correction", key: "step3" as const, description: "Hands-on coaching to retrain your body's movement patterns with precise cuing for proper biomechanical alignment.", tags: ["Technique Correction", "Real-time Feedback", "Neuromuscular Re-ed", "Integration"] },
  { number: "04", title: "Results", key: "step4" as const, description: "Corrected patterns integrated into real-world movement. Measurable improvements in posture, pain, and performance.", tags: ["Before/After", "Gait Re-analysis", "Maintenance Plan", "Ongoing Support"] },
];

export default function Method({ videos }: { videos: MethodVideos }) {
  return (
    <section id="method" className="relative py-24 sm:py-32" style={{ backgroundColor: "var(--section-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">The Process</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>How It Works</h2>
        </motion.div>
        <div className="mt-20 space-y-8">
          {stepData.map((step, index) => (
            <motion.div key={step.number} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7 }} className={`flex flex-col overflow-hidden rounded-3xl border border-card-border bg-card-bg ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
              <div className="relative w-full lg:w-1/2">
                <div className="aspect-video lg:aspect-auto lg:h-full">
                  <video autoPlay muted loop playsInline className="h-full w-full object-cover"><source src={videos[step.key]} type="video/mp4" /></video>
                </div>
                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-background" style={{ fontFamily: "var(--font-outfit)" }}>{step.number}</div>
              </div>
              <div className="flex w-full flex-col justify-center p-8 sm:p-10 lg:w-1/2 lg:p-14">
                <h3 className="text-3xl font-extrabold lg:text-4xl" style={{ fontFamily: "var(--font-outfit)" }}>{step.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">{step.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {step.tags.map((tag) => (<span key={tag} className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">{tag}</span>))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
