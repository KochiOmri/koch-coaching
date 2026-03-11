/* ============================================================
   ROOT LAYOUT - src/app/layout.tsx
   ============================================================
   This is the root layout for the entire application.
   Every page in the app is wrapped by this layout.
   
   What it does:
   - Loads Google Fonts (Outfit for headings, Inter for body text)
   - Sets up HTML metadata (title, description) for SEO
   - Wraps all pages with consistent styling
   ============================================================ */

import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

/* --- Font Setup ---
   Outfit: Bold, modern geometric font for headings.
   Inter: Clean, highly readable font for body text.
   Both are loaded from Google Fonts and assigned CSS variables. */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/* --- SEO Metadata ---
   This appears in Google search results and browser tabs.
   Update this with your real info before going live! */
export const metadata: Metadata = {
  title: "KOCH | Functional Patterns Coaching",
  description:
    "Transform your movement with biomechanics-based coaching. KOCH Functional Patterns helps you move better, feel stronger, and live pain-free.",
  keywords: [
    "functional patterns",
    "biomechanics",
    "movement coaching",
    "posture correction",
    "pain-free movement",
    "Koch coaching",
  ],
};

/* --- Root Layout Component ---
   This wraps every page. The fonts are applied via CSS variables
   so we can use them anywhere with font-outfit or font-inter. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
