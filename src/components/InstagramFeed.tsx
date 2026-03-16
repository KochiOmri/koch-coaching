/**
 * InstagramFeed — Instagram feed placeholder section with video grid.
 *
 * Displays a grid of video posts with hover overlay linking to Instagram. Handle is shown
 * as section headline. Posts are currently hardcoded; grid links to the profile.
 *
 * CMS/Architecture: Receives `handle` from CMS. Post content (videos, captions) is static
 * for now; handle drives the link to instagram.com/{handle}.
 */
"use client";

import { motion } from "framer-motion";
import { Instagram, ExternalLink } from "lucide-react";
import LazyVideo from "./LazyVideo";

const posts = [
  { id: 1, caption: "Posture transformation after 8 weeks of FP training", video: "/videos/vid-01.mp4" },
  { id: 2, caption: "Gait pattern analysis and correction session", video: "/videos/vid-03.mp4" },
  { id: 3, caption: "Biomechanics assessment - understanding your movement", video: "/videos/vid-06.mp4" },
  { id: 4, caption: "Results speak for themselves. Another client pain-free", video: "/videos/vid-08.mp4" },
];

export default function InstagramFeed({ handle }: { handle: string }) {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Follow The Journey</span>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
            @{handle}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Follow my Instagram for daily movement tips, client transformations, and biomechanics breakdowns.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {posts.map((post, index) => (
            <motion.a
              key={post.id}
              href={`https://instagram.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-card-border"
            >
              <div style={{ aspectRatio: "1/1" }} className="overflow-hidden bg-black">
                <LazyVideo
                  src={post.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                <div className="flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Instagram size={28} className="text-white" />
                  <span className="text-xs font-medium text-white">View on Instagram</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-card-border px-6 py-3 text-sm font-medium transition-all hover:border-primary hover:text-primary"
          >
            <Instagram size={16} />
            Follow @{handle}
            <ExternalLink size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
