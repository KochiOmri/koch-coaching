"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Stethoscope,
  Activity,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PAIN_CONDITIONS = [
  "Lower back pain",
  "Neck pain",
  "Shoulder pain",
  "Hip pain",
  "Knee pain",
  "Ankle pain",
  "Headaches",
  "Scoliosis",
  "Herniated disc",
  "Sciatica",
  "None",
] as const;

const ACTIVITY_LEVELS = [
  "Sedentary (little to no exercise)",
  "Lightly active (1-2 days/week)",
  "Moderately active (3-4 days/week)",
  "Very active (5-6 days/week)",
  "Athlete / highly active (daily)",
] as const;

const STEPS = [
  { label: "Personal", icon: User },
  { label: "Pain", icon: AlertCircle },
  { label: "Medical", icon: Stethoscope },
  { label: "Lifestyle", icon: Activity },
  { label: "Submit", icon: FileCheck },
];

interface IntakeFormData {
  name: string;
  email: string;
  phone: string;
  age: string;
  occupation: string;
  painConditions: string[];
  mainConcern: string;
  previousInjuries: string;
  surgeries: string;
  currentMedications: string;
  allergies: string;
  activityLevel: string;
  hoursSitting: string;
  exerciseFrequency: string;
  sportsActivities: string;
  goals: string;
  consentAccepted: boolean;
}

const INITIAL_FORM: IntakeFormData = {
  name: "",
  email: "",
  phone: "",
  age: "",
  occupation: "",
  painConditions: [],
  mainConcern: "",
  previousInjuries: "",
  surgeries: "",
  currentMedications: "",
  allergies: "",
  activityLevel: "",
  hoursSitting: "",
  exerciseFrequency: "",
  sportsActivities: "",
  goals: "",
  consentAccepted: false,
};

const inputClass =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary";

