// Asks the server's AI fallback. Returns the reply text, or null on ANY problem
// (switched off, daily cap reached, timeout, network, empty reply), so the widget
// can show its normal "not sure" answer instead.

const API_URL = import.meta.env.VITE_API_URL;
const TIMEOUT_MS = 20000;

export const askAi = async (text) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.reply === "string" && data.reply.trim()
      ? data.reply
      : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};
