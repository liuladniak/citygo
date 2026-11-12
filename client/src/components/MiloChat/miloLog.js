// Sends one exchange (what the visitor typed or tapped, and Milo's reply) to our own
// server so we can review conversations and improve the FAQ.
// Fire-and-forget: a failure must never affect the chat.

const API_URL = import.meta.env.VITE_API_URL;
const KEY = "milo_session_id";

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const getSessionId = () => {
  try {
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = newId();
      sessionStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return newId();
  }
};

export const logExchange = ({ text, source, matchedId, reply }) => {
  try {
    fetch(`${API_URL}/api/milo/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source,
        matched_id: matchedId ?? undefined,
        reply,
        session_id: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
};
