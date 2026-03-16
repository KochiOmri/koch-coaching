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
  Send,
  Check,
  BarChart3,
  UserCheck,
  CreditCard,
  FileText,
} from "lucide-react";

interface ClientData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface SessionNote {
  id: string;
  clientId: string;
  date: string;
  createdAt: string;
}

function BookingsChart({ appointments }: { appointments: Appointment[] }) {
  const now = new Date();
  const weeks: { label: string; count: number }[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const count = appointments.filter((a) => {
      const d = new Date(a.date);
      return d >= weekStart && d <= weekEnd && a.status !== "cancelled";
    }).length;

    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
    weeks.push({ label, count });
  }

  const maxCount = Math.max(...weeks.map((w) => w.count), 1);
  const width = 560;
  const height = 160;
  const padX = 40;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = weeks.map((w, i) => ({
    x: padX + (i / (weeks.length - 1)) * chartW,
    y: padY + chartH - (w.count / maxCount) * chartH,
    ...w,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padY + chartH} L ${points[0].x} ${padY + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      {[0, Math.ceil(maxCount / 2), maxCount].map((v) => {
        const y = padY + chartH - (v / maxCount) * chartH;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="var(--card-border)" strokeWidth="1" />
            <text x={padX - 8} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="10">{v}</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#bookingsGrad)" />
      <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" />
          <text x={p.x} y={padY + chartH + 14} textAnchor="middle" fill="var(--muted)" fontSize="9">{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

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
  const [registeredClients, setRegisteredClients] = useState<ClientData[]>([]);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [aptsRes, clientsRes, notesRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/clients"),
        fetch("/api/session-notes"),
      ]);
      if (aptsRes.ok) setAppointments(await aptsRes.json());
      if (clientsRes.ok) setRegisteredClients(await clientsRes.json());
      if (notesRes.ok) setSessionNotes(await notesRes.json());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleSendReminders = async () => {
    setSendingReminders(true);
    setReminderResult(null);
    try {
      const res = await fetch("/api/cron");
      const data = await res.json();
      if (res.ok) {
        setReminderResult(`Sent ${data.reminders} reminder(s) and ${data.followups} follow-up(s)`);
        setTimeout(() => setReminderResult(null), 5000);
      } else {
        setReminderResult("Failed to send emails");
        setTimeout(() => setReminderResult(null), 5000);
      }
    } catch {
      setReminderResult("Network error");
      setTimeout(() => setReminderResult(null), 5000);
    } finally {
      setSendingReminders(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                Dashboard
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {reminderResult && (
                <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm" style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}>
                  <Check size={14} />
                  {reminderResult}
                </span>
              )}
              <button
                onClick={handleSendReminders}
                disabled={sendingReminders}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #d4a843, #b8922e)", color: "#000" }}
              >
                {sendingReminders ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {sendingReminders ? "Sending…" : "Send Reminders"}
              </button>
            </div>
          </div>
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

          {/* --- Analytics Section --- */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
              Analytics & Insights
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(() => {
                const thisMonth = today.toISOString().slice(0, 7);
                const sessionsThisMonth = sessionNotes.filter((n) => n.date.startsWith(thisMonth)).length;
                const totalSessions = sessionNotes.length;

                const clientSessionCounts: Record<string, number> = {};
                for (const n of sessionNotes) {
                  clientSessionCounts[n.clientId] = (clientSessionCounts[n.clientId] || 0) + 1;
                }
                const retainedClients = Object.values(clientSessionCounts).filter((c) => c >= 2).length;

                return [
                  { label: "Registered Clients", value: registeredClients.length, icon: Users, color: "#10b981" },
                  { label: "Sessions This Month", value: sessionsThisMonth, icon: FileText, color: "var(--primary)" },
                  { label: "Total Sessions", value: totalSessions, icon: BarChart3, color: "#3b82f6" },
                  { label: "Retained (2+ sessions)", value: retainedClients, icon: UserCheck, color: "#8b5cf6" },
                ];
              })().map((stat) => (
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

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Bookings Per Week Chart */}
              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 size={18} style={{ color: "#3b82f6" }} />
                  <h3 className="font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                    Bookings Per Week (Last 8 Weeks)
                  </h3>
                </div>
                <BookingsChart appointments={appointments} />
              </div>

              {/* Revenue Placeholder */}
              <div
                className="flex flex-col items-center justify-center rounded-2xl border p-8 text-center"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              >
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: "var(--primary)" + "15" }}
                >
                  <CreditCard size={28} style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>Revenue Tracking</h3>
                <p className="mt-2 max-w-xs text-sm" style={{ color: "var(--muted)" }}>
                  Coming soon — connect Stripe to track revenue, view payment history, and generate financial reports.
                </p>
                <div
                  className="mt-4 rounded-full px-4 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                >
                  Coming Soon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
