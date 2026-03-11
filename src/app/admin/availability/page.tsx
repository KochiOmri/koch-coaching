/* ============================================================
   AVAILABILITY SETTINGS - src/app/admin/availability/page.tsx
   ============================================================
   This page lets you configure:
   
   1. Working days (which days of the week you take clients)
   2. Working hours (start time and end time for each day)
   3. Session duration (how long each appointment slot is)
   4. Blocked dates (holidays, vacations, etc.)
   
   The settings are saved to a JSON file on the server.
   The booking form uses these settings to show only
   available time slots to clients.
   ============================================================ */

"use client";

import { useState } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import { Save, Plus, X, Clock, Calendar } from "lucide-react";

/* --- Default schedule ---
   Represents your weekly availability.
   enabled = whether you work that day. */
interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const defaultSchedule: DaySchedule[] = [
  { day: "Sunday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Monday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Tuesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Wednesday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Thursday", enabled: true, startTime: "09:00", endTime: "18:00" },
  { day: "Friday", enabled: true, startTime: "09:00", endTime: "13:00" },
  { day: "Saturday", enabled: false, startTime: "09:00", endTime: "13:00" },
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
  const [sessionDuration, setSessionDuration] = useState(60);
  const [breakBetween, setBreakBetween] = useState(0);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState("");
  const [saved, setSaved] = useState(false);

  /* --- Toggle a day on/off --- */
  const toggleDay = (index: number) => {
    const updated = [...schedule];
    updated[index].enabled = !updated[index].enabled;
    setSchedule(updated);
    setSaved(false);
  };

  /* --- Update time for a day --- */
  const updateTime = (index: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
    setSaved(false);
  };

  /* --- Add a blocked date --- */
  const addBlockedDate = () => {
    if (newBlockedDate && !blockedDates.includes(newBlockedDate)) {
      setBlockedDates([...blockedDates, newBlockedDate]);
      setNewBlockedDate("");
      setSaved(false);
    }
  };

  /* --- Remove a blocked date --- */
  const removeBlockedDate = (date: string) => {
    setBlockedDates(blockedDates.filter((d) => d !== date));
    setSaved(false);
  };

  /* --- Save settings ---
     For now, just shows a success message.
     In Phase 2, this saves to the database and the booking form
     reads these settings to show correct available slots. */
  const handleSave = () => {
    console.log("Availability saved:", { schedule, sessionDuration, breakBetween, blockedDates });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />

      <div className="md:ml-64">
        {/* Header */}
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Availability
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Set your working hours and blocked dates
              </p>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-colors"
              style={{
                backgroundColor: saved ? "#10b981" : "var(--primary)",
                color: "var(--background)",
              }}
            >
              <Save size={14} />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* --- Weekly Schedule --- */}
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <h2 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                <Clock size={18} style={{ color: "var(--primary)" }} />
                Weekly Schedule
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                Set which days and hours you&apos;re available for sessions
              </p>

              <div className="mt-6 space-y-3">
                {schedule.map((day, index) => (
                  <div
                    key={day.day}
                    className={`flex items-center gap-4 rounded-xl border p-4 transition-opacity ${
                      !day.enabled ? "opacity-40" : ""
                    }`}
                    style={{ borderColor: "var(--card-border)" }}
                  >
                    {/* Day toggle */}
                    <button
                      onClick={() => toggleDay(index)}
                      className={`h-5 w-5 rounded-md border-2 transition-colors ${
                        day.enabled ? "border-transparent" : ""
                      }`}
                      style={{
                        backgroundColor: day.enabled ? "var(--primary)" : "transparent",
                        borderColor: day.enabled ? "var(--primary)" : "var(--card-border)",
                      }}
                    >
                      {day.enabled && (
                        <svg viewBox="0 0 16 16" fill="var(--background)" className="h-full w-full p-0.5">
                          <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                        </svg>
                      )}
                    </button>

                    {/* Day name */}
                    <span className="w-24 text-sm font-medium">{day.day}</span>

                    {/* Time inputs */}
                    {day.enabled && (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => updateTime(index, "startTime", e.target.value)}
                          className="rounded-lg border px-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--card-border)",
                          }}
                        />
                        <span className="text-sm" style={{ color: "var(--muted)" }}>to</span>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => updateTime(index, "endTime", e.target.value)}
                          className="rounded-lg border px-3 py-1.5 text-sm"
                          style={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--card-border)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* --- Session Settings --- */}
              <div
                className="rounded-xl border p-6"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <h2 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  <Clock size={18} style={{ color: "var(--primary)" }} />
                  Session Settings
                </h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Session Duration (minutes)</label>
                    <select
                      value={sessionDuration}
                      onChange={(e) => { setSessionDuration(Number(e.target.value)); setSaved(false); }}
                      className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes (1 hour)</option>
                      <option value={90}>90 minutes (1.5 hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Break Between Sessions (minutes)</label>
                    <select
                      value={breakBetween}
                      onChange={(e) => { setBreakBetween(Number(e.target.value)); setSaved(false); }}
                      className="mt-1 w-full rounded-xl border px-4 py-2.5 text-sm"
                      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                    >
                      <option value={0}>No break</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* --- Blocked Dates --- */}
              <div
                className="rounded-xl border p-6"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <h2 className="flex items-center gap-2 font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  <Calendar size={18} style={{ color: "var(--primary)" }} />
                  Blocked Dates
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Block specific dates for holidays or time off
                </p>

                {/* Add blocked date */}
                <div className="mt-4 flex gap-2">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="flex-1 rounded-xl border px-4 py-2.5 text-sm"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                  <button
                    onClick={addBlockedDate}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
                    style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* List of blocked dates */}
                <div className="mt-3 space-y-2">
                  {blockedDates.length === 0 ? (
                    <p className="py-4 text-center text-sm" style={{ color: "var(--muted)" }}>
                      No blocked dates
                    </p>
                  ) : (
                    blockedDates
                      .sort()
                      .map((date) => (
                        <div
                          key={date}
                          className="flex items-center justify-between rounded-lg border px-4 py-2.5"
                          style={{ borderColor: "var(--card-border)" }}
                        >
                          <span className="text-sm">
                            {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <button
                            onClick={() => removeBlockedDate(date)}
                            className="text-red-400 transition-colors hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
