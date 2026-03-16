/**
 * Marketing Tools Hub — Admin Page
 *
 * Four tabs: (1) SEO — current setup (title, meta, Open Graph, JSON-LD), Google
 * Search Console link, and checklist; (2) Newsletter — subscriber list from
 * /api/newsletter with CSV export, plus links to Resend/Mailchimp; (3) UTM Builder —
 * generate tracked links with source/medium/campaign params and quick templates;
 * (4) QR Codes — generate QR codes for booking page, homepage, WhatsApp, Instagram.
 */
"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Search,
  Link2,
  QrCode,
  Mail,
  Download,
  Copy,
  CheckCircle,
  Users,
  ExternalLink,
  Globe,
  Loader2,
  Trash2,
} from "lucide-react";

interface Subscriber {
  email: string;
  subscribedAt: string;
}

type Tab = "seo" | "newsletter" | "utm" | "qr";

export default function MarketingTools() {
  const [tab, setTab] = useState<Tab>("seo");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  const [utmUrl, setUtmUrl] = useState("https://koch-fp.com");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [generatedUtm, setGeneratedUtm] = useState("");

  const [qrUrl, setQrUrl] = useState("https://koch-fp.com/#book");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/newsletter")
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(Array.isArray(data) ? data : []);
        setLoadingSubs(false);
      })
      .catch(() => setLoadingSubs(false));
  }, []);

  const generateUtm = () => {
    const params = new URLSearchParams();
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);
    const q = params.toString();
    setGeneratedUtm(q ? `${utmUrl}?${q}` : utmUrl);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCsv = () => {
    const header = "Email,Subscribed At\n";
    const rows = subscribers.map((s) => `${s.email},${s.subscribedAt}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

  const renderSeo = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <Globe size={18} className="text-primary" /> Current SEO Setup
        </h3>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="text-xs text-muted">Title Tag</div>
            <div className="mt-1 text-sm font-medium">KOCH | Functional Patterns Coaching — Biomechanics & Movement</div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="text-xs text-muted">Meta Description</div>
            <div className="mt-1 text-sm">Biomechanics-based coaching by Koch. Functional Patterns certified practitioner offering personalized movement assessment, pain resolution, and posture correction.</div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="text-xs text-muted">Open Graph</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-green-500"><CheckCircle size={14} /> Configured</div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--card-border)" }}>
            <div className="text-xs text-muted">JSON-LD Structured Data</div>
            <div className="mt-1 flex items-center gap-2 text-sm text-green-500"><CheckCircle size={14} /> LocalBusiness schema active</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <Search size={18} className="text-primary" /> Google Search Console
        </h3>
        <p className="mt-2 text-sm text-muted">
          Monitor your search rankings, clicks, and impressions for free.
        </p>
        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-primary-dark">
          <ExternalLink size={14} /> Open Search Console
        </a>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          SEO Checklist
        </h3>
        <ul className="mt-4 space-y-2">
          {[
            { done: true, text: "Meta title and description set" },
            { done: true, text: "Open Graph tags configured" },
            { done: true, text: "JSON-LD structured data added" },
            { done: true, text: "Favicon set" },
            { done: true, text: "Vercel Analytics integrated" },
            { done: false, text: "Submit sitemap to Google Search Console" },
            { done: false, text: "Set up Google Analytics 4" },
            { done: false, text: "Add robots.txt" },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <div className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center ${item.done ? "bg-green-500/20 text-green-500" : "bg-card-border/30 text-muted"}`}>
                {item.done ? <CheckCircle size={12} /> : <span className="h-2 w-2 rounded-full bg-muted/40" />}
              </div>
              <span className={item.done ? "" : "text-muted"}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderNewsletter = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
            <Users size={18} className="text-primary" /> Subscribers ({subscribers.length})
          </h3>
          <button onClick={exportCsv} disabled={subscribers.length === 0} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-30" style={{ borderColor: "var(--card-border)" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>

        {loadingSubs ? (
          <div className="py-12 text-center"><Loader2 size={24} className="mx-auto animate-spin text-primary" /></div>
        ) : subscribers.length === 0 ? (
          <div className="py-12 text-center">
            <Mail size={40} className="mx-auto text-muted/30" />
            <p className="mt-3 text-sm text-muted">No subscribers yet. The newsletter signup is in the footer of your website.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {subscribers.map((sub, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--card-border)" }}>
                <div>
                  <div className="text-sm font-medium">{sub.email}</div>
                  <div className="text-xs text-muted">{new Date(sub.subscribedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <Mail size={18} className="text-primary" /> Email Campaigns
        </h3>
        <p className="mt-2 text-sm text-muted">
          Export your subscriber list and import it into a free email marketing tool to send campaigns.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="rounded-xl border p-4 transition-colors hover:border-primary" style={{ borderColor: "var(--card-border)" }}>
            <div className="font-semibold">Resend</div>
            <div className="mt-1 text-xs text-muted">100 emails/day free. Already integrated for booking notifications.</div>
          </a>
          <a href="https://mailchimp.com" target="_blank" rel="noopener noreferrer" className="rounded-xl border p-4 transition-colors hover:border-primary" style={{ borderColor: "var(--card-border)" }}>
            <div className="font-semibold">Mailchimp</div>
            <div className="mt-1 text-xs text-muted">500 contacts free. Great for newsletters and marketing emails.</div>
          </a>
        </div>
      </div>
    </div>
  );

  const renderUtm = () => (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <Link2 size={18} className="text-primary" /> UTM Link Builder
        </h3>
        <p className="mt-2 text-sm text-muted">
          Create tracked links for your social media posts and marketing campaigns. UTM parameters help you track which channels drive the most traffic.
        </p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Website URL</label>
            <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={utmUrl} onChange={(e) => setUtmUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Source</label>
              <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="instagram" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Medium</label>
              <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="social" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Campaign</label>
              <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} placeholder="spring2026" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
            </div>
          </div>
          <button onClick={generateUtm} className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-dark">
            Generate Link
          </button>
        </div>
        {generatedUtm && (
          <div className="mt-4 rounded-xl border p-4" style={{ borderColor: "var(--primary)", backgroundColor: "var(--primary)" + "08" }}>
            <div className="flex items-center justify-between">
              <code className="break-all text-sm text-primary">{generatedUtm}</code>
              <button onClick={() => copyToClipboard(generatedUtm)} className="ml-4 shrink-0 text-primary hover:text-primary-dark">
                {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Quick Templates</h3>
        <div className="mt-4 space-y-2">
          {[
            { source: "instagram", medium: "social", campaign: "bio_link", label: "Instagram Bio Link" },
            { source: "facebook", medium: "social", campaign: "post", label: "Facebook Post" },
            { source: "tiktok", medium: "social", campaign: "profile", label: "TikTok Profile" },
            { source: "whatsapp", medium: "messaging", campaign: "direct", label: "WhatsApp Share" },
          ].map((t) => (
            <button
              key={t.label}
              onClick={() => {
                setUtmSource(t.source);
                setUtmMedium(t.medium);
                setUtmCampaign(t.campaign);
              }}
              className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors hover:border-primary" style={{ borderColor: "var(--card-border)" }}
            >
              <span>{t.label}</span>
              <span className="text-xs text-muted">source={t.source}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQr = () => (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
          <QrCode size={18} className="text-primary" /> QR Code Generator
        </h3>
        <p className="mt-2 text-sm text-muted">
          Generate a QR code for your booking page, business cards, or flyers.
        </p>
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium">URL to encode</label>
          <input className={inputClass} style={{ borderColor: "var(--card-border)", backgroundColor: "var(--background)" }} value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} />
        </div>
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--card-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`}
              alt="QR Code"
              width={200}
              height={200}
            />
          </div>
          <div className="flex gap-3">
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrUrl)}&format=png`}
              download="koch-qr-code.png"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-primary-dark"
            >
              <Download size={14} /> Download PNG
            </a>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrUrl)}&format=svg`}
              download="koch-qr-code.svg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
              style={{ borderColor: "var(--card-border)" }}
            >
              <Download size={14} /> Download SVG
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-6" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
        <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Quick QR Links</h3>
        <div className="mt-4 space-y-2">
          {[
            { url: "https://koch-fp.com/#book", label: "Booking Page" },
            { url: "https://koch-fp.com", label: "Homepage" },
            { url: "https://wa.me/972000000000", label: "WhatsApp Direct" },
            { url: "https://instagram.com/koch.fp", label: "Instagram Profile" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setQrUrl(item.url)}
              className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors hover:border-primary" style={{ borderColor: "var(--card-border)" }}
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted">{item.url}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs: Array<{ key: Tab; label: string; icon: typeof Search }> = [
    { key: "seo", label: "SEO", icon: Search },
    { key: "newsletter", label: "Newsletter", icon: Mail },
    { key: "utm", label: "UTM Builder", icon: Link2 },
    { key: "qr", label: "QR Codes", icon: QrCode },
  ];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <AdminSidebar />
      <main className="flex-1 md:ml-64">
        <div className="border-b px-8 py-6" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Marketing Tools
          </h1>
          <p className="mt-1 text-sm text-muted">SEO, email list, tracked links, and QR codes</p>
        </div>

        <div className="flex gap-1 border-b px-8 pt-4" style={{ borderColor: "var(--card-border)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-medium transition-colors"
              style={{
                backgroundColor: tab === t.key ? "var(--primary)" : "transparent",
                color: tab === t.key ? "var(--background)" : "var(--muted)",
              }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {tab === "seo" && renderSeo()}
          {tab === "newsletter" && renderNewsletter()}
          {tab === "utm" && renderUtm()}
          {tab === "qr" && renderQr()}
        </div>
      </main>
    </div>
  );
}
