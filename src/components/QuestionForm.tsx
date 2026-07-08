import { useState, type FormEvent } from "react";
import { ADMIN_TOPICS, type AdminQuestion, type Difficulty } from "../services/adminMock";

type FormData = Omit<AdminQuestion, "id" | "updatedAt">;

export function QuestionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: AdminQuestion;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [topic, setTopic] = useState<string>(initial?.topic ?? ADMIN_TOPICS[0]);
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "easy");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options ?? ["", "", "", ""],
  );
  const [correctIndex, setCorrectIndex] = useState<number>(initial?.correctIndex ?? 0);
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return setError("Question text is required.");
    if (options.some((o) => !o.trim())) return setError("All options are required.");
    if (correctIndex < 0 || correctIndex >= options.length)
      return setError("Select which option is correct.");
    setError(null);
    onSubmit({
      topic,
      difficulty,
      question: question.trim(),
      options: options.map((o) => o.trim()),
      correctIndex,
      explanation: explanation.trim(),
      active,
    });
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      {error ? (
        <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>
      ) : null}
      <div className="row">
        <label>
          Topic
          <select value={topic} onChange={(e) => setTopic(e.target.value)}>
            {ADMIN_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
      </div>
      <label>
        Question text
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
      </label>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Options</div>
        {options.map((opt, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}
          >
            <input
              type="radio"
              name="correct"
              checked={correctIndex === i}
              onChange={() => setCorrectIndex(i)}
              aria-label={`Mark option ${i + 1} correct`}
            />
            <input
              value={opt}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              placeholder={`Option ${i + 1}`}
              style={{ flex: 1 }}
            />
          </div>
        ))}
        <div style={{ fontSize: 12, color: "#64748b" }}>Select the radio next to the correct option.</div>
      </div>
      <label>
        Explanation (shown after answering)
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </label>
      <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        Active (available to learners)
      </label>
      <div className="admin-actions">
        <button type="submit" className="admin-btn admin-btn-primary">
          Save
        </button>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
