import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import {
  ADMIN_TOPICS,
  createContent,
  deleteContent,
  listContent,
  updateContent,
  type AdminContent,
  type ContentLevel,
} from "../services/adminMock";

export const Route = createFileRoute("/admin/content")({
  head: () => ({ meta: [{ title: "Content — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <ContentPage />
    </RequireAuth>
  ),
});

type Editing = { mode: "new" } | { mode: "edit"; item: AdminContent };

function emptyContent(): Omit<AdminContent, "id" | "updatedAt"> {
  return {
    topic: ADMIN_TOPICS[0],
    title: "",
    description: "",
    objectives: [""],
    explanation: "",
    examples: [""],
    keyPoints: [""],
    practice: { prompt: "", answer: "" },
    level: "Beginner",
    active: true,
  };
}

function ContentPage() {
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<ContentLevel | "">("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [preview, setPreview] = useState<AdminContent | null>(null);
  const [deleting, setDeleting] = useState<AdminContent | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);

  const items = useMemo(() => {
    void tick;
    return listContent().filter((c) => {
      if (search && !`${c.title} ${c.description}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (topic && c.topic !== topic) return false;
      if (level && c.level !== level) return false;
      if (status === "active" && !c.active) return false;
      if (status === "inactive" && c.active) return false;
      return true;
    });
  }, [tick, search, topic, level, status]);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteContent(deleting.id);
    setDeleting(null);
    setTick((t) => t + 1);
  };

  return (
    <AdminShell
      title="Learning Content"
      description="Manage lessons and practice activities."
      actions={
        <button
          className="admin-btn admin-btn-primary"
          onClick={() => setEditing({ mode: "new" })}
        >
          + Add Content
        </button>
      }
    >
      <div className="admin-toolbar">
        <input
          placeholder="Search title or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="">All topics</option>
          {ADMIN_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value as ContentLevel | "")}>
          <option value="">All levels</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
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

      {items.length ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Topic</th>
              <th>Level</th>
              <th>Status</th>
              <th style={{ width: 280 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{c.title}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{c.description}</div>
                </td>
                <td>{c.topic}</td>
                <td>{c.level}</td>
                <td>
                  <span className={`admin-badge ${c.active ? "active" : "inactive"}`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="admin-btn admin-btn-ghost" onClick={() => setPreview(c)}>
                      Preview
                    </button>
                    <button
                      className="admin-btn admin-btn-secondary"
                      onClick={() => setEditing({ mode: "edit", item: c })}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-btn admin-btn-danger"
                      onClick={() => setDeleting(c)}
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
        <div className="admin-empty">No content matches your filters.</div>
      )}

      {preview ? (
        <div className="admin-modal-backdrop" onClick={() => setPreview(null)}>
          <div
            className="admin-modal"
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{preview.title}</h3>
            <p style={{ color: "#64748b" }}>
              {preview.topic} · {preview.level}
            </p>
            <div className="admin-preview">
              <p>{preview.description}</p>
              <p><strong>Objectives:</strong> {preview.objectives.join("; ")}</p>
              <p><strong>Explanation:</strong> {preview.explanation}</p>
              <p><strong>Examples:</strong> {preview.examples.join(", ")}</p>
              <p><strong>Key points:</strong> {preview.keyPoints.join("; ")}</p>
              <p>
                <strong>Practice:</strong> {preview.practice.prompt} →{" "}
                <em>{preview.practice.answer}</em>
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
            <h3>Delete content?</h3>
            <p>This action cannot be undone.</p>
            <p className="admin-preview">{deleting.title}</p>
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

      {editing ? (
        <ContentEditor
          initial={editing.mode === "edit" ? editing.item : undefined}
          onCancel={() => setEditing(null)}
          onSave={(data) => {
            if (editing.mode === "edit") {
              updateContent(editing.item.id, data);
            } else {
              createContent(data);
            }
            setEditing(null);
            setTick((t) => t + 1);
          }}
        />
      ) : null}
    </AdminShell>
  );
}

function ContentEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial?: AdminContent;
  onSave: (data: Omit<AdminContent, "id" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [data, setData] = useState<Omit<AdminContent, "id" | "updatedAt">>(
    initial
      ? {
          topic: initial.topic,
          title: initial.title,
          description: initial.description,
          objectives: [...initial.objectives],
          explanation: initial.explanation,
          examples: [...initial.examples],
          keyPoints: [...initial.keyPoints],
          practice: { ...initial.practice },
          level: initial.level,
          active: initial.active,
        }
      : emptyContent(),
  );
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) return setError("Title is required.");
    if (!data.description.trim()) return setError("Description is required.");
    setError(null);
    onSave({
      ...data,
      title: data.title.trim(),
      description: data.description.trim(),
      objectives: data.objectives.map((o) => o.trim()).filter(Boolean),
      examples: data.examples.map((e) => e.trim()).filter(Boolean),
      keyPoints: data.keyPoints.map((k) => k.trim()).filter(Boolean),
    });
  };

  const list = (
    field: "objectives" | "examples" | "keyPoints",
    label: string,
  ) => (
    <div>
      <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 14 }}>{label}</div>
      {data[field].map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <input
            value={v}
            onChange={(e) => {
              const next = [...data[field]];
              next[i] = e.target.value;
              setData({ ...data, [field]: next });
            }}
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="admin-btn admin-btn-ghost"
            onClick={() => {
              const next = data[field].filter((_, idx) => idx !== i);
              setData({ ...data, [field]: next.length ? next : [""] });
            }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-btn admin-btn-secondary"
        onClick={() => setData({ ...data, [field]: [...data[field], ""] })}
      >
        + Add
      </button>
    </div>
  );

  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div
        className="admin-modal"
        style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{initial ? "Edit Content" : "New Content"}</h3>
        <form className="admin-form" onSubmit={submit}>
          {error ? <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div> : null}
          <div className="row">
            <label>
              Topic
              <select
                value={data.topic}
                onChange={(e) => setData({ ...data, topic: e.target.value })}
              >
                {ADMIN_TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Level
              <select
                value={data.level}
                onChange={(e) => setData({ ...data, level: e.target.value as ContentLevel })}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>
          </div>
          <label>
            Title
            <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
          </label>
          <label>
            Description
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
            />
          </label>
          {list("objectives", "Learning objectives")}
          <label>
            Explanation
            <textarea
              value={data.explanation}
              onChange={(e) => setData({ ...data, explanation: e.target.value })}
            />
          </label>
          {list("examples", "Examples")}
          {list("keyPoints", "Key points")}
          <div className="row">
            <label>
              Practice prompt
              <input
                value={data.practice.prompt}
                onChange={(e) =>
                  setData({ ...data, practice: { ...data.practice, prompt: e.target.value } })
                }
              />
            </label>
            <label>
              Expected answer
              <input
                value={data.practice.answer}
                onChange={(e) =>
                  setData({ ...data, practice: { ...data.practice, answer: e.target.value } })
                }
              />
            </label>
          </div>
          <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={data.active}
              onChange={(e) => setData({ ...data, active: e.target.checked })}
            />
            Active (visible to learners)
          </label>
          <div className="admin-actions">
            <button type="submit" className="admin-btn admin-btn-primary">
              Save
            </button>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
