import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MiloChat.scss";

const MAX_LENGTH = 500;
const API_URL = import.meta.env.VITE_API_URL;

// ─── render message content — handles **bold** and [text](url) ────────────────
const renderContent = (text, navigate) => {
  const parts = text.split(/(\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isInternal = url.startsWith("/");
      if (isInternal) {
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hi! I'm **Milo**, your CityGo guide. Ready to explore Istanbul? Where do we start?",
    },
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const suggestions = [
    "What tours do you offer?",
    "Something romantic on the water",
    "Best tour for history lovers",
  ];

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

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

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: history || [] }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.reply },
        ]);
        setHistory(data.history);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            content: "Milo is offline for a quick espresso. Try again?",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Milo is offline for a quick espresso. Try again?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const charsLeft = MAX_LENGTH - input.length;
  const showCounter = input.length > 400;

  return (
    <div className="milo-wrapper">
      {/* ─── launcher ────────────────────────────────────────────────────── */}
      {!isOpen && (
        <button
          className="milo-launcher"
          onClick={() => setIsOpen(true)}
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

            {/* suggestion chips */}
            {messages.length === 1 && !isLoading && (
              <div className="milo-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="suggestion-chip"
                    type="button"
                  >
                    {s}
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
                {showCounter && (
                  <span
                    className={`milo-char-count ${
                      charsLeft < 50 ? "milo-char-count--warn" : ""
                    }`}
                  >
                    {charsLeft}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
};

export default MiloChat;
