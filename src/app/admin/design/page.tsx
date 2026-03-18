"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Palette,
  Type,
  Layout,
  Eye,
  Save,
  Loader2,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  Paintbrush,
  Layers,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";

interface SiteDesign {
  theme_mode: "dark" | "light";
  primary_color: string;
  accent_color: string;
  background_color: string;
  font_heading: string;
  font_body: string;
  hero_style: "video" | "image" | "gradient";
  hero_overlay_opacity: number;
  sections_visible: Record<string, boolean>;
  custom_css: string;
}

const DEFAULT_DESIGN: SiteDesign = {
  theme_mode: "dark",
  primary_color: "#d4a843",
  accent_color: "#d4a843",
  background_color: "#0a0a0a",
  font_heading: "Outfit",
  font_body: "Inter",
  hero_style: "video",
  hero_overlay_opacity: 0.6,
  sections_visible: {
    hero: true,
    about: true,
    videoShowcase: true,
    methodology: true,
    services: true,
    method: true,
    results: true,
    booking: true,
  },
  custom_css: "",
};

const COLOR_PRESETS = [
  { name: "Gold", primary: "#d4a843", bg: "#0a0a0a" },
  { name: "Emerald", primary: "#10b981", bg: "#0a0a0a" },
  { name: "Blue", primary: "#3b82f6", bg: "#0a0a0a" },
  { name: "Rose", primary: "#f43f5e", bg: "#0a0a0a" },
  { name: "Purple", primary: "#8b5cf6", bg: "#0a0a0a" },
  { name: "Amber", primary: "#f59e0b", bg: "#0a0a0a" },
  { name: "Cyan", primary: "#06b6d4", bg: "#0f172a" },
  { name: "Light Minimal", primary: "#1a1a1a", bg: "#ffffff" },
];

const FONT_OPTIONS = [
  "Outfit", "Inter", "Poppins", "Montserrat", "Playfair Display",
  "Raleway", "Oswald", "DM Sans", "Space Grotesk", "Cormorant Garamond",
];

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero / Banner",
  about: "About Section",
  videoShowcase: "Video Showcase",
  methodology: "FP Methodology",
  services: "Services",
  method: "Method Section",
  results: "Results",
  booking: "Booking Form",
};

type TabId = "colors" | "typography" | "layout" | "sections" | "advanced";

