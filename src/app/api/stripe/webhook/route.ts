import { NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isSupabaseConfigured, getDb } from "@/lib/supabase/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { packageId, clientId, sessionCount } = session.metadata || {};

    if (isSupabaseConfigured() && packageId) {
      const db = await getDb();
      if (db) {
        // Record the payment
        await db.from("payments").insert({
          client_id: clientId || null,
          package_id: packageId,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency?.toUpperCase() || "ILS",
          status: "succeeded",
          stripe_payment_id: session.payment_intent as string,
          description: `Package purchase: ${packageId}`,
        });

        // Create client package (activate sessions)
        if (clientId && sessionCount) {
          await db.from("client_packages").insert({
            client_id: clientId,
            package_id: packageId,
            sessions_total: parseInt(sessionCount),
            sessions_used: 0,
            status: "active",
            stripe_subscription_id: session.subscription as string || null,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
