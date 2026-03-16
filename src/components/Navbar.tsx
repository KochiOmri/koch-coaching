/**
 * Navbar — Fixed top navigation with brand, links, theme toggle, and book button.
 *
 * Sticky nav that becomes blurred (backdrop-blur-xl) on scroll. Includes nav links, theme toggle
 * (light/dark via document class), and Book Session CTA. Mobile: hamburger menu with slide-down panel.
 * No CMS data — links and copy are static.
 *
 * CMS/Architecture: Standalone UI component. Nav links and labels are hardcoded; no CMS integration.
 */
"use client";

import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
const navLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Method", href: "#method" },
  { name: "Results", href: "#results" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    setIsDark(!document.documentElement.classList.contains("light"));
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
    setIsDark(!isDark);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg backdrop-blur-xl" : "backdrop-blur-sm"
      }`}
      style={{ backgroundColor: "var(--nav-bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <a
            href="#"
            className="text-sm font-bold tracking-[0.2em]"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            KOCH
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm tracking-wide text-muted transition-colors duration-200 hover:text-primary"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-card-bg"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="#book"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-primary-dark hover:shadow-lg"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Book Session
            </a>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-card-bg"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="border-t border-card-border backdrop-blur-xl md:hidden"
          style={{ backgroundColor: "var(--nav-bg)" }}
        >
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-sm text-muted transition-colors hover:bg-card-bg hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#book"
              className="mt-2 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-background"
              onClick={() => setIsOpen(false)}
            >
              Book Session
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
