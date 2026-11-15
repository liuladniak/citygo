import { describe, it, expect } from "vitest";
import { reminderBlockReason, balanceDue } from "./reminder.js";

const base = {
  status: "confirmed",
  primary_contact_email: "guest@example.com",
  tour_date: "2026-11-20T00:00:00.000Z",
};

describe("reminderBlockReason", () => {
  it("allows a confirmed upcoming booking, including today", () => {
    expect(reminderBlockReason(base, "2026-11-15")).toBeNull();
    expect(reminderBlockReason(base, "2026-11-20")).toBeNull();
  });

  it("blocks cancelled, completed and past bookings", () => {
    expect(reminderBlockReason({ ...base, status: "cancelled" }, "2026-11-15")).toBe("status");
    expect(reminderBlockReason({ ...base, status: "completed" }, "2026-11-15")).toBe("status");
    expect(reminderBlockReason(base, "2026-11-21")).toBe("tour_passed");
  });

  it("blocks missing and demo emails", () => {
    expect(reminderBlockReason({ ...base, primary_contact_email: " " }, "2026-11-15")).toBe("no_email");
    expect(reminderBlockReason({ ...base, primary_contact_email: null }, "2026-11-15")).toBe("no_email");
    expect(reminderBlockReason({ ...base, primary_contact_email: "A@Seed.Example.com" }, "2026-11-15")).toBe("seed_email");
  });

  it("reads a Date value as a calendar day", () => {
    const b = { ...base, tour_date: new Date("2026-11-20T00:00:00Z") };
    expect(reminderBlockReason(b, "2026-11-20")).toBeNull();
  });
});

describe("balanceDue", () => {
  it("subtracts payments and never goes negative", () => {
    expect(balanceDue(120, 40)).toBe(80);
    expect(balanceDue("120.00", "120.00")).toBe(0);
    expect(balanceDue(100, 130)).toBe(0);
  });

  it("avoids floating point drift", () => {
    expect(balanceDue(0.3, 0.1)).toBe(0.2);
    expect(balanceDue(19.99, 0)).toBe(19.99);
  });
});
