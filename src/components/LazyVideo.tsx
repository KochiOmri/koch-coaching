"use client";

import { useRef, useState, useEffect, useCallback, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
  rootMargin?: string;
  /** Show a static frame instead of autoplay on mobile */
  mobilePoster?: boolean;
}

const MAX_CONCURRENT_MOBILE = 2;
let activeMobileVideos = 0;

export default function LazyVideo({
  src,
  rootMargin = "100px",
  className,
  style,
  mobilePoster = true,
  ...videoProps
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // Observe visibility: load when near viewport, pause when far away
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Play/pause based on visibility + mobile concurrency limit
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isLoaded) return;

    if (isInView) {
      if (isMobile && activeMobileVideos >= MAX_CONCURRENT_MOBILE) {
        v.pause();
        setIsPlaying(false);
        return;
      }
      v.play().then(() => {
        setIsPlaying(true);
        if (isMobile) activeMobileVideos++;
      }).catch(() => {});
    } else {
      if (isPlaying) {
        v.pause();
        setIsPlaying(false);
        if (isMobile) activeMobileVideos = Math.max(0, activeMobileVideos - 1);
      }
    }

    return () => {
      if (isPlaying && isMobile) {
        activeMobileVideos = Math.max(0, activeMobileVideos - 1);
      }
    };
  }, [isInView, isLoaded, isMobile]);

  const onReady = useCallback(() => setIsLoaded(true), []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`} style={style}>
      {/* Simple solid placeholder instead of shimmer animation */}
      {!isLoaded && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "var(--card-bg, #1a1a1a)" }}
        />
      )}

      {isInView && (
        <video
          ref={videoRef}
          className={`h-full w-full ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          onLoadedData={onReady}
          preload={isMobile ? "metadata" : "auto"}
          {...videoProps}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
