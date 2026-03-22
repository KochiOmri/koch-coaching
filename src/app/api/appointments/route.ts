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
   
   Data layer: Supabase when configured, JSON file fallback otherwise.
   ============================================================ */

import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getAllAppointments,
  getAppointmentsByDate,
  createAppointment,
  getBookedSlots,
} from "@/lib/appointments";
import { createCalendarEvent } from "@/lib/google-calendar";
import { sendBookingNotification, sendBookingConfirmation } from "@/lib/email";

/* --- GET Handler ---
   Returns appointments. Optionally filter by date or clientId.
   Example: GET /api/appointments?date=2024-03-15
   Example: GET /api/appointments?clientId=abc-123 (portal: client's appointments) */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const clientId = searchParams.get("clientId");

    /* Resolve client email when filtering by clientId (for portal) */
    let clientEmail: string | null = null;
    if (clientId) {
      if (isSupabaseConfigured()) {
        const db = await getDb();
        if (db) {
          const { data: profile } = await db.from("profiles").select("email").eq("id", clientId).single();
          if (profile?.email) {
            clientEmail = profile.email;
          }
        }
      }
      if (!clientEmail) {
        const { getClientById } = await import("@/lib/clients");
        const client = getClientById(clientId);
        if (client) clientEmail = client.email;
      }
    }

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        let query = db.from("appointments").select("*");
        if (date) {
          query = query.eq("date", date);
        }
        const { data, error } = await query;
        if (error) {
          console.error("Supabase appointments fetch error:", error);
        }
        if (!error && data) {
          let result = data as Array<Record<string, unknown>>;
          if (clientEmail) {
            result = result.filter((a) => {
              const email = String(a.email || a.client_email || "").toLowerCase();
              return email === clientEmail!.toLowerCase();
            });
          }
          return NextResponse.json(result);
        }
      }
    }

    /* Fallback: JSON file */
    let appointments: ReturnType<typeof getAllAppointments>;
    if (date) {
      appointments = getAppointmentsByDate(date);
    } else {
      appointments = getAllAppointments();
    }
    if (clientEmail) {
      appointments = appointments.filter(
        (a) => a.email.toLowerCase() === clientEmail!.toLowerCase()
      );
    }
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
  const ip = getClientIp(request);
  const { success } = rateLimit(`booking:${ip}`, { windowMs: 60_000, maxRequests: 5 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

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
    let bookedSlots: string[];
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { data, error } = await db
          .from("appointments")
          .select("time")
          .eq("date", body.date)
          .neq("status", "cancelled");
        if (error) {
          console.error("Supabase booked slots fetch error:", error);
          return NextResponse.json(
            { error: "Failed to check availability" },
            { status: 500 }
          );
        }
        bookedSlots = (data ?? []).map((r: { time: string }) => r.time);
      } else {
        bookedSlots = getBookedSlots(body.date);
      }
    } else {
      bookedSlots = getBookedSlots(body.date);
    }

    if (bookedSlots.includes(body.time)) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 }
      );
    }

    /* Create the appointment in our data store */
    let appointment: {
      id: string;
      date: string;
      time: string;
      name: string;
      email: string;
      phone: string;
      service: string;
      message: string;
      status: string;
      createdAt: string;
      googleEventId?: string;
    };

    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const row = {
          date: body.date,
          time: body.time,
          name: body.name,
          email: body.email,
          phone: body.phone,
          service: body.service,
          message: body.message || "",
          status: "pending",
        };
        const { data, error } = await db
          .from("appointments")
          .insert(row)
          .select()
          .single();
        if (error) {
          console.error("Supabase appointment insert error:", error);
        }
        if (!error && data) {
          appointment = {
            id: data.id,
            date: data.date,
            time: data.time,
            name: data.name || data.client_name || body.name,
            email: data.email || data.client_email || body.email,
            phone: data.phone || data.client_phone || body.phone,
            service: data.service,
            message: data.message || data.notes || "",
            status: data.status,
            createdAt: data.created_at || new Date().toISOString(),
          };
        } else {
          appointment = createAppointment({
            date: body.date,
            time: body.time,
            name: body.name,
            email: body.email,
            phone: body.phone,
            service: body.service,
            message: body.message || "",
          });
        }
      } else {
        appointment = createAppointment({
          date: body.date,
          time: body.time,
          name: body.name,
          email: body.email,
          phone: body.phone,
          service: body.service,
          message: body.message || "",
        });
      }
    } else {
      appointment = createAppointment({
        date: body.date,
        time: body.time,
        name: body.name,
        email: body.email,
        phone: body.phone,
        service: body.service,
        message: body.message || "",
      });
    }

    /* Sync to Google Calendar (non-blocking, won't fail the booking) */
    const googleEventId = await createCalendarEvent(appointment as any);
    if (googleEventId) {
      if (isSupabaseConfigured()) {
        const db = await getDb();
        if (db) {
          await db
            .from("appointments")
            .update({ googleEventId })
            .eq("id", appointment.id);
        }
      } else {
        const { updateAppointment } = await import("@/lib/appointments");
        updateAppointment(appointment.id, { googleEventId });
      }
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
