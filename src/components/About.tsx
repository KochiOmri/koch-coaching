/* ============================================================
   ABOUT SECTION - src/components/About.tsx
   ============================================================
   This section introduces you (the coach) and explains what
   Functional Patterns is.
   
   Layout:
   - Left side: Image placeholder (replace with your photo)
   - Right side: Text content with stats
   
   Features:
   - Scroll-triggered animations (elements animate in as you scroll)
   - Key statistics displayed in a grid
   - Responsive: stacks vertically on mobile, side-by-side on desktop
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { Award, Users, Clock, Target } from "lucide-react";

/* --- Statistics Data ---
   These numbers appear in the stats grid below the about text.
   Update these with your real numbers as you grow! */
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
        {/* --- Section Header ---
            Small label + big title, centered above the content. */}
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

        {/* --- Two-Column Layout ---
            On mobile: stacks vertically (flex-col)
            On desktop (lg): sits side by side (lg:flex-row) */}
        <div className="mt-16 flex flex-col items-center gap-16 lg:flex-row">
          
          {/* --- Left Column: Coach Photo ---
              Replace the placeholder with your actual photo.
              The border and glow effect frame the image nicely. */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2"
          >
            <div className="relative">
              {/* Image placeholder - replace src with your photo */}
              <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-card-border bg-card-bg">
                {/* REPLACE THIS with an actual Image component:
                    <Image src="/images/coach.jpg" alt="Koch - Your Coach" fill className="object-cover" />
                    
                    For now, showing a placeholder with text: */}
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="text-6xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>
                    KOCH
                  </div>
                  <p className="text-sm text-muted">
                    Add your coaching photo here
                    <br />
                    (public/images/coach.jpg)
                  </p>
                </div>
              </div>
              {/* Decorative glow behind the image */}
              <div className="absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
            </div>
          </motion.div>

          {/* --- Right Column: About Text ---
              Your story and what makes your coaching unique.
              UPDATE THIS with your real bio! */}
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

            {/* --- Stats Grid ---
                Four key numbers displayed in a 2x2 grid.
                Each stat has an icon, number, and label. */}
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
