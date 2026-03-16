/**
 * CRON ENDPOINT — /api/cron
 *
 * Triggers reminder and follow-up emails.
 * Can be called by:
 * - Vercel Cron (add to vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "0 8 * * *" }] })
 * - Manual trigger from the admin dashboard "Send Reminders" button
 *
 * Optional: protect with CRON_SECRET env var for Vercel Cron.
 */

import { NextResponse } from "next/server";
import { checkAndSendReminders, checkAndSendFollowups } from "@/lib/email-scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional auth: Vercel sends this header for cron jobs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [reminders, followups] = await Promise.all([
      checkAndSendReminders(),
      checkAndSendFollowups(),
    ]);

    return NextResponse.json({
      success: true,
      reminders,
      followups,
      total: reminders + followups,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Failed to process emails", details: String(error) },
      { status: 500 }
    );
  }
}
