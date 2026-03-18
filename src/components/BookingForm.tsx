/* ============================================================
   BOOKING FORM - src/components/BookingForm.tsx
   ============================================================
   This is the appointment scheduling section where clients
   can book a free consultation session.
   
   Features:
   - Calendar date picker (shows available dates)
   - Time slot selection
   - Client info form (name, email, phone, message)
   - Service type selection
   - Form validation
   - Confirmation message after booking
   
   How it works:
   1. Client picks a date from the calendar
   2. Available time slots for that date are shown
   3. Client fills in their details
   4. On submit, data is saved (currently just logged)
   
   TODO (Phase 2):
   - Connect to Supabase to store bookings in database
   - Send confirmation emails
   - Integrate with Google Calendar API
   - Add Stripe payment later
   ============================================================ */

"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* --- Available Time Slots ---
   These are the default time slots shown for each day.
   In Phase 3, these will be generated from your availability
   settings in the back office. */
const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

/* --- Service Types ---
   Dropdown options for what type of session the client wants. */
const serviceTypes = [
  "Free Consultation",
  "1-on-1 Coaching Session",
  "Online Coaching Session",
  "Intensive Program Inquiry",
];

/* --- Helper: Get days in a month ---
   Returns the number of days in a given month/year.
   For example: February 2024 = 29 (leap year) */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/* --- Helper: Get first day of month ---
   Returns which day of the week the month starts on (0 = Sunday). */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function BookingForm() {
  /* --- State Variables ---
     These track everything the user has selected and entered. */
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: serviceTypes[0],
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: date, 2: time, 3: details
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  /* --- Calendar Navigation ---
     Functions to move between months in the calendar. */
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  /* --- Date Selection Handler ---
     When a user clicks a date on the calendar.
     Only allows selecting dates in the future (not past dates).
     Also fetches which time slots are already booked for that date. */
  const handleDateSelect = async (day: number) => {
    const selected = new Date(currentYear, currentMonth, day);
    if (selected < today && selected.toDateString() !== today.toDateString()) return;
    if (selected.getDay() === 0 || selected.getDay() === 6) return;
    
    setSelectedDate(selected);

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    try {
      const res = await fetch(`/api/appointments/slots?date=${dateStr}`);
      if (res.ok) {
        const slots = await res.json();
        setBookedSlots(slots);
      }
    } catch {
      setBookedSlots([]);
    }

    setCurrentStep(2);
  };

  /* --- Time Selection Handler --- */
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(3); // Move to details form
  };

  /* --- Form Submission Handler ---
     Sends the booking data to our API which:
     1. Saves it to the appointments data store
     2. Syncs it to Google Calendar (if configured)
     3. Returns the created appointment */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateStr = selectedDate
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
        : "";

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateStr,
          time: selectedTime,
          ...formData,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to book appointment. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  /* --- Calendar Rendering Data ---
     Calculate which days to show in the calendar grid. */
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /* --- If booking is confirmed, show success message --- */
  if (isSubmitted) {
    return (
      <section id="book" className="relative py-24 sm:py-32" style={{ backgroundColor: "var(--section-alt)" }}>
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div
            style={{
              transition: "all 0.5s ease",
              opacity: 1,
              transform: "scale(1)",
            }}
          >
            <CheckCircle size={64} className="mx-auto text-primary" />
            <h2
              className="mt-6 text-3xl font-bold"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Booking Confirmed!
            </h2>
            <p className="mt-4 text-muted">
              Your {formData.service} is scheduled for{" "}
              <span className="font-semibold text-foreground">
                {selectedDate?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>{" "}
              at{" "}
              <span className="font-semibold text-foreground">
                {selectedTime}
              </span>
              .
            </p>
            <p className="mt-2 text-sm text-muted">
              A confirmation email will be sent to {formData.email}
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedDate(null);
                setSelectedTime(null);
                setCurrentStep(1);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  service: serviceTypes[0],
                  message: "",
                });
              }}
              className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary-dark"
            >
              Book Another Session
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="book"
      className="relative py-24 sm:py-32"
      style={{ backgroundColor: "var(--section-alt)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* --- Section Header --- */}
        <div className="text-center">
          <span className="text-sm font-medium tracking-widest text-primary">
            SCHEDULE A SESSION
          </span>
          <h2
            className="mt-4 text-4xl font-bold sm:text-5xl"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Book Your Free Consultation
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Take the first step towards pain-free movement. Select a date and
            time that works for you, and let&apos;s discuss your goals.
          </p>
        </div>

        {/* --- Progress Steps ---
            Shows which step the user is on (1. Date, 2. Time, 3. Details) */}
        <div className="mx-auto mt-12 flex max-w-md items-center justify-center gap-4">
          {[
            { step: 1, label: "Date", icon: Calendar },
            { step: 2, label: "Time", icon: Clock },
            { step: 3, label: "Details", icon: User },
          ].map((item, index) => (
            <div key={item.step} className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (item.step === 1) setCurrentStep(1);
                  if (item.step === 2 && selectedDate) setCurrentStep(2);
                  if (item.step === 3 && selectedTime) setCurrentStep(3);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentStep >= item.step
                    ? "bg-primary text-background"
                    : "bg-card-bg text-muted"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
              {index < 2 && (
                <div
                  className={`h-px w-8 ${
                    currentStep > item.step ? "bg-primary" : "bg-card-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* --- Step 1: Calendar Date Picker --- */}
        {currentStep === 1 && (
          <div
            className="mx-auto mt-12 max-w-md rounded-2xl border border-card-border bg-card-bg p-6"
            style={{ transition: "all 0.5s ease", opacity: 1, transform: "translateY(0)" }}
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <ChevronLeft size={20} />
              </button>
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <button
                onClick={goToNextMonth}
                className="rounded-lg p-2 transition-colors hover:bg-secondary"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Names Header (Sun, Mon, Tue...) */}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-medium text-muted"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the 1st of the month */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Actual day buttons */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentYear, currentMonth, day);
                const isPast =
                  date < today &&
                  date.toDateString() !== today.toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isSelected =
                  selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    disabled={isPast || isWeekend}
                    className={`
                      rounded-lg py-2.5 text-sm transition-all
                      ${isPast || isWeekend
                        ? "cursor-not-allowed text-muted/30"
                        : "cursor-pointer hover:bg-primary/10 hover:text-primary"
                      }
                      ${isSelected ? "bg-primary font-bold text-background" : ""}
                      ${isToday && !isSelected ? "border border-primary/50" : ""}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Step 2: Time Slot Selection --- */}
        {currentStep === 2 && (
          <div
            className="mx-auto mt-12 max-w-md rounded-2xl border border-card-border bg-card-bg p-6"
            style={{ transition: "all 0.5s ease", opacity: 1, transform: "translateY(0)" }}
          >
            <h3
              className="text-center text-lg font-semibold"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Available Times for{" "}
              {selectedDate?.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {timeSlots.map((time) => {
                const isBooked = bookedSlots.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && handleTimeSelect(time)}
                    disabled={isBooked}
                    className={`
                      flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-all
                      ${isBooked
                        ? "cursor-not-allowed border-card-border opacity-30 line-through"
                        : selectedTime === time
                          ? "border-primary bg-primary text-background"
                          : "border-card-border hover:border-primary hover:text-primary"
                      }
                    `}
                  >
                    <Clock size={14} />
                    {time}
                    {isBooked && <span className="text-xs">(Taken)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Step 3: Client Details Form --- */}
        {currentStep === 3 && (
          <div
            className="mx-auto mt-12 max-w-lg"
            style={{ transition: "all 0.5s ease", opacity: 1, transform: "translateY(0)" }}
          >
            {/* Selected date/time summary */}
            <div className="mb-6 flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
                <Calendar size={14} />
                {selectedDate?.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
                <Clock size={14} />
                {selectedTime}
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-card-border bg-card-bg p-8"
            >
              {/* Name field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <User size={14} className="text-primary" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                  placeholder="Your full name"
                />
              </div>

              {/* Email field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Mail size={14} className="text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                  placeholder="your@email.com"
                />
              </div>

              {/* Phone field */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Phone size={14} className="text-primary" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                  placeholder="+972 XXX-XXX-XXXX"
                />
              </div>

              {/* Service type dropdown */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Calendar size={14} className="text-primary" />
                  Service Type
                </label>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message/notes textarea */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MessageSquare size={14} className="text-primary" />
                  Tell me about your goals (optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full resize-none rounded-xl border border-card-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                  placeholder="Describe your pain points, movement goals, or any questions..."
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full rounded-full bg-primary py-4 text-sm font-bold tracking-wide text-background transition-colors hover:bg-primary-dark"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                CONFIRM BOOKING
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
