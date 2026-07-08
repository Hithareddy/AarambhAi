import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import { QuestionForm } from "../components/QuestionForm";
import { getQuestion, updateQuestion, type AdminQuestion } from "../services/adminMock";

export const Route = createFileRoute("/admin/questions/$questionId/edit")({
  head: () => ({ meta: [{ title: "Edit Question — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <EditQuestionPage />
    </RequireAuth>
  ),
});

function EditQuestionPage() {
  const { questionId } = Route.useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState<AdminQuestion | null>(null);

  useEffect(() => {
    const found = getQuestion(questionId);
    if (!found) navigate({ to: "/admin/questions" });
    else setQ(found);
  }, [questionId, navigate]);

  if (!q) return null;

  return (
    <AdminShell title="Edit Question" description="Update this question in the question bank.">
      <div className="admin-card">
        <QuestionForm
          initial={q}
          onSubmit={(data) => {
            updateQuestion(q.id, data);
            navigate({ to: "/admin/questions" });
          }}
          onCancel={() => navigate({ to: "/admin/questions" })}
        />
      </div>
    </AdminShell>
  );
}
