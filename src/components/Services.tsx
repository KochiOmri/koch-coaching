/**
 * Services — Three-column service cards with pricing and CTAs.
 *
 * Renders a grid of service cards. The card marked `featured: true` gets "MOST POPULAR" styling
 * and primary CTA. Each card shows icon, title, description, features list, price, and Book Now.
 * Icons are mapped by index (User, Users, Video).
 *
 * CMS/Architecture: Receives `content` with tagline, headline, subheadline, and `items` array
 * (title, description, features, price, featured). All service data is CMS-driven.
 */
"use client";

import { useRef, useEffect, useState } from "react";
import { User, Users, Video, Check } from "lucide-react";

const iconMap = [User, Users, Video];

interface ServicesContent {
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
}

export default function Services({ content }: { content: ServicesContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="services" ref={sectionRef} className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.7s ease",
            transitionDelay: "0.2s",
          }}
        >
          <span className="text-sm font-medium tracking-widest text-primary">
            {content.tagline}
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            {content.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            {content.subheadline}
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {content.items.map((service, index) => {
            const Icon = iconMap[index] || User;
            return (
              <div
                key={service.title}
                className={`
                  group relative flex flex-col rounded-2xl border p-8
                  transition-all duration-300 hover:-translate-y-1
                  ${service.featured
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-card-border bg-card-bg hover:border-primary/50"
                  }
                `}
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(30px)",
                  transition: "all 0.7s ease",
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                {service.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-background">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {service.title}
                </h3>
                <p className="mt-3 text-sm text-muted">{service.description}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <div className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>
                    {service.price}
                  </div>
                  <a
                    href="#book"
                    className={`
                      mt-4 block rounded-full py-3 text-center text-sm font-semibold
                      transition-all duration-300
                      ${service.featured
                        ? "bg-primary text-background hover:bg-primary-dark"
                        : "border border-card-border text-foreground hover:border-primary hover:text-primary"
                      }
                    `}
                  >
                    Book Now
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
