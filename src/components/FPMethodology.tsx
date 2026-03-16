"use client";

import { motion } from "framer-motion";
import { Activity, Search, Footprints, Link, CheckCircle } from "lucide-react";

const iconMap: Record<string, typeof Activity> = {
  activity: Activity,
  search: Search,
  footprints: Footprints,
  link: Link,
};

interface FPContentData {
  tagline: string;
  headline: string;
  description: string;
  principles: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  evidence: string[];
}

export default function FPMethodology({ content }: { content: FPContentData }) {
  return (
    <section
      id="methodology"
      className="relative overflow-hidden py-24 lg:py-32"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span
            className="text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--primary)" }}
          >
            {content.tagline}
          </span>
          <h2
            className="mt-4 font-outfit text-4xl font-bold md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            {content.headline}
          </h2>
          <p
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed"
            style={{ color: "var(--muted)" }}
          >
            {content.description}
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {content.principles.map((principle, index) => {
            const Icon = iconMap[principle.icon] || Activity;
            return (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border p-8 transition-all duration-300 hover:border-transparent"
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                }}
              >
                <div className="relative">
                  <div
                    className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "color-mix(in srgb, var(--primary) 15%, transparent)" }}
                  >
                    <span style={{ color: "var(--primary)" }}>
                      <Icon className="h-7 w-7" />
                    </span>
                  </div>
                  <h3
                    className="font-outfit text-xl font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {principle.title}
                  </h3>
                  <p className="mt-3 leading-relaxed" style={{ color: "var(--muted)" }}>
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 rounded-2xl border p-8 md:p-12"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
          }}
        >
          <h3
            className="mb-8 text-center font-outfit text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Evidence-Based Results
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {content.evidence.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--primary)" }}>
                  <CheckCircle className="h-5 w-5" />
                </span>
                <span style={{ color: "var(--muted)" }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
