import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { createServer, type Server as HttpServer } from "node:http";
import { io as connect, type Socket } from "socket.io-client";
import { createRealtime } from "./index.js";
import { hashToken } from "../lib/handoff.js";
import type { Conversation, Store } from "./types.js";

// In-memory store, so these tests exercise the access rules without a database.
const makeStore = () => {
  const convs = new Map<string, Conversation>();
  const saved: { sessionId: string; role: string; text: string }[] = [];
  const store: Store = {
    getConversation: async (id) => convs.get(id) ?? null,
    createOrReset: async () => "created",
    countRecent: async () => 0,
    markLive: async (id) => {
      const c = convs.get(id);
      if (c) c.status = "live";
    },
    close: async (id, status) => {
      const c = convs.get(id);
      if (c) c.status = status;
    },
    saveMessage: async (sessionId, role, text) => {
      saved.push({ sessionId, role, text });
    },
    listOpen: async () => [...convs.values()].filter((c) => c.status === "waiting" || c.status === "live"),
    history: async () => [],
    expireWaiting: async () => {
      const out: Conversation[] = [];
      for (const c of convs.values()) if (c.status === "waiting") { c.status = "missed"; out.push(c); }
      return out;
    },
    deleteOldConversations: async () => {},
  };
  const add = (sessionId: string, token: string) =>
    convs.set(sessionId, { sessionId, status: "waiting", tokenHash: hashToken(token), visitorName: null, visitorEmail: null, createdAt: "" });
  return { store, add, saved, convs };
};

let httpServer: HttpServer;
let url: string;
let ctx: ReturnType<typeof makeStore>;
let rt: ReturnType<typeof createRealtime>;
const sockets: Socket[] = [];

beforeAll(async () => {
  ctx = makeStore();
  httpServer = createServer();
  rt = createRealtime(httpServer, {
    store: ctx.store,
    allowedOrigins: ["*"],
    agentName: "Liu",
    authenticateAgent: async (t) => (t === "admin-jwt" ? { role: "admin" } : t === "staff-jwt" ? { role: "manager" } : null),
  });
  await new Promise<void>((r) => httpServer.listen(0, () => r()));
  url = `http://127.0.0.1:${(httpServer.address() as { port: number }).port}`;
  ctx.add("session-aaaaaaaa", "token-a");
  ctx.add("session-bbbbbbbb", "token-b");
});
afterAll(async () => {
  rt.close();
  httpServer.close();
});
afterEach(() => {
  sockets.splice(0).forEach((s) => s.close());
});

const open = (auth: Record<string, unknown>) =>
  new Promise<Socket>((resolve, reject) => {
    const s = connect(url, { auth, transports: ["websocket"], forceNew: true });
    sockets.push(s);
    s.on("connect", () => resolve(s));
    s.on("connect_error", (e) => reject(e));
  });
const next = <T = any>(s: Socket, event: string) =>
  new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), 1500);
    s.once(event, (d: T) => { clearTimeout(t); resolve(d); });
  });
const silent = (s: Socket, event: string, ms = 300) =>
  new Promise<boolean>((resolve) => {
    let got = false;
    s.once(event, () => { got = true; });
    setTimeout(() => resolve(!got), ms);
  });
const emitAck = (s: Socket, event: string, data: unknown) =>
  new Promise<any>((resolve) => s.emit(event, data, resolve));

describe("live chat access rules", () => {
  it("rejects a wrong visitor token and a non-admin agent", async () => {
    await expect(open({ sessionId: "session-aaaaaaaa", token: "nope" })).rejects.toThrow("unauthorized");
    await expect(open({ sessionId: "session-aaaaaaaa" })).rejects.toThrow("unauthorized");
    await expect(open({ accessToken: "staff-jwt" })).rejects.toThrow("unauthorized");
    await expect(open({ accessToken: "garbage" })).rejects.toThrow("unauthorized");
  });

  it("delivers a visitor's message to the joined agent, saved and redacted", async () => {
    const visitor = await open({ sessionId: "session-aaaaaaaa", token: "token-a" });
    const agent = await open({ accessToken: "admin-jwt" });
    const joined = await emitAck(agent, "join", "session-aaaaaaaa");
    expect(joined.ok).toBe(true);
    expect(ctx.convs.get("session-aaaaaaaa")?.status).toBe("live");

    const got = next(agent, "message");
    await emitAck(visitor, "message", "my mail is a@b.com, hi");
    expect((await got).text).toBe("my mail is [email], hi");
    expect(ctx.saved.at(-1)).toMatchObject({ role: "visitor", text: "my mail is [email], hi" });
  });

  it("keeps conversations apart and lets an agent reply only after joining", async () => {
    const visA = await open({ sessionId: "session-aaaaaaaa", token: "token-a" });
    const visB = await open({ sessionId: "session-bbbbbbbb", token: "token-b" });
    const agent = await open({ accessToken: "admin-jwt" });

    // Not joined yet: the reply is refused.
    expect((await emitAck(agent, "message", { sessionId: "session-aaaaaaaa", text: "hello" })).ok).toBe(false);

    await emitAck(agent, "join", "session-aaaaaaaa");
    const toA = next(visA, "message");
    const bQuiet = silent(visB, "message");
    expect((await emitAck(agent, "message", { sessionId: "session-aaaaaaaa", text: "Hi, Liu here" })).ok).toBe(true);
    expect(await toA).toMatchObject({ from: "agent", name: "Liu", text: "Hi, Liu here" });
    expect(await bQuiet).toBe(true);
  });

  it("never sends token hashes to the console, announces new requests, and tags messages with their conversation", async () => {
    // The list arrives right after connecting, so listen before the connect finishes.
    const agent = connect(url, { auth: { accessToken: "admin-jwt" }, transports: ["websocket"], forceNew: true });
    sockets.push(agent);
    const list = await next<Record<string, unknown>[]>(agent, "conversations");
    expect(JSON.stringify(list)).not.toContain("tokenHash");

    ctx.add("session-dddddddd", "token-d");
    const announced = next(agent, "conversation_new");
    const visitor = await open({ sessionId: "session-dddddddd", token: "token-d" });
    const item = await announced;
    expect(item).toMatchObject({ sessionId: "session-dddddddd", status: "waiting" });
    expect(item).not.toHaveProperty("tokenHash");

    await emitAck(agent, "join", "session-dddddddd");
    const got = next(agent, "message");
    await emitAck(visitor, "message", "hello");
    expect(await got).toMatchObject({ sessionId: "session-dddddddd", from: "visitor" });
  });

  it("marks unanswered requests as missed and tells the visitor", async () => {
    ctx.add("session-cccccccc", "token-c");
    const visitor = await open({ sessionId: "session-cccccccc", token: "token-c" });
    const status = next(visitor, "status");
    await rt.expireWaiting(5);
    expect((await status).status).toBe("missed");
  });
});
