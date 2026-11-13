import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { redact } from "../lib/redact.js";
import { SESSION_ID, tokenMatches, createRateLimiter } from "../lib/handoff.js";
import { setAgentOnlineCheck } from "./presence.js";
import type { Conversation, Store } from "./types.js";

// Live chat between a visitor (widget) and the owner (dashboard console).
// Visitors authenticate with the token from POST /api/milo/handoff; the owner with
// a Supabase access token whose role is "admin". Nothing here trusts the browser:
// membership of a conversation room is decided on the server.

const ADMIN_ROLE = "admin";
const MAX_VISITOR_TEXT = 500;
const MAX_AGENT_TEXT = 2000;
const NOTIFY_EVERY_MS = 60_000;
const roomOf = (sessionId: string) => `conv:${sessionId}`;
const cleanAgentText = (t: unknown): string =>
  typeof t === "string"
    ? t.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ").trim().slice(0, MAX_AGENT_TEXT)
    : "";

export interface RealtimeDeps {
  store: Store;
  authenticateAgent: (accessToken: string) => Promise<{ role: string | null } | null>;
  allowedOrigins: string[];
  agentName?: string;
  notify?: (text: string) => Promise<unknown>;
  consoleUrl?: string;
}

type Ack = (r: Record<string, unknown>) => void;

