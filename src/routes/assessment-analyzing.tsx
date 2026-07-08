import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { AdaptiveAssessment } from "../services/assessment";

export const Route = createFileRoute("/assessment-analyzing")({
  head: () => ({ meta: [{ title: "Analyzing — Aarambh AI" }] }),
  component: () => (<RequireAuth><AnalyzingPage /></RequireAuth>),
});

function AnalyzingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const inst = (window as unknown as { __aarambhAssessment?: AdaptiveAssessment })
      .__aarambhAssessment;
    if (inst) {
      inst.finalize();
    }
    const t = setTimeout(() => {
      navigate({ to: "/assessment-results" });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="analyzing">
          <div className="spinner" />
          <h1>Analyzing your answers...</h1>
          <p className="muted">
            We're identifying your strengths and the best place for you to begin.
          </p>
        </div>
      </main>
    </div>
  );
}