export default function IntakePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof IntakeFormData, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCondition = (condition: string) => {
    if (condition === "None") {
      set("painConditions", form.painConditions.includes("None") ? [] : ["None"]);
      return;
    }
    const without = form.painConditions.filter((c) => c !== "None");
    set(
      "painConditions",
      without.includes(condition)
        ? without.filter((c) => c !== condition)
        : [...without, condition]
    );
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0:
        return !!(form.name && form.email && form.phone && form.age);
      case 1:
        return form.painConditions.length > 0;
      case 2:
        return true;
      case 3:
        return !!(form.activityLevel && form.hoursSitting && form.exerciseFrequency);
      case 4:
        return form.consentAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!form.consentAccepted) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main
          className="flex min-h-screen items-center justify-center px-4 pt-14"
          style={{ backgroundColor: "var(--background)" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <CheckCircle size={64} className="mx-auto" style={{ color: "var(--primary)" }} />
            <h2
              className="mt-6 text-3xl font-bold"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Form Submitted!
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: "var(--muted)" }}>
              Thank you, {form.name}. Your health intake form has been received.
              We&apos;ll review your information before your first session to
              provide you with the best possible experience.
            </p>
            <a
              href="/"
              className="mt-8 inline-block rounded-full px-8 py-3 text-sm font-semibold transition-colors"
              style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
            >
              Back to Home
            </a>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen px-4 pb-20 pt-24 sm:px-6 lg:px-8"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <span
              className="text-sm font-medium tracking-widest"
              style={{ color: "var(--primary)" }}
            >
              CLIENT INTAKE
            </span>
            <h1
              className="mt-3 text-3xl font-bold sm:text-4xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Health Questionnaire
            </h1>
            <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
              Please fill out this form before your first session. All information
              is kept confidential.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mt-10 flex items-center justify-between gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => {
                  if (i < step) setStep(i);
                }}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor:
                      i <= step ? "var(--primary)" : "var(--card-bg)",
                    color:
                      i <= step ? "var(--background)" : "var(--muted)",
                    border:
                      i <= step ? "none" : "1px solid var(--card-border)",
                  }}
                >
                  <s.icon size={18} />
                </div>
                <span
                  className="hidden text-xs font-medium sm:block"
                  style={{ color: i <= step ? "var(--foreground)" : "var(--muted)" }}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>

          {/* Progress line */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-bg)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="mt-8 rounded-2xl border p-6 sm:p-8"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            >
              {/* Step 1: Personal Info */}
              {step === 0 && (
                <div className="space-y-5">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Personal Information
                  </h2>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <User size={14} style={{ color: "var(--primary)" }} />
                      Full Name <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Mail size={14} style={{ color: "var(--primary)" }} />
                      Email <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Phone size={14} style={{ color: "var(--primary)" }} />
                        Phone <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className={inputClass}
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                        placeholder="+972 XXX-XXX-XXXX"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                        Age <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="120"
                        value={form.age}
                        onChange={(e) => set("age", e.target.value)}
                        className={inputClass}
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                        placeholder="e.g. 32"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Briefcase size={14} style={{ color: "var(--primary)" }} />
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={form.occupation}
                      onChange={(e) => set("occupation", e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="e.g. Software Developer"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Pain & Conditions */}
              {step === 1 && (
                <div className="space-y-5">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Pain & Conditions
                  </h2>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Select all that apply:
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {PAIN_CONDITIONS.map((condition) => {
                      const selected = form.painConditions.includes(condition);
                      return (
                        <button
                          key={condition}
                          type="button"
                          onClick={() => toggleCondition(condition)}
                          className="rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all"
                          style={{
                            backgroundColor: selected
                              ? "var(--primary)"
                              : "var(--background)",
                            color: selected
                              ? "var(--background)"
                              : "var(--foreground)",
                            borderColor: selected
                              ? "var(--primary)"
                              : "var(--card-border)",
                          }}
                        >
                          {condition}
                        </button>
                      );
                    })}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Describe your main concern
                    </label>
                    <textarea
                      rows={4}
                      value={form.mainConcern}
                      onChange={(e) => set("mainConcern", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="Tell us about your primary issue, when it started, and how it affects your daily life..."
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Medical History */}
              {step === 2 && (
                <div className="space-y-5">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Medical History
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Previous Injuries
                    </label>
                    <textarea
                      rows={3}
                      value={form.previousInjuries}
                      onChange={(e) => set("previousInjuries", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="List any past injuries (e.g. torn ACL in 2019, broken wrist in 2015)..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Surgeries
                    </label>
                    <textarea
                      rows={3}
                      value={form.surgeries}
                      onChange={(e) => set("surgeries", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="List any surgeries you've had..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Current Medications
                    </label>
                    <textarea
                      rows={3}
                      value={form.currentMedications}
                      onChange={(e) => set("currentMedications", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="List any medications or supplements you're currently taking..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Allergies
                    </label>
                    <textarea
                      rows={2}
                      value={form.allergies}
                      onChange={(e) => set("allergies", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="List any known allergies..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Movement & Lifestyle */}
              {step === 3 && (
                <div className="space-y-5">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Movement & Lifestyle
                  </h2>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Activity Level <span style={{ color: "var(--primary)" }}>*</span>
                    </label>
                    <select
                      value={form.activityLevel}
                      onChange={(e) => set("activityLevel", e.target.value)}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      <option value="">Select your activity level</option>
                      {ACTIVITY_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Hours Sitting/Day <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={form.hoursSitting}
                        onChange={(e) => set("hoursSitting", e.target.value)}
                        className={inputClass}
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                        placeholder="e.g. 8"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Exercise Frequency <span style={{ color: "var(--primary)" }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.exerciseFrequency}
                        onChange={(e) => set("exerciseFrequency", e.target.value)}
                        className={inputClass}
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                        placeholder="e.g. 3 times/week"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Sports / Activities
                    </label>
                    <input
                      type="text"
                      value={form.sportsActivities}
                      onChange={(e) => set("sportsActivities", e.target.value)}
                      className={inputClass}
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="e.g. Running, swimming, yoga"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      What are your goals?
                    </label>
                    <textarea
                      rows={4}
                      value={form.goals}
                      onChange={(e) => set("goals", e.target.value)}
                      className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                      placeholder="Describe what you'd like to achieve through Functional Patterns coaching..."
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Consent & Submit */}
              {step === 4 && (
                <div className="space-y-6">
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Review & Submit
                  </h2>

                  {/* Summary */}
                  <div
                    className="space-y-3 rounded-xl border p-4 text-sm"
                    style={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>Name</span>
                      <span className="font-medium">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>Email</span>
                      <span className="font-medium">{form.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>Conditions</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {form.painConditions.join(", ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--muted)" }}>Activity Level</span>
                      <span className="max-w-[60%] text-right font-medium">
                        {form.activityLevel || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Consent checkbox */}
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.consentAccepted}
                      onChange={(e) => set("consentAccepted", e.target.checked)}
                      className="mt-1 h-4 w-4 accent-primary"
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      I confirm that the information provided is accurate. I
                      understand that this intake form is for informational
                      purposes and does not constitute medical advice. I consent
                      to my data being stored securely for use in my coaching
                      sessions.
                    </span>
                  </label>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!form.consentAccepted || submitting}
                    className="w-full rounded-full py-4 text-sm font-bold tracking-wide transition-all disabled:opacity-40"
                    style={{
                      backgroundColor: "var(--primary)",
                      color: "var(--background)",
                      fontFamily: "var(--font-outfit)",
                    }}
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "SUBMIT INTAKE FORM"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
              style={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>
            {step < 4 && (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                disabled={!canAdvance()}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all disabled:opacity-30"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--background)",
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
