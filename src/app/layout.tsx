/**
 * Root Layout — App Shell
 *
 * Wraps the entire app. Configures fonts (Outfit for headings via --font-outfit,
 * Inter for body via --font-inter), sets SEO metadata (title, description, keywords,
 * Open Graph, Twitter cards, robots), adds JSON-LD structured data (LocalBusiness
 * schema), favicon, and Vercel Analytics. All pages render as children inside this layout.
 */
import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#d4a843",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://koch-fp.com"),
  title: "KOCH | Functional Patterns Coaching — Biomechanics & Movement",
  description:
    "Transform your movement with biomechanics-based coaching. KOCH Functional Patterns helps you move better, feel stronger, and live pain-free. Book your free consultation today.",
  keywords: [
    "functional patterns",
    "biomechanics",
    "movement coaching",
    "posture correction",
    "pain-free movement",
    "Koch coaching",
    "gait analysis",
    "functional training",
    "biomechanics coach Israel",
  ],
  openGraph: {
    title: "KOCH | Functional Patterns Coaching",
    description:
      "Biomechanics-based coaching that fixes the root cause of your pain. Book a free consultation.",
    type: "website",
    locale: "en_US",
    url: "https://koch-fp.com",
    siteName: "KOCH Functional Patterns",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "KOCH Functional Patterns Coaching",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOCH | Functional Patterns Coaching",
    description: "Biomechanics-based coaching that fixes the root cause of your pain.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "KOCH Functional Patterns",
    description: "Biomechanics-based movement coaching using Functional Patterns methodology.",
    url: "https://koch-fp.com",
    telephone: "+972-000-000-0000",
    email: "omrikochman@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IL",
    },
    priceRange: "Free Consultation",
    openingHours: ["Su-Th 09:00-18:00", "Fr 09:00-13:00"],
    sameAs: [
      "https://instagram.com/koch.fp",
      "https://youtube.com/@koch.fp",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4a843" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KOCH FP" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter), Arial, sans-serif" }}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
