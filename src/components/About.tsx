"use client";

import { motion } from "framer-motion";
import { Award, Users, Clock, Target } from "lucide-react";

const stats = [
  { icon: Users, value: "100+", label: "Clients Trained" },
  { icon: Clock, value: "1000+", label: "Training Hours" },
  { icon: Award, value: "HF", label: "Certified" },
  { icon: Target, value: "95%", label: "Pain Reduction" },
];

export default function About({ videoSrc }: { videoSrc: string }) {
  return (
    <section id="about" className="relative py-24 sm:py-32" style={{ backgroundColor: "var(--section-alt)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative overflow-hidden rounded-3xl">
          <div className="aspect-[21/9] sm:aspect-[2.4/1]">
            <video autoPlay muted loop playsInline className="h-full w-full object-cover"><source src={videoSrc} type="video/mp4" /></video>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 flex items-center p-8 sm:p-12 lg:p-16">
            <div className="max-w-lg">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">About Your Coach</span>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-outfit)" }}>
                The Science of <span className="text-primary">Movement</span>
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">
                Certified Functional Patterns practitioner specializing in correcting dysfunctional movement patterns through biomechanics and evolutionary biology.
              </p>
            </div>
          </div>
        </motion.div>
        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-start">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h3 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>Helping You Move Better, <span className="text-primary">Feel Better</span></h3>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              <p>Unlike traditional training methods, Functional Patterns is rooted in biomechanics and evolutionary biology. We train the way humans are designed to move — walking, running, throwing, and rotating — to create lasting structural changes.</p>
              <p>My mission is to help you understand your body at a deeper level and give you the tools to move pain-free for the rest of your life.</p>
            </div>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: index * 0.1 }} className="rounded-2xl border border-card-border bg-card-bg p-6 text-center transition-all duration-300 hover:border-primary/30">
                <stat.icon size={28} className="mx-auto text-primary" />
                <div className="mt-3 text-3xl font-extrabold" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</div>
                <div className="mt-1 text-xs text-muted">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
