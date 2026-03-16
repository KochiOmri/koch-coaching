"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import {
  Loader2,
  Gift,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Calendar,
} from "lucide-react";

interface ReferralInfo {
  referrerName: string;
  referralCode: string;
}

export default function ReferralPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    setIsDark(!document.documentElement.classList.contains("light"));

    fetch(`/api/referrals?code=${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid");
        return r.json();
      })
      .then((data) => {
        setReferral({ referrerName: data.referrerName, referralCode: data.referralCode });
      })
      .catch(() => setInvalid(true))
      .finally(() => setLoading(false));
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "track",
          code: referral?.referralCode,
          name: formData.name,
          email: formData.email,
        }),
      });

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: "",
          time: "",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          service: "Free Consultation",
          message: `[Referred by ${referral?.referrerName}] ${formData.message}`,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (invalid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <Image
          src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
          alt="KOCH"
          width={48}
          height={48}
          loading="lazy"
        />
        <h1 className="mt-6 text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          Invalid Referral Link
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          This referral code is not valid or has expired.
        </p>
        <a
          href="/"
          className="mt-6 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
        >
          Visit KOCH Website
        </a>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        <CheckCircle size={64} style={{ color: "var(--primary)" }} />
        <h1 className="mt-6 text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
          You&apos;re In!
        </h1>
        <p className="mt-2 max-w-md text-center" style={{ color: "var(--muted)" }}>
          Thanks for signing up! We&apos;ll be in touch soon to schedule your free consultation.
        </p>
        <a
          href="/"
          className="mt-6 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
        >
          Explore KOCH
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-20">
        <div className="mb-8 text-center">
          <Image
            src={isDark ? "/logo-white.png" : "/logo-transparent.png"}
            alt="KOCH"
            width={48}
            height={48}
            className="mx-auto"
            loading="lazy"
          />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2" style={{ backgroundColor: "var(--primary)" + "15" }}>
            <Gift size={16} style={{ color: "var(--primary)" }} />
            <span className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              Referred by {referral?.referrerName}
            </span>
          </div>
          <h1
            className="mt-6 text-3xl font-bold sm:text-4xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            You&apos;ve Been Invited!
          </h1>
          <p className="mt-3" style={{ color: "var(--muted)" }}>
            {referral?.referrerName} thinks you&apos;d love training at KOCH.
            Sign up for a free consultation and start your movement journey.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border p-8"
          style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
        >
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <User size={14} style={{ color: "var(--primary)" }} />
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail size={14} style={{ color: "var(--primary)" }} />
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Phone size={14} style={{ color: "var(--primary)" }} />
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
              placeholder="+972 XXX-XXX-XXXX"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <MessageSquare size={14} style={{ color: "var(--primary)" }} />
              Tell us about your goals (optional)
            </label>
            <textarea
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
              placeholder="What brought you here? Any pain, movement goals..."
            />
          </div>

          <input type="hidden" name="referralCode" value={referral?.referralCode || ""} />

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold tracking-wide transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--background)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Calendar size={16} />
            )}
            BOOK FREE CONSULTATION
          </button>

          <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
            Referral code: {referral?.referralCode}
          </p>
        </form>
      </div>
    </div>
  );
}
