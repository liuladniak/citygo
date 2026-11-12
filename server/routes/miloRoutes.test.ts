import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "http";

const values = vi.fn();
vi.mock("../db/index.js", () => ({
  db: { insert: () => ({ values }) },
}));

import miloRoutes from "./miloRoutes.js";

let server: Server;
let base: string;

beforeAll(async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/milo", miloRoutes);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address() as { port: number };
  base = `http://127.0.0.1:${port}/api/milo/log`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  values.mockReset();
  values.mockResolvedValue(undefined);
});

const post = (body: unknown) =>
  fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const valid = {
  text: "do kids pay?",
  source: "faq",
  session_id: "3f2b8c1e-aaaa-bbbb-cccc-123456789abc",
  matched_id: "kids",
};

describe("POST /api/milo/log", () => {
  it("saves a valid message and returns 204", async () => {
    const res = await post(valid);
    expect(res.status).toBe(204);
    expect(values).toHaveBeenCalledWith({
      sessionId: valid.session_id,
      text: "do kids pay?",
      source: "faq",
      matchedId: "kids",
    });
  });

  it("accepts messages answered by the AI fallback", async () => {
    expect((await post({ ...valid, source: "ai", matched_id: null })).status).toBe(204);
  });

  it("redacts personal data before saving", async () => {
    await post({ ...valid, text: "my email is a@b.com, phone 555 123 4567" });
    expect(values.mock.calls[0][0].text).toBe(
      "my email is [email], phone [number]",
    );
  });

  it("rejects bad input without touching the database", async () => {
    for (const body of [
      { ...valid, source: "admin" },
      { ...valid, session_id: "short" },
      { ...valid, text: "   " },
      { ...valid, matched_id: "x'; drop table users;--" },
      {},
    ]) {
      expect((await post(body)).status).toBe(400);
    }
    expect(values).not.toHaveBeenCalled();
  });
});
