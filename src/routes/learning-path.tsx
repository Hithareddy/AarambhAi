import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AppShell } from "../components/AppShell";
import { hasCompletedAssessment } from "../services/assessment";
import { getLearningPath, type Lesson, type LessonStatus } from "../services/learning";

export const Route = createFileRoute("/learning-path")({
  head: () => ({ meta: [{ title: "Learning Path — Aarambh AI" }] }),
  component: () => (<RequireAuth><LearningPathPage /></RequireAuth>),
});

function statusLabel(status: LessonStatus) {
  switch (status) {
    case "completed":
      return { text: "Completed", color: "#166534" };
    case "in-progress":
      return { text: "In Progress", color: "#16a34a" };
    case "available":
      return { text: "Available", color: "#2563eb" };
    case "locked":
      return { text: "Locked", color: "#64748b" };
  }
}

function LearningPathPage() {
  const navigate = useNavigate();
  const [path, setPath] = useState<{ lesson: Lesson; status: LessonStatus }[]>([]);

  useEffect(() => {
    if (!hasCompletedAssessment()) {
      navigate({ to: "/assessment" });
      return;
    }
    setPath(getLearningPath());
  }, [navigate]);

  return (
    <AppShell>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 style={{ marginBottom: 4 }}>Your Personalized Learning Path</h1>
            <p className="muted" style={{ margin: 0 }}>
              A step-by-step journey tailored to your assessment results.
            </p>
          </div>
        </div>

        <ol className="path-list">
          {path.map((p, i) => {
            const s = statusLabel(p.status);
            return (
              <li key={p.lesson.id} className={`path-item ${p.status}`}>
                <div className="path-num">
                  {p.status === "completed" ? "✓" : p.status === "locked" ? "🔒" : i + 1}
                </div>
                <div className="path-body">
                  <p className="path-title">{p.lesson.title}</p>
                  <p className="path-topic">
                    {p.lesson.topic} · <span className="path-status" style={{ color: s.color }}>{s.text}</span>
                  </p>
                </div>
                <div className="path-actions">
                  {p.status === "locked" ? (
                    <button className="btn btn-secondary" disabled style={{ width: "auto", minHeight: 44, padding: "0.6rem 1.1rem" }}>
                      Locked
                    </button>
                  ) : (
                    <Link
                      to="/lesson/$lessonId"
                      params={{ lessonId: p.lesson.id }}
                      className={p.status === "completed" ? "btn btn-secondary" : "btn btn-primary"}
                      style={{ width: "auto", minHeight: 44, padding: "0.6rem 1.1rem" }}
                    >
                      {p.status === "completed" ? "Review" : "Start"}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}
