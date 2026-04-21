"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import en from "./messages/en.json";
import he from "./messages/he.json";

export type Locale = "en" | "he";
type Messages = typeof en;

const messages: Record<Locale, Messages> = { en, he };

interface TranslationContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("locale") as Locale | null;
      if (stored === "he" || stored === "en") return stored;
    }
    return "en";
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "he" ? "rtl" : "ltr";
  }, [locale, mounted]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("locale", l);
    document.cookie = `locale=${l};path=/;max-age=31536000`;
    window.location.reload();
  }, []);

  const t = useCallback(
    (key: string) => resolve(messages[locale] as unknown as Record<string, unknown>, key),
    [locale],
  );

  const dir = locale === "he" ? "rtl" : "ltr";

  return (
    <TranslationContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error("useTranslation must be used within TranslationProvider");
  return ctx;
}
