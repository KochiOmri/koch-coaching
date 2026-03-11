/* ============================================================
   ABOUT SECTION - src/components/About.tsx
   ============================================================
   Introduces you as a coach with a real video of you training.
   Left side shows a looping video, right side shows your bio.
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { Award, Users, Clock, Target } from "lucide-react";

const stats = [
  { icon: Users, value: "100+", label: "Clients Trained" },
  { icon: Clock, value: "1000+", label: "Training Hours" },
  { icon: Award, value: "HF", label: "Certified" },
  { icon: Target, value: "95%", label: "Pain Reduction" },
];

export default function About() {
  return (
    <section
      id="about"
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
            ABOUT YOUR COACH
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            The Science of Movement
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="mt-16 flex flex-col items-center gap-16 lg:flex-row">
          
          {/* Left: Video of you coaching */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-card-border">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                >
                  <source src="/videos/about.mp4" type="video/mp4" />
                </video>
              </div>
              {/* Decorative glow */}
              <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
              {/* Floating badge on the video */}
              <div className="absolute -bottom-4 -right-4 rounded-xl border border-card-border bg-card-bg px-4 py-3 shadow-xl sm:bottom-6 sm:right-6">
                <div className="text-xs font-medium text-muted">Certified</div>
                <div className="text-lg font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>
                  Functional Patterns
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Bio text + stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <h3
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Helping You Move Better,{" "}
              <span className="text-primary">Feel Better</span>
            </h3>

            <div className="mt-6 space-y-4 text-muted">
              <p>
                As a certified Functional Patterns practitioner, I specialize in
                correcting dysfunctional movement patterns that cause chronic
                pain, poor posture, and limited mobility.
              </p>
              <p>
                Unlike traditional training methods, Functional Patterns is
                rooted in biomechanics and evolutionary biology. We train the way
                humans are designed to move — walking, running, throwing, and
                rotating — to create lasting structural changes.
              </p>
              <p>
                My mission is to help you understand your body at a deeper level
                and give you the tools to move pain-free for the rest of your
                life.
              </p>
            </div>

            {/* Stats grid */}
            <div className="mt-10 grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-xl border border-card-border bg-card-bg p-5"
                >
                  <stat.icon size={24} className="text-primary" />
                  <div
                    className="mt-2 text-2xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
