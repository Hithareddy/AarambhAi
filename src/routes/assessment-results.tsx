import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { Logo } from "../components/Logo";
import { getAssessmentResult, type AssessmentResult } from "../services/assessment";

export const Route = createFileRoute("/assessment-results")({
  head: () => ({ meta: [{ title: "Assessment Results — Aarambh AI" }] }),
  component: AssessmentResultsPage,
});

function AssessmentResultsPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const r = getAssessmentResult();
    if (!r) navigate({ to: "/assessment" });
    else setResult(r);
  }, [navigate]);

  if (!result) return null;

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="panel" style={{ textAlign: "center", marginBottom: "1.25rem" }}>
          <Logo withName />
          <h1 style={{ marginTop: "0.75rem" }}>Your Learning Snapshot</h1>
          <p className="muted">
            Here's a friendly summary — this is a starting point, not a score to worry about.
          </p>
        </div>

        <div className="grid-3">
          <div className="stat-card">
            <p className="stat-label">Estimated Starting Level</p>
            <div className="stat-value">{result.level}</div>
            <p className="stat-sub">Based on your answers today</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Recommended Starting Point</p>
            <div className="stat-value" style={{ fontSize: "1.4rem" }}>
              {result.recommendedStart}
            </div>
            <p className="stat-sub">We'll begin your path here</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Questions Answered</p>
            <div className="stat-value">
              {result.correctCount}/{result.totalQuestions}
            </div>
            <p className="stat-sub">{Math.round(result.accuracy * 100)}% accuracy</p>
          </div>
        </div>

        <div className="panel" style={{ marginTop: "1.25rem" }}>
          <h2>Your Strengths</h2>
          {result.strengths.length ? (
            <div className="chip-row">
              {result.strengths.map((s) => (
                <span key={s} className="chip chip-strong">
                  ★ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">
              You're just starting out — every topic is a fresh opportunity to grow.
            </p>
          )}
        </div>

        <div className="panel">
          <h2>Topics to Focus On</h2>
          {result.weaknesses.length ? (
            <div className="chip-row">
              {result.weaknesses.map((s) => (
                <span key={s} className="chip chip-weak">
                  ✎ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Wonderful — no weak topics stood out. We'll keep it well-balanced.</p>
          )}
        </div>

        <div className="panel">
          <h2>Topic-wise Performance</h2>
          <div className="spaced-y">
            {result.topicBreakdown.map((t) => (
              <div key={t.topic}>
                <div className="progress-label">
                  <strong>{t.topic}</strong>
                  <span>
                    {t.correct}/{t.total} ({Math.round(t.accuracy * 100)}%)
                  </span>
                </div>
                <div className="progress-bar">
                  <span style={{ width: `${Math.round(t.accuracy * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <button
            className="btn btn-primary"
            style={{ width: "auto", padding: "0.9rem 2rem" }}
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Go to My Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
