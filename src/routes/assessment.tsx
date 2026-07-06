import { createFileRoute, useNavigate } from "@tanstack/react-router";
import "../styles/theme.css";
import { Logo } from "../components/Logo";

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
  component: AssessmentIntro,
});

function AssessmentIntro() {
  const navigate = useNavigate();
  return (
    <main className="auth-shell">
      <section className="card" aria-labelledby="as-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="as-title">Ready to Begin?</h1>
          <p>
            Your personalized literacy assessment will help us recommend the right learning path for
            you.
          </p>
        </div>

        <button className="btn btn-accent" onClick={() => navigate({ to: "/dashboard" })}>
          Start Assessment
        </button>
      </section>
    </main>
  );
}
