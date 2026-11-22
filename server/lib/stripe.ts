import Stripe from "stripe";
import { env } from "../config/env.js";

let client: Stripe | undefined;

/** The one Stripe client, created on first use so tests and dev work without a key. */
export function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  return (client ??= new Stripe(env.STRIPE_SECRET_KEY));
}
