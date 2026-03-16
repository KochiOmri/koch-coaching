import { NextRequest, NextResponse } from "next/server";
import {
  getAllReferrals,
  generateReferralCode,
  trackReferral,
  getReferralByCode,
  getReferralByClientId,
} from "@/lib/referrals";
import { getClientById } from "@/lib/clients";

export async function GET(req: NextRequest) {
  try {
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

      const client = getClientById(clientId);
      if (!client) {
        return NextResponse.json({ error: "Client not found" }, { status: 404 });
      }

      const referral = generateReferralCode(clientId, client.name, client.email);
      return NextResponse.json(referral, { status: 201 });
    }

    if (action === "track") {
      const { code, name, email } = body;
      if (!code || !name || !email) {
        return NextResponse.json({ error: "Code, name, and email are required" }, { status: 400 });
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
