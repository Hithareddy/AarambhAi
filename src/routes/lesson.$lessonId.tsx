import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AppShell } from "../components/AppShell";
import {
  getLessonById,
  getNextLesson,
  markLessonComplete,
  type Lesson,
} from "../services/learning";

export const Route = createFileRoute("/lesson/$lessonId")({
  head: () => ({ meta: [{ title: "Lesson — Aarambh AI" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const l = getLessonById(lessonId);
    if (!l) navigate({ to: "/learning-path" });
    else {
      setLesson(l);
      setAnswer("");
      setFeedback(null);
      setCompleted(false);
    }
  }, [lessonId, navigate]);

  if (!lesson) return null;

  const check = () => {
    const ok = answer.trim().toLowerCase() === lesson.practice.answer.trim().toLowerCase();
    setFeedback({
      ok,
      msg: ok
        ? "Wonderful — that's correct!"
        : `Not quite. The expected answer was "${lesson.practice.answer}". Keep going!`,
    });
  };

  const complete = () => {
    markLessonComplete(lesson);
    setCompleted(true);
  };

  const next = getNextLesson(lesson.id);

  return (
    <AppShell>
      <div className="panel">
        <div className="lesson-header">
          <span className="chip">{lesson.topic}</span>
          <h1 style={{ marginTop: "0.5rem" }}>{lesson.title}</h1>
        </div>

        <div className="lesson-section">
          <h3>🎯 Learning Objective</h3>
          <p>{lesson.objective}</p>
        </div>

        <div className="lesson-section">
          <h3>📖 Explanation</h3>
          <p>{lesson.explanation}</p>
        </div>

        <div className="lesson-section">
          <h3>💡 Examples</h3>
          <ul className="example-list">
            {lesson.examples.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-section">
          <h3>📌 Key Points</h3>
          <ul className="key-list">
            {lesson.keyPoints.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-section">
          <h3>✏️ Practice</h3>
          <div className="practice-box">
            <p style={{ margin: "0 0 0.75rem", color: "var(--color-text)" }}>
              <strong>{lesson.practice.prompt}</strong>
            </p>
            <input
              className="input"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here"
            />
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <button className="btn btn-secondary" style={{ width: "auto", minHeight: 44, padding: "0.6rem 1.1rem" }} onClick={check} disabled={!answer.trim()}>
                Check Answer
              </button>
            </div>
            {feedback ? (
              <div className={`alert ${feedback.ok ? "alert-success" : "alert-error"}`} style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                {feedback.msg}
              </div>
            ) : null}
          </div>
        </div>

        {completed ? (
          <div className="alert alert-success">
            🎉 Lesson marked complete. Great work!
          </div>
        ) : null}

        <div className="lesson-actions">
          <button className="btn btn-accent" onClick={complete} disabled={completed}>
            {completed ? "Completed ✓" : "Mark Complete"}
          </button>
          <Link to="/tutor" className="btn btn-secondary">
            💬 Ask AI Tutor
          </Link>
          {next ? (
            <Link
              to="/lesson/$lessonId"
              params={{ lessonId: next.id }}
              className="btn btn-primary"
            >
              Next Lesson →
            </Link>
          ) : (
            <Link to="/learning-path" className="btn btn-primary">
              Back to Path
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
