// Rules for the transcript review page. Pure functions so they are easy to test.

export type Outcome = "person" | "waiting" | "missed" | "unanswered" | "bot";

export type SessionFacts = {
  /** milo_conversations.status, or null when the visitor never asked for a person. */
  status: string | null;
  /** An agent actually joined the chat. */
  joined: boolean;
  /** Visitor messages Milo could not answer (source = none). */
  noMatch: number;
};

// What happened in a visit, in one word, so the owner can filter by it.
export function classifyOutcome({ status, joined, noMatch }: SessionFacts): Outcome {
  if (joined) return "person";
  if (status === "waiting") return "waiting";
  if (status === "missed" || status === "closed") return "missed";
  return noMatch > 0 ? "unanswered" : "bot";
}

export const REVIEW_DEFAULT_DAYS = 30;
export const REVIEW_MAX_DAYS = 90; // matches the retention period

export function clampDays(value: unknown): number {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 1) return REVIEW_DEFAULT_DAYS;
  return Math.min(n, REVIEW_MAX_DAYS);
}

export type Totals = Record<Outcome, number> & { sessions: number; aiAnswered: number };

export function summarize(rows: Array<{ outcome: Outcome; aiCount: number }>): Totals {
  const totals: Totals = { sessions: rows.length, person: 0, waiting: 0, missed: 0, unanswered: 0, bot: 0, aiAnswered: 0 };
  for (const r of rows) {
    totals[r.outcome] += 1;
    if (r.aiCount > 0) totals.aiAnswered += 1;
  }
  return totals;
}