export const createRealtime = (httpServer: HttpServer, deps: RealtimeDeps) => {
  const { store, authenticateAgent, allowedOrigins } = deps;
  const notify = deps.notify ?? (async () => {});
  const agentName = deps.agentName || "Liu";
  const consoleLine = deps.consoleUrl ? `\nOpen: ${deps.consoleUrl}` : "";

  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
    maxHttpBufferSize: 10_000,
  });

  const agentCount = () => io.sockets.adapter.rooms.get("agents")?.size ?? 0;
  setAgentOnlineCheck(() => agentCount() > 0);

  // What the console may see about a conversation: never the token hash.
  const publicView = async (c: Conversation) => {
    const [last] = await store.history(c.sessionId, { humanOnly: true, limit: 1 });
    return {
      sessionId: c.sessionId,
      status: c.status,
      visitorName: c.visitorName,
      visitorEmail: c.visitorEmail,
      createdAt: c.createdAt,
      preview: last?.text?.slice(0, 80) ?? null,
    };
  };

  const lastNotified = new Map<string, number>();
  const notifyThrottled = (sessionId: string, text: string) => {
    const now = Date.now();
    if (now - (lastNotified.get(sessionId) ?? 0) < NOTIFY_EVERY_MS) return;
    lastNotified.set(sessionId, now);
    void notify(text);
  };

  io.use(async (socket, next) => {
    const auth = (socket.handshake.auth ?? {}) as Record<string, unknown>;
    try {
      if (typeof auth.accessToken === "string") {
        const who = await authenticateAgent(auth.accessToken);
        if (!who || who.role !== ADMIN_ROLE) return next(new Error("unauthorized"));
        socket.data = { kind: "agent" };
        return next();
      }
      if (typeof auth.sessionId === "string" && SESSION_ID.test(auth.sessionId)) {
        const conv = await store.getConversation(auth.sessionId);
        if (
          conv &&
          (conv.status === "waiting" || conv.status === "live") &&
          tokenMatches(auth.token, conv.tokenHash)
        ) {
          socket.data = { kind: "visitor", sessionId: conv.sessionId };
          return next();
        }
      }
    } catch {
      /* fall through */
    }
    return next(new Error("unauthorized"));
  });

  io.on("connection", async (socket) => {
    if (socket.data.kind === "visitor") {
      const sessionId: string = socket.data.sessionId;
      const room = roomOf(sessionId);
      const allow = createRateLimiter(10, 10_000);
      socket.join(room);
      socket.join("visitors");

      const conv = await store.getConversation(sessionId);
      socket.emit("status", { sessionId, status: conv?.status ?? "closed", agentName, agentOnline: agentCount() > 0 });
      if (conv) io.to("agents").emit("conversation_new", await publicView(conv));
      socket.emit("history", await store.history(sessionId, { humanOnly: true, limit: 50 }));

      socket.on("message", async (text: unknown, ack?: Ack) => {
        if (!allow()) return ack?.({ ok: false, error: "slow_down" });
        const clean = redact(text, MAX_VISITOR_TEXT);
        if (!clean) return ack?.({ ok: false, error: "invalid" });
        const current = await store.getConversation(sessionId);
        if (!current || (current.status !== "waiting" && current.status !== "live")) {
          return ack?.({ ok: false, error: "closed" });
        }
        await store.saveMessage(sessionId, "visitor", clean);
        const msg = { sessionId, from: "visitor", text: clean, at: new Date().toISOString() };
        io.to(room).emit("message", msg);
        io.to("agents").emit("activity", { sessionId, preview: clean.slice(0, 80), at: msg.at });
        // No agent socket in the room means nobody has taken this chat yet.
        const inRoom = await io.in(room).fetchSockets();
        if (!inRoom.some((s) => s.data.kind === "agent")) {
          notifyThrottled(sessionId, `💬 New message in a Milo chat:\n“${clean}”${consoleLine}`);
        }
        return ack?.({ ok: true });
      });
      socket.on("typing", (on: unknown) => socket.to(room).emit("typing", { sessionId, from: "visitor", on: !!on }));
      socket.on("seen", () => socket.to(room).emit("seen", { sessionId, by: "visitor" }));
      return;
    }

    // Agent (owner console)
    socket.join("agents");
    io.to("visitors").emit("presence", { agentOnline: true });
    socket.emit("conversations", await Promise.all((await store.listOpen()).map(publicView)));

    const joined = (sessionId: unknown): sessionId is string =>
      typeof sessionId === "string" && socket.rooms.has(roomOf(sessionId));

    socket.on("join", async (sessionId: unknown, ack?: Ack) => {
      if (typeof sessionId !== "string" || !SESSION_ID.test(sessionId)) return ack?.({ ok: false });
      const conv = await store.getConversation(sessionId);
      if (!conv || (conv.status !== "waiting" && conv.status !== "live")) return ack?.({ ok: false, error: "closed" });
      socket.join(roomOf(sessionId));
      if (conv.status === "waiting") await store.markLive(sessionId);
      io.to(roomOf(sessionId)).emit("status", { sessionId, status: "live", agentName, agentOnline: true });
      io.to("agents").emit("conversation_updated", { sessionId, status: "live" });
      return ack?.({
        ok: true,
        conversation: await publicView({ ...conv, status: "live" }),
        history: await store.history(sessionId, { limit: 100 }),
      });
    });

    socket.on("message", async (data: { sessionId?: unknown; text?: unknown } | null, ack?: Ack) => {
      const sessionId = data?.sessionId;
      const text = cleanAgentText(data?.text);
      if (!joined(sessionId) || !text) return ack?.({ ok: false });
      await store.saveMessage(sessionId, "agent", text);
      io.to(roomOf(sessionId)).emit("message", { sessionId, from: "agent", name: agentName, text, at: new Date().toISOString() });
      return ack?.({ ok: true });
    });

    socket.on("typing", (data: { sessionId?: unknown; on?: unknown } | null) => {
      if (joined(data?.sessionId)) socket.to(roomOf(data!.sessionId as string)).emit("typing", { sessionId: data!.sessionId, from: "agent", name: agentName, on: !!data!.on });
    });

    socket.on("seen", (data: { sessionId?: unknown } | null) => {
      if (joined(data?.sessionId)) socket.to(roomOf(data!.sessionId as string)).emit("seen", { sessionId: data!.sessionId, by: "agent" });
    });

    socket.on("close", async (data: { sessionId?: unknown } | null, ack?: Ack) => {
      const sessionId = data?.sessionId;
      if (!joined(sessionId)) return ack?.({ ok: false });
      await store.close(sessionId, "closed");
      io.to(roomOf(sessionId)).emit("status", { sessionId, status: "closed", agentName, agentOnline: agentCount() > 0 });
      for (const s of await io.in(roomOf(sessionId)).fetchSockets()) {
        if (s.data.kind === "visitor") s.disconnect(true);
      }
      io.to("agents").emit("conversation_updated", { sessionId, status: "closed" });
      return ack?.({ ok: true });
    });

    socket.on("disconnect", () => {
      if (agentCount() === 0) io.to("visitors").emit("presence", { agentOnline: false });
    });
  });

  // Called every minute: waiting requests nobody picked up become "missed".
  const expireWaiting = async (minutes: number) => {
    const missed = await store.expireWaiting(minutes);
    for (const c of missed) {
      io.to(roomOf(c.sessionId)).emit("status", { sessionId: c.sessionId, status: "missed", agentName, agentOnline: false });
      io.to("agents").emit("conversation_updated", { sessionId: c.sessionId, status: "missed" });
      void notify(
        `⏰ Missed Milo chat request${c.visitorName ? ` from ${c.visitorName}` : ""}.${
          c.visitorEmail ? `\nEmail to follow up: ${c.visitorEmail}` : "\nNo email was left."
        }${consoleLine}`,
      );
    }
    return missed;
  };

  return { io, expireWaiting, close: () => io.close() };
};
