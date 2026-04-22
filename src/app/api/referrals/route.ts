import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import {
  getAllReferrals,
  generateReferralCode,
  trackReferral,
  getReferralByCode,
  getReferralByClientId,
} from "@/lib/referrals";
import { getClientById } from "@/lib/clients";

function mapRowToReferral(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    referrerId: String(row.referrer_id),
    referrerName: String(row.referrer_name ?? ""),
    referrerEmail: String(row.referrer_email ?? ""),
    referralCode: String(row.referral_code ?? ""),
    referredClients: Array.isArray(row.referred_clients) ? (row.referred_clients as Array<{ name: string; email: string; bookedAt: string; status: string }>) : [],
    rewardsEarned: Number(row.rewards_earned ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "KOCH-";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET(req: NextRequest) {
  try {
    if (isSupabaseConfigured()) {
      const db = await getDb();
      if (db) {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const clientId = searchParams.get("clientId");

        if (code) {
          const { data, error } = await db
            .from("referrals")
            .select("*")
            .eq("referral_code", code.toUpperCase())
            .single();
          if (error || !data) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
          }
          return NextResponse.json(mapRowToReferral(data as Record<string, unknown>));
        }

        if (clientId) {
          const { data, error } = await db
            .from("referrals")
            .select("*")
            .eq("referrer_id", clientId)
            .single();
          if (error || !data) {
            return NextResponse.json(null);
          }
          return NextResponse.json(mapRowToReferral(data as Record<string, unknown>));
        }

        const { data, error } = await db.from("referrals").select("*");
        if (error) {
          console.error("Referrals GET Supabase error:", error);
          return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 });
        }
        const referrals = (data ?? []).map((r) => mapRowToReferral(r as Record<string, unknown>));
        return NextResponse.json(referrals);
      }
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const clientId = searchParams.get("clientId");

    if (code) {
      const referral = getReferralByCode(code);
      if (!referral) return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
      return NextResponse.json(referral);
    }

    if (clientId) {
      const referral = getReferralByClientId(clientId);
      return NextResponse.json(referral || null);
    }

    const referrals = getAllReferrals();
    return NextResponse.json(referrals);
  } catch (error) {
    console.error("Referrals GET error:", error);
    return NextResponse.json({ error: "Failed to load referrals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "generate") {
      const { clientId } = body;
      if (!clientId) {
        return NextResponse.json({ error: "clientId is required" }, { status: 400 });
      }

      let clientName = "";
      let clientEmailAddr = "";

      if (isSupabaseConfigured()) {
        const db = await getDb();
        if (db) {
          const { data: profile } = await db.from("profiles").select("name, email").eq("id", clientId).single();
          if (profile) {
            clientName = profile.name || "";
            clientEmailAddr = profile.email || "";
          }
        }
      }
      if (!clientEmailAddr) {
        const client = await getClientById(clientId);
        if (!client) {
          return NextResponse.json({ error: "Client not found" }, { status: 404 });
        }
        clientName = client.name;
        clientEmailAddr = client.email;
      }

      if (isSupabaseConfigured()) {
        const db = await getDb();
        if (db) {
          const { data: existing } = await db
            .from("referrals")
            .select("*")
            .eq("referrer_id", clientId)
            .single();

          if (existing) {
            return NextResponse.json(mapRowToReferral(existing as Record<string, unknown>), { status: 201 });
          }

          let code = generateCode();
          let { data: codeExists } = await db.from("referrals").select("id").eq("referral_code", code).maybeSingle();
          while (codeExists) {
            code = generateCode();
            const r = await db.from("referrals").select("id").eq("referral_code", code).maybeSingle();
            codeExists = r.data;
          }

          const row = {
            id: crypto.randomUUID(),
            referrer_id: clientId,
            referrer_name: clientName,
            referrer_email: clientEmailAddr,
            referral_code: code,
            referred_clients: [],
            rewards_earned: 0,
            created_at: new Date().toISOString(),
          };

          const { data, error } = await db.from("referrals").insert(row).select().single();
          if (error) {
            console.error("Referrals generate Supabase error:", error);
            return NextResponse.json({ error: "Failed to generate referral" }, { status: 500 });
          }
          return NextResponse.json(mapRowToReferral(data as Record<string, unknown>), { status: 201 });
        }
      }

      const referral = generateReferralCode(clientId, clientName, clientEmailAddr);
      return NextResponse.json(referral, { status: 201 });
    }

    if (action === "track") {
      const { code, name, email } = body;
      if (!code || !name || !email) {
        return NextResponse.json({ error: "Code, name, and email are required" }, { status: 400 });
      }

      if (isSupabaseConfigured()) {
        const db = await getDb();
        if (db) {
          const { data: referral, error: fetchError } = await db
            .from("referrals")
            .select("*")
            .eq("referral_code", code.toUpperCase())
            .single();

          if (fetchError || !referral) {
            return NextResponse.json({ error: "Invalid referral code" }, { status: 400 });
          }

          const r = referral as Record<string, unknown>;
          const referredClients = (r.referred_clients as Array<Record<string, unknown>>) ?? [];
          const alreadyReferred = referredClients.some(
            (rc) => String(rc.email || "").toLowerCase() === email.toLowerCase()
          );
          if (alreadyReferred) {
            return NextResponse.json({ error: "This email has already been referred" }, { status: 400 });
          }

          referredClients.push({
            name,
            email: email.toLowerCase(),
            bookedAt: new Date().toISOString(),
            status: "booked",
          });

          const { error: updateError } = await db
            .from("referrals")
            .update({
              referred_clients: referredClients,
              rewards_earned: Number(r.rewards_earned ?? 0) + 1,
            })
            .eq("id", r.id);

          if (updateError) {
            console.error("Referrals track Supabase error:", updateError);
            return NextResponse.json({ error: "Failed to track referral" }, { status: 500 });
          }

          return NextResponse.json({ success: true });
        }
      }

      const result = trackReferral(code, name, email);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Referrals POST error:", error);
    return NextResponse.json({ error: "Failed to process referral" }, { status: 500 });
  }
}
