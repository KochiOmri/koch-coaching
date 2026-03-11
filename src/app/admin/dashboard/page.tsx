/* ============================================================
   ADMIN DASHBOARD - src/app/admin/dashboard/page.tsx
   ============================================================
   The main admin page. Shows:
   
   1. Stats cards (today's appointments, total this week, etc.)
   2. Full monthly calendar with appointments marked on dates
   3. Click a date to see that day's appointments
   4. Today's upcoming sessions list
   
   This is your command center for managing your coaching schedule.
   ============================================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";

/* --- Appointment type (matches the server-side type) --- */
interface Appointment {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

/* --- Calendar Helpers --- */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminDashboard() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split("T")[0]
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  /* --- Fetch all appointments from the API ---
     Runs when the component first loads.
     The data is used to populate the calendar and stats. */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* --- Calculate Stats ---
     Derived from the appointments data. */
  const todayStr = today.toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr && a.status !== "cancelled");
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekAppointments = appointments.filter((a) => {
    const d = new Date(a.date);
    return d >= weekStart && d <= weekEnd && a.status !== "cancelled";
  });
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const totalClients = new Set(appointments.map((a) => a.email)).size;

  /* --- Get appointments for a specific date --- */
  const getAppointmentsForDate = (dateStr: string) => {
    return appointments
      .filter((a) => a.date === dateStr && a.status !== "cancelled")
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  /* --- Count appointments on a date (for calendar dots) --- */
  const getCountForDate = (dateStr: string) => {
    return appointments.filter((a) => a.date === dateStr && a.status !== "cancelled").length;
  };

  /* --- Calendar data --- */
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const selectedAppointments = getAppointmentsForDate(selectedDate);

  /* --- Status badge colors --- */
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
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
      <AdminSidebar />

      {/* Main content area (pushed right by sidebar width on desktop) */}
      <div className="md:ml-64">
        {/* Page header */}
        <header className="border-b px-6 py-6" style={{ borderColor: "var(--card-border)" }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        <div className="p-6">
          {/* --- Stats Cards --- */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today", value: todayAppointments.length, icon: Calendar, color: "var(--primary)" },
              { label: "This Week", value: weekAppointments.length, icon: TrendingUp, color: "#3b82f6" },
              { label: "Pending", value: pendingCount, icon: Clock, color: "#f59e0b" },
              { label: "Total Clients", value: totalClients, icon: Users, color: "#10b981" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border p-5"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: "var(--muted)" }}>{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                      {stat.value}
                    </p>
                  </div>
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* --- Calendar --- */}
            <div
              className="rounded-xl border p-6 lg:col-span-2"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                    else setCurrentMonth(currentMonth - 1);
                  }}
                  className="rounded-lg p-2 transition-colors"
                  style={{ color: "var(--muted)" }}
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <button
                  onClick={() => {
                    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                    else setCurrentMonth(currentMonth + 1);
                  }}
                  className="rounded-lg p-2 transition-colors"
                  style={{ color: "var(--muted)" }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Day name headers */}
              <div className="mt-4 grid grid-cols-7 gap-1">
                {dayNames.map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: "var(--muted)" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const count = getCountForDate(dateStr);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative flex h-16 flex-col items-center rounded-lg pt-1.5 text-sm transition-all ${
                        isSelected ? "ring-2" : "hover:bg-white/5"
                      }`}
                      style={{
                        backgroundColor: isSelected ? "var(--primary)" + "15" : "transparent",
                        color: isSelected ? "var(--primary)" : isToday ? "var(--primary)" : "inherit",
                        outlineColor: isSelected ? "var(--primary)" : "transparent",
                        outlineStyle: isSelected ? "solid" : "none",
                        outlineWidth: isSelected ? "2px" : "0",
                        outlineOffset: "-2px",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <span className={`${isToday ? "font-bold" : ""}`}>{day}</span>
                      {/* Dots showing how many appointments on this date */}
                      {count > 0 && (
                        <div className="mt-1 flex gap-0.5">
                          {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                            <div
                              key={j}
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: "var(--primary)" }}
                            />
                          ))}
                          {count > 3 && (
                            <span className="text-[10px]" style={{ color: "var(--primary)" }}>+</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Selected Date Appointments --- */}
            <div
              className="rounded-xl border p-6"
              style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {selectedAppointments.length} appointment{selectedAppointments.length !== 1 ? "s" : ""}
              </p>

              <div className="mt-4 space-y-3">
                {selectedAppointments.length === 0 ? (
                  <div className="rounded-lg py-8 text-center text-sm" style={{ color: "var(--muted)" }}>
                    No appointments on this date
                  </div>
                ) : (
                  selectedAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="rounded-xl border p-4 transition-colors"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} style={{ color: "var(--primary)" }} />
                            <span className="text-sm font-semibold">{apt.time}</span>
                          </div>
                          <p className="mt-1 font-medium">{apt.name}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {apt.service}
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[apt.status]}`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2 text-xs" style={{ color: "var(--muted)" }}>
                        <span>{apt.email}</span>
                        <span>•</span>
                        <span>{apt.phone}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
