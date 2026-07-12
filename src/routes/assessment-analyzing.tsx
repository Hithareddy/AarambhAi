import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import "../styles/theme.css";
import "../styles/learner.css";
import { finalizeSession, getActiveSessionId } from "../services/assessment";

const searchSchema = z.object({ s: z.string().optional() });

export const Route = createFileRoute("/assessment-analyzing")({
  head: () => ({ meta: [{ title: "Analyzing — Aarambh AI" }] }),
  validateSearch: searchSchema,
  component: () => (<RequireAuth><AnalyzingPage /></RequireAuth>),
});

function AnalyzingPage() {
  const navigate = useNavigate();
  const { s } = Route.useSearch();

  useEffect(() => {
    const id = s ?? getActiveSessionId();
    if (!id) { navigate({ to: "/assessment" }); return; }
    let done = false;
    try {
      finalizeSession(id);
    } catch {
      navigate({ to: "/assessment" });
      return;
    }
    const t = setTimeout(() => {
      if (!done) navigate({ to: "/assessment-results" });
    }, 1800);
    return () => { done = true; clearTimeout(t); };
  }, [s, navigate]);

  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="analyzing">
          <div className="spinner" />
          <h1>Analyzing your responses…</h1>
          <p className="muted">
            We're reviewing all four skills to recommend the best next step for you.
          </p>
        </div>
      </main>
    </div>
  );
}
