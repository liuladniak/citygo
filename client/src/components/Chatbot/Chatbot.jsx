// import { useState } from "react";

// const Chatbot = () => {
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [input, setInput] = useState("");

//   const sendMessage = async () => {
//     if (!input) return;

//     // Add user message
//     setMessages([...messages, { role: "user", content: input }]);

//     const res = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: input }),
//     });
//     const data = await res.json();

//     // Add AI message
//     setMessages((prev) => [...prev, { role: "ai", content: data.message }]);
//     setInput("");
//   };

//   return (
//     <div className="border rounded-md p-4 w-80 h-96 flex flex-col">
//       <div className="flex-1 overflow-y-auto space-y-2">
//         {messages.map((msg, i) => (
//           <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
//             <p className={msg.role === "user" ? "bg-blue-200 inline-block p-2 rounded" : "bg-gray-200 inline-block p-2 rounded"}>
//               {msg.content}
//             </p>
//           </div>
//         ))}
//       </div>
//       <div className="mt-2 flex">
//         <input
//           type="text"
//           className="flex-1 border rounded-l-md p-2"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//         />
//         <button className="bg-blue-600 text-white px-4 rounded-r-md" onClick={sendMessage}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;

import { useState } from "react";
import Icon from "../UI/Icon";
import { chatBubblePath, sendHorizontalPath } from "../UI/iconsPaths";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "bot", text: "Hi 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: input },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="flex flex-col h-[500px] w-[350px] border rounded-2xl shadow-lg bg-white mb-3">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-blue-600 text-white rounded-t-2xl">
            <span className="font-semibold">Assistant</span>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center border-t p-2 gap-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700"
            >
              <Icon
                iconPath={sendHorizontalPath}
                size={20}
                className="fill-white"
              />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
      >
        <Icon iconPath={chatBubblePath} size={24} className="fill-white" />
      </button>
    </div>
  );
}
