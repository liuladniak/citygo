import { describe, it, expect } from "vitest";
import { checkAiCaps, type Counter } from "./aiCaps.js";

const fakeRedis = (): Counter & { store: Map<string, number> } => {
  const store = new Map<string, number>();
  return {
    store,
    incr: async (k) => {
      store.set(k, (store.get(k) ?? 0) + 1);
      return store.get(k)!;
    },
    decr: async (k) => {
      store.set(k, (store.get(k) ?? 0) - 1);
      return store.get(k)!;
    },
    expire: async () => 1,
  };
};

const day = new Date("2026-11-12T10:00:00Z");

describe("checkAiCaps", () => {
  it("allows up to the per-IP limit, then blocks that IP only", async () => {
    const r = fakeRedis();
    const limits = { perIp: 2, global: 100 };
    expect((await checkAiCaps(r, "1.1.1.1", limits, day)).allowed).toBe(true);
    expect((await checkAiCaps(r, "1.1.1.1", limits, day)).allowed).toBe(true);
    expect(await checkAiCaps(r, "1.1.1.1", limits, day)).toEqual({ allowed: false, reason: "ip" });
    expect((await checkAiCaps(r, "2.2.2.2", limits, day)).allowed).toBe(true);
  });

  it("blocks everyone at the global limit and does not use up the visitor's allowance", async () => {
    const r = fakeRedis();
    const limits = { perIp: 5, global: 1 };
    await checkAiCaps(r, "1.1.1.1", limits, day);
    expect(await checkAiCaps(r, "2.2.2.2", limits, day)).toEqual({ allowed: false, reason: "global" });
    expect(r.store.get("milo:ai:ip:2.2.2.2:2026-11-12")).toBe(0);
    expect(r.store.get("milo:ai:global:2026-11-12")).toBe(1);
  });

  it("starts a fresh count on a new day", async () => {
    const r = fakeRedis();
    const limits = { perIp: 1, global: 100 };
    await checkAiCaps(r, "1.1.1.1", limits, day);
    expect((await checkAiCaps(r, "1.1.1.1", limits, new Date("2026-11-13T00:30:00Z"))).allowed).toBe(true);
  });

  it("fails closed when the counter store errors", async () => {
    const broken: Counter = {
      incr: async () => {
        throw new Error("redis down");
      },
      decr: async () => 0,
      expire: async () => 0,
    };
    expect(await checkAiCaps(broken, "1.1.1.1", undefined, day)).toEqual({ allowed: false, reason: "error" });
  });
});
