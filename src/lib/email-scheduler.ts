/**
 * EMAIL SCHEDULER — Automated reminders & follow-ups
 *
 * Two main functions:
 * - checkAndSendReminders(): sessions in the next 24h get a reminder email
 * - checkAndSendFollowups(): sessions 3 days ago get a follow-up email
 *
 * Tracks sent emails in data/email-log.json to prevent duplicates.
 * Called by the /api/cron route (Vercel cron or manual admin trigger).
 */

import fs from "fs";
import path from "path";
import { getAllAppointments, type Appointment } from "./appointments";
import { sendSessionReminder, sendFollowUpEmail } from "./email";

// ─── Email log persistence ─────────────────────────────────────────────────────

interface EmailLogEntry {
  appointmentId: string;
  type: "reminder" | "followup";
  sentAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "email-log.json");

function ensureLogFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2));
  }
}

function readLog(): EmailLogEntry[] {
  ensureLogFile();
  const raw = fs.readFileSync(LOG_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeLog(entries: EmailLogEntry[]): void {
  ensureLogFile();
  fs.writeFileSync(LOG_FILE, JSON.stringify(entries, null, 2));
}

function alreadySent(log: EmailLogEntry[], appointmentId: string, type: "reminder" | "followup"): boolean {
  return log.some((e) => e.appointmentId === appointmentId && e.type === type);
}

function recordSent(log: EmailLogEntry[], appointmentId: string, type: "reminder" | "followup"): EmailLogEntry[] {
  return [...log, { appointmentId, type, sentAt: new Date().toISOString() }];
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function appointmentDateTime(apt: Appointment): Date {
  return new Date(`${apt.date}T${apt.time}:00`);
}

function hoursUntil(target: Date, now: Date): number {
  return (target.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function daysSince(target: Date, now: Date): number {
  return (now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
}

// ─── Reminders (24h before) ─────────────────────────────────────────────────────

export async function checkAndSendReminders(): Promise<number> {
  const now = new Date();
  const appointments = getAllAppointments();
  let log = readLog();
  let sent = 0;

  for (const apt of appointments) {
    if (apt.status === "cancelled") continue;
    if (alreadySent(log, apt.id, "reminder")) continue;

    const sessionTime = appointmentDateTime(apt);
    const hours = hoursUntil(sessionTime, now);

    if (hours > 0 && hours <= 24) {
      const result = await sendSessionReminder({
        name: apt.name,
        email: apt.email,
        date: apt.date,
        time: apt.time,
        service: apt.service,
      });

      if (result) {
        log = recordSent(log, apt.id, "reminder");
        sent++;
        console.log(`Reminder sent to ${apt.email} for ${apt.date} ${apt.time}`);
      }
    }
  }

  writeLog(log);
  return sent;
}

// ─── Follow-ups (3 days after) ──────────────────────────────────────────────────

export async function checkAndSendFollowups(): Promise<number> {
  const now = new Date();
  const appointments = getAllAppointments();
  let log = readLog();
  let sent = 0;

  for (const apt of appointments) {
    if (apt.status === "cancelled") continue;
    if (alreadySent(log, apt.id, "followup")) continue;

    const sessionTime = appointmentDateTime(apt);
    const days = daysSince(sessionTime, now);

    // Send follow-up between 3 and 4 days after the session
    if (days >= 3 && days < 4) {
      const result = await sendFollowUpEmail({
        name: apt.name,
        email: apt.email,
        date: apt.date,
        service: apt.service,
      });

      if (result) {
        log = recordSent(log, apt.id, "followup");
        sent++;
        console.log(`Follow-up sent to ${apt.email} for session on ${apt.date}`);
      }
    }
  }

  writeLog(log);
  return sent;
}
