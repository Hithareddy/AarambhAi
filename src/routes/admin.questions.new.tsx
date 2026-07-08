import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "../styles/admin.css";
import { AdminShell } from "../components/AdminShell";
import { RequireAuth } from "../components/RequireAuth";
import { QuestionForm } from "../components/QuestionForm";
import { createQuestion } from "../services/adminMock";

export const Route = createFileRoute("/admin/questions/new")({
  head: () => ({ meta: [{ title: "New Question — Admin" }] }),
  component: () => (
    <RequireAuth role="admin">
      <NewQuestionPage />
    </RequireAuth>
  ),
});

function NewQuestionPage() {
  const navigate = useNavigate();
  return (
    <AdminShell title="Add Question" description="Create a new question for the question bank.">
      <div className="admin-card">
        <QuestionForm
          onSubmit={(data) => {
            createQuestion(data);
            navigate({ to: "/admin/questions" });
          }}
          onCancel={() => navigate({ to: "/admin/questions" })}
        />
      </div>
    </AdminShell>
  );
}
