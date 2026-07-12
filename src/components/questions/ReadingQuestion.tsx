import { useEffect, useState } from "react";
import type { ReadingQuestion as RQ } from "../../services/assessment";

interface Props {
  question: RQ;
  disabled?: boolean;
  onSubmit: (selectedIndex: number) => void;
}

export function ReadingQuestion({ question, disabled, onSubmit }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { setSelected(null); }, [question.id]);

  return (
    <div className="q-block">
      <div className="passage-card" role="region" aria-label="Reading passage">
        <div className="passage-label">📖 Reading passage</div>
        <p className="passage-text">{question.passage}</p>
      </div>

      <p className="q-instruction">{question.question}</p>

      <div role="radiogroup" aria-label="Answer options" className="options-list">
        {question.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            className={`option${selected === i ? " selected" : ""}`}
            disabled={disabled}
            onClick={() => setSelected(i)}
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="quiz-actions">
        <button
          className="btn btn-accent"
          onClick={() => selected != null && onSubmit(selected)}
          disabled={selected == null || disabled}
        >
          Submit Response
        </button>
      </div>
    </div>
  );
}
