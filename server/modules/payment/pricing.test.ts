import { describe, expect, it } from "vitest";
import { priceBooking, toMinorUnits } from "./pricing.js";

describe("priceBooking", () => {
  it("charges children half price", () => {
    expect(priceBooking({ price: 100, featured: false }, { adults: 2, children: 2 })).toEqual({
      adultTotal: 200, childTotal: 100, subtotal: 300, discount: 0, total: 300,
    });
  });

  it("takes 10% off featured tours", () => {
    const priced = priceBooking({ price: 100, featured: true }, { adults: 2, children: 1 });
    expect(priced.discount).toBeCloseTo(25);
    expect(priced.total).toBeCloseTo(225);
  });
});

describe("toMinorUnits", () => {
  it("rounds once, to the cent", () => {
    expect(toMinorUnits(225, 0.9)).toBe(20250);
    expect(toMinorUnits(33.33, 1.1)).toBe(3666); // 3666.3
    expect(toMinorUnits(0.005, 1)).toBe(1);
  });
});
