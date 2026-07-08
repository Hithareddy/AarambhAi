import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import { listLearners, type ContentLevel } from "../services/adminMock";

export const Route = createFileRoute("/admin/learners")({
  head: () => ({ meta: [{ title: "Learners — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <LearnersPage />
    </RequireAuth>
  ),
});

function LearnersPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<ContentLevel | "">("");
  const [assessed, setAssessed] = useState<"" | "yes" | "no">("");

  const rows = useMemo(() => {
    return listLearners().filter((l) => {
      if (search && !`${l.name} ${l.email}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (level && l.level !== level) return false;
      if (assessed === "yes" && !l.assessmentCompleted) return false;
      if (assessed === "no" && l.assessmentCompleted) return false;
      return true;
    });
  }, [search, level, assessed]);

  return (
    <AdminShell
      title="Learner Analytics"
      description="Monitor learner progress and identify who needs support."
    >
      <div className="admin-toolbar">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value as ContentLevel | "")}>
          <option value="">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <select
          value={assessed}
          onChange={(e) => setAssessed(e.target.value as "" | "yes" | "no")}
        >
          <option value="">Assessment: any</option>
          <option value="yes">Completed</option>
          <option value="no">Pending</option>
        </select>
      </div>

      {rows.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Level</th>
              <th>Assessment</th>
              <th>Progress</th>
              <th>Weak Areas</th>
              <th style={{ width: 140 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{l.name}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{l.email}</div>
                </td>
                <td>{l.level}</td>
                <td>
                  <span
                    className={`admin-badge ${l.assessmentCompleted ? "active" : "inactive"}`}
                  >
                    {l.assessmentCompleted ? "Completed" : "Pending"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="admin-progress">
                      <span style={{ width: `${l.progressPercent}%` }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#64748b" }}>
                      {l.progressPercent}%
                    </span>
                  </div>
                </td>
                <td>
                  {l.weakAreas.length ? (
                    l.weakAreas.map((w) => (
                      <span key={w} className="admin-badge" style={{ marginRight: 4 }}>
                        {w}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
                  )}
                </td>
                <td>
                  <Link
                    to="/admin/learners/$learnerId"
                    params={{ learnerId: l.id }}
                    className="admin-btn admin-btn-secondary"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-empty">No learners match your filters.</div>
      )}
    </AdminShell>
  );
}
