import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/lib/supabaseClient";
import { MiloContext } from "@/lib/miloContext";
import { askNotificationPermission, notify, playChime, readFlag, writeFlag } from "@/lib/miloAlerts";
import type { ConvStatus, MiloConv, MiloMsg } from "@/lib/miloTypes";

const BASE_TITLE_KEY = "milo-base-title";

type ServerConv = Partial<MiloConv> & { sessionId: string; status: ConvStatus };
type HistoryRow = { role: "visitor" | "milo" | "agent"; text: string; at: string };

const apiOrigin = () => {
  try {
    return new URL(import.meta.env.VITE_API_URL).origin;
  } catch {
    return "";
  }
};

const toConv = (c: ServerConv, old?: MiloConv): MiloConv => ({
  sessionId: c.sessionId,
  status: c.status,
  visitorName: c.visitorName ?? old?.visitorName ?? null,
  visitorEmail: c.visitorEmail ?? old?.visitorEmail ?? null,
  createdAt: c.createdAt ?? old?.createdAt ?? new Date().toISOString(),
  preview: c.preview ?? old?.preview ?? null,
  lastAt: old?.lastAt ?? c.createdAt ?? new Date().toISOString(),
  unread: old?.unread ?? 0,
  typing: old?.typing ?? false,
  seenAt: old?.seenAt ?? null,
});

let msgCounter = 0;
const msgId = () => `m${Date.now()}-${msgCounter++}`;

