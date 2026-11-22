import { z } from "zod";

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 5;

// A feed should never fail on a sloppy query string: bad limits fall back, big ones are capped.
const limit = z.preprocess((value) => {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(n, MAX_PAGE_SIZE);
}, z.number());

export const feedQuery = z.object({
  limit,
  cursor: z.string().max(500).optional(),
});

export type FeedQuery = z.infer<typeof feedQuery>;
