/* ============================================================
   APPOINTMENTS DATA STORE - src/lib/appointments.ts
   ============================================================
   This file handles reading and writing appointment data.
   
   For now, we store appointments in a JSON file on disk.
   This works perfectly for development and testing.
   
   In production (Phase 2), replace this with Supabase:
   - import { createClient } from '@supabase/supabase-js'
   - Use supabase.from('appointments').select/insert/update/delete
   
   Each appointment has:
   - id: unique identifier
   - date: the date of the session (YYYY-MM-DD)
   - time: the time slot (HH:MM)
   - name: client's full name
   - email: client's email address
   - phone: client's phone number
   - service: type of session booked
   - message: optional notes from the client
   - status: "pending" | "confirmed" | "cancelled"
   - createdAt: when the booking was made
   - googleEventId: Google Calendar event ID (if synced)
   ============================================================ */

import fs from "fs";
import path from "path";

/* --- Appointment Type ---
   TypeScript interface that defines the shape of an appointment.
   Every appointment object must match this structure. */
export interface Appointment {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  googleEventId?: string;
}

/* --- File Path ---
   The JSON file where appointments are stored.
   Located in the /data folder at the project root. */
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "appointments.json");

/* --- Ensure data directory and file exist ---
   Creates /data/appointments.json if it doesn't exist yet.
   Called before every read/write operation. */
function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

/* --- Get All Appointments ---
   Reads the JSON file and returns all appointments as an array.
   Returns empty array if file is empty or doesn't exist. */
export function getAllAppointments(): Appointment[] {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

/* --- Get Appointment By ID ---
   Finds a single appointment by its unique ID.
   Returns undefined if not found. */
export function getAppointmentById(id: string): Appointment | undefined {
  const appointments = getAllAppointments();
  return appointments.find((apt) => apt.id === id);
}

/* --- Get Appointments By Date ---
   Returns all appointments for a specific date.
   Date format: "YYYY-MM-DD" */
export function getAppointmentsByDate(date: string): Appointment[] {
  const appointments = getAllAppointments();
  return appointments.filter((apt) => apt.date === date);
}

/* --- Create New Appointment ---
   Adds a new appointment to the JSON file.
   Returns the created appointment. */
export function createAppointment(
  appointment: Omit<Appointment, "id" | "createdAt" | "status">
): Appointment {
  const appointments = getAllAppointments();

  const newAppointment: Appointment = {
    ...appointment,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  appointments.push(newAppointment);
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));

  return newAppointment;
}

/* --- Update Appointment ---
   Updates specific fields of an existing appointment.
   Uses the spread operator to merge old data with new data.
   Returns the updated appointment, or null if not found. */
export function updateAppointment(
  id: string,
  updates: Partial<Appointment>
): Appointment | null {
  const appointments = getAllAppointments();
  const index = appointments.findIndex((apt) => apt.id === id);

  if (index === -1) return null;

  appointments[index] = { ...appointments[index], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));

  return appointments[index];
}

/* --- Delete Appointment ---
   Removes an appointment from the JSON file.
   Returns true if deleted, false if not found. */
export function deleteAppointment(id: string): boolean {
  const appointments = getAllAppointments();
  const filtered = appointments.filter((apt) => apt.id !== id);

  if (filtered.length === appointments.length) return false;

  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

/* --- Get Booked Time Slots ---
   Returns an array of booked time slots for a given date.
   Used to prevent double-booking (can't book 10:00 if someone
   already has 10:00 on that day). */
export function getBookedSlots(date: string): string[] {
  const appointments = getAppointmentsByDate(date);
  return appointments
    .filter((apt) => apt.status !== "cancelled")
    .map((apt) => apt.time);
}
