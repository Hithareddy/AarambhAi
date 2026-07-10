import { createFileRoute, Navigate } from "@tanstack/react-router";
import { isAuthenticated } from "../services/auth";
import { hasCompletedAssessment } from "../services/assessment";

export const Route = createFileRoute("/")({
  component: RootIndex,
});

function RootIndex() {
  if (typeof window === "undefined") return null;
  if (isAuthenticated()) {
    return <Navigate to={hasCompletedAssessment() ? "/dashboard" : "/assessment"} />;
  }
  return <Navigate to="/role-select" />;
}
