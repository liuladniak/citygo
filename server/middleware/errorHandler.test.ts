import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "http";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler.js";
import { notFound } from "../lib/errors.js";
import { errorHandler, notFoundHandler } from "./errorHandler.js";
import { validate } from "./validate.js";
import { idParam, requiredText, email } from "../lib/schemas.js";

let server: Server;
let url: string;

beforeAll(async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const app = express();
  app.use(express.json());
  app.get("/tours/:id", validate({ params: idParam }), asyncHandler(async (req, res) => {
    if (Number(req.params.id) === 404) throw notFound("Tour not found");
    if (Number(req.params.id) === 500) throw new Error("db password is hunter2");
    res.json({ id: req.params.id });
  }));
  app.post("/contact", validate({ body: z.object({ name: requiredText(50), email }) }), (req, res) => {
    res.json(req.body);
  });
  app.use(notFoundHandler);
  app.use(errorHandler);
  await new Promise<void>((r) => (server = app.listen(0, () => r())));
  url = `http://localhost:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

const post = (path: string, body: string) =>
  fetch(url + path, { method: "POST", headers: { "content-type": "application/json" }, body });

describe("error handler", () => {
  it("turns a thrown HttpError into a response with both error and message", async () => {
    const res = await fetch(`${url}/tours/404`);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "Tour not found", message: "Tour not found" });
  });

  it("hides the details of an unexpected error", async () => {
    const res = await fetch(`${url}/tours/500`);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("hunter2");
  });

  it("answers unknown routes and broken JSON with 404 and 400", async () => {
    expect((await fetch(`${url}/nope`)).status).toBe(404);
    const res = await post("/contact", "{not json");
    expect(res.status).toBe(400);
    expect((await res.json()).message).toBe("Invalid JSON body");
  });
});

describe("validate", () => {
  it("passes cleaned values on and drops unknown keys", async () => {
    const res = await post("/contact", JSON.stringify({ name: "  Ayşe\u0000 ", email: " AYSE@Example.com ", admin: true }));
    expect(await res.json()).toEqual({ name: "Ayşe", email: "ayse@example.com" });
  });

  it("returns 400 with every problem listed", async () => {
    const res = await post("/contact", JSON.stringify({ name: "", email: "nope" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe("name: Required");
    expect(body.details.map((d: { path: string }) => d.path)).toEqual(["name", "email"]);
  });

  it("rejects a bad id in the path", async () => {
    expect((await fetch(`${url}/tours/abc`)).status).toBe(400);
    expect((await fetch(`${url}/tours/-3`)).status).toBe(400);
  });
});
