import { describe, it, expect } from "vitest";
import { answerTyped, NO_MATCH_REPLY } from "./miloMatch.js";
import { faqs } from "../../data/faq.js";

const tours = [
  { tour_name: "Bosphorus Sunset Cruise", slug: "bosphorus-cruise", duration: "2 hours", price: 40, category: "Cruise", overview: "Sail the strait at sunset", best_seller: true },
  { tour_name: "Old City Walking Tour", slug: "old-city", duration: "4 hours", price: 30, category: "Cultural tour", overview: "Hagia Sophia and the Blue Mosque" },
];

describe("answerTyped", () => {
  it("answers policy questions from the FAQ", () => {
    const r = answerTyped("Can I get a refund if I cancel?", tours);
    expect(r.source).toBe("faq");
    expect(r.reply).toContain(faqs.find((f) => f.id === "cancel").answer);
  });

  it("finds a specific tour by name, with a real link", () => {
    const r = answerTyped("tell me about the bosphorus cruise", tours);
    expect(r.source).toBe("tour");
    expect(r.reply).toContain("/tours/bosphorus-cruise");
    expect(r.reply).not.toContain("old-city");
  });

  it("routes a human request to the contact answer", () => {
    expect(answerTyped("I want to talk to a real person", tours).reply).toContain("/contact");
  });

  it("falls back politely and never invents anything", () => {
    const r = answerTyped("what is the meaning of life", tours);
    expect(r).toEqual({ reply: NO_MATCH_REPLY, source: "none" });
  });
});
