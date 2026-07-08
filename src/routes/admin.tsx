import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import { getAdminDashboard } from "../services/adminMock";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Aarambh AI" }] }),
  component: () => (
    <RequireAuth role="admin">
      <AdminDashboardPage />
    </RequireAuth>
  ),
});

function AdminDashboardPage() {
  const s = getAdminDashboard();
  return (
    <AdminShell
      title="Admin Dashboard"
      description="Overview of learners, content and question bank."
      actions={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to="/admin/questions/new" className="admin-btn admin-btn-primary">
            + New Question
          </Link>
          <Link to="/admin/content" className="admin-btn admin-btn-secondary">
            Manage Content
          </Link>
        </div>
      }
    >
      <div className="admin-grid-4">
        <Stat label="Total Learners" value={s.totalLearners} sub="All registered users" />
        <Stat label="Active (7d)" value={s.activeLearners} sub="Active in the last week" />
        <Stat
          label="Assessments Done"
          value={s.assessmentsCompleted}
          sub={`${Math.round((s.assessmentsCompleted / Math.max(1, s.totalLearners)) * 100)}% of learners`}
        />
        <Stat
          label="Needs Attention"
          value={s.needsAttention}
          sub="Inactive or weak in ≥2 topics"
        />
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Question Bank</h3>
          <p style={{ color: "#64748b", margin: "0 0 0.75rem" }}>
            {s.questionsActive} active of {s.questionsTotal} total questions.
          </p>
          <Link to="/admin/questions" className="admin-btn admin-btn-secondary">
            Manage Questions →
          </Link>
        </div>
        <div className="admin-card">
          <h3 style={{ marginTop: 0 }}>Learning Content</h3>
          <p style={{ color: "#64748b", margin: "0 0 0.75rem" }}>
            {s.contentActive} active of {s.contentTotal} lessons.
          </p>
          <Link to="/admin/content" className="admin-btn admin-btn-secondary">
            Manage Content →
          </Link>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
        {s.recentActivity.length ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Activity</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {s.recentActivity.map((a, i) => (
                <tr key={i}>
                  <td>{a.learner}</td>
                  <td>{a.title}</td>
                  <td>{new Date(a.at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="admin-empty">No recent activity yet.</div>
        )}
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="admin-stat">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
      {sub ? <p className="sub">{sub}</p> : null}
    </div>
  );
}
