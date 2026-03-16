import { NextResponse } from "next/server";
import { getAllClients } from "@/lib/clients";

export async function GET() {
  try {
    const clients = getAllClients().map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt,
      programs: c.programs,
    }));
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Clients GET error:", error);
    return NextResponse.json({ error: "Failed to load clients" }, { status: 500 });
  }
}
