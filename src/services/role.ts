// Development-only mock role mechanism.
// Replace `getRole()` implementation with the role returned by the FastAPI
// backend once the backend exposes it (e.g. via /auth/me or a JWT claim).
import { getItem, removeItem, setItem } from "../utils/storage";

export type AppRole = "learner" | "admin";

const ROLE_KEY = "aarambh.role";

export function getRole(): AppRole {
  const r = getItem<AppRole>(ROLE_KEY);
  return r === "admin" ? "admin" : "learner";
}

export function setRole(role: AppRole): void {
  setItem(ROLE_KEY, role);
}

export function clearRole(): void {
  removeItem(ROLE_KEY);
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}
