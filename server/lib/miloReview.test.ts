import { describe, it, expect } from "vitest";
import { classifyOutcome, clampDays, summarize } from "./miloReview.js";

describe("Milo review rules", () => {
  it("a chat the owner joined is always 'person', whatever else happened", () => {
    expect(classifyOutcome({ status: "closed", joined: true, noMatch: 3 })).toBe("person");
    expect(classifyOutcome({ status: "live", joined: true, noMatch: 0 })).toBe("person");
  });

  it("separates waiting, missed and bot-only visits", () => {
    expect(classifyOutcome({ status: "waiting", joined: false, noMatch: 0 })).toBe("waiting");
    expect(classifyOutcome({ status: "missed", joined: false, noMatch: 0 })).toBe("missed");
    // closed without anyone joining is still a visitor nobody answered
    expect(classifyOutcome({ status: "closed", joined: false, noMatch: 0 })).toBe("missed");
    expect(classifyOutcome({ status: null, joined: false, noMatch: 2 })).toBe("unanswered");
    expect(classifyOutcome({ status: null, joined: false, noMatch: 0 })).toBe("bot");
  });

  it("keeps the window inside the retention period and ignores junk", () => {
    expect(clampDays("7")).toBe(7);
    expect(clampDays("9999")).toBe(90);
    expect(clampDays("0")).toBe(30);
    expect(clampDays("abc")).toBe(30);
    expect(clampDays(undefined)).toBe(30);
    expect(clampDays("12.9")).toBe(12);
  });

  it("counts each visit once and AI-answered visits separately", () => {
    const t = summarize([
      { outcome: "person", aiCount: 1 },
      { outcome: "bot", aiCount: 2 },
      { outcome: "missed", aiCount: 0 },
    ]);
    expect(t).toMatchObject({ sessions: 3, person: 1, bot: 1, missed: 1, unanswered: 0, aiAnswered: 2 });
  });
});
