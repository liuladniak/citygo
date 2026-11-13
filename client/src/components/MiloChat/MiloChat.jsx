import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MiloChat.scss";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import { MENU, NEEDS_TOURS, buildAnswer } from "./miloGuided.js";
import { answerTyped } from "./miloMatch.js";
import { askAi } from "./miloAi.js";
import { linkKind } from "./miloLinks.js";
import { logExchange } from "./miloLog.js";
import { useHumanChat } from "./useHumanChat.js";
import { endedMessage } from "./miloHuman.js";

const MAX_LENGTH = 200;
const API_URL = import.meta.env.VITE_API_URL;

// ─── render message content — handles **bold** and [text](url) ────────────────
const renderContent = (text, navigate) => {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const kind = linkKind(url);
      if (kind === "none") return label;
      if (kind === "internal") {
        return (
          <button
            key={i}
            className="milo-link"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(url);
            }}
          >
            {label}
          </button>
        );
      }
      return (
        <a
          key={i}
          href={url}
          className="milo-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </a>
      );
    }
    // handle **bold** within non-link text
    return part
      .split("**")
      .map((p, j) =>
        j % 2 === 1 ? <strong key={`${i}-${j}`}>{p}</strong> : p,
      );
  });
};

const MiloChat = () => {
  const {
    trackMiloOpen,
    trackMiloMessage,
    trackMiloChip,
    trackMiloLocal,
    trackMiloNoMatch,
    trackMiloAi,
  } = useAnalytics();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hi! I'm **Milo**, your CityGo guide. Ready to explore Istanbul? Where do we start?",
    },
  ]);

  const scrollRef = useRef(null);
  const toursRef = useRef(null);

  // Live chat with a person (Phase 5). Messages from the person are rendered
  // as plain text and tagged `human` so a reload can replace them with history.
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendError, setSendError] = useState("");
  const human = useHumanChat({
    isOpen,
    onHistory: (rows) =>
      setMessages((prev) => [
        ...prev.filter((m) => !m.human),
        ...rows
          .filter((r) => r.role !== "milo")
          .map((r) => ({
            role: r.role === "agent" ? "agent" : "user",
            content: r.text,
            human: true,
          })),
      ]),
    onMessage: (m) =>
      setMessages((prev) => [
        ...prev,
        {
          role: m.from === "agent" ? "agent" : "user",
          content: m.text,
          name: m.name,
          human: true,
        },
      ]),
    onEnded: (kind) =>
      setMessages((prev) => [
        ...prev,
        { role: "model", content: endedMessage(kind) },
      ]),
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];

    // A new answer: show the question (the tapped chip) with its answer
    // right below it, so the reader sees both without scrolling.
    if (messages.length > 1 && last.role === "model" && !isLoading && !last.human) {
      const rows = el.querySelectorAll(".message-row");
      const prev = messages[messages.length - 2];
      const anchor =
        prev.role === "user" ? rows[rows.length - 2] : rows[rows.length - 1];
      if (anchor) {
        const offset =
          anchor.getBoundingClientRect().top - el.getBoundingClientRect().top;
        el.scrollTop += offset - 8;
        return;
      }
    }
    // Otherwise (user message, typing indicator): stay at the bottom.
    el.scrollTop = el.scrollHeight;
  }, [messages, isLoading]);

  const loadTours = async () => {
    if (toursRef.current) return toursRef.current;
    try {
      const res = await fetch(`${API_URL}/api/tours?limit=50`);
      const json = await res.json();
      toursRef.current = Array.isArray(json.data) ? json.data : [];
    } catch {
      toursRef.current = [];
    }
    return toursRef.current;
  };

  const openHumanForm = async () => {
    human.openForm();
    setFormError("");
  };

  const submitHumanForm = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError("");
    const res = await human.start({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (!res.ok) return setFormError(res.error);
    setForm({ name: "", email: "", message: "" });
  };

  const sendToHuman = async (text) => {
    const t = text.trim();
    if (!t) return;
    if (t.length > MAX_LENGTH) {
      setSendError(`Please keep messages under ${MAX_LENGTH} characters.`);
      return;
    }
    setSendError("");
    const res = await human.send(t);
    if (res?.ok) setInput("");
    else if (res?.error === "slow_down") setSendError("You're sending messages very fast. Please wait a moment.");
    else setSendError("Message not sent. Check your connection and try again.");
  };

  const handleChip = async (item) => {
    if (isLoading) return;
    trackMiloChip(item.id);
    if (item.id === "human") {
      setMessages((prev) => [...prev, { role: "user", content: item.label }]);
      openHumanForm();
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: item.label }]);
    setIsLoading(true);
    const tours = NEEDS_TOURS.includes(item.id) ? await loadTours() : [];
    const answer = buildAnswer(item.id, tours);
    logExchange({
      text: item.label,
      source: "chip",
      matchedId: item.id,
      reply: answer,
    });
    setMessages((prev) => [...prev, { role: "model", content: answer }]);
    setIsLoading(false);
  };

  const sendMessage = async (text) => {
    if (human.active) return sendToHuman(text);
    if (!text.trim() || isLoading) return;
    trackMiloMessage();
    if (text.length > MAX_LENGTH) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `Please keep messages under ${MAX_LENGTH} characters.`,
        },
      ]);
      return;
    }

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const tours = await loadTours();
    const local = answerTyped(text, tours);
    let { reply, source } = local;

    // No local answer: try the capped AI fallback; if it declines or fails,
    // keep the normal "not sure" reply.
    if (source === "none") {
      const aiReply = await askAi(text.trim());
      if (aiReply) {
        reply = aiReply;
        source = "ai";
      }
    }

    if (source === "ai") trackMiloAi();
    else if (source === "none") trackMiloNoMatch();
    else trackMiloLocal(source);
    logExchange({
      text: text.trim(),
      source,
      matchedId: local.matchedId,
      reply,
    });
    setMessages((prev) => [...prev, { role: "model", content: reply }]);
    setIsLoading(false);
  };

  const charsLeft = MAX_LENGTH - input.length;
  // Tell the visitor about the limit before they hit it, and say so clearly when they do.
  const showCounter = input.length > MAX_LENGTH * 0.75;

  return (
    <div className="milo-wrapper">
      {/* ─── launcher ────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          className="milo-launcher"
          onClick={() => {
            setIsOpen(true);
            trackMiloOpen();
          }}
          aria-label="Open Milo chat"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* ─── chat window ─────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="milo-container" role="dialog" aria-label="Milo chat">
          {/* header */}
          <header className="milo-header">
            <div className="milo-profile">
              <div className="milo-avatar">
                {human.phase === "live" ? (
                  human.agent.name.charAt(0)
                ) : human.active ? (
                  <MessageCircle size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>
              <div className="milo-info">
                <span className="milo-name">
                  {human.phase === "live"
                    ? human.agent.name
                    : human.active
                      ? "CityGo Support"
                      : "Milo"}
                </span>
                <span className="milo-status">
                  {human.active ? (
                    <>
                      <span
                        className={`milo-dot ${human.phase === "live" ? "milo-dot--on" : ""}`}
                      />
                      {human.phase === "waiting"
                        ? "Someone will be with you in a moment"
                        : "CityGo Support"}
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} />
                      CityGo Specialist
                    </>
                  )}
                </span>
              </div>
            </div>
            <button
              className="milo-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </header>

          {/* messages */}
          <main className="milo-messages" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-bubble">
                  {msg.role === "agent" && (
                    <span className="milo-agent-name">
                      {msg.name || human.agent.name}
                    </span>
                  )}
                  {/* Text from a person is shown as plain text, never parsed. */}
                  {msg.human ? msg.content : renderContent(msg.content, navigate)}
                </div>
              </div>
            ))}

            {/* typing indicator */}
            {isLoading && (
              <div className="message-row model">
                <div className="message-bubble milo-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            {human.active && human.agentTyping && (
              <div className="message-row agent">
                <div className="message-bubble milo-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            {human.active && human.seen && messages[messages.length - 1]?.role === "user" && (
              <span className="milo-seen">Seen</span>
            )}

            {human.phase === "form" && (
              <form className="milo-handoff" onSubmit={submitHumanForm}>
                <p className="milo-handoff__lead">
                  Leave your question and someone from our team will be with you in a moment.
                </p>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={form.name}
                  maxLength={60}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  aria-label="Your name (optional)"
                />
                <input
                  type="email"
                  placeholder="Email (optional, so we can reply if you leave)"
                  value={form.email}
                  maxLength={120}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-label="Email (optional)"
                />
                <textarea
                  placeholder="What would you like to ask?"
                  value={form.message}
                  maxLength={MAX_LENGTH}
                  rows={3}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  aria-label="What would you like to ask?"
                />
                <p className="milo-handoff__note">
                  Name and email are optional and kept for 90 days. Emails and
                  phone numbers typed in the chat itself are removed.
                </p>
                {formError && (
                  <p className="milo-limit-hint milo-limit-hint--max" role="alert">
                    {formError}{" "}
                    <button
                      type="button"
                      className="milo-link"
                      onClick={() => navigate("/contact")}
                    >
                      Contact page
                    </button>
                  </p>
                )}
                <div className="milo-handoff__actions">
                  <button type="submit" className="milo-handoff__go" disabled={submitting}>
                    {submitting ? "Sending…" : "Ask a person"}
                  </button>
                  <button
                    type="button"
                    className="suggestion-chip"
                    onClick={() => {
                      human.cancelForm();
                      setMessages((prev) => [
                        ...prev,
                        { role: "model", content: buildAnswer("human", []) },
                      ]);
                    }}
                  >
                    No thanks
                  </button>
                </div>
              </form>
            )}

            {/* guided menu chips */}
            {!isLoading &&
              human.phase === "bot" &&
              messages[messages.length - 1].role === "model" && (
              <div className="milo-suggestions">
                {MENU.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleChip(item)}
                    className="suggestion-chip"
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </main>

          {/* input */}
          <footer className="milo-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <div className="milo-input-wrap">
                <input
                  type="text"
                  placeholder={
                    human.active ? "Type your message..." : "Ask Milo..."
                  }
                  value={input}
                  maxLength={MAX_LENGTH}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (human.active) human.notifyTyping();
                  }}
                  disabled={isLoading || human.phase === "form"}
                  aria-label={human.active ? "Type your message" : "Message Milo"}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading || human.phase === "form"}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            {sendError && human.active && (
              <p className="milo-limit-hint milo-limit-hint--max" role="alert">
                {sendError}
              </p>
            )}
            {showCounter && (
              <p
                className={`milo-limit-hint ${
                  charsLeft === 0 ? "milo-limit-hint--max" : ""
                }`}
                role="status"
              >
                {charsLeft === 0
                  ? `You've reached the ${MAX_LENGTH}-character limit. Please shorten your question.`
                  : `${charsLeft} characters left`}
              </p>
            )}
          </footer>
        </div>
      )}
    </div>
  );
};

export default MiloChat;
