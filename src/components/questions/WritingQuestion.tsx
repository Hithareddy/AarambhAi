import { useEffect, useState } from "react";
import type { WritingQuestion as WQ } from "../../services/assessment";

interface Props {
  question: WQ;
  disabled?: boolean;
  onSubmit: (payload: { text: string; wordCount: number }) => void;
}

function countWords(s: string): number {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function WritingQuestion({ question, disabled, onSubmit }: Props) {
  const [text, setText] = useState("");
  useEffect(() => { setText(""); }, [question.id]);
  const words = countWords(text);
  const met = words >= question.minWords;

  return (
    <div className="q-block">
      <p className="q-instruction">{question.instruction}</p>
      <p className="muted" style={{ marginTop: "-0.5rem" }}>
        Suggested length: at least {question.minWords} words.
      </p>

      <textarea
        className="input writing-area"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing here…"
        rows={8}
        disabled={disabled}
        aria-label="Your written response"
      />

      <div className="writing-meta">
        <span className={met ? "chip chip-strong" : "chip"}>
          {words} word{words === 1 ? "" : "s"}{met ? " ✓" : ""}
        </span>
      </div>

      <div className="quiz-actions">
        <button
          className="btn btn-accent"
          onClick={() => onSubmit({ text: text.trim(), wordCount: words })}
          disabled={disabled || words === 0}
        >
          Submit Response
        </button>
      </div>
    </div>
  );
}
