import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const createIntent = vi.fn();
const getRates = vi.fn();
vi.mock("stripe", () => ({
  default: class {
    paymentIntents = { create: (...a: unknown[]) => createIntent(...a) };
  },
}));
vi.mock("axios", () => ({ default: { get: (...a: unknown[]) => getRates(...a) } }));

import { startApp } from "../test/app.js";
import { resetDb } from "../test/db.js";
import { makeTour } from "../test/fixtures.js";
import { knex } from "../db/knex.js";
import payment from "./payment.js";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(payment)));
afterAll(async () => {
  await app.close();
  await knex.destroy();
});
beforeEach(async () => {
  await resetDb();
  createIntent.mockReset().mockResolvedValue({ client_secret: "secret_123" });
  getRates.mockReset().mockResolvedValue({ data: { rates: { EUR: 0.9, TRY: 30 } } });
});

const guests = (adults: number, children = 0, infants = 0) => ({ adults, children, infants });

describe("POST /cart/quote", () => {
  it("prices adults in full and children at half", async () => {
    const tour = await makeTour({ price: "100.00" });
    const res = await app.post("/cart/quote", { bookings: [{ tour_id: tour.id, ...guests(2, 2) }] });
    expect(res.status).toBe(200);
    expect(res.body.grand_total).toBe(300); // 2 x 100 + 2 x 50
    expect(res.body.currency).toBe("USD");
  });

  it("takes 10% off featured tours", async () => {
    const tour = await makeTour({ price: "100.00", featured: true });
    const res = await app.post("/cart/quote", { bookings: [{ tour_id: tour.id, ...guests(2) }] });
    expect(res.body.breakdown[0]).toMatchObject({ discount: 20, subtotal: 180 });
  });

  it("converts to the chosen currency and adds up several tours", async () => {
    const a = await makeTour({ price: "100.00" });
    const b = await makeTour({ price: "50.00", tourName: "Bosphorus Cruise" });
    const res = await app.post("/cart/quote", {
      selectedCurrency: "eur",
      bookings: [
        { tour_id: a.id, ...guests(1) },
        { tour_id: b.id, ...guests(2) },
      ],
    });
    expect(res.body.currency).toBe("EUR");
    expect(res.body.exchange_rate).toBe(0.9);
    expect(res.body.grand_total).toBeCloseTo(180); // (100 + 100) x 0.9
  });

  it.each([
    [{ bookings: [] }, 400, "No bookings provided"],
    [{ bookings: [{ tour_id: 1, adults: 0 }] }, 400, "Booking 1: At least 1 adult is required per booking"],
    [{ bookings: [{ tour_id: 1, adults: 40, children: 11 }] }, 400, "Booking 1: Guest count exceeds maximum allowed (50)"],
    [{ bookings: [{ tour_id: 1, adults: 1, children: -1 }] }, 400, "Booking 1: Invalid children count"],
  ])("rejects bad input %#", async (body, status, error) => {
    const res = await app.post("/cart/quote", body);
    expect(res.status).toBe(status);
    expect(res.body.error).toBe(error);
  });

  it("answers 404 when no tour exists and 400 for an unknown currency", async () => {
    expect((await app.post("/cart/quote", { bookings: [{ tour_id: 999, ...guests(1) }] })).status).toBe(404);
    const tour = await makeTour();
    const res = await app.post("/cart/quote", { selectedCurrency: "XXX", bookings: [{ tour_id: tour.id, ...guests(1) }] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Unsupported currency: XXX");
  });
});

describe("POST /create-payment-intent", () => {
  const booking = (tourId: number, extra = {}) => ({
    user_id: 7, tour_id: tourId, time_slot_id: 3, tour_date: "2099-06-01", ...guests(2, 1), ...extra,
  });

  it("charges the server-side total in the smallest currency unit", async () => {
    const tour = await makeTour({ price: "100.00" });
    const res = await app.post("/create-payment-intent", { selectedCurrency: "EUR", bookings: [booking(tour.id)] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ clientSecret: "secret_123" });
    // (2 x 100 + 1 x 50) x 0.9 = 225.00 EUR
    expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 22500, currency: "eur" }));
  });

  it("applies the featured discount to the charge", async () => {
    const tour = await makeTour({ price: "100.00", featured: true });
    await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking(tour.id)] });
    expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 22500 })); // 250 x 0.9
  });

  it("passes every booking detail to Stripe as metadata", async () => {
    const tour = await makeTour();
    await app.post("/create-payment-intent", {
      selectedCurrency: "USD",
      bookings: [booking(tour.id, { contact_name: "Ayse", contact_email: "ayse@example.com", language: "tr" })],
    });
    expect(createIntent.mock.calls[0][0].metadata).toMatchObject({
      booking_1_tour_id: tour.id,
      booking_1_time_slot_id: 3,
      booking_1_tour_date: "2099-06-01",
      booking_1_adults: 2,
      booking_1_contact_email: "ayse@example.com",
      booking_1_language: "tr",
      conversion_rate: "1",
    });
  });

  it("refuses past dates, bad dates and unknown currencies without charging", async () => {
    const tour = await makeTour();
    const past = await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking(tour.id, { tour_date: "2000-01-01" })] });
    expect(past.body.error).toBe("Tour date must be in the future.");
    const bad = await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking(tour.id, { tour_date: "2099-02-30" })] });
    expect(bad.body.error).toBe("Invalid booking date format.");
    const cur = await app.post("/create-payment-intent", { selectedCurrency: "XXX", bookings: [booking(tour.id)] });
    expect(cur.body.error).toBe("Unsupported currency");
    expect(createIntent).not.toHaveBeenCalled();
  });

  it("ignores any price the client sends", async () => {
    const tour = await makeTour({ price: "100.00" });
    await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking(tour.id, { price: 1, amount: 1, total: 1 })] });
    expect(createIntent.mock.calls[0][0].amount).toBe(25000);
  });

  it.todo("treats omitted children as 0 (today it returns a 500)");
});
