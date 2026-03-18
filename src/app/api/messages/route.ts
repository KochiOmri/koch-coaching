import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  attachment_url: string | null;
  created_at: string;
}

interface ApiMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  attachmentUrl: string | null;
  createdAt: string;
}

function mapRowToMessage(row: MessageRow): ApiMessage {
  return {
    id: String(row.id),
    senderId: String(row.sender_id),
    receiverId: String(row.receiver_id),
    content: String(row.content),
    isRead: Boolean(row.is_read),
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    createdAt: String(row.created_at),
  };
}

export async function GET(request: NextRequest) {
  try {
    const clientId = request.nextUrl.searchParams.get("clientId");
    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Messages GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
        }

        const messages = (data ?? []).map((r) => mapRowToMessage(r as MessageRow));
        return NextResponse.json(messages);
      }
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Messages GET error:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, content } = body;

    if (!clientId || !content || typeof content !== "string") {
      return NextResponse.json(
        { error: "clientId and content are required" },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        // Get coach (admin) profile id for receiver
        const { data: admins } = await db
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .limit(1);

        const coachId = admins?.[0]?.id;
        if (!coachId) {
          return NextResponse.json(
            { error: "No coach found. Please contact support." },
            { status: 500 }
          );
        }

        const row = {
          sender_id: clientId,
          receiver_id: coachId,
          content: trimmedContent,
          is_read: false,
        };

        const { data, error } = await db.from("messages").insert(row).select().single();

        if (error) {
          console.error("Messages POST Supabase error:", error);
          return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }

        const message = mapRowToMessage(data as MessageRow);
        return NextResponse.json(message, { status: 201 });
      }
    }

    // Mock success when Supabase not configured
    return NextResponse.json(
      {
        id: "mock-" + Date.now(),
        senderId: clientId,
        receiverId: "coach",
        content: trimmedContent,
        isRead: false,
        attachmentUrl: null,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Messages POST error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
