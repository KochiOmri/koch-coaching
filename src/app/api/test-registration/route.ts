import { NextResponse } from "next/server";
import { createClient } from "@/lib/clients";

export async function POST() {
  try {
    console.log("Starting test registration...");

    const client = await createClient({
      name: "Test User",
      email: `test-${Date.now()}@example.com`,
      password: "TestPass123!",
    });

    console.log("Client created:", client);

    return NextResponse.json({
      success: true,
      message: "Test registration successful",
      clientId: client.id,
    });
  } catch (error) {
    console.error("Test registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
