/* ============================================================
   INTEGRATIONS API - src/app/api/integrations/route.ts
   ============================================================
   GET  /api/integrations        → Get integration status
   POST /api/integrations        → Test connection or sync all
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import {
  isCalendarConfigured,
  testCalendarConnection,
  createCalendarEventWithMeet,
} from "@/lib/google-calendar";
import {
  isSheetsConfigured,
  testSheetsConnection,
  logSessionToSheet,
} from "@/lib/google-sheets";
import { getAllAppointments, updateAppointment } from "@/lib/appointments";

export async function GET() {
  return NextResponse.json({
    calendar: {
      configured: isCalendarConfigured(),
      calendarId: process.env.GOOGLE_CALENDAR_ID || null,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
    },
    sheets: {
      configured: isSheetsConfigured(),
      sheetId: process.env.GOOGLE_SHEET_ID || null,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === "test") {
      const [calendarResult, sheetsResult] = await Promise.all([
        isCalendarConfigured()
          ? testCalendarConnection()
          : Promise.resolve({ success: false, error: "Not configured" }),
        isSheetsConfigured()
          ? testSheetsConnection()
          : Promise.resolve({ success: false, error: "Not configured" }),
      ]);

      return NextResponse.json({
        calendar: calendarResult,
        sheets: sheetsResult,
      });
    }

    if (action === "sync") {
      const appointments = getAllAppointments().filter(
        (a) => a.status === "confirmed" && !a.googleEventId
      );

      let synced = 0;
      let failed = 0;

      for (const apt of appointments) {
        try {
          const { eventId, meetLink } = await createCalendarEventWithMeet(apt);
          if (eventId) {
            const updates: Record<string, string> = { googleEventId: eventId };
            if (meetLink) updates.meetLink = meetLink;
            updateAppointment(apt.id, updates);
            synced++;

            await logSessionToSheet({
              date: apt.date,
              time: apt.time,
              clientName: apt.name,
              clientEmail: apt.email,
              sessionType: apt.service,
              status: "confirmed",
              meetLink: meetLink || undefined,
              notes: apt.message,
            });
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      return NextResponse.json({
        total: appointments.length,
        synced,
        failed,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Integrations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
