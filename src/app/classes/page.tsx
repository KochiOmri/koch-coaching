"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2,
  Users,
  Clock,
  MapPin,
  CalendarDays,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface GroupClass {
  id: string;
  name: string;
  description: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: string[];
  waitlist: string[];
  price: number;
  isActive: boolean;
  location: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<GroupClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<{ classId: string; status: string } | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/group-classes");
      if (res.ok) {
        const data: GroupClass[] = await res.json();
        setClasses(data.filter((c) => c.isActive));
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    fetch("/api/client-auth")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.client?.id) setClientId(d.client.id);
      })
      .catch(() => {});
  }, [fetchClasses]);

  const handleJoin = async (classId: string) => {
    if (!clientId) {
      window.location.href = "/portal/login";
      return;
    }

    setJoining(classId);
    try {
      const res = await fetch(`/api/group-classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", clientId }),
      });
      if (res.ok) {
        const result = await res.json();
        setJoinResult({ classId, status: result.status });
        await fetchClasses();
      }
    } catch (error) {
      console.error("Join failed:", error);
    } finally {
      setJoining(null);
    }
  };

  const getClientStatus = (gc: GroupClass) => {
    if (!clientId) return null;
    if (gc.currentParticipants.includes(clientId)) return "joined";
    if (gc.waitlist.includes(clientId)) return "waitlisted";
    return null;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-medium tracking-widest" style={{ color: "var(--primary)" }}>
              GROUP TRAINING
            </span>
            <h1
              className="mt-4 text-4xl font-bold sm:text-5xl"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Group Classes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl" style={{ color: "var(--muted)" }}>
              Join our weekly group sessions and train alongside a small, focused group.
              Limited spots to ensure personalized attention.
            </p>
          </div>

          {loading ? (
            <div className="mt-16 flex justify-center">
              <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
            </div>
          ) : classes.length === 0 ? (
            <div className="mx-auto mt-16 max-w-md rounded-2xl border p-12 text-center" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
              <CalendarDays size={48} className="mx-auto mb-4" style={{ color: "var(--muted)" }} />
              <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                No classes available right now
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                Check back soon for upcoming group sessions.
              </p>
              <a
                href="/#book"
                className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--primary)", color: "var(--background)", fontFamily: "var(--font-outfit)" }}
              >
                Book a 1-on-1 Session
              </a>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((gc) => {
                const spotsLeft = gc.maxParticipants - gc.currentParticipants.length;
                const isFull = spotsLeft <= 0;
                const status = getClientStatus(gc);
                const justActed = joinResult?.classId === gc.id;

                return (
                  <div
                    key={gc.id}
                    className="flex flex-col rounded-2xl border transition-all hover:border-opacity-60"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: status ? "var(--primary)" : "var(--card-border)",
                    }}
                  >
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                          {gc.name}
                        </h3>
                        {isFull ? (
                          <span
                            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            style={{ backgroundColor: "#f59e0b20", color: "#f59e0b" }}
                          >
                            Full
                          </span>
                        ) : (
                          <span
                            className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                            style={{ backgroundColor: "var(--primary)" + "15", color: "var(--primary)" }}
                          >
                            {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
                          </span>
                        )}
                      </div>

                      {gc.description && (
                        <p className="mb-4 line-clamp-2 text-sm" style={{ color: "var(--muted)" }}>
                          {gc.description}
                        </p>
                      )}

                      <div className="mt-auto space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} style={{ color: "var(--primary)" }} />
                          Every {gc.dayOfWeek}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} style={{ color: "var(--primary)" }} />
                          {gc.time} · {gc.duration} min
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: "var(--primary)" }} />
                          {gc.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} style={{ color: "var(--primary)" }} />
                          {gc.currentParticipants.length}/{gc.maxParticipants} participants
                        </div>
                      </div>

                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--card-border)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(gc.currentParticipants.length / gc.maxParticipants) * 100}%`,
                            backgroundColor: isFull ? "#ef4444" : "var(--primary)",
                          }}
                        />
                      </div>

                      {gc.price > 0 && (
                        <p className="mt-3 text-lg font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-outfit)" }}>
                          ₪{gc.price}
                        </p>
                      )}
                      {gc.price === 0 && (
                        <p className="mt-3 text-lg font-bold" style={{ color: "var(--primary)", fontFamily: "var(--font-outfit)" }}>
                          Free
                        </p>
                      )}
                    </div>

                    <div className="border-t p-4" style={{ borderColor: "var(--card-border)" }}>
                      {status === "joined" ? (
                        <div className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                          <CheckCircle size={16} />
                          You&apos;re registered!
                        </div>
                      ) : status === "waitlisted" ? (
                        <div className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold" style={{ color: "#f59e0b" }}>
                          <AlertCircle size={16} />
                          Waitlisted
                        </div>
                      ) : justActed && joinResult?.status === "joined" ? (
                        <div className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold" style={{ color: "var(--primary)" }}>
                          <CheckCircle size={16} />
                          Registered!
                        </div>
                      ) : justActed && joinResult?.status === "waitlisted" ? (
                        <div className="flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold" style={{ color: "#f59e0b" }}>
                          <AlertCircle size={16} />
                          Added to waitlist
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoin(gc.id)}
                          disabled={joining === gc.id}
                          className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--background)",
                            fontFamily: "var(--font-outfit)",
                          }}
                        >
                          {joining === gc.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isFull ? (
                            "Join Waitlist"
                          ) : (
                            "Join Class"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
