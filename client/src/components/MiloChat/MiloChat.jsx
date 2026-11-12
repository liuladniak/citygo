import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MiloChat.scss";
import { useAnalytics } from "../../hooks/useAnalytics.js";
import { MENU, NEEDS_TOURS, buildAnswer } from "./miloGuided.js";
import { answerTyped } from "./miloMatch.js";
import { askAi } from "./miloAi.js";
import { linkKind } from "./miloLinks.js";
import { logTypedMessage } from "./miloLog.js";

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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];

    // A new answer: show the question (the tapped chip) with its answer
    // right below it, so the reader sees both without scrolling.
    if (messages.length > 1 && last.role === "model" && !isLoading) {
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

  const handleChip = async (item) => {
    if (isLoading) return;
    trackMiloChip(item.id);
    setMessages((prev) => [...prev, { role: "user", content: item.label }]);
    setIsLoading(true);
    const tours = NEEDS_TOURS.includes(item.id) ? await loadTours() : [];
    setMessages((prev) => [
      ...prev,
      { role: "model", content: buildAnswer(item.id, tours) },
    ]);
    setIsLoading(false);
  };

  const sendMessage = async (text) => {
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
    logTypedMessage({
      text: text.trim(),
      source,
      matchedId: local.matchedId,
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
                <Bot size={18} />
              </div>
              <div className="milo-info">
                <span className="milo-name">Milo</span>
                <span className="milo-status">
                  <Sparkles size={10} />
                  CityGo Specialist
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
                  {renderContent(msg.content, navigate)}
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

            {/* guided menu chips */}
            {!isLoading && messages[messages.length - 1].role === "model" && (
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
                  placeholder="Ask Milo..."
                  value={input}
                  maxLength={MAX_LENGTH}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  aria-label="Message Milo"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
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
