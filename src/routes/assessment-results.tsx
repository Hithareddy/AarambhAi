import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { Logo } from "../components/Logo";
import { SkillResultCard } from "../components/SkillResultCard";
import { getAssessmentResult, type AssessmentResult } from "../services/assessment";

export const Route = createFileRoute("/assessment-results")({
  head: () => ({ meta: [{ title: "Assessment Results — Aarambh AI" }] }),
  component: () => (<RequireAuth><AssessmentResultsPage /></RequireAuth>),
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

  const outcomes = result.skillOutcomes ?? [];
  const strengths = result.strengths ?? [];
  const improvements = result.improvements ?? result.weaknesses ?? [];
  const path = result.recommendedLearningPath ?? [result.recommendedFocus ?? result.recommendedStart];

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="panel" style={{ textAlign: "center" }}>
          <Logo withName />
          <h1 style={{ marginTop: "0.75rem" }}>Your LSRW snapshot</h1>
          <p className="muted">
            Taken on {new Date(result.completedAt).toLocaleDateString()} · Language: {result.language ?? "—"}
          </p>
        </div>

        <div className="grid-3">
          <div className="stat-card">
            <p className="stat-label">Overall estimated level</p>
            <div className="stat-value">{result.overallLevel ?? result.level}</div>
            <p className="stat-sub">Across all four skills</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Recommended focus area</p>
            <div className="stat-value" style={{ fontSize: "1.35rem" }}>
              {result.recommendedFocus ?? result.recommendedStart}
            </div>
            <p className="stat-sub">Where extra practice will help most</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Questions attempted</p>
            <div className="stat-value">{result.totalQuestions}</div>
            <p className="stat-sub">Across LSRW</p>
          </div>
        </div>

        <div className="panel">
          <h2>Skill levels</h2>
          <div className="skill-result-grid">
            {outcomes.map((o) => (<SkillResultCard key={o.skill} outcome={o} />))}
          </div>
        </div>

        <div className="grid-2-wide">
          <div className="panel">
            <h2>Strengths</h2>
            {strengths.length ? (
              <div className="chip-row">
                {strengths.map((s) => (<span key={s} className="chip chip-strong">★ {s}</span>))}
              </div>
            ) : (
              <p className="muted">Every skill is a fresh starting point — you'll grow quickly.</p>
            )}
          </div>
          <div className="panel">
            <h2>Skills to improve</h2>
            {improvements.length ? (
              <div className="chip-row">
                {improvements.map((s) => (<span key={s} className="chip chip-weak">✎ {s}</span>))}
              </div>
            ) : (
              <p className="muted">Well balanced across skills — nice work.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <h2>Recommended learning path</h2>
          <ol className="learning-path">
            {path.map((p, i) => (
              <li key={p + i}><span className="lp-num">{i + 1}</span> {p}</li>
            ))}
          </ol>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary" onClick={() => navigate({ to: "/learning-path" })}>
            Start Learning Path
          </button>
          <button className="btn btn-secondary" onClick={() => navigate({ to: "/assessment" })}>
            Retake Assessment
          </button>
          <button className="btn btn-ghost" onClick={() => navigate({ to: "/dashboard" })}>
            Go to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
