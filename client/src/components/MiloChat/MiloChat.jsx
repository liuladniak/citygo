import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Bot, Sparkles } from "lucide-react";
import "./MiloChat.scss";

const MiloChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: "model",
      content:
        "Hi! I'm **Milo**, your CityGo guide. Ready to explore? Where are we headed?",
    },
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const suggestions = [
    "Tell me about CityGo tours",
    "Why not Expedia?",
    "Plan a 3-day Rome trip",
  ];

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history }),
      });

      const data = await response.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.reply },
        ]);
        setHistory(data.updated_history);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Milo is offline for a quick espresso. Try again?",
        },
      ]);
    }
  };

  return (
    <div className="milo-wrapper">
      {!isOpen && (
        <button className="milo-launcher" onClick={() => setIsOpen(true)}>
          <MessageCircle size={28} />
        </button>
      )}

      {isOpen && (
        <div className="milo-container">
          <header className="milo-header">
            <div className="milo-profile">
              <div className="milo-avatar">
                <Bot size={20} />
              </div>
              <div className="milo-info">
                <span className="milo-name">Milo</span>
                <span className="milo-status">
                  <Sparkles size={10} /> CityGo Specialist
                </span>
              </div>
            </div>
            <button className="milo-close" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </header>

          <main className="milo-messages" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.role}`}>
                <div className="message-bubble">
                  {msg.content
                    .split("**")
                    .map((part, index) =>
                      index % 2 === 1 ? (
                        <strong key={index}>{part}</strong>
                      ) : (
                        part
                      )
                    )}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="milo-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="suggestion-chip"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </main>

          <footer className="milo-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
            >
              <input
                type="text"
                placeholder="Ask Milo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" disabled={!input.trim()}>
                <Send size={18} />
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
};

export default MiloChat;
