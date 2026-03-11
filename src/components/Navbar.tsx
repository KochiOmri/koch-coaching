/* ============================================================
   NAVBAR COMPONENT - src/components/Navbar.tsx
   ============================================================
   This is the navigation bar at the top of the page.
   
   Features:
   - Sticky (stays at top when you scroll)
   - Blurred glass effect background
   - Logo on the left, navigation links on the right
   - Mobile hamburger menu for small screens
   - Theme toggle button (switch between dark/light)
   - "Book Now" call-to-action button
   
   How it works:
   - Uses useState to track if mobile menu is open
   - Uses useState to track if page has been scrolled (for shadow effect)
   - Uses useEffect to listen for scroll events
   ============================================================ */

"use client"; // This tells Next.js this component runs in the browser (client-side)

import { useState, useEffect } from "react";
import Image from "next/image";
import { Menu, X, Sun, Moon } from "lucide-react"; // Icon library

/* --- Navigation Links ---
   Each link scrolls to a section on the page.
   The href matches the id of the section (e.g., #about, #services). */
const navLinks = [
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Method", href: "#method" },
  { name: "Results", href: "#results" },
  { name: "Contact", href: "#contact" },
];

export default function Navbar() {
  /* --- State Variables ---
     isOpen: controls mobile menu visibility
     scrolled: tracks if user has scrolled past 50px (adds shadow)
     isDark: tracks current theme (dark or light) */
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(true);

  /* --- Scroll Listener ---
     When the user scrolls more than 50px, we add a shadow to the navbar.
     This makes it clear the navbar is floating above the content. */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    // Cleanup: remove the listener when component unmounts
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* --- Theme Toggle ---
     Switches between dark and light themes.
     Adds or removes the "light" class from the <html> element.
     This triggers the CSS variables we defined in globals.css. */
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
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? "shadow-lg backdrop-blur-xl"
          : "backdrop-blur-sm"
        }
      `}
      style={{ backgroundColor: "var(--nav-bg)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* --- Logo Section ---
              Clicking the logo scrolls back to the top of the page. */}
          <a href="#" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="KOCH Functional Patterns Logo"
              width={45}
              height={45}
              className={isDark ? "invert-0" : "invert"}
            />
            <div className="flex flex-col">
              <span
                className="text-xl font-bold tracking-[0.2em]"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                KOCH
              </span>
              <span className="text-[10px] tracking-[0.15em] text-muted">
                FUNCTIONAL PATTERNS
              </span>
            </div>
          </a>

          {/* --- Desktop Navigation ---
              Only visible on medium screens and up (md:flex).
              Hidden on mobile (hidden by default). */}
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

            {/* --- Theme Toggle Button ---
                Switches between sun (light) and moon (dark) icons. */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 transition-colors hover:bg-card-bg"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* --- Book Now CTA Button ---
                Links to the booking section. Styled with the primary brand color. */}
            <a
              href="#book"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:bg-primary-dark hover:shadow-lg"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Book Session
            </a>
          </div>

          {/* --- Mobile Menu Button ---
              Only visible on small screens.
              Toggles the mobile menu open/closed. */}
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

      {/* --- Mobile Menu Dropdown ---
          Slides down when isOpen is true.
          Shows the same links as desktop but in a vertical layout. */}
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
                onClick={() => setIsOpen(false)} // Close menu when a link is clicked
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
