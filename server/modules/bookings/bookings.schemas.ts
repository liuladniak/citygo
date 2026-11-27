import { z } from "zod";
import { text } from "../../lib/schemas.js";
import { normalizeTourDate } from "../../lib/tourDate.js";

export const BOOKING_STATUSES = ["draft", "pending", "confirmed", "completed", "cancelled"] as const;

// The dashboard sends filters straight from its inputs. A filter that makes no sense is ignored
// rather than failing the whole page, as it always has been.
const lenient = <T extends z.ZodType>(schema: T) => z.preprocess((v) => (schema.safeParse(v).success ? v : undefined), schema.optional());
const number = (fallback: number, min: number, max: number) =>
  z.preprocess((v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : fallback;
  }, z.number());

const day = lenient(z.string().transform((v, ctx) => normalizeTourDate(v) ?? (ctx.issues.push({ code: "custom", message: "bad date", input: v }), z.NEVER)));
const searchText = lenient(text(100).pipe(z.string().min(1)));

export const listQuery = z.object({
  page: number(1, 1, 1_000_000),
  limit: number(20, 1, 100),
  search: searchText,
  status: lenient(z.enum(BOOKING_STATUSES)),
  dateFrom: day,
  dateTo: day,
});
export const guestsQuery = z.object({ page: number(1, 1, 1_000_000), limit: number(20, 1, 100), search: searchText });
export const analyticsQuery = z.object({ dateFrom: day, dateTo: day });

export type ListQuery = z.infer<typeof listQuery>;
export type GuestsQuery = z.infer<typeof guestsQuery>;
export type AnalyticsQuery = z.infer<typeof analyticsQuery>;
