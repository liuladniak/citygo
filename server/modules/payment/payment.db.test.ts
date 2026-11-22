import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const createIntent = vi.fn();
const getRates = vi.fn();
vi.mock("stripe", () => ({
  default: class {
    paymentIntents = { create: (...a: unknown[]) => createIntent(...a) };
  },
}));
vi.mock("axios", () => ({ default: { get: (...a: unknown[]) => getRates(...a) } }));
vi.spyOn(console, "error").mockImplementation(() => {});

import { startApp } from "../../test/app.js";
import { resetDb } from "../../test/db.js";
import { makeTimeSlot, makeTour } from "../../test/fixtures.js";
import { resetExchangeRates } from "./exchangeRates.js";
import payment from "./payment.routes.js";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => (app = await startApp(payment)));
afterAll(() => app.close());
beforeEach(async () => {
  await resetDb();
  resetExchangeRates();
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
      bookings: [{ tour_id: a.id, ...guests(1) }, { tour_id: b.id, ...guests(2) }],
    });
    expect(res.body).toMatchObject({ currency: "EUR", exchange_rate: 0.9, grand_total: 180 }); // (100 + 100) x 0.9
  });

  it("treats omitted children and infants as 0", async () => {
    const tour = await makeTour({ price: "100.00" });
    const res = await app.post("/cart/quote", { bookings: [{ tour_id: tour.id, adults: 1 }] });
    expect(res.body.breakdown[0].guests).toEqual({ adults: 1, children: 0, infants: 0 });
  });

  it.each([
    [{ bookings: [] }, "No bookings provided"],
    [{}, "No bookings provided"],
    [{ bookings: [{ tour_id: 1, adults: 0 }] }, "Booking 1: At least 1 adult is required per booking"],
    [{ bookings: [{ tour_id: 1, adults: 40, children: 11 }] }, "Booking 1: Guest count exceeds maximum allowed (50)"],
    [{ bookings: [{ tour_id: 1, adults: 1, children: -1 }] }, "Booking 1: Invalid children count"],
    [{ bookings: Array(5).fill({ tour_id: 1, adults: 1 }) }, "You can pay for at most 4 bookings at once"],
    [{ selectedCurrency: "EURO", bookings: [{ tour_id: 1, adults: 1 }] }, "Unsupported currency"],
  ])("rejects bad input %#", async (body, error) => {
    const res = await app.post("/cart/quote", body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error, message: error });
  });

  it("answers 404 for a missing or draft tour and 400 for an unknown currency", async () => {
    const missing = await app.post("/cart/quote", { bookings: [{ tour_id: 999, ...guests(1) }] });
    expect(missing).toMatchObject({ status: 404, body: { error: "Tour ID 999 not found" } });
    const draft = await makeTour({ status: "draft" });
    expect((await app.post("/cart/quote", { bookings: [{ tour_id: draft.id, ...guests(1) }] })).status).toBe(404);

    const tour = await makeTour();
    const res = await app.post("/cart/quote", { selectedCurrency: "XXX", bookings: [{ tour_id: tour.id, ...guests(1) }] });
    expect(res).toMatchObject({ status: 400, body: { error: "Unsupported currency: XXX" } });
  });

  it("looks the exchange rate up once for repeated quotes, and says 503 when it is unreachable", async () => {
    const tour = await makeTour();
    const body = { selectedCurrency: "EUR", bookings: [{ tour_id: tour.id, ...guests(1) }] };
    await app.post("/cart/quote", body);
    await app.post("/cart/quote", body);
    expect(getRates).toHaveBeenCalledTimes(1);

    resetExchangeRates();
    getRates.mockRejectedValue(new Error("down"));
    expect((await app.post("/cart/quote", body)).status).toBe(503);
  });
});

