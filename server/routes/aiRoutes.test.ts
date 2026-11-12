import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";

const post = vi.fn();
const checkAiCaps = vi.fn();

vi.mock("axios", () => ({ default: { post: (...a: unknown[]) => post(...a) } }));
vi.mock("../lib/aiCaps.js", () => ({ checkAiCaps: (...a: unknown[]) => checkAiCaps(...a) }));
vi.mock("../lib/redis.js", () => ({ getRedis: () => ({}) }));
vi.mock("knex", () => ({
  default: () => {
    const q: any = () => q;
    for (const m of ["leftJoin", "select", "where", "orderBy"]) q[m] = () => q;
    q.then = (resolve: (v: unknown[]) => void) => resolve([]);
    return q;
  },
}));
vi.mock("../knexfile.js", () => ({ default: {} }));
vi.mock("../services/aiService.js", () => ({ getAiItinerary: vi.fn() }));

import aiRoutes from "./aiRoutes.js";

let server: Server;
let url: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRoutes);
  await new Promise<void>((r) => {
    server = app.listen(0, () => r());
  });
  url = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/ai/chat`;
});
afterAll(() => {
  server.close();
});

beforeEach(() => {
  post.mockReset();
  checkAiCaps.mockReset();
  process.env.AI_ENABLED = "true";
  process.env.AI_SERVICE_URL = "http://ai";
});

const ask = (message: unknown) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

describe("POST /api/ai/chat", () => {
  it("is off unless AI_ENABLED=true, and never calls the AI", async () => {
    process.env.AI_ENABLED = "false";
    expect((await ask("hello")).status).toBe(503);
    expect(post).not.toHaveBeenCalled();
  });

  it("returns 429 at the cap without calling the AI", async () => {
    checkAiCaps.mockResolvedValue({ allowed: false, reason: "ip" });
    expect((await ask("any hidden gems?")).status).toBe(429);
    expect(post).not.toHaveBeenCalled();
  });

  it("sends redacted text to the AI and returns only the reply", async () => {
    checkAiCaps.mockResolvedValue({ allowed: true });
    post.mockResolvedValue({ data: { reply: "Try the Old City tour.", history: ["x"] } });
    const res = await ask("mail me at a@b.com about hidden gems");
    expect(await res.json()).toEqual({ reply: "Try the Old City tour." });
    expect(post.mock.calls[0][1].message).toBe("mail me at [email] about hidden gems");
  });

  it("returns 503 when the AI service fails", async () => {
    checkAiCaps.mockResolvedValue({ allowed: true });
    post.mockRejectedValue(new Error("boom"));
    expect((await ask("hello there")).status).toBe(503);
  });
});
