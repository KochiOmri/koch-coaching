"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";

export default function Hero({ videoSrc }: { videoSrc: string }) {
  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden">
      <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="flex items-center gap-5">
            <Image src="/logo.png" alt="KOCH" width={100} height={100} className="drop-shadow-[0_0_30px_rgba(212,168,67,0.15)]" />
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold tracking-[0.3em] text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-outfit)" }}>KOCH</span>
              <span className="mt-1 text-[11px] font-semibold tracking-[0.35em] text-amber-400/80 sm:text-xs">FUNCTIONAL PATTERNS</span>
            </div>
          </motion.div>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="mt-8 h-px w-32 origin-left bg-gradient-to-r from-amber-400/60 to-transparent" />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Move the Way <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Nature Intended</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.55 }} className="mt-5 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
            Biomechanics-based coaching that fixes the root cause of your pain. Not the symptoms.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7 }} className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#book" className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)]" style={{ fontFamily: "var(--font-outfit)" }}>Book Free Session</a>
            <a href="#showcase" className="group flex items-center gap-3 px-2 py-4 text-sm font-medium text-white/60 transition-colors hover:text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-all group-hover:border-amber-400 group-hover:bg-amber-400/10"><Play size={14} className="ml-0.5 text-white" fill="white" /></span>
              Watch Results
            </a>
          </motion.div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <a href="#about" className="flex flex-col items-center gap-2 text-white/30"><span className="text-[10px] tracking-[0.3em]">SCROLL</span><ArrowDown size={14} className="animate-bounce" /></a>
      </motion.div>
    </section>
  );
}
