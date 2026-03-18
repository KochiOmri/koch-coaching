"use client";

import Image from "next/image";
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
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    // Stagger content appearance for smooth load
    requestAnimationFrame(() => setReady(true));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "var(--hero-bg)" }}
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 z-[2]" style={{ background: "var(--hero-gradient-h)" }} />
        <div className="absolute inset-0 z-[2]" style={{ background: "var(--hero-gradient-v)" }} />
        <div className="flex h-full w-full items-center justify-end">
          {isMobile ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full object-contain ml-auto"
              style={{ maxHeight: "100vh" }}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
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
          )}
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12">
          <div className="max-w-xl">
            <div
              className="flex flex-col items-start transition-all duration-700"
              style={{ opacity: ready ? 1 : 0, transform: ready ? "scale(1)" : "scale(0.9)" }}
            >
              <Image
                src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
                alt="KOCH Functional Patterns"
                width={isMobile ? 150 : 220}
                height={isMobile ? 150 : 220}
                priority
              />
              <span
                className="mt-4 text-[11px] font-semibold tracking-[0.4em] sm:text-xs"
                style={{ color: "var(--primary)", opacity: 0.8 }}
              >
                FUNCTIONAL PATTERNS
              </span>
            </div>

            <div
              className="mt-8 h-px w-40 origin-left transition-transform duration-700 delay-200"
              style={{
                backgroundColor: "var(--primary)",
                opacity: 0.6,
                transform: ready ? "scaleX(1)" : "scaleX(0)",
              }}
            />

            <h1
              className="mt-8 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl transition-all duration-700 delay-300"
              style={{
                fontFamily: "var(--font-outfit)",
                color: "var(--hero-text)",
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(16px)",
              }}
            >
              {content.headline}{" "}
              <span style={{ color: "var(--primary)" }}>{content.headlineAccent}</span>
            </h1>

            <p
              className="mt-5 max-w-md text-sm leading-relaxed sm:text-base transition-all duration-700 delay-500"
              style={{
                color: "var(--hero-text-sub)",
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(16px)",
              }}
            >
              {content.subheadline}
            </p>

            <div
              className="mt-10 flex flex-wrap items-center gap-4 transition-all duration-700 delay-700"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <a
                href="#book"
                className="rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                  fontFamily: "var(--font-outfit)",
                }}
              >
                {content.ctaText}
              </a>
              <a
                href="#showcase"
                className="group flex items-center gap-3 px-2 py-4 text-sm font-medium transition-colors"
                style={{ color: "var(--hero-text-sub)" }}
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-full border transition-all group-hover:border-primary"
                  style={{ borderColor: "var(--hero-btn-border)" }}
                >
                  <Play size={14} className="ml-0.5" style={{ color: "var(--hero-text)" }} fill="var(--hero-text)" />
                </span>
                {content.secondaryCtaText}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-700 delay-1000"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <a href="#about" className="flex flex-col items-center gap-2" style={{ color: "var(--hero-scroll)" }}>
          <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
          <ArrowDown size={14} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}
