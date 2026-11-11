import { describe, it, expect } from "vitest";
import { MENU, buildAnswer, pickPopular } from "./miloGuided";

const tours = [
  { tour_name: "Bosphorus Cruise", duration: "2 hours", price: 40, slug: "bosphorus-cruise", category: "Guided tour", best_seller: true },
  { tour_name: "Street Food Walk", duration: "3 hours", price: 55, slug: "street-food-walk", category: "Culinary tour", best_seller: false },
];

describe("Milo guided answers", () => {
  it("every menu item has a non-empty answer, even with no tours loaded", () => {
    for (const item of MENU) {
      expect(buildAnswer(item.id, []).length).toBeGreaterThan(0);
    }
  });

  it("only mentions tours that exist, with a link to their real slug", () => {
    const answer = buildAnswer("tours", tours);
    expect(answer).toContain("**Bosphorus Cruise**");
    expect(answer).toContain("(/tours/street-food-walk)");
    expect(answer).not.toContain("Heritage");
  });

  it("popular prefers best sellers and falls back safely", () => {
    expect(pickPopular(tours).map((t) => t.slug)).toEqual(["bosphorus-cruise"]);
    const noFlags = tours.map((t) => ({ ...t, best_seller: false }));
    expect(pickPopular(noFlags)).toHaveLength(2);
  });
});
