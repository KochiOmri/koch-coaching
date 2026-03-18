/**
 * WhatsAppButton — Floating WhatsApp chat button with optional tooltip.
 *
 * Fixed bottom-right button linking to wa.me with pre-filled message. Appears after 2s delay.
 * Tooltip "Need help? Chat with me!" shows on first visit and auto-dismisses after 8s.
 *
 * CMS/Architecture: Receives `phone` and `message` via props from CMS. Parent page passes
 * contact/CTA text from the content layer.
 */
"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

export default function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 2000);
    const tooltipTimer = setTimeout(() => setTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(tooltipTimer);
    };
  }, []);

  if (!visible) return null;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {tooltip && (
        <div
          className="flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm shadow-xl animate-in fade-in slide-in-from-right-4"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--foreground)",
          }}
        >
          <span>Need help? Chat with me!</span>
          <button onClick={() => setTooltip(false)} className="text-muted hover:text-foreground">
            <X size={14} />
          </button>
        </div>
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-opacity duration-300 hover:opacity-90"
        style={{ backgroundColor: "#25D366" }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={26} className="text-white" fill="white" />
      </a>
    </div>
  );
}
