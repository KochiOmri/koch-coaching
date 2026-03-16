/**
 * SITE CONTENT — CMS data layer for all website copy
 *
 * WHAT IT DOES:
 * Reads and writes all text content from data/site-content.json. Every section of
 * the main page pulls its copy from here: hero, about, services, method, testimonials,
 * and contact. No hardcoded headlines or paragraphs in components.
 *
 * ARCHITECTURE:
 * - Single JSON file as the content store (file-based CMS, no database)
 * - Used by: page components via getSiteContent(), admin UI via saveSiteContent()
 * - Mirrors the structure of video-config.ts — both live under data/
 *
 * DEV PLAN:
 * - Admin UI edits this JSON to update copy without deploying
 * - Add new sections by extending the SiteContent interface and the JSON schema
 * - Consider validation (e.g. Zod) before save to catch malformed content
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_PATH = path.join(DATA_DIR, "site-content.json");
const DATA_PATH_HE = path.join(DATA_DIR, "site-content-he.json");

export interface SiteContent {
  hero: {
    headline: string;
    headlineAccent: string;
    subheadline: string;
    ctaText: string;
    secondaryCtaText: string;
  };
  about: {
    tagline: string;
    headline: string;
    headlineAccent: string;
    paragraphs: string[];
    stats: Array<{ value: string; label: string }>;
  };
  fpContent: {
    tagline: string;
    headline: string;
    description: string;
    principles: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    evidence: string[];
  };
  services: {
    tagline: string;
    headline: string;
    subheadline: string;
    items: Array<{
      title: string;
      description: string;
      features: string[];
      price: string;
      featured: boolean;
    }>;
  };
  method: {
    tagline: string;
    headline: string;
    steps: Array<{
      number: string;
      title: string;
      description: string;
      tags: string[];
    }>;
  };
  testimonials: Array<{
    name: string;
    initials: string;
    issue: string;
    quote: string;
    rating: number;
    color: string;
  }>;
  contact: {
    email: string;
    phone: string;
    phoneRaw: string;
    location: string;
    whatsappNumber: string;
    whatsappMessage: string;
    instagramHandle: string;
    youtubeHandle: string;
    hours: Array<{ days: string; time: string }>;
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSiteContent(locale: "en" | "he" = "en"): SiteContent {
  const filePath = locale === "he" ? DATA_PATH_HE : DATA_PATH;
  if (!fs.existsSync(filePath)) {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function saveSiteContent(content: SiteContent): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(content, null, 2));
}
