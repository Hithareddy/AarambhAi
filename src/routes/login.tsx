import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { isValidEmail } from "../services/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Aarambh AI" },
      {
        name: "description",
        content: "Sign in to continue your learning journey with Aarambh AI.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const next: typeof errors = {};

    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!password) {
      next.password = "Password is required.";
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch("https://tender-phones-grin.loca.lt/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          form: data.detail || "Login failed.",
        });
        return;
      }

      localStorage.setItem("aarambh.accessToken", data.access_token);

      localStorage.setItem("aarambh.user", JSON.stringify(data.user));

      navigate({
        to: data.user.profile_completed ? "/assessment" : "/profile-setup",
      });
    } catch {
      setErrors({
        form: "Unable to connect to the server.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="card" aria-labelledby="login-title">
        <div className="card-header">
          <Logo withName />

          <h1 id="login-title">Welcome back</h1>

          <p>Sign in to continue your learning journey.</p>
        </div>

        {errors.form ? (
          <div className="alert alert-error" role="alert">
            {errors.form}
          </div>
        ) : null}

        <form noValidate onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`input${errors.email ? " invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="you@example.com"
            />

            {errors.email ? (
              <div id="email-error" className="error">
                {errors.email}
              </div>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>

            <div className="input-wrap">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                className={`input${errors.password ? " invalid" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />

              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            {errors.password ? (
              <div id="password-error" className="error">
                {errors.password}
              </div>
            ) : null}
          </div>

          <div className="row-between">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="foot-link">
          New to Aarambh AI? <Link to="/register">Create an account</Link>
        </p>

        <p className="foot-link">
          <Link to="/welcome">← Back to Home</Link>
        </p>
      </section>
    </main>
  );
}
