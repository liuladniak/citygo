// The one place that decides what a booking costs. Amounts are in USD, the base currency.

export const CHILD_PRICE_SHARE = 0.5;
export const FEATURED_DISCOUNT = 0.1;

export type Priced = {
  adultTotal: number;
  childTotal: number;
  subtotal: number;
  discount: number;
  /** subtotal minus discount */
  total: number;
};

export function priceBooking(
  tour: { price: number; featured: boolean },
  guests: { adults: number; children: number },
): Priced {
  const adultTotal = guests.adults * tour.price;
  const childTotal = guests.children * tour.price * CHILD_PRICE_SHARE;
  const subtotal = adultTotal + childTotal;
  const discount = tour.featured ? subtotal * FEATURED_DISCOUNT : 0;
  return { adultTotal, childTotal, subtotal, discount, total: subtotal - discount };
}

/** USD to the smallest unit of the chosen currency (cents), rounded once. */
export const toMinorUnits = (usd: number, rate: number): number => Math.round(usd * rate * 100);
