import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AdaptiveAssessment, type Question } from "../services/assessment";
import { getCurrentUser } from "../services/auth";

export const Route = createFileRoute("/assessment-quiz")({
  head: () => ({
    meta: [{ title: "Assessment — Aarambh AI" }],
  }),
  component: () => (<RequireAuth><AssessmentQuizPage /></RequireAuth>),
});

function AssessmentQuizPage() {
  const navigate = useNavigate();
  const assessment = useMemo(() => new AdaptiveAssessment(), []);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [progress, setProgress] = useState({ answered: 0, total: assessment.total });

  useEffect(() => {
    if (!getCurrentUser()) {
      navigate({ to: "/login" });
      return;
    }
    setQuestion(assessment.next());
  }, [assessment, navigate]);

  const onSubmit = () => {
    if (selected == null || !question) return;
    const correct = assessment.submit(question, selected);
    setWasCorrect(correct);
    setSubmitted(true);
    setProgress({ answered: assessment.answered, total: assessment.total });
  };

  const onNext = () => {
    setLoading(true);
    setTimeout(() => {
      if (assessment.isDone) {
        navigate({ to: "/assessment-analyzing" });
        // finalize on analyzing screen
        return;
      }
      const q = assessment.next();
      setQuestion(q);
      setSelected(null);
      setSubmitted(false);
      setLoading(false);
    }, 350);
  };

  // Keep the assessment instance available to analyzing screen via window ref.
  useEffect(() => {
    (window as unknown as { __aarambhAssessment?: AdaptiveAssessment }).__aarambhAssessment =
      assessment;
  }, [assessment]);

  if (!question) return null;

  const percent = Math.round((progress.answered / progress.total) * 100);

  return (
    <div className="app-shell">
      <main className="app-main quiz-panel">
        <div className="quiz-header">
          <div>
            <div className="stat-label">Topic</div>
            <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>{question.topic}</div>
          </div>
          <button className="btn-ghost" onClick={() => setConfirmExit(true)}>
            Exit Assessment
          </button>
        </div>

        <div className="progress-bar" aria-hidden>
          <span style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-label">
          <span>
            Question {Math.min(progress.answered + (submitted ? 0 : 1), progress.total)} of{" "}
            {progress.total}
          </span>
          <span>{percent}%</span>
        </div>

        {loading ? (
          <div className="analyzing" style={{ minHeight: 260 }}>
            <div className="spinner" />
            <p className="muted">Loading next question...</p>
          </div>
        ) : (
          <div className="question-block" style={{ marginTop: "1rem" }}>
            <p className="question-text">{question.question}</p>
            <div role="radiogroup" aria-label="Answer options">
              {question.options.map((opt, i) => {
                let cls = "option";
                if (submitted) {
                  if (i === question.correct) cls += " correct";
                  else if (i === selected) cls += " wrong";
                } else if (selected === i) {
                  cls += " selected";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={selected === i}
                    className={cls}
                    disabled={submitted}
                    onClick={() => setSelected(i)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {submitted ? (
              <div
                className={`alert ${wasCorrect ? "alert-success" : "alert-error"}`}
                style={{ marginTop: "1rem" }}
              >
                {wasCorrect ? "Great job — that's correct!" : "Not quite — keep going, you're learning!"}
              </div>
            ) : null}

            <div className="quiz-actions">
              {!submitted ? (
                <button className="btn btn-primary" onClick={onSubmit} disabled={selected == null}>
                  Submit Answer
                </button>
              ) : (
                <button className="btn btn-accent" onClick={onNext}>
                  {assessment.isDone ? "See Results" : "Next Question"}
                </button>
              )}
            </div>
          </div>
        )}

        {confirmExit ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
              <h3>Exit assessment?</h3>
              <p>Your progress will not be saved. You can start again anytime.</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setConfirmExit(false)}>
                  Continue
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate({ to: "/dashboard" })}
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
