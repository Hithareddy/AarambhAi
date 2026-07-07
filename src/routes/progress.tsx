import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AppShell } from "../components/AppShell";
import { hasCompletedAssessment } from "../services/assessment";
import { getProgressSummary } from "../services/learning";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "My Progress — Aarambh AI" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<ReturnType<typeof getProgressSummary> | null>(null);

  useEffect(() => {
    if (!hasCompletedAssessment()) {
      navigate({ to: "/assessment" });
      return;
    }
    setSummary(getProgressSummary());
  }, [navigate]);

  if (!summary) return null;

  return (
    <AppShell>
      <div className="panel">
        <h1>Your Progress</h1>
        <p className="muted">Small wins add up. Here's how far you've come.</p>

        <div className="grid-3" style={{ marginTop: "1rem" }}>
          <div className="stat-card">
            <p className="stat-label">Learning Level</p>
            <div className="stat-value">{summary.level}</div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Lessons Completed</p>
            <div className="stat-value">
              {summary.completedLessons}/{summary.totalLessons}
            </div>
          </div>
          <div className="stat-card">
            <p className="stat-label">Streak</p>
            <div className="stat-value">🔥 {summary.streakDays} days</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Learning Path Progress</h2>
        <div className="progress-bar">
          <span style={{ width: `${summary.percent}%` }} />
        </div>
        <div className="progress-label">
          <span>Overall</span>
          <span>{summary.percent}%</span>
        </div>

        <div className="spaced-y" style={{ marginTop: "1rem" }}>
          {summary.topics.map((t) => (
            <div key={t.topic}>
              <div className="progress-label">
                <strong>{t.topic}</strong>
                <span>
                  {t.done}/{t.total}
                </span>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${t.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="panel">
          <h3>Strong Topics</h3>
          {summary.strong.length ? (
            <div className="chip-row">
              {summary.strong.map((s) => (
                <span key={s} className="chip chip-strong">
                  ★ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Keep learning — strengths will appear soon.</p>
          )}
        </div>
        <div className="panel">
          <h3>Improving</h3>
          {summary.improving.length ? (
            <div className="chip-row">
              {summary.improving.map((s) => (
                <span key={s} className="chip">
                  ↑ {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Practice weak topics to see improvement here.</p>
          )}
        </div>
        <div className="panel">
          <h3>Weak Topics</h3>
          {summary.weak.length ? (
            <div className="chip-row">
              {summary.weak.map((s) => (
                <span key={s} className="chip chip-weak">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">No weak topics detected.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Recent Activity</h2>
        {summary.activity.length ? (
          <ul className="spaced-y" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {summary.activity.map((a) => (
              <li
                key={a.at}
                style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}
              >
                <span>✓ {a.title}</span>
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {new Date(a.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No activity yet.</p>
        )}
      </div>
    </AppShell>
  );
}
