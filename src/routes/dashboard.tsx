import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { getCurrentUser, type PublicUser } from "../services/auth";
import { removeItem, StorageKeys } from "../utils/storage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aarambh AI" },
      { name: "description", content: "Your personalized Aarambh AI learning dashboard." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) navigate({ to: "/login" });
    else setUser(current);
  }, [navigate]);

  const signOut = () => {
    removeItem(StorageKeys.session);
    removeItem(StorageKeys.user);
    navigate({ to: "/welcome" });
  };

  if (!user) return null;

  return (
    <main className="auth-shell">
      <section className="card card-wide" aria-labelledby="dash-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="dash-title">Hello, {user.full_name.split(" ")[0]} 👋</h1>
          <p>
            Your learning journey begins here. This is a placeholder dashboard — your lessons and
            recommendations will appear here.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={signOut}>
          Sign Out
        </button>
      </section>
    </main>
  );
}
