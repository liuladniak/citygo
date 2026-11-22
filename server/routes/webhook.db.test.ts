import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "http";
import Stripe from "stripe";
import { resetDb, db } from "../test/db.js";
import { makeTimeSlot, makeTour, makeUser } from "../test/fixtures.js";
import { knex } from "../db/knex.js";
import { bookingGuests, bookingPayments, bookings } from "../db/drizzle/schema.js";
import webhook from "./webhook.js";

const stripe = new Stripe("sk_test_dummy");
let server: Server;
let url: string;

beforeAll(async () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  const app = express();
  // Same order as index.js: the webhook gets the raw body before any JSON parser.
  app.use("/webhook", express.raw({ type: "application/json" }), webhook);
  app.use(express.json());
  await new Promise<void>((r) => (server = app.listen(0, () => r())));
  url = `http://localhost:${(server.address() as { port: number }).port}/webhook`;
});
afterAll(async () => {
  server.close();
  await knex.destroy();
});
beforeEach(resetDb);

const send = (event: object, signature?: string) => {
  const body = JSON.stringify(event);
  const header =
    signature ?? stripe.webhooks.generateTestHeaderString({ payload: body, secret: "whsec_test" });
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "stripe-signature": header },
    body,
  });
};

const succeeded = (metadata: Record<string, string | number>, amount = 22500) => ({
  id: "evt_1",
  object: "event",
  type: "payment_intent.succeeded",
  data: { object: { id: "pi_123", amount, metadata } },
});

describe("Stripe webhook", () => {
  it("rejects an event with a bad signature", async () => {
    const res = await send(succeeded({}), "t=1,v1=bad");
    expect(res.status).toBe(400);
    expect(await db.select().from(bookings)).toHaveLength(0);
  });

  it("accepts a correctly signed event it does not care about", async () => {
    const res = await send({ id: "evt_2", object: "event", type: "charge.succeeded", data: { object: {} } });
    expect(res.status).toBe(200);
  });

  it("turns a paid intent into a confirmed booking with guests and payment", async () => {
    const user = await makeUser();
    const tour = await makeTour({ price: "100.00" });
    const slot = await makeTimeSlot(tour.id);
    const res = await send(
      succeeded({
        booking_1_user_id: user.id,
        booking_1_tour_id: tour.id,
        booking_1_time_slot_id: slot.id,
        booking_1_tour_date: "2099-06-01",
        booking_1_adults: 2,
        booking_1_children: 1,
        booking_1_infants: 0,
        booking_1_contact_name: "Ayse Demir",
        booking_1_contact_email: "ayse@example.com",
        booking_1_language: "tr",
        conversion_rate: "0.9",
      }),
    );
    expect(res.status).toBe(200);

    const [booking] = await db.select().from(bookings);
    expect(booking).toMatchObject({
      userId: user.id,
      tourId: tour.id,
      tourDate: "2099-06-01",
      status: "confirmed",
      source: "website",
      primaryContactName: "Ayse Demir",
      primaryContactEmail: "ayse@example.com",
      language: "tr",
    });
    expect(Number(booking.totalPrice)).toBeCloseTo(225); // (2 x 100 + 1 x 50) x 0.9
    expect(booking.bookingReference).toMatch(/^BK-/);

    const [guests] = await db.select().from(bookingGuests);
    expect(guests).toMatchObject({ bookingId: booking.id, adults: 2, children: 1, infants: 0 });
    const [paid] = await db.select().from(bookingPayments);
    expect(paid).toMatchObject({ bookingId: booking.id, status: "paid", notes: "Stripe payment pi_123" });
    expect(Number(paid.amount)).toBe(225);
  });

  it("creates one booking per item in a multi-tour payment, all or nothing", async () => {
    const user = await makeUser();
    const a = await makeTour();
    const b = await makeTour({ tourName: "Bosphorus Cruise" });
    const [sa, sb] = [await makeTimeSlot(a.id), await makeTimeSlot(b.id)];
    const meta = (i: number, tourId: number, slotId: number) => ({
      [`booking_${i}_user_id`]: user.id,
      [`booking_${i}_tour_id`]: tourId,
      [`booking_${i}_time_slot_id`]: slotId,
      [`booking_${i}_tour_date`]: "2099-06-01",
      [`booking_${i}_adults`]: 1,
    });
    const res = await send(succeeded({ ...meta(1, a.id, sa.id), ...meta(2, b.id, sb.id) }));
    expect(res.status).toBe(200);
    expect(await db.select().from(bookings)).toHaveLength(2);

    await resetDb();
    const broken = await send(succeeded({ ...meta(1, a.id, sa.id), booking_2_user_id: user.id, booking_2_tour_id: 999999, booking_2_tour_date: "2099-06-01" }));
    expect(broken.status).toBe(400);
    expect(await db.select().from(bookings)).toHaveLength(0); // nothing half-saved
  });

  it.todo("ignores a second delivery of the same payment intent (today it books twice)");
});
