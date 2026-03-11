/* ============================================================
   VIDEO SHOWCASE - src/components/VideoShowcase.tsx
   ============================================================
   A cinematic grid gallery of your training videos.
   
   Layout:
   - Large featured video on the left
   - Smaller videos stacked in a grid on the right
   - Videos play on hover for an interactive feel
   - Click to expand a video into a modal/lightbox
   
   This section is key for a coaching website — clients
   want to SEE your training before they book.
   ============================================================ */

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Play, X, Volume2, VolumeX } from "lucide-react";

/* --- Video Data ---
   Each video has a src path, title, and category tag. */
const videos = [
  {
    src: "/videos/showcase-1.mp4",
    title: "Movement Correction",
    tag: "Training",
  },
  {
    src: "/videos/showcase-2.mp4",
    title: "Gait Pattern Work",
    tag: "Biomechanics",
  },
  {
    src: "/videos/showcase-3.mp4",
    title: "Postural Alignment",
    tag: "Posture",
  },
  {
    src: "/videos/showcase-4.mp4",
    title: "Functional Training",
    tag: "Training",
  },
  {
    src: "/videos/showcase-5.mp4",
    title: "Myofascial Release",
    tag: "Recovery",
  },
  {
    src: "/videos/showcase-6.mp4",
    title: "Core Integration",
    tag: "Training",
  },
];

/* --- VideoCard Component ---
   Individual video tile. Plays on hover, click opens lightbox. */
function VideoCard({
  video,
  className,
  onOpen,
}: {
  video: (typeof videos)[0];
  className?: string;
  onOpen: (src: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(video.src)}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      >
        <source src={video.src} type="video/mp4" />
      </video>

      {/* Hover overlay with play icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
        <div className="scale-0 rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
          <Play size={24} className="ml-0.5 text-white" fill="white" />
        </div>
      </div>

      {/* Bottom gradient with title */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4">
        <span className="mb-1 inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-medium text-primary">
          {video.tag}
        </span>
        <h4
          className="text-sm font-semibold text-white"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          {video.title}
        </h4>
      </div>
    </motion.div>
  );
}

export default function VideoShowcase() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <section id="showcase" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-sm font-medium tracking-widest text-primary">
              SEE IT IN ACTION
            </span>
            <h2
              className="mt-4 text-4xl font-bold sm:text-5xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Training Showcase
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              Real training sessions. Real movement correction.
              Hover to preview, click to watch full video.
            </p>
          </motion.div>

          {/* --- Video Grid ---
              Bento-style grid layout.
              First video is large (spans 2 rows), rest are smaller. */}
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Large featured video */}
            <VideoCard
              video={videos[0]}
              className="aspect-[3/4] sm:row-span-2"
              onOpen={setLightboxSrc}
            />
            {/* Smaller grid videos */}
            <VideoCard
              video={videos[1]}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
            <VideoCard
              video={videos[2]}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
            <VideoCard
              video={videos[3]}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
            <VideoCard
              video={videos[4]}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
          </div>

          {/* Second row - full width */}
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <VideoCard
              video={videos[5]}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
            <VideoCard
              video={{ src: "/videos/clip-1.mp4", title: "Quick Drill", tag: "Technique" }}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
            <VideoCard
              video={{ src: "/videos/clip-2.mp4", title: "Movement Flow", tag: "Training" }}
              className="aspect-video"
              onOpen={setLightboxSrc}
            />
          </div>
        </div>
      </section>

      {/* --- Video Lightbox (Modal) ---
          Opens when you click a video. Shows it large with audio controls.
          Click outside or the X button to close. */}
      {lightboxSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => { setLightboxSrc(null); setIsMuted(true); }}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => { setLightboxSrc(null); setIsMuted(true); }}
              className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>

            {/* Video player */}
            <video
              ref={lightboxVideoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full rounded-2xl"
            >
              <source src={lightboxSrc} type="video/mp4" />
            </video>

            {/* Mute/unmute toggle */}
            <button
              onClick={toggleMute}
              className="absolute bottom-4 right-4 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
