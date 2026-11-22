import { and, inArray, ne } from "drizzle-orm";
import { db } from "../../db/index.js";
import { tours, tourTimeSlots } from "../../db/drizzle/schema.js";
import { badRequest, notFound } from "../../lib/errors.js";
import { getStripe } from "../../lib/stripe.js";
import { getExchangeRate } from "./exchangeRates.js";
import { priceBooking, toMinorUnits } from "./pricing.js";
import type { IntentBody, QuoteBody } from "./payment.schemas.js";

type PricedTour = { id: number; name: string; price: number; featured: boolean };

/** One query for every tour in the cart. Draft tours cannot be bought. */
async function loadTours(ids: number[]): Promise<Map<number, PricedTour>> {
  const rows = await db
    .select({ id: tours.id, name: tours.tourName, price: tours.price, featured: tours.featured })
    .from(tours)
    .where(and(inArray(tours.id, [...new Set(ids)]), ne(tours.status, "draft")));
  return new Map(
    rows.map((r) => [r.id, { id: r.id, name: r.name, price: Number(r.price), featured: Boolean(r.featured) }]),
  );
}

const requireTour = (found: Map<number, PricedTour>, id: number) => {
  const tour = found.get(id);
  if (!tour) throw notFound(`Tour ID ${id} not found`);
  return tour;
};

export async function quoteCart({ bookings, selectedCurrency }: QuoteBody) {
  const found = await loadTours(bookings.map((b) => b.tour_id));
  const rate = await getExchangeRate(selectedCurrency);

  let totalUsd = 0;
  const breakdown = bookings.map((booking) => {
    const tour = requireTour(found, booking.tour_id);
    const priced = priceBooking(tour, booking);
    totalUsd += priced.total;
    return {
      tour_id: tour.id,
      tour_name: tour.name,
      featured: tour.featured,
      guests: { adults: booking.adults, children: booking.children, infants: booking.infants },
      base_price: tour.price * rate,
      adult_total: priced.adultTotal * rate,
      child_total: priced.childTotal * rate,
      infant_total: 0,
      discount: priced.discount * rate,
      subtotal: priced.total * rate,
    };
  });

  return {
    breakdown,
    // The amount that will actually be charged, rounded to the cent.
    grand_total: toMinorUnits(totalUsd, rate) / 100,
    currency: selectedCurrency,
    exchange_rate: rate,
  };
}

export async function createPaymentIntent({ bookings, selectedCurrency }: IntentBody) {
  const found = await loadTours(bookings.map((b) => b.tour_id));
  const rate = await getExchangeRate(selectedCurrency);

  // A time slot must belong to the tour it is booked for.
  const slots = await db
    .select({ id: tourTimeSlots.id, tourId: tourTimeSlots.tourId })
    .from(tourTimeSlots)
    .where(inArray(tourTimeSlots.id, [...new Set(bookings.map((b) => b.time_slot_id))]));
  const slotTour = new Map(slots.map((s) => [s.id, s.tourId]));

  let totalUsd = 0;
  const metadata: Record<string, string> = { conversion_rate: String(rate) };

  bookings.forEach((booking, index) => {
    const tour = requireTour(found, booking.tour_id);
    if (slotTour.get(booking.time_slot_id) !== tour.id) {
      throw badRequest("The selected time slot is not available for this tour.");
    }
    totalUsd += priceBooking(tour, booking).total;

    const prefix = `booking_${index + 1}_`;
    const values: Record<string, string | number> = {
      user_id: booking.user_id,
      tour_id: booking.tour_id,
      time_slot_id: booking.time_slot_id,
      tour_date: booking.tour_date,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      contact_name: booking.contact_name,
      contact_email: booking.contact_email,
      contact_phone: booking.contact_phone,
      language: booking.language,
      special_requirements: booking.special_requirements,
    };
    for (const [key, value] of Object.entries(values)) metadata[prefix + key] = String(value);
  });

  const intent = await getStripe().paymentIntents.create({
    amount: toMinorUnits(totalUsd, rate),
    currency: selectedCurrency.toLowerCase(),
    metadata,
  });
  return { clientSecret: intent.client_secret };
}
