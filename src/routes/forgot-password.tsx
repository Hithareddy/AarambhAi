import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { isValidEmail, requestPasswordReset } from "../services/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — Aarambh AI" },
      { name: "description", content: "Reset your Aarambh AI password with a secure link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Email is required.");
    if (!isValidEmail(email)) return setError("Please enter a valid email address.");
    const res = await requestPasswordReset(email);
    if (!res.ok) return setError(res.error);
    setSent(true);
  };

  return (
    <main className="auth-shell">
      <section className="card" aria-labelledby="fp-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="fp-title">Reset your password</h1>
          <p>We'll email you a secure link to set a new password.</p>
        </div>

        {sent ? (
          <>
            <div className="alert alert-success" role="status">
              A password reset link has been sent to <strong>{email}</strong>. Please check your
              inbox and spam folder.
            </div>
            <Link to="/login" className="btn btn-primary">
              Back to Login
            </Link>
          </>
        ) : (
          <form noValidate onSubmit={onSubmit}>
            {error ? (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            ) : null}
            <div className="field">
              <label htmlFor="fp-email">Email</label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                className={`input${error ? " invalid" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Send Reset Link
            </button>
            <p className="foot-link">
              <Link to="/login">← Back to Login</Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
