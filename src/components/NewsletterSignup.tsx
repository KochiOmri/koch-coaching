/**
 * NewsletterSignup — Email signup form for footer.
 *
 * Single-field form that POSTs to /api/newsletter. Handles loading, success (including
 * 409 "already subscribed"), and error states. Resets status after 3s.
 *
 * CMS/Architecture: No CMS props. Submits to /api/newsletter; backend handles storage.
 * Typically composed inside Footer.
 */
"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Subscribed!");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("success");
        setMessage("Already subscribed!");
      } else {
        setStatus("error");
        setMessage("Failed. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong.");
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  };

  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest" style={{ fontFamily: "var(--font-outfit)" }}>
        NEWSLETTER
      </h4>
      <p className="mt-2 text-xs text-muted">Get movement tips & updates</p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-card-border bg-background py-2 pl-9 pr-3 text-xs outline-none transition-colors focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-background transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === "success" ? (
            <CheckCircle size={14} />
          ) : (
            "Join"
          )}
        </button>
      </form>
      {message && (
        <p className={`mt-1 text-[10px] ${status === "error" ? "text-red-400" : "text-primary"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
