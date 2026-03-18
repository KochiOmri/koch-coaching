import { NextRequest, NextResponse } from "next/server";
import { createClient, verifyClientPassword } from "@/lib/clients";

const CLIENT_SESSION = "koch-client-session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "register") {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
      }
      try {
        const client = createClient({ name, email, password });
        const token = Buffer.from(JSON.stringify({ id: client.id, ts: Date.now() })).toString("base64");
        const response = NextResponse.json({ success: true, client: { id: client.id, name: client.name, email: client.email } });
        response.cookies.set(CLIENT_SESSION, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        return NextResponse.json({ error: message }, { status: 409 });
      }
    }

    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
      }
      const client = verifyClientPassword(email, password);
      if (!client) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
      const token = Buffer.from(JSON.stringify({ id: client.id, ts: Date.now() })).toString("base64");
      const response = NextResponse.json({ success: true, client: { id: client.id, name: client.name, email: client.email } });
      response.cookies.set(CLIENT_SESSION, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Client auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(CLIENT_SESSION);
    if (!cookie?.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    const payload = JSON.parse(Buffer.from(cookie.value, "base64").toString());
    const { getClientById } = await import("@/lib/clients");
    const client = getClientById(payload.id);
    if (!client) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      authenticated: true,
      client: { id: client.id, name: client.name, email: client.email, phone: client.phone || "" },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(CLIENT_SESSION);
  return response;
}
