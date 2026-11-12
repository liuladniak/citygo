import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { miloConversations, miloMessages } from "../db/drizzle/schema.js";
import type { Conversation, Store, StoredMessage } from "./types.js";

type Row = typeof miloConversations.$inferSelect;

const toConversation = (r: Row): Conversation => ({
  sessionId: r.sessionId,
  status: r.status as Conversation["status"],
  tokenHash: r.tokenHash,
  visitorName: r.visitorName,
  visitorEmail: r.visitorEmail,
  createdAt: r.createdAt,
});

export const dbStore: Store = {
  async getConversation(sessionId) {
    const [row] = await db.select().from(miloConversations).where(eq(miloConversations.sessionId, sessionId));
    return row ? toConversation(row) : null;
  },

  async createOrReset({ sessionId, tokenHash, name, email }) {
    const existing = await this.getConversation(sessionId);
    if (existing && (existing.status === "waiting" || existing.status === "live")) return "exists";
    const fresh = {
      status: "waiting",
      tokenHash,
      visitorName: name,
      visitorEmail: email,
      createdAt: sql`now()` as unknown as string,
      agentJoinedAt: null,
      closedAt: null,
    };
    if (existing) {
      await db.update(miloConversations).set(fresh).where(eq(miloConversations.sessionId, sessionId));
    } else {
      await db.insert(miloConversations).values({ sessionId, ...fresh });
    }
    return "created";
  },

  async countRecent(hours) {
    const [r] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(miloConversations)
      .where(gte(miloConversations.createdAt, sql`now() - make_interval(hours => ${hours})`));
    return r?.n ?? 0;
  },

  async markLive(sessionId) {
    await db
      .update(miloConversations)
      .set({ status: "live", agentJoinedAt: sql`now()` as unknown as string })
      .where(and(eq(miloConversations.sessionId, sessionId), eq(miloConversations.status, "waiting")));
  },

  async close(sessionId, status) {
    await db
      .update(miloConversations)
      .set({ status, closedAt: sql`now()` as unknown as string })
      .where(eq(miloConversations.sessionId, sessionId));
  },

  async saveMessage(sessionId, role, text) {
    await db.insert(miloMessages).values({ sessionId, role, text, source: "human", matchedId: null });
  },

  async listOpen() {
    const rows = await db
      .select()
      .from(miloConversations)
      .where(inArray(miloConversations.status, ["waiting", "live"]))
      .orderBy(asc(miloConversations.createdAt));
    return rows.map(toConversation);
  },

  async history(sessionId, { humanOnly, limit }) {
    const where = humanOnly
      ? and(eq(miloMessages.sessionId, sessionId), eq(miloMessages.source, "human"))
      : eq(miloMessages.sessionId, sessionId);
    const rows = await db
      .select({ role: miloMessages.role, text: miloMessages.text, source: miloMessages.source, at: miloMessages.createdAt })
      .from(miloMessages)
      .where(where)
      .orderBy(desc(miloMessages.id))
      .limit(limit);
    return rows.reverse() as StoredMessage[];
  },

  async expireWaiting(olderThanMinutes) {
    const rows = await db
      .update(miloConversations)
      .set({ status: "missed", closedAt: sql`now()` as unknown as string })
      .where(
        and(
          eq(miloConversations.status, "waiting"),
          lt(miloConversations.createdAt, sql`now() - make_interval(mins => ${olderThanMinutes})`),
        ),
      )
      .returning();
    return rows.map(toConversation);
  },

  async deleteOldConversations(days) {
    await db
      .delete(miloConversations)
      .where(lt(miloConversations.createdAt, sql`now() - make_interval(days => ${days})`));
  },
};
