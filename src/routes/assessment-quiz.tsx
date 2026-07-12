import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import "../styles/theme.css";
import "../styles/learner.css";
import {
  abandonSession,
  getActiveSessionId,
  getSession,
  submitAnswer,
  type AnswerResponse,
  type AssessmentSession,
  type Question,
} from "../services/assessment";
import { AssessmentProgress } from "../components/AssessmentProgress";
import { SkillProgressPanel } from "../components/SkillProgressPanel";
import { ListeningQuestion } from "../components/questions/ListeningQuestion";
import { SpeakingQuestion } from "../components/questions/SpeakingQuestion";
import { ReadingQuestion } from "../components/questions/ReadingQuestion";
import { WritingQuestion } from "../components/questions/WritingQuestion";

const searchSchema = z.object({ s: z.string().optional() });

export const Route = createFileRoute("/assessment-quiz")({
  head: () => ({ meta: [{ title: "Assessment — Aarambh AI" }] }),
  validateSearch: searchSchema,
  component: () => (<RequireAuth><AssessmentQuizPage /></RequireAuth>),
});

function AssessmentQuizPage() {
  const navigate = useNavigate();
  const { s: searchSessionId } = Route.useSearch();
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const id = searchSessionId ?? getActiveSessionId();
    if (!id) { navigate({ to: "/assessment" }); return; }
    const s = getSession(id);
    if (!s) { navigate({ to: "/assessment" }); return; }
    if (s.status !== "active") {
      navigate({ to: "/assessment-analyzing", search: { s: s.id } });
      return;
    }
    setSession(s);
  }, [searchSessionId, navigate]);

  if (!session) return null;

  const question = session.plan[session.currentIndex];
  if (!question) {
    navigate({ to: "/assessment-analyzing", search: { s: session.id } });
    return null;
  }

  const handleSubmit = (response: AnswerResponse) => {
    setSubmitting(true);
    setStatus("Response recorded. Selecting your next question…");
    // Slight delay for UX; keeps intent clear that a next question is being chosen.
    setTimeout(() => {
      const result = submitAnswer(session.id, response);
      if (result.done) {
        navigate({ to: "/assessment-analyzing", search: { s: session.id } });
        return;
      }
      setSession({ ...result.session });
      setSubmitting(false);
      setStatus(null);
    }, 600);
  };

  const doExit = () => {
    abandonSession(session.id);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="quiz-topbar">
          <div />
          <button className="btn-ghost" onClick={() => setConfirmExit(true)}>
            Exit Assessment
          </button>
        </div>

        <div className="quiz-layout">
          <aside className="quiz-side">
            <SkillProgressPanel counts={session.skillCounts} currentSkill={question.skill} />
          </aside>

          <section className="quiz-main">
            <AssessmentProgress
              currentIndex={session.currentIndex}
              total={session.plan.length}
              currentSkill={question.skill}
            />

            <div className="q-card">
              {renderQuestion(question, submitting, handleSubmit)}
              {status ? (
                <div className="quiz-status" role="status" aria-live="polite">
                  <div className="spinner spinner-sm" aria-hidden />
                  <span>{status}</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        {confirmExit ? (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal">
              <h3>Exit assessment?</h3>
              <p>Your current progress will not be saved as a result. You can start again anytime from Assessment.</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setConfirmExit(false)}>
                  Continue
                </button>
                <button className="btn btn-primary" onClick={doExit}>
                  Exit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function renderQuestion(
  q: Question,
  disabled: boolean,
  onSubmit: (r: AnswerResponse) => void,
) {
  switch (q.type) {
    case "listening_mcq":
      return (
        <ListeningQuestion
          question={q}
          disabled={disabled}
          onSubmit={(i) => onSubmit({ kind: "mcq", selectedIndex: i })}
        />
      );
    case "speaking_prompt":
      return (
        <SpeakingQuestion
          question={q}
          disabled={disabled}
          onSubmit={(p) => onSubmit({ kind: "speech", transcript: p.transcript, durationMs: p.durationMs })}
        />
      );
    case "reading_mcq":
      return (
        <ReadingQuestion
          question={q}
          disabled={disabled}
          onSubmit={(i) => onSubmit({ kind: "mcq", selectedIndex: i })}
        />
      );
    case "writing_prompt":
      return (
        <WritingQuestion
          question={q}
          disabled={disabled}
          onSubmit={(p) => onSubmit({ kind: "writing", text: p.text, wordCount: p.wordCount })}
        />
      );
  }
}
