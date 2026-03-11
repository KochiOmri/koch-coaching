/* ============================================================
   APPOINTMENTS MANAGEMENT - src/app/admin/appointments/page.tsx
   ============================================================
   Full table view of all appointments with actions:
   
   - View all appointments in a table
   - Filter by status (all, pending, confirmed, cancelled)
   - Search by client name or email
   - Confirm pending appointments
   - Cancel appointments
   - Delete appointments
   
   This is where you manage your day-to-day booking operations.
   ============================================================ */

"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Filter,
  RefreshCw,
} from "lucide-react";

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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* --- Fetch appointments --- */
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  /* --- Update appointment status ---
     Sends a PATCH request to update the status.
     Used for confirming or cancelling appointments. */
  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: status as Appointment["status"] } : a))
        );
      }
    } catch (error) {
      console.error("Failed to update:", error);
    } finally {
      setActionLoading(null);
    }
  };

  /* --- Delete appointment --- */
  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;
    setActionLoading(id);
    try {
      const response = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (response.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setActionLoading(null);
    }
  };

  /* --- Filter and search ---
     Combines the status filter and search query to narrow results. */
  const filteredAppointments = appointments
    .filter((a) => statusFilter === "all" || a.status === statusFilter)
    .filter(
      (a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.service.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500",
    confirmed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
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
                Appointments
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                {appointments.length} total appointments
              </p>
            </div>
            <button
              onClick={fetchAppointments}
              className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* Search and filter bar */}
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or service..."
                className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}
              />
            </div>

            {/* Status filter buttons */}
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: "var(--muted)" }} />
              {["all", "pending", "confirmed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    statusFilter === status ? "text-background" : ""
                  }`}
                  style={{
                    backgroundColor: statusFilter === status ? "var(--primary)" : "var(--card-bg)",
                    color: statusFilter === status ? "var(--background)" : "var(--muted)",
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Appointments table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="py-20 text-center text-sm" style={{ color: "var(--muted)" }}>
              {searchQuery || statusFilter !== "all"
                ? "No appointments match your filters"
                : "No appointments yet. They'll appear here when clients book sessions."}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border" style={{ borderColor: "var(--card-border)" }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: "var(--card-bg)" }}>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>Date & Time</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>Client</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>Service</th>
                    <th className="px-4 py-3 text-left font-medium" style={{ color: "var(--muted)" }}>Status</th>
                    <th className="px-4 py-3 text-right font-medium" style={{ color: "var(--muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-t transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: "var(--card-border)" }}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {new Date(apt.date + "T00:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{apt.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{apt.name}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{apt.email}</div>
                        <div className="text-xs" style={{ color: "var(--muted)" }}>{apt.phone}</div>
                      </td>
                      <td className="px-4 py-3">{apt.service}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[apt.status]}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actionLoading === apt.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <>
                              {apt.status === "pending" && (
                                <button
                                  onClick={() => updateStatus(apt.id, "confirmed")}
                                  className="rounded-lg p-2 text-green-500 transition-colors hover:bg-green-500/10"
                                  title="Confirm"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {apt.status !== "cancelled" && (
                                <button
                                  onClick={() => updateStatus(apt.id, "cancelled")}
                                  className="rounded-lg p-2 text-yellow-500 transition-colors hover:bg-yellow-500/10"
                                  title="Cancel"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAppointment(apt.id)}
                                className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-500/10"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
