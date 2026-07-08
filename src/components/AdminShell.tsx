import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles/admin.css";
import { Logo } from "./Logo";
import { logout } from "../services/auth";
import { setRole } from "../services/role";

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/questions", label: "Questions" },
  { to: "/admin/content", label: "Content" },
  { to: "/admin/learners", label: "Learners" },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const onLogout = () => {
    logout();
    navigate({ to: "/welcome" });
  };

  const backToLearner = () => {
    setRole("learner");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <Logo />
          <span>Aarambh Admin</span>
        </Link>
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`admin-link${active ? " active" : ""}`}
            >
              {n.label}
            </Link>
          );
        })}
        <div className="admin-foot">
          <span>Signed in as Admin</span>
          <button onClick={backToLearner}>Switch to Learner</button>
          <button onClick={onLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <div>
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </div>
        {children}
      </main>
    </div>
  );
}
