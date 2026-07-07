import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { Logo } from "./Logo";
import { getCurrentUser, logout, type PublicUser } from "../services/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/learning-path", label: "Learning Path" },
  { to: "/progress", label: "Progress" },
  { to: "/tutor", label: "AI Tutor" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate({ to: "/login" });
      return;
    }
    setUser(u);
  }, [navigate]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!user) return null;

  const onLogout = () => {
    logout();
    navigate({ to: "/welcome" });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/dashboard" className="app-brand" aria-label="Aarambh AI home">
          <Logo withName />
        </Link>
        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
        <nav className={`app-nav${menuOpen ? " open" : ""}`} aria-label="Main navigation">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="nav-link"
              activeProps={{ className: "nav-link active" }}
            >
              {n.label}
            </Link>
          ))}
          <button className="nav-logout" onClick={onLogout}>
            Sign Out
          </button>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
