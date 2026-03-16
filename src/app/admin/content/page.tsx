/**
 * CMS Content Editor — Admin Page
 *
 * Lets admins edit all text on the main website without touching code. Uses a sidebar
 * to switch between sections: hero, about, services, method, testimonials, and contact.
 * Each section exposes form fields for its content (headlines, paragraphs, stats, etc.).
 *
 * Data flow: Reads from GET /api/site-content on load; writes via PUT /api/site-content
 * on Save. The homepage (page.tsx) consumes this content server-side.
 */
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Save,
  Loader2,
  CheckCircle,
  Plus,
  Trash2,
  Type,
  Star,
  MessageSquare,
  Briefcase,
  Info,
  Phone,
} from "lucide-react";

interface SiteContent {
  hero: {
    headline: string;
    headlineAccent: string;
    subheadline: string;
    ctaText: string;
    secondaryCtaText: string;
  };
  about: {
    tagline: string;
    headline: string;
    headlineAccent: string;
    paragraphs: string[];
    stats: Array<{ value: string; label: string }>;
  };
  services: {
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
  };
  method: {
    tagline: string;
    headline: string;
    steps: Array<{
      number: string;
      title: string;
      description: string;
      tags: string[];
    }>;
  };
  testimonials: Array<{
    name: string;
    initials: string;
    issue: string;
    quote: string;
    rating: number;
    color: string;
  }>;
  contact: {
    email: string;
    phone: string;
    phoneRaw: string;
    location: string;
    whatsappNumber: string;
    whatsappMessage: string;
    instagramHandle: string;
    youtubeHandle: string;
    hours: Array<{ days: string; time: string }>;
  };
}

type SectionKey = "hero" | "about" | "services" | "method" | "testimonials" | "contact";

const sectionConfig: Array<{ key: SectionKey; label: string; icon: typeof Type }> = [
  { key: "hero", label: "Hero Section", icon: Type },
  { key: "about", label: "About Section", icon: Info },
  { key: "services", label: "Services", icon: Briefcase },
  { key: "method", label: "Method Steps", icon: Star },
  { key: "testimonials", label: "Testimonials", icon: MessageSquare },
  { key: "contact", label: "Contact & Social", icon: Phone },
];

