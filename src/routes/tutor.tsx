import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AppShell } from "../components/AppShell";
import {
  mockTutorReply,
  newMessage,
  SUGGESTED_QUESTIONS,
  type TutorMessage,
} from "../services/tutor";

export const Route = createFileRoute("/tutor")({
  head: () => ({ meta: [{ title: "AI Tutor — Aarambh AI" }] }),
  component: TutorPage,
});

const GREETING: TutorMessage = {
  id: "greeting",
  role: "assistant",
  text:
    "Hello! I'm your Aarambh AI Tutor. Ask me anything about your lessons — I'm here to help you learn, one step at a time.",
  at: new Date().toISOString(),
};

function TutorPage() {
  const [messages, setMessages] = useState<TutorMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const userMsg = newMessage("user", clean);
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = newMessage("assistant", mockTutorReply(clean));
      setMessages((m) => [...m, reply]);
      setTyping(false);
      inputRef.current?.focus();
    }, 700);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const clear = () => {
    setMessages([GREETING]);
    inputRef.current?.focus();
  };

  return (
    <AppShell>
      <div className="tutor-toolbar">
        <div>
          <h1 style={{ margin: 0 }}>AI Tutor</h1>
          <p className="muted" style={{ margin: 0 }}>
            Ask friendly questions — no wrong ones here.
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={clear}
          style={{ border: "2px solid var(--color-border)", borderRadius: 8 }}
        >
          Clear Conversation
        </button>
      </div>

      <div className="tutor-shell">
        <div className="tutor-messages" ref={listRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role === "user" ? "msg-user" : "msg-assistant"}`}>
              {m.text}
            </div>
          ))}
          {typing ? (
            <div className="msg msg-assistant">
              <span className="typing" aria-label="Tutor is typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          ) : null}
        </div>

        <div className="tutor-suggested" aria-label="Suggested questions">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} className="suggested-chip" onClick={() => send(q)}>
              {q}
            </button>
          ))}
        </div>

        <form className="tutor-composer" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            aria-label="Your question"
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || typing}>
            Send
          </button>
        </form>
      </div>
    </AppShell>
  );
}