export default function AdminDesignPage() {
  const [design, setDesign] = useState<SiteDesign>(DEFAULT_DESIGN);
  const [originalDesign, setOriginalDesign] = useState<SiteDesign>(DEFAULT_DESIGN);
  const [activeTab, setActiveTab] = useState<TabId>("colors");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const hasChanges = JSON.stringify(design) !== JSON.stringify(originalDesign);

  const loadDesign = useCallback(async () => {
    try {
      const res = await fetch("/api/site-design");
      if (res.ok) {
        const data = await res.json();
        if (data && data.theme_mode) {
          setDesign(data);
          setOriginalDesign(data);
        }
      }
    } catch {
      console.error("Failed to load design");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDesign();
  }, [loadDesign]);

  async function saveDesign() {
    setSaving(true);
    try {
      const res = await fetch("/api/site-design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(design),
      });
      if (res.ok) {
        setOriginalDesign(design);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("Failed to save design");
    } finally {
      setSaving(false);
    }
  }

  function resetDesign() {
    setDesign(originalDesign);
  }

  function applyPreset(preset: typeof COLOR_PRESETS[0]) {
    setDesign((d) => ({
      ...d,
      primary_color: preset.primary,
      accent_color: preset.primary,
      background_color: preset.bg,
      theme_mode: preset.bg === "#ffffff" ? "light" : "dark",
    }));
  }

  function updateField<K extends keyof SiteDesign>(key: K, value: SiteDesign[K]) {
    setDesign((d) => ({ ...d, [key]: value }));
  }

  function toggleSection(key: string) {
    setDesign((d) => ({
      ...d,
      sections_visible: {
        ...d.sections_visible,
        [key]: !d.sections_visible[key],
      },
    }));
  }

  const tabs: { id: TabId; label: string; icon: typeof Palette }[] = [
    { id: "colors", label: "Colors", icon: Palette },
    { id: "typography", label: "Fonts", icon: Type },
    { id: "layout", label: "Hero", icon: Layout },
    { id: "sections", label: "Sections", icon: Layers },
    { id: "advanced", label: "Custom CSS", icon: Paintbrush },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <AdminSidebar />
        <div className="flex flex-1 items-center justify-center md:ml-64">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />
      <main className="flex-1 p-4 md:ml-64 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide" style={{ fontFamily: "var(--font-outfit)" }}>
              <Paintbrush className="mr-2 inline" size={24} style={{ color: "var(--primary)" }} />
              Site Designer
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Customize colors, fonts, sections and layout of your website
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewOpen(!previewOpen)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
              style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
            >
              <Eye size={16} />
              {previewOpen ? "Hide" : "Show"} Preview
            </button>
            {hasChanges && (
              <button
                onClick={resetDesign}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all"
                style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
            <button
              onClick={saveDesign}
              disabled={saving || !hasChanges}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saved ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          {/* Settings Panel */}
          <div className="flex-1">
            {/* Tabs */}
            <div
              className="mb-6 flex gap-1 overflow-x-auto rounded-xl border p-1"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all"
                    style={{
                      backgroundColor: activeTab === tab.id ? "var(--primary)" : "transparent",
                      color: activeTab === tab.id ? "var(--background)" : "var(--muted)",
                    }}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              {/* Colors Tab */}
              {activeTab === "colors" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Theme Mode</h3>
                    <div className="flex gap-3">
                      {(["dark", "light"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateField("theme_mode", mode)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-4 text-sm font-medium transition-all"
                          style={{
                            borderColor: design.theme_mode === mode ? "var(--primary)" : "var(--card-border)",
                            backgroundColor: design.theme_mode === mode ? "color-mix(in srgb, var(--primary) 10%, transparent)" : "transparent",
                          }}
                        >
                          {mode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Color Presets</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset)}
                          className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:opacity-80"
                          style={{
                            borderColor: design.primary_color === preset.primary ? "var(--primary)" : "var(--card-border)",
                          }}
                        >
                          <div
                            className="h-10 w-10 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <span className="text-xs">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.primary_color}
                          onChange={(e) => updateField("primary_color", e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-lg border-0"
                        />
                        <input
                          type="text"
                          value={design.primary_color}
                          onChange={(e) => updateField("primary_color", e.target.value)}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.accent_color}
                          onChange={(e) => updateField("accent_color", e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-lg border-0"
                        />
                        <input
                          type="text"
                          value={design.accent_color}
                          onChange={(e) => updateField("accent_color", e.target.value)}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Background</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={design.background_color}
                          onChange={(e) => updateField("background_color", e.target.value)}
                          className="h-10 w-10 cursor-pointer rounded-lg border-0"
                        />
                        <input
                          type="text"
                          value={design.background_color}
                          onChange={(e) => updateField("background_color", e.target.value)}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Typography Tab */}
              {activeTab === "typography" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Heading Font</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font}
                          onClick={() => updateField("font_heading", font)}
                          className="rounded-xl border p-4 text-left transition-all"
                          style={{
                            borderColor: design.font_heading === font ? "var(--primary)" : "var(--card-border)",
                            fontFamily: font,
                          }}
                        >
                          <div className="text-lg font-bold">Aa</div>
                          <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{font}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Body Font</h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font}
                          onClick={() => updateField("font_body", font)}
                          className="rounded-xl border p-4 text-left transition-all"
                          style={{
                            borderColor: design.font_body === font ? "var(--primary)" : "var(--card-border)",
                            fontFamily: font,
                          }}
                        >
                          <div className="text-sm">The quick brown fox jumps over the lazy dog</div>
                          <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{font}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Hero/Layout Tab */}
              {activeTab === "layout" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Hero Style</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(["video", "image", "gradient"] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateField("hero_style", style)}
                          className="flex flex-col items-center gap-3 rounded-xl border p-5 transition-all"
                          style={{
                            borderColor: design.hero_style === style ? "var(--primary)" : "var(--card-border)",
                          }}
                        >
                          {style === "video" ? <Monitor size={24} /> :
                           style === "image" ? <ImageIcon size={24} /> :
                           <Palette size={24} />}
                          <span className="text-sm font-medium capitalize">{style}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Hero Overlay Opacity: {Math.round(design.hero_overlay_opacity * 100)}%
                    </h3>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={design.hero_overlay_opacity}
                      onChange={(e) => updateField("hero_overlay_opacity", parseFloat(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <div className="mt-2 flex justify-between text-xs" style={{ color: "var(--muted)" }}>
                      <span>Transparent</span>
                      <span>Full overlay</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sections Tab */}
              {activeTab === "sections" && (
                <div className="space-y-2">
                  <h3 className="mb-4 text-lg font-semibold">Toggle Website Sections</h3>
                  <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
                    Show or hide sections on your public website
                  </p>
                  {Object.entries(SECTION_LABELS).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-xl border px-4 py-3"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <button
                        onClick={() => toggleSection(key)}
                        className="relative h-6 w-11 rounded-full transition-colors"
                        style={{
                          backgroundColor: design.sections_visible[key]
                            ? "var(--primary)"
                            : "var(--card-border)",
                        }}
                      >
                        <div
                          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                          style={{
                            transform: design.sections_visible[key]
                              ? "translateX(22px)"
                              : "translateX(2px)",
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === "advanced" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Custom CSS</h3>
                    <p className="mb-4 text-sm" style={{ color: "var(--muted)" }}>
                      Add custom CSS rules to override the default styles.
                      Use CSS variables like --primary, --background, --foreground.
                    </p>
                    <textarea
                      value={design.custom_css}
                      onChange={(e) => updateField("custom_css", e.target.value)}
                      rows={12}
                      className="w-full rounded-xl border p-4 font-mono text-sm"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                        color: "var(--foreground)",
                      }}
                      placeholder={`/* Example: */\n:root {\n  --primary: #e63946;\n}\n\n.hero-section {\n  min-height: 100vh;\n}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview */}
          {previewOpen && (
            <div className="w-full xl:w-96">
              <div
                className="sticky top-4 overflow-hidden rounded-2xl border"
                style={{ borderColor: "var(--card-border)" }}
              >
                <div
                  className="p-3 text-center text-xs font-medium"
                  style={{ backgroundColor: "var(--card-bg)", color: "var(--muted)" }}
                >
                  Live Preview
                </div>
                <div
                  className="relative aspect-[9/16] overflow-hidden"
                  style={{ backgroundColor: design.background_color }}
                >
                  {/* Mini preview of the site */}
                  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                    <div
                      className="mb-4 h-12 w-12 rounded-full"
                      style={{ backgroundColor: design.primary_color }}
                    />
                    <h2
                      className="text-xl font-bold tracking-wider"
                      style={{
                        fontFamily: design.font_heading,
                        color: design.theme_mode === "dark" ? "#ffffff" : "#1a1a1a",
                      }}
                    >
                      KOCH
                    </h2>
                    <p
                      className="mt-2 text-xs"
                      style={{
                        fontFamily: design.font_body,
                        color: design.theme_mode === "dark" ? "#999999" : "#666666",
                      }}
                    >
                      Functional Patterns Coaching
                    </p>
                    <div
                      className="mt-6 rounded-full px-6 py-2 text-xs font-semibold"
                      style={{
                        backgroundColor: design.primary_color,
                        color: design.background_color,
                      }}
                    >
                      Book a Session
                    </div>

                    <div className="mt-8 w-full space-y-2">
                      {Object.entries(SECTION_LABELS).map(([key, label]) => (
                        <div
                          key={key}
                          className="rounded-lg px-3 py-1.5 text-left text-[10px]"
                          style={{
                            backgroundColor: design.sections_visible[key]
                              ? `color-mix(in srgb, ${design.primary_color} 15%, transparent)`
                              : "transparent",
                            color: design.sections_visible[key]
                              ? design.primary_color
                              : design.theme_mode === "dark" ? "#444" : "#ccc",
                            textDecoration: design.sections_visible[key] ? "none" : "line-through",
                          }}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
