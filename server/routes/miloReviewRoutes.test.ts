import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";

const { execute } = vi.hoisted(() => {
  // middleware/auth.js builds a Supabase client when it loads.
  process.env.SUPABASE_URL = "http://localhost:9";
  process.env.SUPABASE_SERVICE_KEY = "test-key";
  return { execute: vi.fn() };
});
vi.mock("../db/index.js", () => ({ db: { execute } }));
// Real role check; only the token lookup is replaced: the test sends the role in a header.
vi.mock("../middleware/auth.js", async (orig) => ({
  ...(await orig<typeof import("../middleware/auth.js")>()),
  requireAuth: (req: any, _res: unknown, next: () => void) => {
    req.role = req.headers["x-test-role"];
    next();
  },
}));

import routes from "./miloReviewRoutes.js";

let server: Server;
let base: string;
beforeAll(async () => {
  const app = express();
  app.use("/api/milo/review", routes);
  await new Promise<void>((r) => { server = app.listen(0, () => r()); });
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/milo/review`;
});
afterAll(() => { server.close(); });
beforeEach(() => execute.mockReset());

const get = (path: string, role?: string) =>
  fetch(base + path, { headers: role ? { "x-test-role": role } : {} });

describe("Milo review access", () => {
  it("only admins can read conversations", async () => {
    for (const role of [undefined, "associate", "manager"]) {
      expect((await get("", role)).status).toBe(403);
      expect((await get("/abcdefgh-1234", role)).status).toBe(403);
    }
    expect(execute).not.toHaveBeenCalled();
  });

  it("rejects a malformed session id before touching the database", async () => {
    expect((await get("/bad%20id", "admin")).status).toBe(400);
    expect(execute).not.toHaveBeenCalled();
  });

  it("returns outcomes for an admin and never exposes a token hash", async () => {
    execute
      .mockResolvedValueOnce({ rows: [
        { session_id: "abcdefgh-1", started_at: "t", last_at: "t", message_count: 4, no_match: 0, ai_count: 0, status: "live", joined: true, visitor_name: "Anna", first_text: "hi" },
        { session_id: "abcdefgh-2", started_at: "t", last_at: "t", message_count: 2, no_match: 1, ai_count: 0, status: null, joined: false, visitor_name: null, first_text: "snowboarding?" },
      ] })
      .mockResolvedValueOnce({ rows: [{ text: "snowboarding?", count: 2 }] });
    const res = await get("?days=7", "admin");
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.days).toBe(7);
    expect(json.sessions.map((s: any) => s.outcome)).toEqual(["person", "unanswered"]);
    expect(json.totals).toMatchObject({ sessions: 2, person: 1, unanswered: 1 });
    expect(json.topUnanswered).toEqual([{ text: "snowboarding?", count: 2 }]);
    expect(JSON.stringify(json)).not.toMatch(/token/i);
  });
});
