// Sends a typed Milo message to our own server so we can improve the FAQ.
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

export const logTypedMessage = ({ text, source, matchedId }) => {
  try {
    fetch(`${API_URL}/api/milo/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        source,
        matched_id: matchedId ?? undefined,
        session_id: getSessionId(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* ignore */
  }
};