export function MiloProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { role } = useRole(user?.id);
  const enabled = role === "admin";

  const [available, setAvailableState] = useState(() => readFlag("milo_available", false));
  const [soundOn, setSoundOnState] = useState(() => readFlag("milo_sound", true));
  const [connected, setConnected] = useState(false);
  const [convMap, setConvMap] = useState<Record<string, MiloConv>>({});
  const [messages, setMessages] = useState<Record<string, MiloMsg[]>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const joinedRef = useRef<Set<string>>(new Set());
  const selectedRef = useRef<string | null>(null);
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  selectedRef.current = selectedId;

  const setAvailable = useCallback((on: boolean) => {
    setAvailableState(on);
    writeFlag("milo_available", on);
    if (on) askNotificationPermission();
  }, []);

  const setSoundOn = useCallback((on: boolean) => {
    setSoundOnState(on);
    writeFlag("milo_sound", on);
    if (on) playChime();
  }, []);

  const alertMe = useCallback((title: string, body: string) => {
    if (soundRef.current) playChime();
    notify(title, body, () => undefined);
  }, []);

  const join = useCallback((sessionId: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("join", sessionId, (res: { ok: boolean; conversation?: ServerConv; history?: HistoryRow[] }) => {
      if (!res?.ok) return;
      joinedRef.current.add(sessionId);
      const rows = res.history ?? [];
      setMessages((m) => ({
        ...m,
        [sessionId]: rows.map((r) => ({ id: msgId(), from: r.role, text: r.text, at: r.at })),
      }));
      if (res.conversation) {
        setConvMap((cm) => ({ ...cm, [sessionId]: toConv(res.conversation!, cm[sessionId]) }));
      }
      socket.emit("seen", { sessionId });
    });
  }, []);

  const select = useCallback(
    (sessionId: string | null) => {
      setSelectedId(sessionId);
      if (!sessionId) return;
      setConvMap((cm) => (cm[sessionId] ? { ...cm, [sessionId]: { ...cm[sessionId], unread: 0 } } : cm));
      if (joinedRef.current.has(sessionId)) {
        socketRef.current?.emit("seen", { sessionId });
      } else {
        join(sessionId);
      }
    },
    [join],
  );

  useEffect(() => {
    if (!enabled || !available) {
      setConnected(false);
      return;
    }
    const origin = apiOrigin();
    if (!origin) return;

    const socket = io(origin, {
      path: "/socket.io",
      transports: ["websocket"],
      // Called on every (re)connect, so a refreshed Supabase token is picked up.
      auth: (cb) => {
        void supabase.auth.getSession().then(({ data }) => cb({ accessToken: data.session?.access_token ?? "" }));
      },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      // After a drop the server forgot our rooms: rejoin what we had open.
      joinedRef.current.forEach((id) => join(id));
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("conversations", (list: ServerConv[]) => {
      setConvMap((cm) => {
        const next: Record<string, MiloConv> = {};
        for (const c of list) next[c.sessionId] = toConv(c, cm[c.sessionId]);
        // Keep ones we have open that the server no longer lists as open (closed this session).
        for (const id of joinedRef.current) if (cm[id] && !next[id]) next[id] = cm[id];
        return next;
      });
    });

    socket.on("conversation_new", (c: ServerConv) => {
      let isNew = false;
      setConvMap((cm) => {
        isNew = !cm[c.sessionId];
        return { ...cm, [c.sessionId]: toConv(c, cm[c.sessionId]) };
      });
      if (isNew && c.status === "waiting") {
        alertMe("Someone wants to chat", c.visitorName ? `${c.visitorName} is waiting` : "A visitor is waiting");
      }
    });

    const setStatus = ({ sessionId, status }: { sessionId: string; status: ConvStatus }) =>
      setConvMap((cm) => (cm[sessionId] ? { ...cm, [sessionId]: { ...cm[sessionId], status, typing: false } } : cm));
    socket.on("status", setStatus);
    socket.on("conversation_updated", setStatus);

    socket.on("activity", ({ sessionId, preview, at }: { sessionId: string; preview: string; at: string }) => {
      const viewing = selectedRef.current === sessionId && document.visibilityState === "visible";
      setConvMap((cm) => {
        const old = cm[sessionId];
        if (!old) return cm;
        return { ...cm, [sessionId]: { ...old, preview, lastAt: at, unread: viewing ? 0 : old.unread + 1 } };
      });
      if (viewing) socket.emit("seen", { sessionId });
      else alertMe("New message", preview);
    });

    socket.on("message", (m: { sessionId: string; from: "visitor" | "agent"; name?: string; text: string; at: string }) => {
      setMessages((all) => ({
        ...all,
        [m.sessionId]: [...(all[m.sessionId] ?? []), { id: msgId(), from: m.from, name: m.name, text: m.text, at: m.at }],
      }));
      if (m.from === "visitor") {
        setConvMap((cm) => (cm[m.sessionId] ? { ...cm, [m.sessionId]: { ...cm[m.sessionId], typing: false } } : cm));
      }
    });

    socket.on("typing", ({ sessionId, from, on }: { sessionId: string; from: string; on: boolean }) => {
      if (from !== "visitor") return;
      setConvMap((cm) => (cm[sessionId] ? { ...cm, [sessionId]: { ...cm[sessionId], typing: !!on } } : cm));
    });

    socket.on("seen", ({ sessionId, by }: { sessionId: string; by: string }) => {
      if (by !== "visitor") return;
      setConvMap((cm) =>
        cm[sessionId] ? { ...cm, [sessionId]: { ...cm[sessionId], seenAt: new Date().toISOString() } } : cm,
      );
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, available, alertMe, join]);

  const send = useCallback(
    (sessionId: string, text: string) =>
      new Promise<boolean>((resolve) => {
        const socket = socketRef.current;
        if (!socket?.connected) return resolve(false);
        socket.timeout(5000).emit("message", { sessionId, text }, (err: Error | null, res?: { ok: boolean }) =>
          resolve(!err && !!res?.ok),
        );
      }),
    [],
  );

  const setTyping = useCallback((sessionId: string, on: boolean) => {
    socketRef.current?.emit("typing", { sessionId, on });
  }, []);

  const close = useCallback((sessionId: string) => {
    socketRef.current?.emit("close", { sessionId });
  }, []);

  const conversations = useMemo(() => {
    const rank: Record<ConvStatus, number> = { waiting: 0, live: 1, missed: 2, closed: 3 };
    return Object.values(convMap).sort(
      (a, b) => rank[a.status] - rank[b.status] || (a.status === "waiting" ? a.createdAt.localeCompare(b.createdAt) : b.lastAt.localeCompare(a.lastAt)),
    );
  }, [convMap]);

  const attention = useMemo(
    () => conversations.reduce((n, c) => n + (c.status === "waiting" ? 1 : 0) + c.unread, 0),
    [conversations],
  );

  // Show the count in the browser tab so it is noticed from another tab.
  useEffect(() => {
    if (!enabled) return;
    const store = document.documentElement.dataset;
    if (!store[BASE_TITLE_KEY]) store[BASE_TITLE_KEY] = document.title;
    const base = store[BASE_TITLE_KEY] ?? "";
    document.title = attention > 0 ? `(${attention}) ${base}` : base;
    return () => {
      document.title = base;
    };
  }, [attention, enabled]);

  const value = useMemo(
    () => ({
      enabled,
      available,
      setAvailable,
      connected,
      soundOn,
      setSoundOn,
      conversations,
      messages,
      selectedId,
      select,
      send,
      setTyping,
      close,
      attention,
    }),
    [enabled, available, setAvailable, connected, soundOn, setSoundOn, conversations, messages, selectedId, select, send, setTyping, close, attention],
  );

  return <MiloContext.Provider value={value}>{children}</MiloContext.Provider>;
}
