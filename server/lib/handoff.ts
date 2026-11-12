import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Helpers for Milo's human handoff: visitor tokens, input cleaning, rate limiting.

export const newToken = (): string => randomBytes(32).toString("hex");

export const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const tokenMatches = (provided: unknown, storedHash: string): boolean => {
  if (typeof provided !== "string" || !provided) return false;
  const a = Buffer.from(hashToken(provided));
  const b = Buffer.from(storedHash);
  return a.length === b.length && timingSafeEqual(a, b);
};

export const SESSION_ID = /^[a-zA-Z0-9-]{8,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const stripControl = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, " ");

export const cleanName = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  const v = stripControl(input).replace(/\s+/g, " ").trim().slice(0, 80);
  return v || null;
};

export const cleanEmail = (input: unknown): string | null => {
  if (typeof input !== "string") return null;
  const v = input.trim().slice(0, 120);
  return EMAIL.test(v) ? v : null;
};

// Allows `max` events per `windowMs` (sliding window), for one socket.
export const createRateLimiter = (max: number, windowMs: number, now = () => Date.now()) => {
  let hits: number[] = [];
  return () => {
    const t = now();
    hits = hits.filter((h) => t - h < windowMs);
    if (hits.length >= max) return false;
    hits.push(t);
    return true;
  };
};
