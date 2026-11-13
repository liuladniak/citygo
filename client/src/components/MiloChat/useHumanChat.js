import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getSessionId } from "./miloLog.js";
import { isEnded, phaseFromStatus, requestHuman } from "./miloHuman.js";

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = "milo_handoff_token";

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token) => {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};
const apiOrigin = () => {
  try {
    return new URL(API_URL).origin;
  } catch {
    return "";
  }
};

/**
 * Live chat with the owner. Phases: bot (normal Milo), form (asking for details),
 * waiting, live. A chat that ends (closed or missed) goes back to "bot" and
 * reports it once through onEnded.
 */
export function useHumanChat({ isOpen, onHistory, onMessage, onEnded }) {
  const [phase, setPhase] = useState("bot");
  const [agent, setAgent] = useState({ name: "Liu", online: false });
  const [agentTyping, setAgentTyping] = useState(false);
  const [seen, setSeen] = useState(false);

  const socketRef = useRef(null);
  const wasActive = useRef(false);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;
  const agentRef = useRef(agent);
  agentRef.current = agent;
  const cb = useRef({});
  cb.current = { onHistory, onMessage, onEnded };
  const typingOut = useRef({ on: false, timer: null });

  const disconnect = useCallback(() => {
    socketRef.current?.removeAllListeners();
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const connect = useCallback(
    (token) => {
      disconnect();
      const origin = apiOrigin();
      if (!origin) return;
      const socket = io(origin, {
        path: "/socket.io",
        transports: ["websocket"],
        auth: { sessionId: getSessionId(), token },
      });
      socketRef.current = socket;

      socket.on("status", ({ status, agentName, agentOnline }) => {
        const next = phaseFromStatus(status);
        setAgent({ name: agentName || "Liu", online: !!agentOnline });
        if (isEnded(next)) {
          writeToken(null);
          disconnect();
          setAgentTyping(false);
          setPhase("bot");
          // Stay quiet when we only resumed an old, already-finished chat after a reload.
          if (wasActive.current) cb.current.onEnded?.(next, agentName || "Liu");
          wasActive.current = false;
          return;
        }
        wasActive.current = true;
        setPhase(next);
      });
      socket.on("history", (rows) => cb.current.onHistory?.(rows));
      socket.on("message", (m) => {
        cb.current.onMessage?.(m);
        if (m.from === "agent") {
          setAgentTyping(false);
          if (openRef.current) socket.emit("seen");
        }
      });
      socket.on("typing", ({ from, on }) => from === "agent" && setAgentTyping(!!on));
      socket.on("seen", ({ by }) => by === "agent" && setSeen(true));
      socket.on("presence", ({ agentOnline }) => setAgent((a) => ({ ...a, online: !!agentOnline })));
    },
    [disconnect],
  );

  // Pick up a chat that was running before a page reload.
  useEffect(() => {
    const token = readToken();
    if (token) connect(token);
    return disconnect;
  }, [connect, disconnect]);

  // Opening the widget counts as reading what the agent wrote.
  useEffect(() => {
    if (isOpen && (phase === "live" || phase === "waiting")) socketRef.current?.emit("seen");
  }, [isOpen, phase]);

  const openForm = useCallback(() => setPhase("form"), []);
  const cancelForm = useCallback(() => setPhase("bot"), []);

  const start = useCallback(
    async (form) => {
      const res = await requestHuman({ sessionId: getSessionId(), ...form });
      if (!res.ok) return res;
      writeToken(res.token);
      setAgent({ name: res.agentName || "Liu", online: !!res.online });
      wasActive.current = true;
      setPhase("waiting");
      connect(res.token);
      return { ok: true };
    },
    [connect],
  );

  const send = useCallback(
    (text) =>
      new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket?.connected) return resolve({ ok: false, error: "offline" });
        setSeen(false);
        socket.timeout(5000).emit("message", text, (err, res) => resolve(err ? { ok: false, error: "offline" } : res));
      }),
    [],
  );

  // Let the agent see "typing…": send on when the visitor types, off after a pause.
  const notifyTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    const t = typingOut.current;
    if (!t.on) {
      t.on = true;
      socket.emit("typing", true);
    }
    clearTimeout(t.timer);
    t.timer = setTimeout(() => {
      t.on = false;
      socket.emit("typing", false);
    }, 2000);
  }, []);

  return {
    phase,
    agent,
    agentTyping,
    seen,
    active: phase === "waiting" || phase === "live",
    openForm,
    cancelForm,
    start,
    send,
    notifyTyping,
  };
}
