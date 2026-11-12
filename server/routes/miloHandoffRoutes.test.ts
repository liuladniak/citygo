import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";

const { store, notify } = vi.hoisted(() => ({
  store: { countRecent: vi.fn(), createOrReset: vi.fn(), saveMessage: vi.fn() },
  notify: vi.fn(),
}));
// The per-IP hourly limit is express-rate-limit's job; take it out so these tests see our own rules.
vi.mock("express-rate-limit", () => ({ default: () => (_q: unknown, _r: unknown, n: () => void) => n() }));
vi.mock("../realtime/dbStore.js", () => ({ dbStore: store }));
vi.mock("../lib/telegram.js", () => ({ notifyTelegram: (...a: unknown[]) => notify(...a) }));

import routes from "./miloHandoffRoutes.js";

let server: Server;
let base: string;
beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/milo/handoff", routes);
  await new Promise<void>((r) => { server = app.listen(0, () => r()); });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/milo/handoff`;
});
afterAll(() => { server.close(); });
beforeEach(() => {
  Object.values(store).forEach((m) => m.mockReset());
  notify.mockReset();
  store.countRecent.mockResolvedValue(0);
  store.createOrReset.mockResolvedValue("created");
});

const post = (body: unknown) =>
  fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const valid = { session_id: "3f2b8c1e-aaaa-bbbb-cccc-123456789abc", name: " Ana ", email: "ana@example.com", message: "Can you call me at 555 123 4567?" };

describe("POST /api/milo/handoff", () => {
  it("creates a chat, returns a one-time token (only its hash is stored) and notifies the owner", async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.token).toHaveLength(64);
    const saved = store.createOrReset.mock.calls[0][0];
    expect(saved.tokenHash).not.toBe(body.token);
    expect(saved).toMatchObject({ sessionId: valid.session_id, name: "Ana", email: "ana@example.com" });
    expect(store.saveMessage).toHaveBeenCalledWith(valid.session_id, "visitor", "Can you call me at [number]?");
    expect(notify).toHaveBeenCalledOnce();
  });

  it("refuses bad input, a duplicate open chat, and the daily cap", async () => {
    expect((await post({ ...valid, session_id: "x" })).status).toBe(400);
    store.createOrReset.mockResolvedValue("exists");
    expect((await post(valid)).status).toBe(409);
    store.countRecent.mockResolvedValue(30);
    expect((await post(valid)).status).toBe(429);
  });
});
