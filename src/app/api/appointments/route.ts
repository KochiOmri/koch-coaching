/* ============================================================
   APPOINTMENTS API - src/app/api/appointments/route.ts
   ============================================================
   This API handles all appointment operations:
   
   GET  /api/appointments         → Get all appointments
   GET  /api/appointments?date=X  → Get appointments for a specific date
   POST /api/appointments         → Create a new appointment
   
   When creating an appointment, it also:
   - Checks for double-booking (same date + time)
   - Syncs with Google Calendar (if configured)
   - Returns the created appointment with its ID
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllAppointments,
  getAppointmentsByDate,
  createAppointment,
  getBookedSlots,
} from "@/lib/appointments";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/email";

/* --- GET Handler ---
   Returns appointments. Optionally filter by date.
   Example: GET /api/appointments?date=2024-03-15 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const appointments = getAppointmentsByDate(date);
      return NextResponse.json(appointments);
    }

    const appointments = getAllAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

/* --- POST Handler ---
   Creates a new appointment.
   
   Expected request body:
   {
     "date": "2024-03-15",
     "time": "10:00",
     "name": "John Doe",
     "email": "john@example.com",
     "phone": "+972...",
     "service": "1-on-1 Coaching Session",
     "message": "I have back pain..."
   }
   
   Steps:
   1. Validate required fields
   2. Check if the time slot is already booked
   3. Create the appointment in our data store
   4. Sync to Google Calendar
   5. Return the appointment */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    /* Validate that all required fields are present */
    const required = ["date", "time", "name", "email", "phone", "service"];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    /* Check for double-booking: is this time slot already taken? */
    const bookedSlots = getBookedSlots(body.date);
    if (bookedSlots.includes(body.time)) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    /* Create the appointment in our data store */
    const appointment = createAppointment({
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      phone: body.phone,
      service: body.service,
      message: body.message || "",
    });

    /* Sync to Google Calendar (non-blocking, won't fail the booking) */
    const googleEventId = await createCalendarEvent(appointment);
    if (googleEventId) {
      const { updateAppointment } = await import("@/lib/appointments");
      updateAppointment(appointment.id, { googleEventId });
      appointment.googleEventId = googleEventId;
    }

    /* Send email notifications (non-blocking) */
    sendBookingNotification({
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      message: appointment.message,
    });
    sendBookingConfirmation({
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
      message: appointment.message,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
