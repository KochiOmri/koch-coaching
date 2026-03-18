"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import {
  MessageCircle,
  Send,
  Loader2,
  Users,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ClientThread {
  id: string;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState<ClientThread[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => scrollToBottom(), [messages, scrollToBottom]);

  useEffect(() => {
    loadThreads();
  }, []);

  async function loadThreads() {
    try {
      const res = await fetch("/api/messages?admin=true");
      if (res.ok) {
        const data = await res.json();
        setThreads(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  async function loadMessages(clientId: string) {
    try {
      const res = await fetch(`/api/messages?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
  }

  function selectThread(thread: ClientThread) {
    setSelectedClient(thread);
    loadMessages(thread.id);
  }

  // Realtime subscription
  useEffect(() => {
    if (!selectedClient) return;
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("admin-messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            if (
              String(row.sender_id) === selectedClient.id ||
              String(row.receiver_id) === selectedClient.id
            ) {
              const msg: Message = {
                id: String(row.id),
                senderId: String(row.sender_id),
                receiverId: String(row.receiver_id),
                content: String(row.content),
                isRead: Boolean(row.is_read),
                createdAt: String(row.created_at),
              };
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
              });
            }
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } catch { /* Supabase not configured */ }
  }, [selectedClient]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient || !input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, content, fromAdmin: true }),
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch { /* ignore */ }
    setSending(false);
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <AdminSidebar />
        <div className="flex flex-1 items-center justify-center md:ml-64">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      <AdminSidebar />
      <main className="flex flex-1 flex-col md:ml-64" style={{ height: "100vh" }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 border-b px-6 py-4"
          style={{ borderColor: "var(--card-border)" }}
        >
          <MessageCircle size={22} style={{ color: "var(--primary)" }} />
          <h1 className="text-xl font-bold tracking-wide" style={{ fontFamily: "var(--font-outfit)" }}>
            Client Messages
          </h1>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Thread List */}
          <div
            className="w-80 shrink-0 overflow-y-auto border-r"
            style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}
          >
            <div className="p-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--muted)" }} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                />
              </div>
            </div>

            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center">
                <Users size={32} className="mx-auto mb-2" style={{ color: "var(--muted)" }} />
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  No conversations yet
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => selectThread(thread)}
                  className="flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-all"
                  style={{
                    borderColor: "var(--card-border)",
                    backgroundColor: selectedClient?.id === thread.id
                      ? "color-mix(in srgb, var(--primary) 10%, transparent)"
                      : "transparent",
                  }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                  >
                    {thread.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{thread.name}</span>
                      {thread.unreadCount > 0 && (
                        <span
                          className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                        >
                          {thread.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs" style={{ color: "var(--muted)" }}>
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="flex flex-1 flex-col">
            {!selectedClient ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-3" style={{ color: "var(--muted)" }} />
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div
                  className="flex items-center gap-3 border-b px-6 py-3"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                    style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                  >
                    {selectedClient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selectedClient.name}</p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{selectedClient.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm" style={{ color: "var(--muted)" }}>No messages yet. Send the first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isAdmin = msg.senderId !== selectedClient.id;
                        return (
                          <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                            <div
                              className="max-w-[70%] rounded-2xl px-4 py-2.5"
                              style={{
                                backgroundColor: isAdmin ? "var(--primary)" : "var(--card-bg)",
                                color: isAdmin ? "var(--background)" : "var(--foreground)",
                              }}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p
                                className="mt-1 text-[10px]"
                                style={{ opacity: 0.6 }}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={scrollRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="flex items-center gap-3 border-t px-6 py-4"
                  style={{ borderColor: "var(--card-border)" }}
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none"
                    style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || sending}
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: "var(--primary)", color: "var(--background)" }}
                  >
                    {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
