import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { useI18n } from "../i18n";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Aarambh AI" }] }),
  component: AdminPlaceholder,
});

function AdminPlaceholder() {
  const { t } = useI18n();
  return (
    <main className="auth-shell" style={{ padding: "2rem 1rem" }}>
      <section className="card" style={{ maxWidth: 520, textAlign: "center" }}>
        <div className="card-header">
          <Logo withName />
          <h1 style={{ marginTop: "1rem" }}>{t("role.admin")}</h1>
        </div>
        <div style={{ padding: "1.5rem 0", fontSize: "3rem" }}>🚧</div>
        <p style={{ fontSize: "1.05rem" }}>{t("role.admin.soon")}</p>
        <div style={{ marginTop: "1.5rem" }}>
          <Link to="/role-select" className="btn btn-secondary" style={{ textDecoration: "none" }}>
            ← {t("ctl.back")}
          </Link>
        </div>
      </section>
    </main>
  );
}
