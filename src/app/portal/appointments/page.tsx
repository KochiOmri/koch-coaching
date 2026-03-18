"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Video,
  MapPin,
  Plus,
  ChevronRight,
  Loader2,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import PortalNav from "@/components/PortalNav";
import { createClient } from "@/lib/supabase/client";

interface Appointment {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  service: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  meetLink?: string;
  message?: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const SERVICE_TYPES = [
  "Free Consultation",
  "1-on-1 Coaching Session",
  "Online Coaching Session",
  "Intensive Program Inquiry",
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatDate(d: string): string {
  const [y, m, day] = d.split("-");
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(day));
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function isPast(dateStr: string, timeStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const apt = new Date(y, m - 1, d, h, min);
  return apt < new Date();
}

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const styles: Record<Appointment["status"], { bg: string; text: string }> = {
    pending: { bg: "rgba(245, 158, 11, 0.2)", text: "#f59e0b" },
    confirmed: { bg: "rgba(34, 197, 94, 0.2)", text: "#22c55e" },
    cancelled: { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444" },
    completed: { bg: "rgba(59, 130, 246, 0.2)", text: "#3b82f6" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

export default function PortalAppointmentsPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showBookingForm, setShowBookingForm] = useState(false);

  // Booking form state
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0]);
  const [phone, setPhone] = useState("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("id, name, email, phone").eq("id", user.id).single();
      const clientInfo: ClientInfo = {
        id: user.id,
        name: profile?.name || user.email?.split("@")[0] || "",
        email: profile?.email || user.email || "",
        phone: profile?.phone || "",
      };
      setClient(clientInfo);

      const aptRes = await fetch(`/api/appointments?clientId=${clientInfo.id}`);
      if (!aptRes.ok) {
        setError("Failed to load appointments");
        return;
      }
      const data = await aptRes.json();
      // Normalize: API may return email or client_email (Supabase)
      const normalized: Appointment[] = (Array.isArray(data) ? data : []).map((a: Record<string, unknown>) => ({
        id: String(a.id ?? ""),
        date: String(a.date ?? ""),
        time: String(a.time ?? ""),
        name: String(a.name ?? a.client_name ?? ""),
        email: String(a.email ?? a.client_email ?? ""),
        service: String(a.service ?? ""),
        status: (a.status ?? "pending") as Appointment["status"],
        meetLink: a.meetLink ?? a.meet_link ? String(a.meetLink ?? a.meet_link) : undefined,
        message: a.message ?? a.notes ? String(a.message ?? a.notes) : undefined,
      }));
      setAppointments(normalized);
    } catch {
      setError("Something went wrong");
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (client?.phone) setPhone(client.phone);
  }, [client?.phone]);

  const upcoming = appointments.filter((a) => a.status !== "cancelled" && !isPast(a.date, a.time));
  const past = appointments.filter((a) => a.status === "cancelled" || isPast(a.date, a.time));

