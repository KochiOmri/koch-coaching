/* ============================================================
   BOOKED SLOTS API - src/app/api/appointments/slots/route.ts
   ============================================================
   Returns which time slots are already booked for a given date.
   
   Used by the booking form to grey out unavailable times
   so clients can only pick open slots.
   
   GET /api/appointments/slots?date=2024-03-15
   Returns: ["09:00", "14:00"] (booked slots)
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { getBookedSlots } from "@/lib/appointments";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const bookedSlots = getBookedSlots(date);
    return NextResponse.json(bookedSlots);
  } catch (error) {
    console.error("Failed to fetch booked slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch booked slots" },
      { status: 500 }
    );
  }
}
