import express from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { SESSION_ID } from "../lib/handoff.js";
import { classifyOutcome, clampDays, summarize } from "../lib/miloReview.js";

const router = express.Router();

// Everything here shows what visitors typed, so it is for admins only.
router.use(requireAuth, requireRole("admin"));

type SessionRow = {
  session_id: string;
  started_at: string;
  last_at: string;
  message_count: number;
  no_match: number;
  ai_count: number;
  status: string | null;
  joined: boolean;
  visitor_name: string | null;
  first_text: string | null;
};

// Overview for the review page: totals, one row per visit, and the questions
// Milo could not answer (most asked first), for the last N days.
router.get("/", async (req, res) => {
  const days = clampDays(req.query.days);
  try {
    const sessions = await db.execute<SessionRow>(sql`
      select * from (
        select
          session_id,
          coalesce(m.started, c.created_at) as started_at,
          coalesce(m.last_at, c.created_at) as last_at,
          coalesce(m.n, 0) as message_count,
          coalesce(m.no_match, 0) as no_match,
          coalesce(m.ai_n, 0) as ai_count,
          c.status,
          (c.agent_joined_at is not null) as joined,
          c.visitor_name,
          m.first_text
        from (
          select session_id,
            min(created_at) as started,
            max(created_at) as last_at,
            count(*)::int as n,
            (count(*) filter (where role = 'visitor' and source = 'none'))::int as no_match,
            (count(*) filter (where role = 'visitor' and source = 'ai'))::int as ai_n,
            (array_agg(text order by id) filter (where role = 'visitor'))[1] as first_text
          from milo_messages
          where created_at >= now() - make_interval(days => ${days})
          group by session_id
        ) m
        full join (
          select * from milo_conversations
          where created_at >= now() - make_interval(days => ${days})
        ) c using (session_id)
      ) s
      order by last_at desc
      limit 500
    `);

    const unanswered = await db.execute<{ text: string; count: number }>(sql`
      select min(text) as text, count(*)::int as count
      from milo_messages
      where role = 'visitor' and source = 'none'
        and created_at >= now() - make_interval(days => ${days})
      group by lower(btrim(text, ' ?!.'))
      order by count desc, max(id) desc
      limit 20
    `);

    const list = sessions.rows.map((r) => ({
      sessionId: r.session_id,
      startedAt: r.started_at,
      lastAt: r.last_at,
      messageCount: r.message_count,
      aiCount: r.ai_count,
      visitorName: r.visitor_name,
      firstQuestion: r.first_text,
      outcome: classifyOutcome({ status: r.status, joined: r.joined, noMatch: r.no_match }),
    }));

    return res.json({
      days,
      totals: summarize(list),
      sessions: list,
      topUnanswered: unanswered.rows,
    });
  } catch (err) {
    console.error("[Milo] review failed:", (err as Error).message);
    return res.status(500).json({ error: "Could not load conversations." });
  }
});

// One visit, in order. The token hash is never selected.
router.get("/:sessionId", async (req, res) => {
  const { sessionId } = req.params;
  if (!SESSION_ID.test(sessionId)) return res.status(400).json({ error: "Invalid session." });
  try {
    const msgs = await db.execute<{ id: number; role: string; text: string; source: string; created_at: string }>(sql`
      select id, role, text, source, created_at
      from milo_messages where session_id = ${sessionId} order by id
    `);
    const conv = await db.execute<{ status: string; visitor_name: string | null; visitor_email: string | null; created_at: string; agent_joined_at: string | null; closed_at: string | null }>(sql`
      select status, visitor_name, visitor_email, created_at, agent_joined_at, closed_at
      from milo_conversations where session_id = ${sessionId}
    `);
    if (msgs.rows.length === 0 && conv.rows.length === 0) return res.status(404).json({ error: "Not found." });
    const c = conv.rows[0];
    return res.json({
      conversation: c
        ? { status: c.status, visitorName: c.visitor_name, visitorEmail: c.visitor_email, createdAt: c.created_at, joinedAt: c.agent_joined_at, closedAt: c.closed_at }
        : null,
      messages: msgs.rows.map((m) => ({ id: m.id, role: m.role, text: m.text, source: m.source, at: m.created_at })),
    });
  } catch (err) {
    console.error("[Milo] transcript failed:", (err as Error).message);
    return res.status(500).json({ error: "Could not load the chat." });
  }
});

export default router;
