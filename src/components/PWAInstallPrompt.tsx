"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7;

export default function PWAInstallPrompt() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = new Date(dismissed).getTime();
      if (Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") setShow(false);
    deferredPrompt.current = null;
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  if (!show) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-md md:left-auto md:right-6 md:max-w-sm"
      style={{
        backgroundColor: "rgba(20, 20, 20, 0.95)",
        borderColor: "var(--primary)",
      }}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "var(--primary)" }}
      >
        <Download size={18} style={{ color: "var(--background)" }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
          Install KOCH FP
        </p>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          For the best experience
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10"
      >
        <X size={16} style={{ color: "var(--muted)" }} />
      </button>
    </div>
  );
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
