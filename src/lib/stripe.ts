import Stripe from "stripe";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

export function getStripe(): Stripe | null {
  if (!STRIPE_SECRET || STRIPE_SECRET === "sk_test_xxx") return null;
  return new Stripe(STRIPE_SECRET, { apiVersion: "2024-12-18.acacia" as any });
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET && STRIPE_SECRET !== "sk_test_xxx";
}
