import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { useI18n, LOCALES, type Locale } from "../i18n";

export const Route = createFileRoute("/role-select")({
  head: () => ({ meta: [{ title: "Welcome — Aarambh AI" }] }),
  component: RoleSelectPage,
});

function RoleSelectPage() {
  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();

  return (
    <main className="auth-shell" style={{ padding: "2rem 1rem" }}>
      <section className="card" aria-labelledby="rs-title" style={{ maxWidth: 560 }}>
        <div className="card-header" style={{ textAlign: "center" }}>
          <Logo withName />
          <h1 id="rs-title" style={{ marginTop: "1rem" }}>{t("role.title")}</h1>
          <p>{t("role.subtitle")}</p>
        </div>

        <div style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate({ to: "/welcome" })}
            style={{ padding: "1rem", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto" }}
          >
            <strong style={{ fontSize: "1.05rem" }}>🎓 {t("role.learner")}</strong>
            <span style={{ fontWeight: 400, opacity: 0.92, fontSize: "0.9rem", marginTop: 4 }}>
              {t("role.learner.desc")}
            </span>
          </button>

          <Link
            to="/admin"
            className="btn btn-secondary"
            style={{ padding: "1rem", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}
          >
            <strong style={{ fontSize: "1.05rem" }}>🛠 {t("role.admin")}</strong>
            <span style={{ fontWeight: 400, opacity: 0.85, fontSize: "0.9rem", marginTop: 4 }}>
              {t("role.admin.desc")}
            </span>
          </Link>
        </div>

        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <label htmlFor="lang" style={{ fontSize: "0.85rem", color: "var(--color-muted, #64748b)", marginRight: 8 }}>
            🌐 {t("nav.language")}:
          </label>
          <select
            id="lang"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            style={{ padding: "0.4rem 0.6rem", borderRadius: 8, border: "1px solid var(--color-border, #e2e8f0)" }}
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>{l.native}</option>
            ))}
          </select>
        </div>
      </section>
    </main>
  );
}
