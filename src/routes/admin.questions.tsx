import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import {
  ADMIN_TOPICS,
  deleteQuestion,
  listQuestions,
  type AdminQuestion,
  type Difficulty,
} from "../services/adminMock";

export const Route = createFileRoute("/admin/questions")({
  head: () => ({ meta: [{ title: "Questions — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <QuestionsPage />
    </RequireAuth>
  ),
});

function QuestionsPage() {
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState<string>("");
  const [diff, setDiff] = useState<Difficulty | "">("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [preview, setPreview] = useState<AdminQuestion | null>(null);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);

  const questions = useMemo(() => {
    // reference tick so this recomputes after mutation
    void tick;
    return listQuestions().filter((q) => {
      if (search && !q.question.toLowerCase().includes(search.toLowerCase())) return false;
      if (topic && q.topic !== topic) return false;
      if (diff && q.difficulty !== diff) return false;
      if (status === "active" && !q.active) return false;
      if (status === "inactive" && q.active) return false;
      return true;
    });
  }, [tick, search, topic, diff, status]);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteQuestion(deleting.id);
    setDeleting(null);
    setTick((t) => t + 1);
  };

  return (
    <AdminShell
      title="Question Management"
      description="Create and curate questions used in the adaptive assessment."
      actions={
        <Link to="/admin/questions/new" className="admin-btn admin-btn-primary">
          + Add Question
        </Link>
      }
    >
      <div className="admin-toolbar">
        <input
          placeholder="Search question text..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {ADMIN_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={diff} onChange={(e) => setDiff(e.target.value as Difficulty | "")}>
          <option value="">All difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "" | "active" | "inactive")}
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {questions.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>Status</th>
              <th style={{ width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td style={{ maxWidth: 380 }}>{q.question}</td>
                <td>{q.topic}</td>
                <td>
                  <span className={`admin-badge ${q.difficulty}`}>{q.difficulty}</span>
                </td>
                <td>
                  <span className={`admin-badge ${q.active ? "active" : "inactive"}`}>
                    {q.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="admin-btn admin-btn-ghost" onClick={() => setPreview(q)}>
                      Preview
                    </button>
                    <Link
                      to="/admin/questions/$questionId/edit"
                      params={{ questionId: q.id }}
                      className="admin-btn admin-btn-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => setDeleting(q)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="admin-empty">No questions match your filters.</div>
      )}

      {preview ? (
        <div className="admin-modal-backdrop" onClick={() => setPreview(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Question Preview</h3>
            <div className="admin-preview">
              <p style={{ marginTop: 0 }}>
                <strong>{preview.question}</strong>
              </p>
              <ol>
                {preview.options.map((o, i) => (
                  <li key={i} style={{ fontWeight: i === preview.correctIndex ? 700 : 400 }}>
                    {o} {i === preview.correctIndex ? "✓" : ""}
                  </li>
                ))}
              </ol>
              <p style={{ marginBottom: 0 }}>
                <em>Explanation:</em> {preview.explanation}
              </p>
            </div>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleting ? (
        <div className="admin-modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete question?</h3>
            <p>This action cannot be undone.</p>
            <p className="admin-preview">{deleting.question}</p>
            <div className="admin-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button className="admin-btn admin-btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminShell>
  );
}
