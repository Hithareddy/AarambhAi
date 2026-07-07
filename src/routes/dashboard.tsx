import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AppShell } from "../components/AppShell";
import { getCurrentUser, type PublicUser } from "../services/auth";
import { getAssessmentResult, hasCompletedAssessment } from "../services/assessment";
import { getContinueLesson, getProgressSummary } from "../services/learning";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aarambh AI" },
      { name: "description", content: "Your personalized Aarambh AI learning dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    if (!hasCompletedAssessment()) {
      navigate({ to: "/assessment" });
      return;
    }
    setUser(u);
  }, [navigate]);

  if (!user) return null;

  const summary = getProgressSummary();
  const result = getAssessmentResult();
  const continueLesson = getContinueLesson();
  const firstName = user.full_name.split(" ")[0];

  return (
    <AppShell>
      <div className="panel">
        <div className="panel-header">
          <div>
            <h1 style={{ marginBottom: 4 }}>Welcome back, {firstName} 👋</h1>
            <p className="muted" style={{ margin: 0 }}>
              Small steps, every day. You're doing great.
            </p>
          </div>
          <div className="chip-row">
            <span className="chip">Level: {summary.level}</span>
            <span className="chip chip-strong">🔥 {summary.streakDays}-day streak</span>
          </div>
        </div>

        <div className="grid-2-wide">
          <div className="stat-card" style={{ background: "linear-gradient(135deg,#eff6ff,#f0fdf4)" }}>
            <p className="stat-label">Continue Learning</p>
            {continueLesson ? (
              <>
                <div className="stat-value" style={{ fontSize: "1.35rem" }}>
                  {continueLesson.title}
                </div>
                <p className="stat-sub">{continueLesson.topic}</p>
                <Link
                  to="/lesson/$lessonId"
                  params={{ lessonId: continueLesson.id }}
                  className="btn btn-primary"
                  style={{ width: "auto", marginTop: "0.75rem", padding: "0.75rem 1.5rem" }}
                >
                  Resume Lesson →
                </Link>
              </>
            ) : (
              <p className="muted">You've completed all available lessons — well done!</p>
            )}
          </div>

          <div className="stat-card">
            <p className="stat-label">Learning Path Progress</p>
            <div className="stat-value">{summary.percent}%</div>
            <div className="progress-bar" style={{ marginTop: "0.5rem" }}>
              <span style={{ width: `${summary.percent}%` }} />
            </div>
            <p className="stat-sub">
              {summary.completedLessons} of {summary.totalLessons} lessons complete
            </p>
          </div>
        </div>
      </div>

      <div className="grid-2-wide">
        <div className="panel">
          <h2>Recommended for You</h2>
          {continueLesson ? (
            <div className="path-item available">
              <div className="path-num">★</div>
              <div className="path-body">
                <p className="path-title">{continueLesson.title}</p>
                <p className="path-topic">{continueLesson.topic} · Personalized to your level</p>
              </div>
              <Link
                to="/lesson/$lessonId"
                params={{ lessonId: continueLesson.id }}
                className="btn btn-primary"
                style={{ width: "auto", padding: "0.6rem 1.1rem", minHeight: 44 }}
              >
                Start
              </Link>
            </div>
          ) : (
            <p className="muted">Explore your full learning path.</p>
          )}

          <h2 style={{ marginTop: "1.5rem" }}>Weak Topics</h2>
          {summary.weak.length ? (
            <div className="chip-row">
              {summary.weak.map((w) => (
                <span key={w} className="chip chip-weak">
                  {w}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">No weak topics — keep it up!</p>
          )}
        </div>

        <div className="panel">
          <h2>Assessment Summary</h2>
          {result ? (
            <>
              <p>
                Starting level: <strong>{result.level}</strong>
              </p>
              <p>
                Accuracy: <strong>{Math.round(result.accuracy * 100)}%</strong>
              </p>
              <Link to="/assessment-results" className="btn btn-secondary" style={{ width: "auto", padding: "0.6rem 1rem", minHeight: 44 }}>
                View Full Results
              </Link>
            </>
          ) : (
            <p className="muted">Take the initial assessment to unlock personalized insights.</p>
          )}

          <h2 style={{ marginTop: "1.5rem" }}>AI Tutor</h2>
          <p className="muted">Stuck on something? Ask your AI Tutor anytime.</p>
          <Link to="/tutor" className="btn btn-accent" style={{ width: "auto", padding: "0.6rem 1.1rem", minHeight: 44 }}>
            💬 Ask AI Tutor
          </Link>
        </div>
      </div>

      <div className="panel">
        <h2>Recent Activity</h2>
        {summary.activity.length ? (
          <ul className="spaced-y" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {summary.activity.map((a) => (
              <li key={a.at} style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <span>✓ Completed: <strong>{a.title}</strong></span>
                <span className="muted" style={{ fontSize: "0.9rem" }}>
                  {new Date(a.at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No activity yet — start your first lesson to begin.</p>
        )}
      </div>
    </AppShell>
  );
}
