/* ============================================================
   GOOGLE CALENDAR INTEGRATION - src/lib/google-calendar.ts
   ============================================================
   This file handles syncing appointments with Google Calendar.
   
   How it works:
   1. Uses a Google Service Account to access your calendar
   2. When a booking is created → creates a Google Calendar event
   3. When a booking is cancelled → deletes the calendar event
   4. When a booking is updated → updates the calendar event
   
   Setup steps (do this once):
   ─────────────────────────────
   1. Go to https://console.cloud.google.com
   2. Create a new project (or use existing)
   3. Enable the "Google Calendar API"
   4. Go to "Credentials" → Create "Service Account"
   5. Download the JSON key file
   6. Copy the service account email (looks like: xxx@xxx.iam.gserviceaccount.com)
   7. Go to your Google Calendar → Settings → Share with the service account email
      (give it "Make changes to events" permission)
   8. Copy your Calendar ID from Calendar Settings
   9. Create a .env.local file in the project root with:
      GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@xxx.iam.gserviceaccount.com
      GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
      GOOGLE_CALENDAR_ID=your-calendar-id@gmail.com
   ============================================================ */

import { google } from "googleapis";
import type { Appointment } from "./appointments";

/* --- Check if Google Calendar is configured ---
   Returns false if env variables are missing.
   This way the app works without Google Calendar set up. */
function isConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

/* --- Get authenticated Google Calendar client ---
   Uses JWT (JSON Web Token) authentication with a service account.
   The service account acts on behalf of your Google account. */
function getCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

/* --- Create Calendar Event ---
   Creates a new event in your Google Calendar when someone books.
   Returns the Google Calendar event ID (used to update/delete later).
   
   If Google Calendar isn't configured, returns null silently
   so the booking still works without it. */
export async function createCalendarEvent(
  appointment: Appointment
): Promise<string | null> {
  if (!isConfigured()) {
    console.log("Google Calendar not configured — skipping sync");
    return null;
  }

  try {
    const calendar = getCalendarClient();

    /* Build the start and end times for the event.
       Each session is 1 hour long by default. */
    const startDateTime = `${appointment.date}T${appointment.time}:00`;
    const endHour = parseInt(appointment.time.split(":")[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, "0")}:${appointment.time.split(":")[1]}`;
    const endDateTime = `${appointment.date}T${endTime}:00`;

    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary: `KOCH | ${appointment.service} - ${appointment.name}`,
        description: [
          `Client: ${appointment.name}`,
          `Email: ${appointment.email}`,
          `Phone: ${appointment.phone}`,
          `Service: ${appointment.service}`,
          appointment.message ? `Notes: ${appointment.message}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        start: {
          dateTime: startDateTime,
          timeZone: "Asia/Jerusalem",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Asia/Jerusalem",
        },
        colorId: "9", // Blueberry color in Google Calendar
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      },
    });

    console.log(`Google Calendar event created: ${event.data.id}`);
    return event.data.id || null;
  } catch (error) {
    console.error("Failed to create Google Calendar event:", error);
    return null;
  }
}

/* --- Delete Calendar Event ---
   Removes an event from Google Calendar when a booking is cancelled.
   Needs the googleEventId that was saved when the event was created. */
export async function deleteCalendarEvent(
  googleEventId: string
): Promise<boolean> {
  if (!isConfigured() || !googleEventId) return false;

  try {
    const calendar = getCalendarClient();
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: googleEventId,
    });
    console.log(`Google Calendar event deleted: ${googleEventId}`);
    return true;
  } catch (error) {
    console.error("Failed to delete Google Calendar event:", error);
    return false;
  }
}

/* --- Update Calendar Event ---
   Updates an existing Google Calendar event (e.g., when rescheduled). */
export async function updateCalendarEvent(
  googleEventId: string,
  appointment: Appointment
): Promise<boolean> {
  if (!isConfigured() || !googleEventId) return false;

  try {
    const calendar = getCalendarClient();

    const startDateTime = `${appointment.date}T${appointment.time}:00`;
    const endHour = parseInt(appointment.time.split(":")[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, "0")}:${appointment.time.split(":")[1]}`;
    const endDateTime = `${appointment.date}T${endTime}:00`;

    await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      eventId: googleEventId,
      requestBody: {
        summary: `KOCH | ${appointment.service} - ${appointment.name}`,
        description: [
          `Client: ${appointment.name}`,
          `Email: ${appointment.email}`,
          `Phone: ${appointment.phone}`,
          `Service: ${appointment.service}`,
          appointment.message ? `Notes: ${appointment.message}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        start: { dateTime: startDateTime, timeZone: "Asia/Jerusalem" },
        end: { dateTime: endDateTime, timeZone: "Asia/Jerusalem" },
      },
    });

    console.log(`Google Calendar event updated: ${googleEventId}`);
    return true;
  } catch (error) {
    console.error("Failed to update Google Calendar event:", error);
    return false;
  }
}

/* --- Get Calendar Events ---
   Fetches events from Google Calendar for a date range.
   Used in the admin dashboard to show your full schedule
   (including non-KOCH events). */
export async function getCalendarEvents(
  startDate: string,
  endDate: string
): Promise<Array<{ id: string; summary: string; start: string; end: string }>> {
  if (!isConfigured()) return [];

  try {
    const calendar = getCalendarClient();
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: `${startDate}T00:00:00Z`,
      timeMax: `${endDate}T23:59:59Z`,
      singleEvents: true,
      orderBy: "startTime",
    });

    return (response.data.items || []).map((event) => ({
      id: event.id || "",
      summary: event.summary || "No title",
      start: event.start?.dateTime || event.start?.date || "",
      end: event.end?.dateTime || event.end?.date || "",
    }));
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    return [];
  }
}
