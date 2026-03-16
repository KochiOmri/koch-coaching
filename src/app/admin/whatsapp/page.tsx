"use client";

import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  MessageCircle,
  Send,
  Clock,
  FileText,
  Loader2,
  Search,
  ExternalLink,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  sendWhatsAppMessage,
  generateReminderMessage,
  generateFollowUpMessage,
  generateConfirmationMessage,
  generateWelcomeMessage,
} from "@/lib/whatsapp";

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
  meetLink?: string;
}

interface Template {
  id: string;
  name: string;
  template: string;
}

type Tab = "quick" | "reminders" | "templates";

export default function WhatsAppPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("quick");

  const [selectedPhone, setSelectedPhone] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const [quickMessage, setQuickMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aptRes, tplRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/whatsapp-templates"),
      ]);
      if (aptRes.ok) setAppointments(await aptRes.json());
      if (tplRes.ok) setTemplates(await tplRes.json());
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const upcomingAppointments = appointments
    .filter((a) => {
      if (a.status === "cancelled") return false;
      const aptDate = new Date(a.date + "T" + a.time);
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      return aptDate >= now && aptDate <= in24h;
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const uniqueClients = appointments.reduce<
    { name: string; phone: string }[]
  >((acc, a) => {
    if (a.phone && !acc.some((c) => c.phone === a.phone)) {
      acc.push({ name: a.name, phone: a.phone });
    }
    return acc;
  }, []);

  const filteredClients = uniqueClients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const openWhatsApp = (phone: string, message: string) => {
    window.open(sendWhatsAppMessage(phone, message), "_blank");
  };

  const handleSelectClient = (name: string, phone: string) => {
    setSelectedName(name);
    setSelectedPhone(phone);
    setSearchQuery("");
  };

  const fillTemplate = (template: string, apt?: Appointment) => {
    let msg = template;
    if (apt) {
      const date = new Date(apt.date + "T00:00:00").toLocaleDateString(
        "en-US",
        { weekday: "long", month: "long", day: "numeric" }
      );
      msg = msg
        .replace(/{name}/g, apt.name)
        .replace(/{date}/g, date)
        .replace(/{time}/g, apt.time)
        .replace(/{service}/g, apt.service);
    } else if (selectedName) {
      msg = msg.replace(/{name}/g, selectedName);
    }
    return msg;
  };

  const handleSaveTemplate = async (id: string, newText: string) => {
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/whatsapp-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, template: newText }),
      });
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, template: newText } : t))
        );
        setEditingTemplate(null);
      }
    } catch (err) {
      console.error("Failed to save template:", err);
    } finally {
      setSavingTemplate(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof MessageCircle }[] = [
    { id: "quick", label: "Quick Message", icon: Send },
    { id: "reminders", label: "Bulk Reminders", icon: Clock },
    { id: "templates", label: "Templates", icon: FileText },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      <AdminSidebar />

      <div className="md:ml-64">
        <header
          className="border-b px-6 py-6"
          style={{ borderColor: "var(--card-border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#25D366" }}
            >
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                WhatsApp Messages
              </h1>
              <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>
                Send messages and reminders to clients
              </p>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Tabs */}
          <div className="mb-6 flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
                style={{
                  backgroundColor:
                    activeTab === tab.id ? "var(--primary)" : "var(--card-bg)",
                  color:
                    activeTab === tab.id
                      ? "var(--background)"
                      : "var(--muted)",
                  borderColor: "var(--card-border)",
                  borderWidth: activeTab === tab.id ? 0 : 1,
                }}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--primary)" }}
              />
            </div>
          ) : (
            <>
              {/* Quick Message Tab */}
              {activeTab === "quick" && (
                <div
                  className="rounded-2xl border p-6"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <h2
                    className="mb-4 text-lg font-semibold"
                    style={{ fontFamily: "var(--font-outfit)" }}
                  >
                    Send a Quick Message
                  </h2>

                  {/* Client search */}
                  <div className="mb-4">
                    <label
                      className="mb-1.5 block text-sm font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      Select Client
                    </label>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--muted)" }}
                      />
                      <input
                        type="text"
                        value={
                          selectedName
                            ? `${selectedName} (${selectedPhone})`
                            : searchQuery
                        }
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedName("");
                          setSelectedPhone("");
                        }}
                        placeholder="Search by name or phone..."
                        className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none"
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                      />
                    </div>

                    {searchQuery && !selectedName && (
                      <div
                        className="mt-1 max-h-40 overflow-y-auto rounded-xl border"
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                      >
                        {filteredClients.length === 0 ? (
                          <p
                            className="p-3 text-sm"
                            style={{ color: "var(--muted)" }}
                          >
                            No clients found
                          </p>
                        ) : (
                          filteredClients.map((c) => (
                            <button
                              key={c.phone}
                              onClick={() =>
                                handleSelectClient(c.name, c.phone)
                              }
                              className="flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                            >
                              <span className="font-medium">{c.name}</span>
                              <span style={{ color: "var(--muted)" }}>
                                {c.phone}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Or enter phone manually */}
                  {!selectedName && (
                    <div className="mb-4">
                      <label
                        className="mb-1.5 block text-sm font-medium"
                        style={{ color: "var(--muted)" }}
                      >
                        Or enter phone number
                      </label>
                      <input
                        type="tel"
                        value={selectedPhone}
                        onChange={(e) => setSelectedPhone(e.target.value)}
                        placeholder="e.g. 0541234567"
                        className="w-full rounded-xl border py-2.5 px-4 text-sm outline-none"
                        style={{
                          backgroundColor: "var(--background)",
                          borderColor: "var(--card-border)",
                        }}
                      />
                    </div>
                  )}

                  {/* Quick template buttons */}
                  {selectedPhone && (
                    <div className="mb-4">
                      <label
                        className="mb-1.5 block text-sm font-medium"
                        style={{ color: "var(--muted)" }}
                      >
                        Quick Templates
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() =>
                              setQuickMessage(fillTemplate(t.template))
                            }
                            className="rounded-lg border px-3 py-1.5 text-xs transition-colors hover:border-primary"
                            style={{
                              borderColor: "var(--card-border)",
                              color: "var(--muted)",
                            }}
                          >
                            {t.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message textarea */}
                  <div className="mb-4">
                    <label
                      className="mb-1.5 block text-sm font-medium"
                      style={{ color: "var(--muted)" }}
                    >
                      Message
                    </label>
                    <textarea
                      value={quickMessage}
                      onChange={(e) => setQuickMessage(e.target.value)}
                      rows={4}
                      placeholder="Type your message..."
                      className="w-full resize-none rounded-xl border p-4 text-sm outline-none"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--card-border)",
                      }}
                    />
                  </div>

                  <button
                    onClick={() => openWhatsApp(selectedPhone, quickMessage)}
                    disabled={!selectedPhone || !quickMessage}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
                    style={{
                      backgroundColor: "#25D366",
                      color: "#fff",
                    }}
                  >
                    <Send size={16} />
                    Open in WhatsApp
                  </button>
                </div>
              )}

              {/* Bulk Reminders Tab */}
              {activeTab === "reminders" && (
                <div>
                  <div
                    className="mb-4 rounded-2xl border p-4"
                    style={{
                      backgroundColor: "var(--card-bg)",
                      borderColor: "var(--card-border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: "var(--primary)" }} />
                      <span className="text-sm font-medium">
                        Upcoming Appointments (Next 24 Hours)
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {upcomingAppointments.length} appointment
                      {upcomingAppointments.length !== 1 ? "s" : ""} coming up
                    </p>
                  </div>

                  {upcomingAppointments.length === 0 ? (
                    <div
                      className="py-16 text-center text-sm"
                      style={{ color: "var(--muted)" }}
                    >
                      No upcoming appointments in the next 24 hours
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between rounded-2xl border p-4"
                          style={{
                            backgroundColor: "var(--card-bg)",
                            borderColor: "var(--card-border)",
                          }}
                        >
                          <div>
                            <p className="font-medium">{apt.name}</p>
                            <p
                              className="text-sm"
                              style={{ color: "var(--muted)" }}
                            >
                              {new Date(
                                apt.date + "T00:00:00"
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              at {apt.time} — {apt.service}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted)" }}
                            >
                              {apt.phone}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                openWhatsApp(
                                  apt.phone,
                                  generateReminderMessage(apt)
                                )
                              }
                              className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                              style={{
                                backgroundColor: "#25D366",
                                color: "#fff",
                              }}
                            >
                              <MessageCircle size={14} />
                              Send Reminder
                            </button>
                            <button
                              onClick={() =>
                                openWhatsApp(
                                  apt.phone,
                                  generateFollowUpMessage(apt)
                                )
                              }
                              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-colors"
                              style={{
                                borderColor: "var(--card-border)",
                                color: "var(--muted)",
                              }}
                            >
                              Follow Up
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* All confirmed appointments for quick access */}
                  <div className="mt-8">
                    <h3
                      className="mb-3 text-lg font-semibold"
                      style={{ fontFamily: "var(--font-outfit)" }}
                    >
                      All Active Clients
                    </h3>
                    <div className="space-y-2">
                      {appointments
                        .filter((a) => a.status !== "cancelled" && a.phone)
                        .sort(
                          (a, b) =>
                            (b.date + b.time).localeCompare(a.date + a.time)
                        )
                        .slice(0, 20)
                        .map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between rounded-xl border px-4 py-3"
                            style={{
                              backgroundColor: "var(--card-bg)",
                              borderColor: "var(--card-border)",
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-sm font-medium">
                                  {apt.name}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: "var(--muted)" }}
                                >
                                  {apt.date} at {apt.time}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() =>
                                  openWhatsApp(
                                    apt.phone,
                                    generateReminderMessage(apt)
                                  )
                                }
                                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                                title="Send Reminder"
                              >
                                <Clock
                                  size={15}
                                  style={{ color: "var(--primary)" }}
                                />
                              </button>
                              <button
                                onClick={() =>
                                  openWhatsApp(
                                    apt.phone,
                                    generateFollowUpMessage(apt)
                                  )
                                }
                                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                                title="Send Follow-Up"
                              >
                                <Send
                                  size={15}
                                  style={{ color: "var(--muted)" }}
                                />
                              </button>
                              <a
                                href={sendWhatsAppMessage(apt.phone, "")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg p-2 transition-colors hover:bg-white/5"
                                title="Open Chat"
                              >
                                <ExternalLink
                                  size={15}
                                  style={{ color: "var(--muted)" }}
                                />
                              </a>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === "templates" && (
                <div className="space-y-4">
                  {templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border p-5"
                      style={{
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                      }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">{tpl.name}</h3>
                        <div className="flex gap-2">
                          {editingTemplate === tpl.id ? (
                            <>
                              <button
                                onClick={() =>
                                  handleSaveTemplate(tpl.id, editedText)
                                }
                                disabled={savingTemplate}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                                style={{
                                  backgroundColor: "var(--primary)",
                                  color: "var(--background)",
                                }}
                              >
                                {savingTemplate ? (
                                  <Loader2
                                    size={12}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Save size={12} />
                                )}
                                Save
                              </button>
                              <button
                                onClick={() => setEditingTemplate(null)}
                                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                                style={{
                                  borderColor: "var(--card-border)",
                                  color: "var(--muted)",
                                }}
                              >
                                <RotateCcw size={12} />
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingTemplate(tpl.id);
                                setEditedText(tpl.template);
                              }}
                              className="rounded-lg border px-3 py-1.5 text-xs transition-colors"
                              style={{
                                borderColor: "var(--card-border)",
                                color: "var(--muted)",
                              }}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </div>

                      {editingTemplate === tpl.id ? (
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          rows={3}
                          className="w-full resize-none rounded-xl border p-3 text-sm outline-none"
                          style={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--card-border)",
                          }}
                        />
                      ) : (
                        <p
                          className="rounded-xl p-3 text-sm leading-relaxed"
                          style={{
                            backgroundColor: "var(--background)",
                            color: "var(--muted)",
                          }}
                        >
                          {tpl.template}
                        </p>
                      )}

                      <p
                        className="mt-2 text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        Variables: {"{name}"}, {"{date}"}, {"{time}"},{" "}
                        {"{service}"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
