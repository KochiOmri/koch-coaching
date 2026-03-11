"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface ResultVideo { src: string; title: string; description: string }

const testimonials = [
  { name: "David M.", issue: "Chronic Lower Back Pain", quote: "After 10 years of back pain and trying everything, Koch's approach was the first thing that actually addressed WHY I was in pain. 3 months later — pain-free.", rating: 5 },
  { name: "Sarah K.", issue: "Poor Posture & Neck Pain", quote: "Koch didn't just give me exercises — he taught me HOW my body should actually move. The change has been incredible.", rating: 5 },
  { name: "Mike R.", issue: "Athletic Performance", quote: "Functional Patterns showed me my gait was completely dysfunctional. After correcting my patterns, I'm running faster with zero injuries.", rating: 5 },
];

export default function Results({ videos }: { videos: ResultVideo[] }) {
  return (
    <section id="results" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Real Results</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>Client Transformations</h2>
        </motion.div>
        <div className="mt-16 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            {videos.slice(0, 2).map((video, index) => (
              <motion.div key={video.src + index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group relative overflow-hidden rounded-2xl">
                <div className="aspect-[4/3]"><video autoPlay muted loop playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><source src={video.src} type="video/mp4" /></video></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white sm:text-2xl" style={{ fontFamily: "var(--font-outfit)" }}>{video.title}</h3>
                  <p className="mt-1 text-sm text-white/60">{video.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="grid gap-5 sm:grid-cols-2">
            {videos.slice(2, 4).map((video, index) => (
              <div key={video.src + index} className="group relative overflow-hidden rounded-2xl">
                <div className="aspect-video"><video autoPlay muted loop playsInline className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"><source src={video.src} type="video/mp4" /></video></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{video.title}</h3>
                  <p className="mt-1 text-xs text-white/60">{video.description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative rounded-2xl border border-card-border bg-card-bg p-7 transition-all duration-300 hover:border-primary/20">
              <Quote size={28} className="text-primary/20" />
              <p className="mt-4 text-sm leading-relaxed text-muted">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center justify-between">
                <div><div className="text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>{t.name}</div><div className="text-[11px] text-muted">{t.issue}</div></div>
                <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => (<Star key={i} size={12} className="fill-primary text-primary" />))}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
