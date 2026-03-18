/**
 * Results — Client transformations with video cards and testimonial carousel.
 *
 * Top: 4 video cards in a grid (src, title, description per video). Below: testimonial carousel
 * with prev/next buttons and dot indicators. Testimonials show quote, avatar, name, issue, and stars.
 *
 * CMS/Architecture: Receives `videos` (array of ResultVideo) and `testimonials` from CMS.
 * Video metadata and testimonial text are fully CMS-driven.
 */
"use client";

import { useRef, useEffect, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import LazyVideo from "./LazyVideo";

interface ResultVideo {
  src: string;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  initials: string;
  issue: string;
  quote: string;
  rating: number;
  color: string;
}

export default function Results({ videos, testimonials }: { videos: ResultVideo[]; testimonials: Testimonial[] }) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const next = () => setActiveTestimonial((p) => (p + 1) % testimonials.length);
  const prev = () => setActiveTestimonial((p) => (p - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="results" ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease",
            transitionDelay: "0.2s",
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Real Results</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
            Client Transformations
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {videos.slice(0, 4).map((video, index) => (
            <div
              key={video.src + index}
              className="group relative overflow-hidden rounded-2xl border border-card-border bg-black transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.7s ease",
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <LazyVideo
                src={video.src}
                autoPlay
                muted
                loop
                playsInline
                className="w-full"
                style={{ aspectRatio: "9/16" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3 className="text-sm font-bold text-white sm:text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
                  {video.title}
                </h3>
                <p className="mt-1 text-[11px] text-white/60 sm:text-xs">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {testimonials.length > 0 && (
          <div className="mt-20">
            <div
              className="text-center transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: "all 0.7s ease",
                transitionDelay: "0.4s",
              }}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Testimonials</span>
              <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
                What Clients Say
              </h3>
            </div>

            <div className="relative mx-auto mt-12 max-w-2xl">
              <div className="overflow-hidden rounded-3xl border border-card-border bg-card-bg p-8 sm:p-12">
                <Quote size={40} className="text-primary/20" />
                <p
                  className="mt-6 text-lg leading-relaxed sm:text-xl"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: testimonials[activeTestimonial].color }}
                  >
                    {testimonials[activeTestimonial].initials}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-sm text-muted">{testimonials[activeTestimonial].issue}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                      <Star key={i} size={16} className="fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={prev}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: i === activeTestimonial ? "24px" : "8px",
                        backgroundColor: i === activeTestimonial ? "var(--primary)" : "var(--card-border)",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
