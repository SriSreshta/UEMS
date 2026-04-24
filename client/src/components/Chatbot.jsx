import { useState, useRef, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import "./Chatbot.css";

// ── Quick action buttons per role ─────────────────────
const QUICK_ACTIONS = {
  student: [
    { label: "📊 View SGPA", query: "show my sgpa" },
    { label: "📋 Attendance", query: "check my attendance" },
    { label: "📝 Results", query: "show my results" },
    { label: "📅 Exams", query: "exam schedule" },
    { label: "💰 Fee Status", query: "show pending fees" },
    { label: "📚 My Courses", query: "show my courses" },
    { label: "🔔 Updates", query: "any updates?" },
    { label: "👤 Profile", query: "show my profile" },
  ],
  faculty: [
    { label: "📚 My Courses", query: "show my courses" },
    { label: "⚠️ Low Attendance", query: "students with low attendance" },
    { label: "📝 Marks Overview", query: "show marks overview" },
    { label: "👤 Profile", query: "show my profile" },
    { label: "🔔 Updates", query: "any updates?" },
  ],
  admin: [
    { label: "📊 System Stats", query: "show statistics" },
    { label: "👥 All Students", query: "show all students" },
    { label: "💰 Fee Overview", query: "show fee overview" },
    { label: "📚 All Courses", query: "show all courses" },
    { label: "🔔 Updates", query: "any updates?" },
  ],
};

export default function Chatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [isOpen]);

  // Prevent chat history bleed between users
  useEffect(() => {
    setMessages([]);
    setIsOpen(false);
    setInput("");
    setIsTyping(false);
    setHasNewMessage(false);
  }, [user?.email]);

  // Don't render if not logged in (AFTER all hooks)
  if (!user) return null;

  const role = user.role || "student";
  const quickActions = QUICK_ACTIONS[role] || QUICK_ACTIONS.student;

  // Send message to backend
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const storedUser = sessionStorage.getItem("uems_user");
      const token = storedUser ? JSON.parse(storedUser).token : null;

      const res = await fetch("https://uems-rz8o.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: "😅 Something went wrong. Please try again or type 'help'.",
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "🔌 Connection error. Please check if the server is running.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    if (!isOpen) {
      setHasNewMessage(false);
      // Show welcome message on first open
      if (messages.length === 0) {
        setMessages([
          {
            role: "bot",
            text: `Hello ${user.username || "there"}! 👋\n\nI'm your UEMS Assistant. I can help you with academics, attendance, exams, fees, and more!\n\nUse the quick actions below or type your question. 💡`,
          },
        ]);
      }
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* ── Floating Toggle Button ──────────────── */}
      <button
        className={`chatbot-toggle ${isOpen ? "active" : ""}`}
        onClick={toggleChat}
        title={isOpen ? "Close chat" : "Open UEMS Assistant"}
        id="chatbot-toggle-btn"
      >
        {isOpen ? "✕" : "💬"}
        {hasNewMessage && !isOpen && <span className="chatbot-badge" />}
      </button>

      {/* ── Chat Window ─────────────────────────── */}
      {isOpen && (
        <div className={`chatbot-window ${isMaximized ? "maximized" : ""}`} id="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-avatar">✨</div>
              <div className="chatbot-header-text">
                <h3>UEMS Assistant</h3>
                <span>
                  <span className="chatbot-online-dot" />
                  Online — ready to help
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions" style={{ display: 'flex', gap: '8px' }}>
              <button className="chatbot-close-btn" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore down" : "Maximize"}>
                {isMaximized ? "🗗" : "🗖"}
              </button>
              <button className="chatbot-close-btn" onClick={toggleChat} title="Close">
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" id="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.role}`}
                id={`chatbot-msg-${i}`}
              >
                {msg.text}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-typing">
                <div className="chatbot-typing-dot" />
                <div className="chatbot-typing-dot" />
                <div className="chatbot-typing-dot" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Buttons */}
          <div className="chatbot-quick-actions" id="chatbot-quick-actions">
            {quickActions.map((action, i) => (
              <button
                key={i}
                className="chatbot-quick-btn"
                onClick={() => sendMessage(action.query)}
                id={`chatbot-quick-${i}`}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              id="chatbot-input"
              autoComplete="off"
            />
            <button
              className="chatbot-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              title="Send message"
              id="chatbot-send-btn"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
