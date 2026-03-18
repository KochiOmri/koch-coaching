/**
 * Data Migration Script: JSON files → Supabase
 *
 * Usage:
 *   npx tsx scripts/migrate-to-supabase.ts
 *
 * Prerequisites:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 *   2. Run the schema.sql in Supabase SQL Editor first
 *   3. Have a Supabase service_role key for admin operations
 *
 * Set SUPABASE_SERVICE_ROLE_KEY in .env.local for this script.
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || SUPABASE_URL.includes("your-project")) {
  console.error("ERROR: Set NEXT_PUBLIC_SUPABASE_URL in .env.local");
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: Set SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function readJson(filename: string) {
  const filePath = path.join(process.cwd(), "data", filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function migrate() {
  console.log("Starting migration to Supabase...\n");

  // 1. Site Content
  const siteContent = readJson("site-content.json");
  if (siteContent) {
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: "main", content: siteContent, updated_at: new Date().toISOString() });
    console.log(error ? `✗ site_content: ${error.message}` : "✓ site_content migrated");
  }

  // 2. Video Config
  const videoConfig = readJson("video-config.json");
  if (videoConfig) {
    const { error } = await supabase
      .from("video_config")
      .upsert({ id: "main", config: videoConfig, updated_at: new Date().toISOString() });
    console.log(error ? `✗ video_config: ${error.message}` : "✓ video_config migrated");
  }

  // 3. Appointments
  const appointments = readJson("appointments.json");
  if (Array.isArray(appointments) && appointments.length > 0) {
    const rows = appointments.map((a: any) => ({
      id: a.id,
      client_name: a.name || a.clientName || "",
      client_email: a.email || a.clientEmail || "",
      client_phone: a.phone || a.clientPhone || "",
      service: a.service || "consultation",
      date: a.date,
      time: a.time,
      status: a.status || "pending",
      notes: a.message || a.notes || "",
      meet_link: a.meetLink || null,
      created_at: a.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from("appointments").upsert(rows);
    console.log(error ? `✗ appointments: ${error.message}` : `✓ appointments: ${rows.length} migrated`);
  }

  // 4. Exercises
  const exercises = readJson("exercises.json");
  if (Array.isArray(exercises) && exercises.length > 0) {
    const rows = exercises.map((e: any) => ({
      id: e.id,
      name: e.name,
      description: e.description || "",
      category: e.category || "general",
      difficulty: e.difficulty || "intermediate",
      video_url: e.videoUrl || null,
      instructions: e.instructions || [],
      target_areas: e.targetAreas || [],
      tags: e.tags || [],
      duration_minutes: e.durationMinutes || null,
      created_at: e.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from("exercises").upsert(rows);
    console.log(error ? `✗ exercises: ${error.message}` : `✓ exercises: ${rows.length} migrated`);
  }

  // 5. Packages
  const packages = readJson("packages.json");
  if (Array.isArray(packages) && packages.length > 0) {
    const rows = packages.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      session_count: p.sessionCount || p.sessions || 1,
      price: p.price || 0,
      currency: p.currency || "ILS",
      is_active: p.isActive !== false,
      created_at: p.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from("packages").upsert(rows);
    console.log(error ? `✗ packages: ${error.message}` : `✓ packages: ${rows.length} migrated`);
  }

  // 6. Group Classes
  const groupClasses = readJson("group-classes.json");
  if (Array.isArray(groupClasses) && groupClasses.length > 0) {
    const rows = groupClasses.map((g: any) => ({
      id: g.id,
      title: g.title || g.name,
      description: g.description || "",
      instructor: g.instructor || "Koch",
      day_of_week: g.dayOfWeek || g.day || "",
      time: g.time || "",
      duration_minutes: g.durationMinutes || g.duration || 60,
      max_participants: g.maxParticipants || g.capacity || 10,
      location: g.location || "",
      is_active: g.isActive !== false,
    }));
    const { error } = await supabase.from("group_classes").upsert(rows);
    console.log(error ? `✗ group_classes: ${error.message}` : `✓ group_classes: ${rows.length} migrated`);
  }

  // 7. Newsletter
  const newsletter = readJson("newsletter.json");
  if (Array.isArray(newsletter) && newsletter.length > 0) {
    const rows = newsletter.map((n: any) => ({
      email: typeof n === "string" ? n : n.email,
      subscribed_at: n.subscribedAt || new Date().toISOString(),
      is_active: true,
    }));
    const { error } = await supabase.from("newsletter_subscribers").upsert(rows, { onConflict: "email" });
    console.log(error ? `✗ newsletter: ${error.message}` : `✓ newsletter: ${rows.length} migrated`);
  }

  // 8. Intake Forms
  const intakeForms = readJson("intake-forms.json");
  if (Array.isArray(intakeForms) && intakeForms.length > 0) {
    const rows = intakeForms.map((f: any) => ({
      id: f.id,
      name: f.name || f.personal?.name || "",
      email: f.email || f.personal?.email || "",
      phone: f.phone || f.personal?.phone || "",
      goals: f.goals || "",
      pain_areas: f.painAreas || [],
      pain_level: f.painLevel || null,
      medical_history: f.medicalHistory || "",
      consent: f.consent !== false,
      submitted_at: f.submittedAt || f.createdAt || new Date().toISOString(),
    }));
    const { error } = await supabase.from("intake_forms").upsert(rows);
    console.log(error ? `✗ intake_forms: ${error.message}` : `✓ intake_forms: ${rows.length} migrated`);
  }

  // 9. WhatsApp Templates
  const templates = readJson("whatsapp-templates.json");
  if (templates && typeof templates === "object") {
    const rows = Object.entries(templates).map(([name, template]) => ({
      name,
      template: template as string,
      category: "general",
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("whatsapp_templates").upsert(rows, { onConflict: "name" });
      console.log(error ? `✗ whatsapp_templates: ${error.message}` : `✓ whatsapp_templates: ${rows.length} migrated`);
    }
  }

  console.log("\nMigration complete!");
  console.log("Next steps:");
  console.log("1. Go to Supabase > Authentication > Providers > Enable Google");
  console.log("2. Set your email as admin: UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';");
  console.log("3. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel env vars");
}

migrate().catch(console.error);
