/**
 * EMAIL NOTIFICATIONS — Booking flow emails via Resend
 *
 * WHAT IT DOES:
 * Sends two emails when a client books a session:
 * 1. Admin notification — to you, with full booking details
 * 2. Client confirmation — to the client, confirming their appointment
 *
 * ARCHITECTURE:
 * - Uses Resend (resend.com), a free email API with generous limits
 * - Called from: the booking API route (e.g. app/api/booking/route.ts)
 * - Requires RESEND_API_KEY in .env; if missing, logs and skips (no crash)
 *
 * DEV PLAN:
 * - Replace "onboarding@resend.dev" with your verified domain once Resend is set up
 * - Set ADMIN_EMAIL in .env for where booking notifications go
 * - Templates are inline HTML; consider moving to React Email for maintainability
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface BookingEmailData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service: string;
  message: string;
}

export interface ReminderEmailData {
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
}

export interface FollowUpEmailData {
  name: string;
  email: string;
  date: string;
  service: string;
}

// ─── Admin notification (you get this when someone books) ─────────────────────

export async function sendBookingNotification(data: BookingEmailData) {
  if (!resend) {
    console.log("Resend not configured — skipping email notification");
    return null;
  }

  const adminEmail = process.env.ADMIN_EMAIL || "omrikochman@gmail.com";
  const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const result = await resend.emails.send({
      from: "KOCH Booking <onboarding@resend.dev>",
      to: adminEmail,
      subject: `New Booking: ${data.name} — ${formattedDate} at ${data.time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4a843, #b8922e); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #000;">New Session Booked</h1>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #737373; width: 120px;">Client</td><td style="padding: 8px 0; font-weight: bold;">${data.name}</td></tr>
              <tr><td style="padding: 8px 0; color: #737373;">Email</td><td style="padding: 8px 0;">${data.email}</td></tr>
              <tr><td style="padding: 8px 0; color: #737373;">Phone</td><td style="padding: 8px 0;">${data.phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #737373;">Date</td><td style="padding: 8px 0; font-weight: bold;">${formattedDate}</td></tr>
              <tr><td style="padding: 8px 0; color: #737373;">Time</td><td style="padding: 8px 0; font-weight: bold;">${data.time}</td></tr>
              <tr><td style="padding: 8px 0; color: #737373;">Service</td><td style="padding: 8px 0;">${data.service}</td></tr>
              ${data.message ? `<tr><td style="padding: 8px 0; color: #737373; vertical-align: top;">Message</td><td style="padding: 8px 0;">${data.message}</td></tr>` : ""}
            </table>
          </div>
        </div>
      `,
    });

    console.log("Booking notification email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send booking email:", error);
    return null;
  }
}

// ─── Client confirmation (they get this after booking) ────────────────────────

export async function sendBookingConfirmation(data: BookingEmailData) {
  if (!resend) return null;

  const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const result = await resend.emails.send({
      from: "KOCH Functional Patterns <onboarding@resend.dev>",
      to: data.email,
      subject: `Your Session is Confirmed — ${formattedDate} at ${data.time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4a843, #b8922e); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #000;">Session Confirmed</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;">Hi ${data.name},</p>
            <p style="margin: 0 0 24px; color: #a3a3a3;">Your ${data.service} has been confirmed. Here are the details:</p>
            <div style="background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #262626;">
              <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 8px;"><strong>Time:</strong> ${data.time}</p>
              <p style="margin: 0;"><strong>Service:</strong> ${data.service}</p>
            </div>
            <p style="margin: 24px 0 0; color: #a3a3a3; font-size: 14px;">If you need to reschedule, please contact us directly.</p>
            <p style="margin: 16px 0 0; color: #d4a843;">— KOCH Functional Patterns</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return null;
  }
}

// ─── Appointment confirmed (sent when admin confirms, includes Meet link) ──────

export interface AppointmentConfirmationData {
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  meetLink?: string;
}

export async function sendAppointmentConfirmation(data: AppointmentConfirmationData) {
  if (!resend) return null;

  const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const meetSection = data.meetLink
    ? `
            <div style="background: #0d2818; border-radius: 12px; padding: 20px; border: 1px solid #1a4028; margin-top: 16px;">
              <p style="margin: 0 0 8px; font-weight: bold; color: #34d399;">Google Meet Link</p>
              <p style="margin: 0 0 12px; color: #a3a3a3; font-size: 14px;">Join your session online via Google Meet:</p>
              <a href="${data.meetLink}" style="display: inline-block; background: linear-gradient(135deg, #34d399, #059669); color: #000; font-weight: bold; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-size: 14px;">Join Meeting</a>
              <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px; word-break: break-all;">${data.meetLink}</p>
            </div>`
    : "";

  try {
    const result = await resend.emails.send({
      from: "KOCH Functional Patterns <onboarding@resend.dev>",
      to: data.email,
      subject: `Confirmed: ${data.service} — ${formattedDate} at ${data.time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4a843, #b8922e); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #000;">Your Session is Confirmed</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;">Hi ${data.name},</p>
            <p style="margin: 0 0 24px; color: #a3a3a3;">Great news — your ${data.service} has been confirmed. Here are your session details:</p>
            <div style="background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #262626;">
              <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 0 0 8px;"><strong>Time:</strong> ${data.time}</p>
              <p style="margin: 0;"><strong>Service:</strong> ${data.service}</p>
            </div>${meetSection}
            <p style="margin: 24px 0 0; color: #a3a3a3; font-size: 14px;">If you need to reschedule, please contact us directly.</p>
            <p style="margin: 16px 0 0; color: #d4a843;">— KOCH Functional Patterns</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Failed to send appointment confirmation email:", error);
    return null;
  }
}

// ─── Session reminder (sent ~24h before the session) ───────────────────────────

export async function sendSessionReminder(data: ReminderEmailData) {
  if (!resend) {
    console.log("Resend not configured — skipping reminder email");
    return null;
  }

  const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  try {
    const result = await resend.emails.send({
      from: "KOCH Functional Patterns <onboarding@resend.dev>",
      to: data.email,
      subject: `Reminder: Your Session is Tomorrow at ${data.time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4a843, #b8922e); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #000;">Session Reminder</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;">Hi ${data.name},</p>
            <p style="margin: 0 0 24px; color: #a3a3a3;">Just a friendly reminder — your ${data.service} session is coming up tomorrow.</p>
            <div style="background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #262626;">
              <p style="margin: 0 0 8px;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 0;"><strong>Time:</strong> ${data.time}</p>
            </div>
            <div style="margin: 24px 0 0; background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #262626;">
              <p style="margin: 0 0 12px; font-weight: bold; color: #d4a843;">How to Prepare</p>
              <ul style="margin: 0; padding-left: 18px; color: #a3a3a3; line-height: 1.8;">
                <li>Wear comfortable clothing you can move in</li>
                <li>Stay hydrated — drink water before your session</li>
                <li>Arrive 5 minutes early so we can start on time</li>
                <li>Note any pain or tightness you've been feeling</li>
              </ul>
            </div>
            <p style="margin: 24px 0 0; color: #a3a3a3; font-size: 14px;">If you need to reschedule, please contact us as soon as possible.</p>
            <p style="margin: 16px 0 0; color: #d4a843;">— KOCH Functional Patterns</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Failed to send reminder email:", error);
    return null;
  }
}

// ─── Follow-up email (sent 3 days after a session) ─────────────────────────────

export async function sendFollowUpEmail(data: FollowUpEmailData) {
  if (!resend) {
    console.log("Resend not configured — skipping follow-up email");
    return null;
  }

  const formattedDate = new Date(data.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const bookingUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/#booking`
    : "https://kochfp.com/#booking";

  try {
    const result = await resend.emails.send({
      from: "KOCH Functional Patterns <onboarding@resend.dev>",
      to: data.email,
      subject: `How Are You Feeling After Your Session, ${data.name}?`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #d4a843, #b8922e); padding: 24px 32px;">
            <h1 style="margin: 0; font-size: 20px; color: #000;">How Are You Feeling?</h1>
          </div>
          <div style="padding: 32px;">
            <p style="margin: 0 0 16px;">Hi ${data.name},</p>
            <p style="margin: 0 0 8px; color: #a3a3a3;">It's been a few days since your ${data.service} on ${formattedDate}.</p>
            <p style="margin: 0 0 24px; color: #a3a3a3;">I'd love to hear how your body has been responding. Have you noticed any changes in how you move or feel?</p>
            <div style="background: #141414; border-radius: 12px; padding: 20px; border: 1px solid #262626;">
              <p style="margin: 0 0 12px; font-weight: bold; color: #d4a843;">Keep the Momentum Going</p>
              <p style="margin: 0; color: #a3a3a3; line-height: 1.6;">Consistency is key to lasting change. Regular sessions help your body build on the progress we've made together.</p>
            </div>
            <div style="text-align: center; margin: 28px 0 0;">
              <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4a843, #b8922e); color: #000; font-weight: bold; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-size: 15px;">Book Your Next Session</a>
            </div>
            <p style="margin: 24px 0 0; color: #a3a3a3; font-size: 14px;">Feel free to reply to this email with any questions or feedback.</p>
            <p style="margin: 16px 0 0; color: #d4a843;">— KOCH Functional Patterns</p>
          </div>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Failed to send follow-up email:", error);
    return null;
  }
}