export default function ContentEditor() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [activeSection, setActiveSection] = useState<SectionKey>("hero");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/site-content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    try {
      await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    }
    setSaving(false);
  };

  if (loading || !content) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 md:ml-64 p-8 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const updateField = (path: string, value: unknown) => {
    setContent((prev) => {
      if (!prev) return prev;
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const inputClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

  const renderHero = () => (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Headline</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.hero.headline} onChange={(e) => updateField("hero.headline", e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Headline Accent (colored text)</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.hero.headlineAccent} onChange={(e) => updateField("hero.headlineAccent", e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Subheadline</label>
        <textarea className={inputClass + " resize-none"} rows={3} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.hero.subheadline} onChange={(e) => updateField("hero.subheadline", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">CTA Button Text</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.hero.ctaText} onChange={(e) => updateField("hero.ctaText", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Secondary CTA Text</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.hero.secondaryCtaText} onChange={(e) => updateField("hero.secondaryCtaText", e.target.value)} />
        </div>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Tagline</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.about.tagline} onChange={(e) => updateField("about.tagline", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Headline</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.about.headline} onChange={(e) => updateField("about.headline", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Headline Accent</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.about.headlineAccent} onChange={(e) => updateField("about.headlineAccent", e.target.value)} />
        </div>
      </div>
      {content.about.paragraphs.map((p, i) => (
        <div key={i}>
          <label className="mb-2 block text-sm font-medium">Paragraph {i + 1}</label>
          <textarea className={inputClass + " resize-none"} rows={3} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={p} onChange={(e) => {
            const paras = [...content.about.paragraphs];
            paras[i] = e.target.value;
            updateField("about.paragraphs", paras);
          }} />
        </div>
      ))}
      <div>
        <label className="mb-3 block text-sm font-medium">Stats</label>
        <div className="grid grid-cols-2 gap-4">
          {content.about.stats.map((stat, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
              <input className={inputClass + " mb-2"} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Value" value={stat.value} onChange={(e) => {
                const stats = [...content.about.stats];
                stats[i] = { ...stats[i], value: e.target.value };
                updateField("about.stats", stats);
              }} />
              <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Label" value={stat.label} onChange={(e) => {
                const stats = [...content.about.stats];
                stats[i] = { ...stats[i], label: e.target.value };
                updateField("about.stats", stats);
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Section Tagline</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.services.tagline} onChange={(e) => updateField("services.tagline", e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Section Headline</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.services.headline} onChange={(e) => updateField("services.headline", e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Section Description</label>
        <textarea className={inputClass + " resize-none"} rows={2} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.services.subheadline} onChange={(e) => updateField("services.subheadline", e.target.value)} />
      </div>
      {content.services.items.map((item, i) => (
        <div key={i} className="rounded-2xl border p-6 space-y-4" style={{ borderColor: item.featured ? "var(--primary)" : "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Service {i + 1}</h4>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={item.featured} onChange={(e) => {
                const items = [...content.services.items];
                items[i] = { ...items[i], featured: e.target.checked };
                updateField("services.items", items);
              }} className="accent-primary" />
              Featured
            </label>
          </div>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Title" value={item.title} onChange={(e) => {
            const items = [...content.services.items];
            items[i] = { ...items[i], title: e.target.value };
            updateField("services.items", items);
          }} />
          <textarea className={inputClass + " resize-none"} rows={2} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Description" value={item.description} onChange={(e) => {
            const items = [...content.services.items];
            items[i] = { ...items[i], description: e.target.value };
            updateField("services.items", items);
          }} />
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Price" value={item.price} onChange={(e) => {
            const items = [...content.services.items];
            items[i] = { ...items[i], price: e.target.value };
            updateField("services.items", items);
          }} />
          <div>
            <label className="mb-2 block text-xs text-muted">Features (one per line)</label>
            <textarea className={inputClass + " resize-none"} rows={4} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={item.features.join("\n")} onChange={(e) => {
              const items = [...content.services.items];
              items[i] = { ...items[i], features: e.target.value.split("\n") };
              updateField("services.items", items);
            }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderMethod = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Tagline</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.method.tagline} onChange={(e) => updateField("method.tagline", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Headline</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.method.headline} onChange={(e) => updateField("method.headline", e.target.value)} />
        </div>
      </div>
      {content.method.steps.map((step, i) => (
        <div key={i} className="rounded-2xl border p-6 space-y-4" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          <h4 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Step {step.number}</h4>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Title" value={step.title} onChange={(e) => {
            const steps = [...content.method.steps];
            steps[i] = { ...steps[i], title: e.target.value };
            updateField("method.steps", steps);
          }} />
          <textarea className={inputClass + " resize-none"} rows={3} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Description" value={step.description} onChange={(e) => {
            const steps = [...content.method.steps];
            steps[i] = { ...steps[i], description: e.target.value };
            updateField("method.steps", steps);
          }} />
          <div>
            <label className="mb-2 block text-xs text-muted">Tags (comma-separated)</label>
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={step.tags.join(", ")} onChange={(e) => {
              const steps = [...content.method.steps];
              steps[i] = { ...steps[i], tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) };
              updateField("method.steps", steps);
            }} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderTestimonials = () => (
    <div className="space-y-6">
      {content.testimonials.map((t, i) => (
        <div key={i} className="rounded-2xl border p-6 space-y-4" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Testimonial {i + 1}</h4>
            <button onClick={() => {
              const testimonials = content.testimonials.filter((_, idx) => idx !== i);
              updateField("testimonials", testimonials);
            }} className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Name" value={t.name} onChange={(e) => {
              const testimonials = [...content.testimonials];
              testimonials[i] = { ...testimonials[i], name: e.target.value };
              updateField("testimonials", testimonials);
            }} />
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Initials" value={t.initials} onChange={(e) => {
              const testimonials = [...content.testimonials];
              testimonials[i] = { ...testimonials[i], initials: e.target.value };
              updateField("testimonials", testimonials);
            }} />
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Issue" value={t.issue} onChange={(e) => {
              const testimonials = [...content.testimonials];
              testimonials[i] = { ...testimonials[i], issue: e.target.value };
              updateField("testimonials", testimonials);
            }} />
          </div>
          <textarea className={inputClass + " resize-none"} rows={3} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Quote" value={t.quote} onChange={(e) => {
            const testimonials = [...content.testimonials];
            testimonials[i] = { ...testimonials[i], quote: e.target.value };
            updateField("testimonials", testimonials);
          }} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs text-muted">Rating (1-5)</label>
              <input type="number" min={1} max={5} className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={t.rating} onChange={(e) => {
                const testimonials = [...content.testimonials];
                testimonials[i] = { ...testimonials[i], rating: parseInt(e.target.value) || 5 };
                updateField("testimonials", testimonials);
              }} />
            </div>
            <div>
              <label className="mb-2 block text-xs text-muted">Color (hex)</label>
              <div className="flex gap-2">
                <input type="color" value={t.color} onChange={(e) => {
                  const testimonials = [...content.testimonials];
                  testimonials[i] = { ...testimonials[i], color: e.target.value };
                  updateField("testimonials", testimonials);
                }} className="h-11 w-11 cursor-pointer rounded-lg border-0" />
                <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={t.color} onChange={(e) => {
                  const testimonials = [...content.testimonials];
                  testimonials[i] = { ...testimonials[i], color: e.target.value };
                  updateField("testimonials", testimonials);
                }} />
              </div>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => {
        updateField("testimonials", [...content.testimonials, {
          name: "New Client",
          initials: "NC",
          issue: "Condition",
          quote: "Their experience...",
          rating: 5,
          color: "#d4a843",
        }]);
      }} className="flex items-center gap-2 rounded-xl border border-dashed px-6 py-3 text-sm transition-colors hover:border-primary hover:text-primary" style={{ borderColor: "var(--card-border)" }}>
        <Plus size={16} /> Add Testimonial
      </button>
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Email</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.email} onChange={(e) => updateField("contact.email", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Phone (display)</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.phone} onChange={(e) => updateField("contact.phone", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Phone (raw, for tel: link)</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.phoneRaw} onChange={(e) => updateField("contact.phoneRaw", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.location} onChange={(e) => updateField("contact.location", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">WhatsApp Number</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.whatsappNumber} onChange={(e) => updateField("contact.whatsappNumber", e.target.value)} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Instagram Handle</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.instagramHandle} onChange={(e) => updateField("contact.instagramHandle", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">WhatsApp Default Message</label>
        <textarea className={inputClass + " resize-none"} rows={2} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.whatsappMessage} onChange={(e) => updateField("contact.whatsappMessage", e.target.value)} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">YouTube Handle</label>
        <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={content.contact.youtubeHandle} onChange={(e) => updateField("contact.youtubeHandle", e.target.value)} />
      </div>
      <div>
        <label className="mb-3 block text-sm font-medium">Training Hours</label>
        {content.contact.hours.map((h, i) => (
          <div key={i} className="mb-2 grid grid-cols-2 gap-4">
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Days" value={h.days} onChange={(e) => {
              const hours = [...content.contact.hours];
              hours[i] = { ...hours[i], days: e.target.value };
              updateField("contact.hours", hours);
            }} />
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="Time" value={h.time} onChange={(e) => {
              const hours = [...content.contact.hours];
              hours[i] = { ...hours[i], time: e.target.value };
              updateField("contact.hours", hours);
            }} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "hero": return renderHero();
      case "about": return renderAbout();
      case "services": return renderServices();
      case "method": return renderMethod();
      case "testimonials": return renderTestimonials();
      case "contact": return renderContact();
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <AdminSidebar />
      <main className="flex-1 md:ml-64">
        <div className="border-b px-8 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Content Editor
              </h1>
              <p className="mt-1 text-sm text-muted">Edit all text and content on your website</p>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="w-56 shrink-0 border-r p-4" style={{ borderColor: "var(--card-border)" }}>
            {sectionConfig.map((sec) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all"
                style={{
                  backgroundColor: activeSection === sec.key ? "var(--primary)" : "transparent",
                  color: activeSection === sec.key ? "var(--background)" : "var(--muted)",
                }}
              >
                <sec.icon size={16} />
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-8">
            <div className="mx-auto max-w-2xl">
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
