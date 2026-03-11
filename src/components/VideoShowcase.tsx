"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";

interface ShowcaseVideo { src: string; title: string; tag: string }

export default function VideoShowcase({ videos }: { videos: ShowcaseVideo[] }) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => { if (lightboxVideoRef.current) { lightboxVideoRef.current.muted = !isMuted; setIsMuted(!isMuted); } };
  const scroll = (dir: "left" | "right") => { scrollRef.current?.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" }); };

  return (
    <>
      <section id="showcase" className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">See It In Action</span>
              <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>Training Showcase</h2>
            </motion.div>
            <div className="hidden gap-2 sm:flex">
              <button onClick={() => scroll("left")} className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll("right")} className="flex h-11 w-11 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>
        <div ref={scrollRef} className="mt-12 flex gap-5 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-12" style={{ scrollbarWidth: "none" }}>
          {videos.map((video, index) => (
            <motion.div key={video.src + index} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.08 }} className="group relative shrink-0 cursor-pointer overflow-hidden rounded-2xl" style={{ width: index === 0 ? "420px" : "320px" }} onClick={() => setLightboxSrc(video.src)}>
              <div className={index === 0 ? "aspect-[3/4]" : "aspect-[9/14]"}>
                <video autoPlay muted loop playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><source src={video.src} type="video/mp4" /></video>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="rounded-full bg-white/10 p-4 backdrop-blur-md">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <span className="inline-block rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm">{video.tag}</span>
                <h4 className="mt-2 text-base font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{video.title}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {lightboxSrc && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => { setLightboxSrc(null); setIsMuted(true); }}>
          <div className="relative w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { setLightboxSrc(null); setIsMuted(true); }} className="absolute -top-14 right-0 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20"><X size={20} /></button>
            <video ref={lightboxVideoRef} autoPlay loop muted={isMuted} playsInline className="w-full rounded-2xl"><source src={lightboxSrc} type="video/mp4" /></video>
            <button onClick={toggleMute} className="absolute bottom-4 right-4 rounded-full bg-black/60 p-3 text-white backdrop-blur-sm hover:bg-black/80">{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
          </div>
        </motion.div>
      )}
    </>
  );
}
