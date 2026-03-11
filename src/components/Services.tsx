/* ============================================================
   SERVICES SECTION - src/components/Services.tsx
   ============================================================
   This section shows the different coaching services you offer.
   
   Layout:
   - Three cards in a row (on desktop)
   - Each card has: icon, title, description, features list, price, CTA
   
   Features:
   - Cards have a hover effect (slight lift + glow)
   - The middle card is "featured" (highlighted with primary border)
   - Scroll-triggered entrance animations
   - Responsive: stacks on mobile, 3 columns on desktop
   
   TODO: Update prices and service details with your real offerings
   ============================================================ */

"use client";

import { motion } from "framer-motion";
import { User, Users, Video, Check } from "lucide-react";

/* --- Services Data ---
   Each object represents one service card.
   featured: true highlights that card (recommended option).
   Update these with your actual services and pricing! */
const services = [
  {
    icon: User,
    title: "1-on-1 Coaching",
    description:
      "Personalized biomechanics assessment and hands-on training tailored to your specific movement dysfunctions.",
    features: [
      "Full posture analysis",
      "Custom training program",
      "Myofascial release techniques",
      "Weekly progress tracking",
      "WhatsApp support",
    ],
    price: "Free Consultation",
    featured: false,
  },
  {
    icon: Users,
    title: "Intensive Program",
    description:
      "A deep-dive 12-week transformation program with comprehensive biomechanical restructuring.",
    features: [
      "Everything in 1-on-1",
      "3 sessions per week",
      "Gait cycle analysis",
      "Video movement review",
      "Nutrition guidance",
      "Priority scheduling",
    ],
    price: "Free Consultation",
    featured: true, // This card gets highlighted
  },
  {
    icon: Video,
    title: "Online Coaching",
    description:
      "Remote biomechanics coaching via video calls. Perfect for clients outside your area.",
    features: [
      "Video posture assessment",
      "Custom home program",
      "Bi-weekly video calls",
      "Exercise video library",
      "Email support",
    ],
    price: "Free Consultation",
    featured: false,
  },
];

export default function Services() {
  return (
    <section id="services" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-sm font-medium tracking-widest text-primary">
            WHAT I OFFER
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Coaching Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Choose the coaching experience that fits your goals. Every program is
            built on the science of Functional Patterns biomechanics.
          </p>
        </motion.div>

        {/* --- Service Cards Grid ---
            3 columns on large screens, 1 on mobile.
            Items stretch to fill height so all cards are the same size. */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`
                group relative flex flex-col rounded-2xl border p-8
                transition-all duration-300 hover:-translate-y-1
                ${service.featured
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-card-border bg-card-bg hover:border-primary/50"
                }
              `}
            >
              {/* "Most Popular" badge on the featured card */}
              {service.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-background">
                  MOST POPULAR
                </div>
              )}

              {/* Service icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <service.icon size={24} />
              </div>

              {/* Service title */}
              <h3
                className="mt-6 text-xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {service.title}
              </h3>

              {/* Service description */}
              <p className="mt-3 text-sm text-muted">{service.description}</p>

              {/* Features list with checkmarks */}
              <ul className="mt-6 flex-1 space-y-3">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="shrink-0 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Price and CTA button */}
              <div className="mt-8">
                <div
                  className="text-2xl font-bold text-primary"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
