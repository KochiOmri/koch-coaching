"use client";

import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
import { heroVideo } from "@/lib/video-config";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={heroVideo.background} type="video/mp4" />
      </video>

      {/* Cinematic overlays: vignette + gradient from left */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      {/* Content aligned left for a cinematic look */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Functional Patterns Coach
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mt-8 text-[3.5rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Move the
            <br />
            Way{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Nature
            </span>
            <br />
            Intended
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg"
          >
            Biomechanics-based coaching that fixes the root cause
            of your pain. Not the symptoms.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#book"
              className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Book Free Session
            </a>
            <a
              href="#showcase"
              className="group flex items-center gap-3 px-2 py-4 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-all group-hover:border-amber-400 group-hover:bg-amber-400/10">
                <Play size={14} className="ml-0.5 text-white" fill="white" />
              </span>
              Watch Results
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a href="#about" className="flex flex-col items-center gap-2 text-white/30">
          <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
          <ArrowDown size={14} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
