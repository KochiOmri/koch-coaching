/* ============================================================
   HERO SECTION - src/components/Hero.tsx
   ============================================================
   Full-screen landing section with your real video playing
   in the background. The video autoplays, loops, and is muted
   so it works on all browsers (browsers block autoplay with sound).
   
   A dark overlay sits on top of the video so the white text
   remains readable. The content fades in with animations.
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
import { heroVideo } from "@/lib/video-config";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* --- Real Video Background ---
          Your coaching video plays fullscreen behind everything.
          object-cover = fills the entire section (may crop edges).
          playsInline = prevents fullscreen on mobile Safari. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={heroVideo.background} type="video/mp4" />
      </video>

      {/* --- Dark Overlay ---
          A gradient overlay over the video for text readability.
          Goes from very dark at top/bottom to slightly transparent in center
          so you can still see the video movement. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80" />

      {/* Subtle animated grid pattern for extra visual texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,168,67,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,168,67,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* --- Hero Content --- */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-white backdrop-blur-sm">
            BIOMECHANICS-BASED TRAINING
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Move the Way
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
            Nature Intended
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70 sm:text-xl"
        >
          Functional Patterns coaching that addresses the root cause of
          your pain and movement dysfunction. Realign your body through
          the science of biomechanics.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#book"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 text-sm font-semibold tracking-wide text-black transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            START YOUR TRANSFORMATION
            <ArrowDown
              size={16}
              className="transition-transform group-hover:translate-y-0.5"
            />
          </a>

          <a
            href="#showcase"
            className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <Play size={16} />
            WATCH RESULTS
          </a>
        </motion.div>
      </div>

      {/* --- Scroll Indicator --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-white/40 transition-colors hover:text-white/70"
        >
          <span className="text-xs tracking-widest">SCROLL</span>
          <ArrowDown size={16} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
