/**
 * Footer — Site footer with contact info, social links, quick links, and newsletter.
 *
 * Four-column layout: brand + social, quick links, contact (email, phone, location) + NewsletterSignup,
 * training hours. Logo switches dark/light via theme detection. Contact data and hours come from CMS.
 *
 * CMS/Architecture: Receives `content` (email, phone, phoneRaw, location, instagramHandle,
 * youtubeHandle, hours) from CMS. NewsletterSignup is a child component that posts to /api/newsletter.
 */
"use client";

import Image from "next/image";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import NewsletterSignup from "./NewsletterSignup";

interface ContactContent {
  email: string;
  phone: string;
  phoneRaw: string;
  location: string;
  instagramHandle: string;
  youtubeHandle: string;
  hours: Array<{ days: string; time: string }>;
}

const quickLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Method", href: "#method" },
  { name: "Results", href: "#results" },
  { name: "Book Session", href: "#book" },
  { name: "Client Portal", href: "/portal/login" },
];

const defaultContent: ContactContent = {
  email: "omrikochman@gmail.com",
  phone: "+972 XXX-XXX-XXXX",
  phoneRaw: "+972000000000",
  location: "Israel",
  instagramHandle: "koch.fp",
  youtubeHandle: "koch.fp",
  hours: [
    { days: "Sunday - Thursday", time: "09:00 - 18:00" },
    { days: "Friday", time: "09:00 - 13:00" },
    { days: "Saturday", time: "Closed" },
  ],
};

export default function Footer({ content = defaultContent }: { content?: ContactContent }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const check = () => setIsDark(!document.documentElement.classList.contains("light"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const socialLinks = [
    { icon: Instagram, href: `https://instagram.com/${content.instagramHandle}`, label: "Instagram" },
    { icon: Youtube, href: `https://youtube.com/@${content.youtubeHandle}`, label: "YouTube" },
  ];

  return (
    <footer
      id="contact"
      className="border-t border-card-border"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-4">
              <Image
                src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
                alt="KOCH Logo"
                width={50}
                height={50}
                loading="lazy"
              />
              <div className="flex flex-col">
                <span
                  className="text-xl font-extrabold tracking-[0.25em]"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  KOCH
                </span>
                <span className="text-[10px] tracking-[0.2em] text-muted">
                  FUNCTIONAL PATTERNS
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Biomechanics-based coaching that addresses the root cause of
              pain and movement dysfunction. Move the way nature intended.
            </p>
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-card-border transition-all hover:border-primary hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              QUICK LINKS
            </h3>
            <ul className="mt-4 space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-sm text-muted transition-colors hover:text-primary">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              CONTACT
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={`mailto:${content.email}`} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
                  <Mail size={14} />
                  {content.email}
                </a>
              </li>
              <li>
                <a href={`tel:${content.phoneRaw}`} className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary">
                  <Phone size={14} />
                  {content.phone}
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={14} />
                  {content.location}
                </span>
              </li>
            </ul>

            <div className="mt-6">
              <NewsletterSignup />
            </div>
          </div>

          <div>
            <h3
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              TRAINING HOURS
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              {content.hours.map((h) => (
                <li key={h.days} className="flex justify-between">
                  <span>{h.days}</span>
                  <span>{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-card-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} KOCH Functional Patterns. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted">
              <a href="#" className="transition-colors hover:text-primary">Privacy Policy</a>
              <a href="#" className="transition-colors hover:text-primary">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
