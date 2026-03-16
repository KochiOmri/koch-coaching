/* ============================================================
   SINGLE APPOINTMENT API - src/app/api/appointments/[id]/route.ts
   ============================================================
   Handles operations on a single appointment by ID:
   
   GET    /api/appointments/:id → Get one appointment
   PATCH  /api/appointments/:id → Update appointment (status, reschedule)
   DELETE /api/appointments/:id → Delete/cancel appointment
   
   The [id] in the folder name is a Next.js dynamic route parameter.
   It captures the ID from the URL automatically.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "@/lib/appointments";
import {
  createCalendarEventWithMeet,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/google-calendar";
import { logSessionToSheet } from "@/lib/google-sheets";
import { sendAppointmentConfirmation } from "@/lib/email";

/* --- GET Handler ---
   Returns a single appointment by its ID.
   Example: GET /api/appointments/abc-123 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Failed to fetch appointment:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

/* --- PATCH Handler ---
   Updates an appointment. Can change status, reschedule, etc.
   
   Example body: { "status": "confirmed" }
   Example body: { "date": "2024-04-01", "time": "14:00" }
   
   Also updates the corresponding Google Calendar event. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = getAppointmentById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    const updated = updateAppointment(id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 }
      );
    }

    /* --- Confirmation flow: create calendar event with Meet + log to Sheets --- */
    if (body.status === "confirmed" && existing.status !== "confirmed") {
      if (!updated.googleEventId) {
        const { eventId, meetLink } = await createCalendarEventWithMeet(updated);
        if (eventId) {
          const meetUpdates: Record<string, string> = { googleEventId: eventId };
          if (meetLink) meetUpdates.meetLink = meetLink;
          updateAppointment(id, meetUpdates);
          updated.googleEventId = eventId;
          updated.meetLink = meetLink || undefined;
        }
      }

      logSessionToSheet({
        date: updated.date,
        time: updated.time,
        clientName: updated.name,
        clientEmail: updated.email,
        sessionType: updated.service,
        status: "confirmed",
        meetLink: updated.meetLink,
        notes: updated.message,
      });

      sendAppointmentConfirmation({
        name: updated.name,
        email: updated.email,
        date: updated.date,
        time: updated.time,
        service: updated.service,
        meetLink: updated.meetLink,
      });
    } else if (body.status === "cancelled" && updated.googleEventId) {
      await deleteCalendarEvent(updated.googleEventId);
    } else if (updated.googleEventId) {
      await updateCalendarEvent(updated.googleEventId, updated);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update appointment:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

/* --- DELETE Handler ---
   Permanently removes an appointment.
   Also deletes the Google Calendar event if one exists. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    /* Delete from Google Calendar first */
    if (appointment.googleEventId) {
      await deleteCalendarEvent(appointment.googleEventId);
    }

    deleteAppointment(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
