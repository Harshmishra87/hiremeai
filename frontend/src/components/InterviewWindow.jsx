import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  RotateCcw,
  Bot,
  User,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { useChat } from "../hooks/useChat";
import { QUICK_QUESTIONS, CANDIDATE } from "../data/constants";
import MarkdownLite from "./MarkdownLite.jsx";

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InterviewWindow({ onCollapse, onClose }) {
  const { messages, isStreaming, error, sendMessage, reset } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (text) => {
    const question = (text ?? input).trim();
    if (!question) return;
    sendMessage(question);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center shadow-glow shrink-0">
            <Bot size={15} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-primary truncate">
              AI Interview Assistant
            </p>
            <p className="text-[11px] text-ink-muted truncate">
              Ask me anything about {CANDIDATE.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 transition text-ink-secondary"
          >
            <RotateCcw size={12} /> Reset
          </button>
          {onCollapse && (
            <button
              onClick={onCollapse}
              aria-label="Collapse chat"
              title="Collapse"
              className="h-7 w-7 rounded-lg bg-white/8 hover:bg-white/14 transition flex items-center justify-center text-ink-secondary"
            >
              <ChevronRight size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close chat"
              title="Close"
              className="h-7 w-7 rounded-lg bg-white/8 hover:bg-white/14 transition flex items-center justify-center text-ink-secondary"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto os-scroll px-5 py-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-ink-muted">
            <Sparkles size={26} className="text-accent-violet" />
            <p className="text-sm max-w-xs">
              Ask a question below, or tap a suggestion to start the interview.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                m.role === "user" ? "bg-accent-blue/30" : "bg-accent-purple/30"
              }`}
            >
              {m.role === "user" ? <User size={12} /> : <Bot size={12} />}
            </div>
            <div
              className={`max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}
            >
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-accent-blue/80 text-white rounded-tr-sm whitespace-pre-wrap leading-relaxed"
                    : "glass-surface text-ink-primary rounded-tl-sm"
                }`}
              >
                {m.role === "user" ? (
                  m.text
                ) : m.streaming && !m.text ? (
                  <span className="flex items-center gap-1 py-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
                  </span>
                ) : (
                  <>
                    <MarkdownLite text={m.text} />
                    {m.streaming && (
                      <span className="inline-block w-1.5 h-3.5 bg-current ml-0.5 align-middle animate-blink" />
                    )}
                  </>
                )}
              </div>
              <span className="text-[10px] text-ink-muted mt-1 px-1">
                {formatTime(m.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}

        {error && (
          <p className="text-xs text-center text-red-300/80">{error}</p>
        )}
      </div>

      {messages.length === 0 && (
        <div className="px-5 pb-3 shrink-0">
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isStreaming}
                className="text-xs px-3 py-1.5 rounded-full glass-surface text-ink-secondary hover:text-ink-primary hover:bg-white/12 transition disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-4 border-t border-white/10 shrink-0"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-[#161b38] border border-white/10 rounded-full px-4 py-2.5 text-sm !text-white placeholder:text-ink-muted focus-ring outline-none caret-white"
          style={{
            backgroundColor: "#161b38",
            color: "#ffffff",
            colorScheme: "dark",
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="h-10 w-10 rounded-full bg-accent-purple hover:bg-accent-violet transition flex items-center justify-center text-white disabled:opacity-40 shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
