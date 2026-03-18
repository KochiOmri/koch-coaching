/**
 * About — Coach introduction section with portrait video and stats grid.
 *
 * Two-column layout: portrait video on the left (9:16 aspect), text and stats on the right.
 * Stats use a fixed icon mapping (Users, Clock, Award, Target). All copy and stat values
 * come from the CMS.
 *
 * CMS/Architecture: Receives `videoSrc` and `content` (tagline, headline, headlineAccent,
 * paragraphs, stats) from the page data layer.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Users, Clock, Target } from "lucide-react";
import LazyVideo from "./LazyVideo";

const iconMap: Record<string, typeof Award> = { Users, Clock, Award, Target };

interface AboutContent {
  tagline: string;
  headline: string;
  headlineAccent: string;
  paragraphs: string[];
  stats: Array<{ value: string; label: string }>;
}

const defaultIcons = ["Users", "Clock", "Award", "Target"];

export default function About({ videoSrc, content }: { videoSrc: string; content: AboutContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 sm:py-32"
      style={{ backgroundColor: "var(--section-alt)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div
            className="flex justify-center transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div className="relative w-full max-w-[360px] overflow-hidden rounded-3xl border border-card-border shadow-2xl shadow-primary/5">
              <LazyVideo
                src={videoSrc}
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
                style={{ aspectRatio: "9/16" }}
              />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
            </div>
          </div>

          <div
            className="transition-all duration-700 delay-100"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{content.tagline}</span>
            <h2
              className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {content.headline} <span className="text-primary">{content.headlineAccent}</span>
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              {content.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {content.stats.map((stat, index) => {
                const Icon = iconMap[defaultIcons[index]] || Award;
                const delayClass = ["delay-0", "delay-100", "delay-200", "delay-300"][index] ?? "delay-0";
                return (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border border-card-border bg-card-bg p-5 text-center transition-all duration-700 ${delayClass} hover:border-primary/30`}
                    style={{
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
                    }}
                  >
                    <Icon size={24} className="mx-auto text-primary" />
                    <div className="mt-2 text-2xl font-extrabold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs text-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
