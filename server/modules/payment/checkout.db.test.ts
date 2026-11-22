// The two halves of checkout must agree: what the payment intent stores in Stripe's
// metadata is exactly what the webhook turns into a booking.
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "http";

const createIntent = vi.fn();
vi.mock("stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("stripe")>();
  return {
    default: class extends actual.default {
      paymentIntents = { create: (...a: unknown[]) => createIntent(...a) } as never;
    },
  };
});
vi.mock("axios", () => ({ default: { get: vi.fn().mockResolvedValue({ data: { rates: { EUR: 0.9 } } }) } }));
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

import Stripe from "stripe";
import { db, resetDb } from "../../test/db.js";
import { makeTimeSlot, makeTour, makeUser } from "../../test/fixtures.js";
import { knex } from "../../db/knex.js";
import { bookingPayments, bookings } from "../../db/drizzle/schema.js";
import webhook from "../../routes/webhook.js";
import { resetExchangeRates } from "./exchangeRates.js";
import payment from "./payment.routes.js";

let server: Server;
let base: string;
beforeAll(async () => {
  const app = express();
  app.use("/webhook", express.raw({ type: "application/json" }), webhook);
  app.use(express.json());
  app.use("/payment", payment);
  await new Promise<void>((r) => (server = app.listen(0, () => r())));
  base = `http://localhost:${(server.address() as { port: number }).port}`;
});
afterAll(async () => {
  server.close();
  await knex.destroy();
});
beforeEach(async () => {
  await resetDb();
  resetExchangeRates();
  createIntent.mockReset().mockResolvedValue({ client_secret: "secret_123" });
});

describe("checkout", () => {
  it("books exactly what was quoted and charged", async () => {
    const user = await makeUser();
    const tour = await makeTour({ price: "100.00", featured: true });
    const slot = await makeTimeSlot(tour.id);

    const res = await fetch(`${base}/payment/create-payment-intent`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        selectedCurrency: "EUR",
        bookings: [{
          user_id: user.id, tour_id: tour.id, time_slot_id: slot.id, tour_date: "2099-06-01",
          adults: 2, children: 1, contact_name: "Ayse Demir", contact_email: "ayse@example.com",
          contact_phone: "+90 532 000 00 00", special_requirements: "Vegetarian lunch",
        }],
      }),
    });
    expect(res.status).toBe(200);
    const { amount, metadata } = createIntent.mock.calls[0][0];
    expect(amount).toBe(20250); // 250 less 10% = 225 USD x 0.9 = 202.50 EUR

    // Stripe confirms the payment and calls the webhook with the same metadata.
    const stripe = new Stripe("sk_test_dummy");
    const body = JSON.stringify({
      id: "evt_1", object: "event", type: "payment_intent.succeeded",
      data: { object: { id: "pi_1", amount, metadata } },
    });
    const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_test" });
    const hook = await fetch(`${base}/webhook`, {
      method: "POST", headers: { "content-type": "application/json", "stripe-signature": signature }, body,
    });
    expect(hook.status).toBe(200);

    const [booking] = await db.select().from(bookings);
    expect(booking).toMatchObject({
      userId: user.id, tourId: tour.id, timeSlotId: slot.id, tourDate: "2099-06-01", status: "confirmed",
      primaryContactName: "Ayse Demir", primaryContactEmail: "ayse@example.com",
      primaryContactPhone: "+90 532 000 00 00", notes: "Vegetarian lunch",
    });
    const [paid] = await db.select().from(bookingPayments);
    expect(Number(booking.totalPrice)).toBeCloseTo(Number(paid.amount)); // 202.50
    expect(Number(paid.amount)).toBe(202.5);
  });
});
