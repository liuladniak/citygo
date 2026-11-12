import express from "express";
import rateLimit from "express-rate-limit";
import { lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { miloMessages } from "../db/drizzle/schema.js";
import { redact } from "../lib/redact.js";

const router = express.Router();

export const SOURCES = ["faq", "topic", "tour", "none", "ai"] as const;
const SESSION_ID = /^[a-zA-Z0-9-]{8,64}$/;
const MATCHED_ID = /^[a-z0-9_-]{1,40}$/;

const logLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

// Public, but it only inserts one short, validated, redacted row.
// It issues no session and returns no data.
router.post("/log", logLimiter, async (req, res) => {
  const { text, source, session_id, matched_id } = req.body ?? {};

  const clean = redact(text);
  if (
    !clean ||
    !SOURCES.includes(source) ||
    typeof session_id !== "string" ||
    !SESSION_ID.test(session_id) ||
    (matched_id != null &&
      (typeof matched_id !== "string" || !MATCHED_ID.test(matched_id)))
  ) {
    return res.status(400).json({ error: "Invalid message." });
  }

  try {
    await db.insert(miloMessages).values({
      sessionId: session_id,
      text: clean,
      source,
      matchedId: matched_id ?? null,
    });
    return res.sendStatus(204);
  } catch (err) {
    // Never log the message text.
    console.error("[Milo] failed to save message:", (err as Error).message);
    return res.status(500).json({ error: "Could not save message." });
  }
});

export const RETENTION_DAYS = 90;

export const deleteOldMiloMessages = async (): Promise<void> => {
  try {
    await db
      .delete(miloMessages)
      .where(
        lt(
          miloMessages.createdAt,
          sql`now() - make_interval(days => ${RETENTION_DAYS})`,
        ),
      );
  } catch (err) {
    console.error("[Milo] retention cleanup failed:", (err as Error).message);
  }
};

export default router;
