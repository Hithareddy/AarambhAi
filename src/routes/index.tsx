import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getItem, StorageKeys } from "../utils/storage";

export const Route = createFileRoute("/")({
  component: RootIndex,
});

function RootIndex() {
  // First-time visitors go through language selection; returning visitors
  // land on the welcome screen.
  const hasLanguage = typeof window !== "undefined" && getItem<string>(StorageKeys.language);
  return <Navigate to={hasLanguage ? "/welcome" : "/language"} />;
}