  const handleDateSelect = async (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    if (selected < today && selected.toDateString() !== today.toDateString()) return;
    if (selected.getDay() === 0 || selected.getDay() === 6) return;

    setSelectedDate(selected);
    setSelectedTime(null);
    setBookingError(null);

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/appointments/slots?date=${dateStr}`);
      if (res.ok) {
        const slots = await res.json();
        setBookedSlots(Array.isArray(slots) ? slots : []);
      } else {
        setBookedSlots([]);
      }
    } catch {
      setBookedSlots([]);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !selectedDate || !selectedTime) return;

    const phoneValue = phone.trim() || client.phone || "";
    if (!phoneValue) {
      setBookingError("Please enter your phone number");
      return;
    }

    setSubmitting(true);
    setBookingError(null);

    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          time: selectedTime,
          name: client.name,
          email: client.email,
          phone: phoneValue,
          service: selectedService,
          message: "",
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setShowBookingForm(false);
        setSelectedDate(null);
        setSelectedTime(null);
        loadData();
      } else {
        const err = await res.json();
        setBookingError(err.error || "Failed to book appointment");
      }
    } catch {
      setBookingError("Something went wrong. Please try again.");
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <PortalNav />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-outfit)" }}>
              Appointments
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              View and book your coaching sessions
            </p>
          </div>
          <button
            onClick={() => {
              setShowBookingForm(!showBookingForm);
              setBookingSuccess(false);
              setBookingError(null);
              setSelectedDate(null);
              setSelectedTime(null);
              setPhone(client?.phone ?? "");
            }}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--background)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            <Plus size={18} />
            Book Appointment
          </button>
        </div>

        {error && (
          <div
            className="mb-6 rounded-xl border p-4"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444" }}
          >
            {error}
          </div>
        )}

        {bookingSuccess && (
          <div
            className="mb-6 rounded-xl border p-4"
            style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)", color: "#22c55e" }}
          >
            Your appointment has been booked successfully. You&apos;ll receive a confirmation email shortly.
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <div
            className="mb-8 rounded-2xl border p-6"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
              <CalendarDays size={20} style={{ color: "var(--primary)" }} />
              New Booking
            </h2>

            <form onSubmit={handleBook} className="space-y-6">
              {/* Date Picker */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Select Date
                </label>
                <div className="rounded-xl border p-4" style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}>
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMonth === 0) {
                          setCurrentMonth(11);
                          setCurrentYear(currentYear - 1);
                        } else setCurrentMonth(currentMonth - 1);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--muted)" }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {MONTH_NAMES[currentMonth]} {currentYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentMonth === 11) {
                          setCurrentMonth(0);
                          setCurrentYear(currentYear + 1);
                        } else setCurrentMonth(currentMonth + 1);
                      }}
                      className="rounded-lg p-2 transition-colors hover:bg-white/5"
                      style={{ color: "var(--muted)" }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs" style={{ color: "var(--muted)" }}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d} className="py-1">{d}</div>
                    ))}
                    {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
                      const day = i + 1;
                      const d = new Date(currentYear, currentMonth, day);
                      const isPast = d < today && d.toDateString() !== today.toDateString();
                      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth;
                      const disabled = isPast || isWeekend;
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => !disabled && handleDateSelect(day)}
                          disabled={disabled}
                          className="rounded-lg py-2 transition-all disabled:cursor-not-allowed disabled:opacity-30"
                          style={{
                            backgroundColor: isSelected ? "var(--primary)" : "transparent",
                            color: isSelected ? "var(--background)" : disabled ? "var(--muted)" : "var(--foreground)",
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <label className="mb-2 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                    Select Time
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => !isBooked && setSelectedTime(slot)}
                          disabled={isBooked}
                          className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
                          style={{
                            backgroundColor: isSelected ? "var(--primary)" : "var(--card-bg)",
                            borderColor: isSelected ? "var(--primary)" : "var(--card-border)",
                            color: isSelected ? "var(--background)" : "var(--foreground)",
                          }}
                        >
                          <Clock size={14} />
                          {formatTime(slot)}
                          {isBooked && <span className="text-xs" style={{ color: "var(--muted)" }}>(booked)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Phone (if not on profile) */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+972..."
                  className="w-full rounded-xl border py-3 px-4 text-sm outline-none"
                  style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  Service Type
                </label>
                <div className="relative">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full appearance-none rounded-xl border py-3 pl-4 pr-10 text-sm outline-none"
                    style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground)" }}
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                </div>
              </div>

              {bookingError && (
                <p className="text-sm" style={{ color: "#ef4444" }}>{bookingError}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || submitting}
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--background)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-4 flex gap-2 border-b" style={{ borderColor: "var(--card-border)" }}>
          <button
            onClick={() => setActiveTab("upcoming")}
            className="border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              borderColor: activeTab === "upcoming" ? "var(--primary)" : "transparent",
              color: activeTab === "upcoming" ? "var(--primary)" : "var(--muted)",
            }}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className="border-b-2 px-4 py-3 text-sm font-medium transition-colors"
            style={{
              borderColor: activeTab === "past" ? "var(--primary)" : "transparent",
              color: activeTab === "past" ? "var(--primary)" : "var(--muted)",
            }}
          >
            Past ({past.length})
          </button>
        </div>

        {/* Appointment List */}
        <div className="space-y-4">
          {(activeTab === "upcoming" ? upcoming : past).length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <CalendarDays size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                {activeTab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
                {activeTab === "upcoming"
                  ? "Book a session to get started. Use the button above to schedule your next appointment."
                  : "Your past sessions will appear here."}
              </p>
              {activeTab === "upcoming" && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--background)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  <Plus size={16} />
                  Book Appointment
                </button>
              )}
            </div>
          ) : (
            (activeTab === "upcoming" ? upcoming : past).map((apt) => (
              <div
                key={apt.id}
                className="group rounded-2xl border p-6 transition-all hover:border-primary/40"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={apt.status} />
                      <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {apt.service}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {formatDate(apt.date)} at {formatTime(apt.time)}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm" style={{ color: "var(--muted)" }}>
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {formatDate(apt.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {formatTime(apt.time)}
                      </span>
                      {apt.meetLink ? (
                        <a
                          href={apt.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 transition-colors hover:text-primary"
                          style={{ color: "var(--primary)" }}
                        >
                          <Video size={14} />
                          Join video call
                        </a>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} />
                          In-person
                        </span>
                      )}
                    </div>
                  </div>
                  {apt.meetLink && apt.status !== "cancelled" && !isPast(apt.date, apt.time) && (
                    <a
                      href={apt.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
                      style={{
                        backgroundColor: "var(--primary)",
                        color: "var(--background)",
                        borderColor: "var(--primary)",
                        fontFamily: "var(--font-outfit)",
                      }}
                    >
                      Join
                      <ChevronRight size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
