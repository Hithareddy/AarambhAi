import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser } from "../services/auth";
import { getRole, type AppRole } from "../services/role";

interface Props {
  children: ReactNode;
  role?: AppRole;
}

/**
 * Reusable client-side route guard.
 * - Redirects unauthenticated users to /login.
 * - Redirects learners away from admin-only routes to /dashboard.
 */
export function RequireAuth({ children, role = "learner" }: Props) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const current = getRole();
    if (role === "admin" && current !== "admin") {
      navigate({ to: "/dashboard" });
      return;
    }
    setReady(true);
  }, [navigate, role]);

  if (!ready) return null;
  return <>{children}</>;
}
