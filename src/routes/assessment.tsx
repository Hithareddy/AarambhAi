import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "../styles/theme.css";
import "../styles/learner.css";
import { Logo } from "../components/Logo";
import { hasCompletedAssessment } from "../services/assessment";
import { getCurrentUser } from "../services/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Start Assessment — Aarambh AI" },
      {
        name: "description",
        content:
          "Take a short personalized literacy assessment so Aarambh AI can recommend the right learning path.",
      },
    ],
  }),
  component: () => (<RequireAuth><AssessmentIntro /></RequireAuth>),
});

function AssessmentIntro() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getCurrentUser()) navigate({ to: "/login" });
    else if (hasCompletedAssessment()) navigate({ to: "/dashboard" });
  }, [navigate]);

  return (
    <main className="auth-shell">
      <section className="card card-wide" aria-labelledby="as-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="as-title">Ready to Begin?</h1>
          <p>
            Your personalized literacy assessment will help us recommend the right learning path
            for you. It has about 10 short questions and takes just a few minutes.
          </p>
        </div>

        <div className="chip-row" style={{ justifyContent: "center", marginBottom: "1.25rem" }}>
          <span className="chip">📝 10 questions</span>
          <span className="chip">⏱ ~5 minutes</span>
          <span className="chip">🧠 Adaptive</span>
        </div>

        <button className="btn btn-accent" onClick={() => navigate({ to: "/assessment-quiz" })}>
          Start Assessment
        </button>
        <p className="foot-link">
          Don't worry — this isn't a test. It just helps us understand where you'd like to begin.
        </p>
      </section>
    </main>
  );
}
