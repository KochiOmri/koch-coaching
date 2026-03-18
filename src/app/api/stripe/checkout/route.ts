import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to your environment." },
      { status: 503 }
    );
  }

  const stripe = getStripe()!;
  const body = await request.json();
  const { packageId, clientId, clientEmail, successUrl, cancelUrl } = body;

  if (!packageId || !clientEmail) {
    return NextResponse.json({ error: "Missing packageId or clientEmail" }, { status: 400 });
  }

  // Look up the package
  let pkg: { name: string; price: number; session_count: number; currency: string } | null = null;

  if (isSupabaseConfigured()) {
    const db = await getDb();
    if (db) {
      const { data } = await db.from("packages").select("*").eq("id", packageId).single();
      pkg = data;
    }
  }

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: (pkg.currency || "ils").toLowerCase(),
            product_data: {
              name: pkg.name,
              description: `${pkg.session_count} coaching sessions`,
            },
            unit_amount: Math.round(pkg.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl || `${request.headers.get("origin")}/portal/billing?success=true`,
      cancel_url: cancelUrl || `${request.headers.get("origin")}/portal/billing?cancelled=true`,
      metadata: {
        packageId,
        clientId: clientId || "",
        sessionCount: String(pkg.session_count),
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
