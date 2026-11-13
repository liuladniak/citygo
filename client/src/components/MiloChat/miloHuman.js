// Talking to a real person: the small, easy-to-get-wrong rules live here as pure
// functions so they can be tested; the socket wiring is in useHumanChat.js.

const API_URL = import.meta.env.VITE_API_URL;

// Server conversation status -> what the widget shows.
export const phaseFromStatus = (status) => {
  if (status === "waiting") return "waiting";
  if (status === "live") return "live";
  if (status === "missed") return "missed";
  return "closed";
};

export const isEnded = (phase) => phase === "missed" || phase === "closed";

// Plain-language reason for a failed request. `status` is the HTTP status,
// `error` the server's error code.
export const startErrorMessage = (status, error) => {
  if (error === "busy") {
    return "We're getting a lot of requests today. Please use the contact page and we'll reply by email.";
  }
  if (status === 429) {
    return "You've asked a few times already. Please try again later, or use the contact page.";
  }
  if (status === 409) {
    return "You already have a chat open with us. Please reload the page to continue it.";
  }
  return "Couldn't start the chat. Please try again, or use the contact page.";
};

export const endedMessage = (phase, agentName) =>
  phase === "missed"
    ? `${agentName} couldn't answer right now. If you left an email, we'll reply there. Otherwise, the contact page is the best way to reach us.`
    : `This chat has ended. Thanks for talking with ${agentName}! I'm still here if you have more questions.`;

export const fetchAvailability = async () => {
  try {
    const res = await fetch(`${API_URL}/api/milo/handoff/availability`);
    if (!res.ok) throw new Error();
    const json = await res.json();
    return { online: !!json.online, agentName: json.agentName || "Liu" };
  } catch {
    return { online: false, agentName: "Liu" };
  }
};

export const requestHuman = async ({ sessionId, name, email, message }) => {
  try {
    const res = await fetch(`${API_URL}/api/milo/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        name: name || undefined,
        email: email || undefined,
        message: message || undefined,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 201 && json.token) return { ok: true, ...json };
    return { ok: false, error: startErrorMessage(res.status, json.error) };
  } catch {
    return { ok: false, error: startErrorMessage(0) };
  }
};