describe("POST /create-payment-intent", () => {
  const book = async (tourOverrides = {}, extra = {}) => {
    const tour = await makeTour(tourOverrides);
    const slot = await makeTimeSlot(tour.id);
    return { tour, slot, booking: { user_id: 7, tour_id: tour.id, time_slot_id: slot.id, tour_date: "2099-06-01", ...guests(2, 1), ...extra } };
  };

  it("charges the server-side total in the smallest currency unit", async () => {
    const { booking } = await book({ price: "100.00" });
    const res = await app.post("/create-payment-intent", { selectedCurrency: "EUR", bookings: [booking] });
    expect(res).toMatchObject({ status: 200, body: { clientSecret: "secret_123" } });
    // (2 x 100 + 1 x 50) x 0.9 = 225.00 EUR
    expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 22500, currency: "eur" }));
  });

  it("applies the featured discount to the charge", async () => {
    const { booking } = await book({ price: "100.00", featured: true });
    await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking] });
    expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 22500 })); // 250 less 10%
  });

  it("passes every booking detail to Stripe as text metadata", async () => {
    const { tour, slot, booking } = await book({}, {
      contact_name: " Ayse ", contact_email: "AYSE@Example.com", contact_phone: "+90 532 000 00 00", language: "tr",
    });
    await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking] });
    expect(createIntent.mock.calls[0][0].metadata).toEqual({
      conversion_rate: "1",
      booking_1_user_id: "7",
      booking_1_tour_id: String(tour.id),
      booking_1_time_slot_id: String(slot.id),
      booking_1_tour_date: "2099-06-01",
      booking_1_adults: "2",
      booking_1_children: "1",
      booking_1_infants: "0",
      booking_1_contact_name: "Ayse",
      booking_1_contact_email: "ayse@example.com",
      booking_1_contact_phone: "+90 532 000 00 00",
      booking_1_language: "tr",
      booking_1_special_requirements: "",
    });
  });

  it("treats omitted children as 0", async () => {
    const { booking } = await book({ price: "100.00" });
    const { children: _omit, ...withoutChildren } = booking;
    const res = await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [withoutChildren] });
    expect(res.status).toBe(200);
    expect(createIntent).toHaveBeenCalledWith(expect.objectContaining({ amount: 20000 }));
  });

  it("refuses past dates, bad dates and unknown currencies without charging", async () => {
    const { booking } = await book();
    const send = (extra: object, currency = "USD") =>
      app.post("/create-payment-intent", { selectedCurrency: currency, bookings: [{ ...booking, ...extra }] });
    expect((await send({ tour_date: "2000-01-01" })).body.error).toBe("Booking 1: Tour date must be in the future.");
    expect((await send({ tour_date: "2099-02-30" })).body.error).toBe("Booking 1: Use a real date as YYYY-MM-DD");
    expect((await send({}, "XXX")).body.error).toBe("Unsupported currency: XXX");
    expect(createIntent).not.toHaveBeenCalled();
  });

  it("needs a user and a time slot that belongs to the tour, because the webhook does", async () => {
    const { booking } = await book();
    const other = await makeTour({ tourName: "Bosphorus Cruise" });
    const otherSlot = await makeTimeSlot(other.id);
    const send = (extra: object) => app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [{ ...booking, ...extra }] });

    expect((await send({ user_id: undefined })).status).toBe(400);
    expect((await send({ time_slot_id: undefined })).status).toBe(400);
    expect(await send({ time_slot_id: otherSlot.id })).toMatchObject({
      status: 400,
      body: { error: "The selected time slot is not available for this tour." },
    });
    expect(createIntent).not.toHaveBeenCalled();
  });

  it("ignores any price the client sends", async () => {
    const { booking } = await book({ price: "100.00" });
    await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [{ ...booking, price: 1, amount: 1, total: 1 }] });
    expect(createIntent.mock.calls[0][0].amount).toBe(25000);
  });

  it("rejects a malformed email instead of storing it", async () => {
    const { booking } = await book({}, { contact_email: "not-an-email" });
    const res = await app.post("/create-payment-intent", { selectedCurrency: "USD", bookings: [booking] });
    expect(res.status).toBe(400);
  });
});
