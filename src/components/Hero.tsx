/**
 * Hero — Landing section with video background, logo, headline, and CTA buttons.
 *
 * Renders the full-viewport hero: left-aligned content (logo, headline, subheadline, primary/secondary CTAs)
 * and a video on the right with gradient overlays. Uses theme detection (MutationObserver on document class)
 * to swap between dark/light logos. All text comes from the CMS via the `content` prop.
 *
 * CMS/Architecture: Receives `videoSrc` and `content` (headline, headlineAccent, subheadline, ctaText,
 * secondaryCtaText) from the page data layer. Video is configured separately from content.
 */
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
import { useState, useEffect } from "react";

interface HeroContent {
  headline: string;
  headlineAccent: string;
  subheadline: string;
  ctaText: string;
  secondaryCtaText: string;
}

export default function Hero({ videoSrc, content }: { videoSrc: string; content: HeroContent }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--hero-bg)" }}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 z-[2]" style={{ background: "var(--hero-gradient-h)" }} />
        <div className="absolute inset-0 z-[2]" style={{ background: "var(--hero-gradient-v)" }} />
        <div className="flex h-full w-full items-center justify-end">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full object-contain ml-auto"
            style={{ maxHeight: "100vh" }}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-start"
            >
              <Image
                src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
                alt="KOCH Functional Patterns"
                width={220}
                height={220}
                priority
              />
              <span
                className="mt-4 text-[11px] font-semibold tracking-[0.4em] sm:text-xs"
                style={{ color: "var(--primary)", opacity: 0.8 }}
              >
                FUNCTIONAL PATTERNS
              </span>
            </motion.div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 h-px w-40 origin-left bg-primary/60"
            />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-outfit)", color: "var(--hero-text)" }}
            >
              {content.headline}{" "}
              <span className="text-primary">{content.headlineAccent}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65 }}
              className="mt-5 max-w-md text-sm leading-relaxed sm:text-base"
              style={{ color: "var(--hero-text-sub)" }}
            >
              {content.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#book"
                className="rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wider text-background transition-all duration-300 hover:bg-primary-dark hover:shadow-lg"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {content.ctaText}
              </a>
              <a
                href="#showcase"
                className="group flex items-center gap-3 px-2 py-4 text-sm font-medium transition-colors"
                style={{ color: "var(--hero-text-sub)" }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full border transition-all group-hover:border-primary group-hover:bg-primary/10"
                  style={{ borderColor: "var(--hero-btn-border)" }}
                >
                  <Play size={14} className="ml-0.5" style={{ color: "var(--hero-text)" }} fill="var(--hero-text)" />
                </span>
                {content.secondaryCtaText}
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <a href="#about" className="flex flex-col items-center gap-2" style={{ color: "var(--hero-scroll)" }}>
          <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
          <ArrowDown size={14} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
