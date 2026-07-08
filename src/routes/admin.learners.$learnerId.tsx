import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import { getLearner, type AdminLearner } from "../services/adminMock";

export const Route = createFileRoute("/admin/learners/$learnerId")({
  head: () => ({ meta: [{ title: "Learner Detail — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <LearnerDetailPage />
    </RequireAuth>
  ),
});

function LearnerDetailPage() {
  const { learnerId } = Route.useParams();
  const navigate = useNavigate();
  const [learner, setLearner] = useState<AdminLearner | null>(null);

  useEffect(() => {
    const l = getLearner(learnerId);
    if (!l) navigate({ to: "/admin/learners" });
    else setLearner(l);
  }, [learnerId, navigate]);

  if (!learner) return null;

  return (
    <AdminShell
      title={learner.name}
      description={learner.email}
      actions={
        <Link to="/admin/learners" className="admin-btn admin-btn-secondary">
          ← Back to Learners
        </Link>
      }
    >
      <div className="admin-grid-4">
        <div className="admin-stat">
          <p className="label">Estimated Level</p>
          <p className="value" style={{ fontSize: "1.4rem" }}>
            {learner.level}
          </p>
        </div>
        <div className="admin-stat">
          <p className="label">Assessment</p>
          <p className="value" style={{ fontSize: "1.4rem" }}>
            {learner.assessmentCompleted ? "Completed" : "Pending"}
          </p>
        </div>
        <div className="admin-stat">
          <p className="label">Progress</p>
          <p className="value">{learner.progressPercent}%</p>
          <div className="admin-progress" style={{ marginTop: 6 }}>
            <span style={{ width: `${learner.progressPercent}%` }} />
          </div>
        </div>
        <div className="admin-stat">
          <p className="label">Streak</p>
          <p className="value">🔥 {learner.streakDays}d</p>
          <p className="sub">
            Last active {new Date(learner.lastActive).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Strengths</h3>
          {learner.strongAreas.length ? (
            learner.strongAreas.map((s) => (
              <span
                key={s}
                className="admin-badge active"
                style={{ marginRight: 6, marginBottom: 6 }}
              >
                ★ {s}
              </span>
            ))
          ) : (
            <p style={{ color: "#64748b" }}>No strong areas identified yet.</p>
          )}
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Weak Areas</h3>
          {learner.weakAreas.length ? (
            learner.weakAreas.map((w) => (
              <span
                key={w}
                className="admin-badge"
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  marginRight: 6,
                  marginBottom: 6,
                }}
              >
                {w}
              </span>
            ))
          ) : (
            <p style={{ color: "#64748b" }}>No weak areas detected.</p>
          )}
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Topic-wise Performance</h3>
        {learner.topicPerformance.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Topic</th>
                <th>Accuracy</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {learner.topicPerformance.map((t) => (
                <tr key={t.topic}>
                  <td>{t.topic}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="admin-progress" style={{ width: 160 }}>
                        <span style={{ width: `${Math.round(t.accuracy * 100)}%` }} />
                      </div>
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        {Math.round(t.accuracy * 100)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {t.completed}/{t.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">No topic performance recorded yet.</div>
        )}
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
        {learner.activity.length ? (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {learner.activity.map((a) => (
              <li
                key={a.at}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <span>✓ {a.title}</span>
                <span style={{ color: "#64748b", fontSize: 13 }}>
                  {new Date(a.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="admin-empty">No activity yet.</div>
        )}
      </div>
    </AdminShell>
  );
}
