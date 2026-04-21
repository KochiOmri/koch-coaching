/**
 * VideoShowcase — Horizontally scrolling filmstrip of training videos with lightbox.
 *
 * Snap-scroll row of video cards. Click opens fullscreen lightbox with mute toggle. Scroll
 * indicators (gradient fades) and chevron buttons show when more content is available.
 * Supports touch-swipe and mouse scroll.
 *
 * CMS/Architecture: Receives `videos` array (src, title, tag) from page/video config.
 * Video URLs and metadata are passed in; no direct CMS fetch.
 */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import LazyVideo from "./LazyVideo";

interface ShowcaseVideo {
  src: string;
  title: string;
  tag: string;
}

export default function VideoShowcase({ videos }: { videos: ShowcaseVideo[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const toggleMute = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsSectionVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (lightboxSrc) {
      const timer = requestAnimationFrame(() => setIsLightboxVisible(true));
      return () => cancelAnimationFrame(timer);
    } else {
      setIsLightboxVisible(false);
    }
  }, [lightboxSrc]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -350 : 350,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section ref={sectionRef} id="showcase" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div
              className={`transition-all duration-700 ${
                isSectionVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                See It In Action
              </span>
              <h2
                className="mt-3 text-4xl font-extrabold sm:text-5xl"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Training Showcase
              </h2>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll fade indicators */}
        {canScrollLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16" style={{ background: "linear-gradient(to right, var(--background), transparent)" }} />
        )}
        {canScrollRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16" style={{ background: "linear-gradient(to left, var(--background), transparent)" }} />
        )}

        <div
          ref={scrollRef}
          className="mx-auto mt-12 flex max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
        >
          {videos.map((video, index) => (
            <div
              key={video.src + index}
              className="group relative shrink-0 cursor-pointer snap-start overflow-hidden rounded-2xl border border-card-border bg-black transition-all duration-700"
              style={{
                width: "280px",
                opacity: isSectionVisible ? 1 : 0,
                transform: isSectionVisible ? "translateX(0)" : "translateX(40px)",
                transitionDelay: isSectionVisible ? `${index * 80}ms` : "0ms",
              }}
              onClick={() => setLightboxSrc(video.src)}
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

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div
                  className="rounded-full p-4"
                  style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span
                  className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                  {video.tag}
                </span>
                <h4 className="mt-2 text-base font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                  {video.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-700"
          style={{
            backgroundColor: "rgba(0,0,0,0.95)",
            opacity: isLightboxVisible ? 1 : 0,
          }}
          onClick={() => {
            setLightboxSrc(null);
            setIsMuted(true);
          }}
        >
          <div className="relative flex max-h-[90vh] justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setLightboxSrc(null);
                setIsMuted(true);
              }}
              className="absolute -top-14 right-0 rounded-full p-2.5 text-white transition-colors hover:bg-white/20"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <X size={20} />
            </button>
            <video
              ref={lightboxVideoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="max-h-[85vh] rounded-2xl"
            >
              <source src={lightboxSrc} type="video/mp4" />
            </video>
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 rounded-full p-3 text-white transition-colors hover:bg-black/80"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
