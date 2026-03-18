"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, Loader2, User } from "lucide-react";
import PortalNav from "@/components/PortalNav";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  attachmentUrl: string | null;
  createdAt: string;
}

interface ClientInfo {
  id: string;
  name: string;
  email: string;
}

export default function PortalMessagesPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const loadAuthAndMessages = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/portal/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("id, name, email").eq("id", user.id).single();
      const clientInfo: ClientInfo = {
        id: user.id,
        name: profile?.name || user.email?.split("@")[0] || "",
        email: profile?.email || user.email || "",
      };
      setClient(clientInfo);

      const msgRes = await fetch(`/api/messages?clientId=${clientInfo.id}`);
      if (msgRes.ok) {
        const data = await msgRes.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch {
      router.push("/portal/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadAuthAndMessages();
  }, [loadAuthAndMessages]);

  // Supabase Realtime: subscribe to new messages
  useEffect(() => {
    if (!client) return;
    try {
      const supabase = createClient();
      const channel = supabase
        .channel("portal-messages")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            if (row.sender_id === client.id || row.receiver_id === client.id) {
              const msg: Message = {
                id: String(row.id),
                senderId: String(row.sender_id),
                receiverId: String(row.receiver_id),
                content: String(row.content),
                isRead: Boolean(row.is_read),
                attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
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

      return () => {
        supabase.removeChannel(channel);
      };
    } catch {
      // Supabase not configured, skip realtime
    }
  }, [client]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: client.id, content }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch {
      // Restore input on error
      setInput(content);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--background)" }}
      >
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <PortalNav />

      <main className="mx-auto max-w-3xl px-4 pb-6 pt-6 sm:px-6">
        <h1
          className="mb-6 text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Messages
        </h1>

        <div
          className="flex flex-col rounded-2xl border"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            minHeight: "400px",
          }}
        >
          {/* Messages area */}
          <div
            className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
            style={{ maxHeight: "calc(100vh - 280px)", minHeight: "320px" }}
          >
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12">
                <MessageCircle
                  size={56}
                  className="mb-4"
                  style={{ color: "var(--muted)" }}
                />
                <p
                  className="text-center text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  No messages yet. Start the conversation with your coach.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isClient = msg.senderId === client?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isClient ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[85%] flex-col gap-1 sm:max-w-[75%] ${
                        isClient ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className="flex items-start gap-2 rounded-2xl px-4 py-3"
                        style={{
                          backgroundColor: isClient
                            ? "var(--primary)"
                            : "var(--card-border)",
                          color: isClient
                            ? "var(--background)"
                            : "var(--foreground)",
                        }}
                      >
                        {!isClient && (
                          <User
                            size={16}
                            className="mt-0.5 shrink-0"
                            style={{ opacity: 0.8 }}
                          />
                        )}
                        <p className="break-words text-sm">{msg.content}</p>
                      </div>
                      <span
                        className="text-xs"
                        style={{ color: "var(--muted)" }}
                      >
                        {new Date(msg.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input bar */}
          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t p-4"
            style={{ borderColor: "var(--card-border)" }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--card-border)",
              }}
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="flex items-center justify-center rounded-xl px-4 py-3 transition-opacity disabled:opacity-50"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--background)",
              }}
            >
              {sending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
