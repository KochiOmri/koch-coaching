"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Method", href: "#method" },
  { name: "Results", href: "#results" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "#contact" },
];

const portalLinks = [
  { name: "Client Portal", href: "/portal/login" },
  { name: "Admin", href: "/admin/login" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== 'undefined' ? !document.documentElement.classList.contains("light") : true
  );
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (isDark) html.classList.add("light");
    else html.classList.remove("light");
    setIsDark(!isDark);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "shadow-lg" : ""
      }`}
      style={{
        backgroundColor: scrolled
          ? "var(--nav-bg-solid, var(--background))"
          : "var(--nav-bg)",
      }}
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
                className="text-sm tracking-wide transition-colors duration-200"
                style={{ color: "var(--muted)", fontFamily: "var(--font-outfit)" }}
              >
                {link.name}
              </a>
            ))}
            {portalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm tracking-wide transition-colors duration-200"
                style={{ color: "var(--muted)", fontFamily: "var(--font-outfit)" }}
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a
              href="#book"
              className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--background)",
                fontFamily: "var(--font-outfit)",
              }}
            >
              Book Session
            </a>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="border-t md:hidden"
          style={{
            backgroundColor: "var(--background)",
            borderColor: "var(--card-border)",
          }}
        >
          <div className="space-y-1 px-4 py-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-sm transition-colors"
                style={{ color: "var(--muted)" }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            {portalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block rounded-lg px-4 py-3 text-sm transition-colors"
                style={{ color: "var(--muted)" }}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="#book"
              className="mt-2 block rounded-full py-3 text-center text-sm font-semibold"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
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
