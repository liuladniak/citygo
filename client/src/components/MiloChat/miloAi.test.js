import { describe, it, expect, vi, afterEach } from "vitest";
import { askAi } from "./miloAi.js";

afterEach(() => vi.unstubAllGlobals());

const stub = (impl) => vi.stubGlobal("fetch", vi.fn(impl));

describe("askAi", () => {
  it("returns the reply text on success", async () => {
    stub(async () => ({ ok: true, json: async () => ({ reply: "Try the Old City tour." }) }));
    expect(await askAi("hidden gems?")).toBe("Try the Old City tour.");
  });

  it("returns null when capped, off, failing or empty, so the widget falls back", async () => {
    stub(async () => ({ ok: false, status: 429, json: async () => ({ error: "limit" }) }));
    expect(await askAi("x")).toBeNull();
    stub(async () => ({ ok: true, json: async () => ({ reply: "   " }) }));
    expect(await askAi("x")).toBeNull();
    stub(async () => {
      throw new Error("network");
    });
    expect(await askAi("x")).toBeNull();
  });
});
