import { beforeEach, describe, expect, it, vi } from "vitest";

const get = vi.fn();
vi.mock("axios", () => ({ default: { get: (...a: unknown[]) => get(...a) } }));
vi.spyOn(console, "error").mockImplementation(() => {});

import { getExchangeRate, resetExchangeRates } from "./exchangeRates.js";

const HOUR = 60 * 60 * 1000;
beforeEach(() => {
  resetExchangeRates();
  get.mockReset().mockResolvedValue({ data: { rates: { EUR: 0.9, TRY: 30 } } });
});

describe("getExchangeRate", () => {
  it("needs no lookup for USD", async () => {
    expect(await getExchangeRate("usd")).toBe(1);
    expect(get).not.toHaveBeenCalled();
  });

  it("looks rates up once an hour, not on every request", async () => {
    await getExchangeRate("EUR", 0);
    await getExchangeRate("TRY", 10 * 60 * 1000);
    expect(get).toHaveBeenCalledTimes(1);
    await getExchangeRate("EUR", HOUR + 1);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("shares one lookup between simultaneous requests", async () => {
    await Promise.all([getExchangeRate("EUR", 0), getExchangeRate("TRY", 0)]);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it("falls back to the last known rates when the provider is down", async () => {
    await getExchangeRate("EUR", 0);
    get.mockRejectedValue(new Error("down"));
    expect(await getExchangeRate("EUR", 2 * HOUR)).toBe(0.9);
  });

  it("says 503 when there is nothing to fall back on, 400 for an unknown currency", async () => {
    get.mockRejectedValue(new Error("down"));
    await expect(getExchangeRate("EUR", 0)).rejects.toMatchObject({ status: 503 });
    resetExchangeRates();
    get.mockResolvedValue({ data: { rates: { EUR: 0.9 } } });
    await expect(getExchangeRate("XXX", 0)).rejects.toMatchObject({
      status: 400,
      message: "Unsupported currency: XXX",
    });
  });
});
