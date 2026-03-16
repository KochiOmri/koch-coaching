"use client";

import { useTranslation } from "@/i18n/TranslationProvider";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "he" : "en")}
      className="rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors hover:bg-card-bg"
      style={{ fontFamily: "var(--font-outfit)" }}
      aria-label={locale === "en" ? "Switch to Hebrew" : "Switch to English"}
    >
      {locale === "en" ? "עב" : "EN"}
    </button>
  );
}
