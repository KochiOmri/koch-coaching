/* ============================================================
   HERO SECTION - src/components/Hero.tsx
   ============================================================
   This is the first thing visitors see when they land on your site.
   
   Features:
   - Full-screen height (100vh = 100% of viewport height)
   - Video background (autoplays, muted, loops)
   - Dark overlay on the video so text is readable
   - Main headline + subtitle
   - Two CTA buttons: "Start Your Transformation" and "Learn More"
   - Animated entrance using Framer Motion
   
   Note: The video is currently a placeholder. Replace the
   YouTube embed or local video file with your actual content.
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* --- Video Background ---
          This plays a looping video behind the content.
          object-cover makes the video fill the entire section.
          Replace the src with your actual video file later.
          
          For now, we use a gradient placeholder. When you have
          your video ready, uncomment the <video> tag below and
          add your video file to public/videos/hero.mp4 */}
      
      {/* UNCOMMENT THIS WHEN YOU HAVE YOUR VIDEO:
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      */}

      {/* --- Placeholder Background ---
          A dynamic gradient background used until you add your video.
          Has a subtle animation that shifts the gradient. */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background">
        {/* Animated grid pattern for visual interest */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Radial glow behind the main content area */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--primary)_0%,transparent_70%)] opacity-[0.08]" />
      </div>

      {/* --- Dark Overlay ---
          Semi-transparent overlay to ensure text is readable
          over any background (video or gradient). */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--hero-overlay)" }}
      />

      {/* --- Hero Content ---
          All the text and buttons that appear on top of the background.
          Uses Framer Motion for a smooth fade-in + slide-up animation. */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* --- Animated Badge ---
            Small label above the headline to set context. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary">
            BIOMECHANICS-BASED TRAINING
          </span>
        </motion.div>

        {/* --- Main Headline ---
            The biggest text on the page. This is what grabs attention.
            Uses the Outfit font for a bold, modern look.
            Delays animation slightly so it appears after the badge. */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Move the Way
          <br />
          <span className="text-primary">Nature Intended</span>
        </motion.h1>

        {/* --- Subtitle ---
            Explains what you do in one or two sentences.
            Smaller text, slightly muted color for hierarchy. */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl"
        >
          Functional Patterns coaching that addresses the root cause of
          your pain and movement dysfunction. Realign your body through
          the science of biomechanics.
        </motion.p>

        {/* --- CTA Buttons ---
            Two buttons: primary (filled) and secondary (outlined).
            Primary leads to booking, secondary scrolls to learn more. */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Primary CTA - leads to booking section */}
          <a
            href="#book"
            className="group flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold tracking-wide text-background transition-all duration-300 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/20"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            START YOUR TRANSFORMATION
            <ArrowDown
              size={16}
              className="transition-transform group-hover:translate-y-0.5"
            />
          </a>

          {/* Secondary CTA - scrolls to about section */}
          <a
            href="#about"
            className="flex items-center gap-2 rounded-full border border-card-border px-8 py-4 text-sm font-semibold tracking-wide text-foreground transition-all duration-300 hover:border-primary hover:text-primary"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            <Play size={16} />
            WATCH HOW IT WORKS
          </a>
        </motion.div>
      </div>

      {/* --- Scroll Indicator ---
          Small animated arrow at the bottom telling users to scroll down.
          Uses CSS animation for a bouncing effect. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <a
          href="#about"
          className="flex flex-col items-center gap-2 text-muted transition-colors hover:text-primary"
        >
          <span className="text-xs tracking-widest">SCROLL</span>
          <ArrowDown size={16} className="animate-bounce" />
        </a>
      </motion.div>
    </section>
  );
}
