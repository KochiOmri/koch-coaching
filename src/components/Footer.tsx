/* ============================================================
   FOOTER COMPONENT - src/components/Footer.tsx
   ============================================================
   The footer appears at the bottom of every page.
   
   Contains:
   - Brand logo and tagline
   - Quick links to sections
   - Contact information
   - Social media links
   - Copyright notice
   
   Layout:
   - 4-column grid on desktop
   - Stacks vertically on mobile
   
   TODO: Update social media links with your real profiles
   ============================================================ */

"use client";

import Image from "next/image";
import { Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

/* --- Footer Links ---
   Quick navigation links in the footer. */
const quickLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Method", href: "#method" },
  { name: "Results", href: "#results" },
  { name: "Book Session", href: "#book" },
];

/* --- Social Media Links ---
   Update these href values with your actual social profiles! */
const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/koch.fp", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com/@koch.fp", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-card-border"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* --- Footer Grid ---
            4 columns on desktop, responsive on smaller screens. */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* --- Column 1: Brand ---
              Logo, brand name, and tagline. */}
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="KOCH Logo"
                width={35}
                height={35}
                className="brightness-0 invert dark:invert-0"
                style={{ filter: "var(--foreground) === '#f5f5f5' ? 'none' : 'invert(1)'" }}
              />
              <span
                className="text-lg font-bold tracking-[0.2em]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                KOCH
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Biomechanics-based coaching that addresses the root cause of
              pain and movement dysfunction. Move the way nature intended.
            </p>
            {/* Social media icons */}
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

          {/* --- Column 2: Quick Links --- */}
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
                  <a
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-primary"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Column 3: Contact Info ---
              Update these with your real contact details! */}
          <div>
            <h3
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              CONTACT
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="mailto:omrikochman@gmail.com"
                  className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
                >
                  <Mail size={14} />
                  omrikochman@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+972000000000"
                  className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
                >
                  <Phone size={14} />
                  +972 XXX-XXX-XXXX
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-sm text-muted">
                  <MapPin size={14} />
                  Israel
                </span>
              </li>
            </ul>
          </div>

          {/* --- Column 4: Training Hours ---
              Shows when you're available for sessions. */}
          <div>
            <h3
              className="text-sm font-semibold tracking-widest"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              TRAINING HOURS
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex justify-between">
                <span>Sunday - Thursday</span>
                <span>09:00 - 18:00</span>
              </li>
              <li className="flex justify-between">
                <span>Friday</span>
                <span>09:00 - 13:00</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- Copyright Bar ---
            Bottom of the footer with copyright and legal links. */}
        <div className="mt-12 border-t border-card-border pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted">
              &copy; {new Date().getFullYear()} KOCH Functional Patterns. All
              rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-muted">
              <a href="#" className="transition-colors hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-primary">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
