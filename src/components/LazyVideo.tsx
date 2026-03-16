"use client";

import { useRef, useState, useEffect, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
  rootMargin?: string;
}

export default function LazyVideo({
  src,
  rootMargin = "200px",
  className,
  style,
  ...videoProps
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!isInView || !videoRef.current) return;
    const v = videoRef.current;

    const onReady = () => setIsLoaded(true);
    v.addEventListener("loadeddata", onReady);
    return () => v.removeEventListener("loadeddata", onReady);
  }, [isInView]);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`} style={style}>
      {/* Shimmer placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 overflow-hidden bg-neutral-900">
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      )}

      {isInView && (
        <video
          ref={videoRef}
          className={`h-full w-full ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}
          {...videoProps}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
