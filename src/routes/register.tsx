import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import {
  isValidEmail,
  passwordStrength,
  type LearnerType,
} from "../services/auth";
import { getItem, StorageKeys } from "../utils/storage";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — Aarambh AI" },
      {
        name: "description",
        content: "Create your Aarambh AI account and begin your personalized literacy journey.",
      },
    ],
  }),
  component: RegisterPage,
});

const EDUCATION_LEVELS = [
  "No formal education",
  "Primary",
  "Secondary",
  "Higher Secondary",
  "Graduate",
  "Postgraduate",
];

const LEARNER_TYPES: LearnerType[] = [
  "Student",
  "Senior Citizen",
  "First-Generation Learner",
  "Discontinued Learner",
];

function RegisterPage() {
  const navigate = useNavigate();
  const preferredLanguage = getItem<string>(StorageKeys.language) ?? "English";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [learnerType, setLearnerType] = useState<LearnerType | "">("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    const ageNum = Number(age);
    if (!age) next.age = "Age is required.";
    else if (!Number.isFinite(ageNum) || ageNum < 5 || ageNum > 120)
      next.age = "Please enter a valid age.";
    if (!educationLevel) next.educationLevel = "Please select your education level.";
    if (!learnerType) next.learnerType = "Please select a learner type.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
setFormError(null);

try {
  const response = await fetch("http://127.0.0.1:8000/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      preferred_language: preferredLanguage,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setFormError(data.detail || "Registration failed.");
    return;
  }

  navigate({ to: "/profile-setup" });
} catch {
  setFormError("Unable to connect to the server.");
} finally {
  setSubmitting(false);
}

  return (
    <main className="auth-shell">
      <section className="card card-wide" aria-labelledby="register-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="register-title">Create your account</h1>
          <p>It only takes a minute to get started.</p>
        </div>

        {formError ? (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        ) : null}

        <form noValidate onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={`input${errors.fullName ? " invalid" : ""}`}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              aria-invalid={!!errors.fullName}
            />
            {errors.fullName ? <div className="error">{errors.fullName}</div> : null}
          </div>

          <div className="field">
            <label htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              className={`input${errors.email ? " invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email ? <div className="error">{errors.email}</div> : null}
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <div className="input-wrap">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  className={`input${errors.password ? " invalid" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby="pw-strength"
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
              {password ? (
                <div id="pw-strength" className="strength" aria-live="polite">
                  <div className="strength-bar">
                    <span
                      style={{
                        width: `${(strength.score / 4) * 100}%`,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <div className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </div>
                </div>
              ) : (
                <div className="hint">At least 8 characters. Mix letters, numbers & symbols.</div>
              )}
              {errors.password ? <div className="error">{errors.password}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className={`input${errors.confirm ? " invalid" : ""}`}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={!!errors.confirm}
              />
              {errors.confirm ? <div className="error">{errors.confirm}</div> : null}
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                min={5}
                max={120}
                inputMode="numeric"
                className={`input${errors.age ? " invalid" : ""}`}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                aria-invalid={!!errors.age}
              />
              {errors.age ? <div className="error">{errors.age}</div> : null}
            </div>

            <div className="field">
              <label htmlFor="gender">Gender (Optional)</label>
              <select
                id="gender"
                className="select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option>Female</option>
                <option>Male</option>
                <option>Non-binary</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="edu">Education Level</label>
              <select
                id="edu"
                className={`select${errors.educationLevel ? " invalid" : ""}`}
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                aria-invalid={!!errors.educationLevel}
              >
                <option value="">Select an option</option>
                {EDUCATION_LEVELS.map((lv) => (
                  <option key={lv}>{lv}</option>
                ))}
              </select>
              {errors.educationLevel ? (
                <div className="error">{errors.educationLevel}</div>
              ) : null}
            </div>

            <div className="field">
              <label htmlFor="learner">Learner Type</label>
              <select
                id="learner"
                className={`select${errors.learnerType ? " invalid" : ""}`}
                value={learnerType}
                onChange={(e) => setLearnerType(e.target.value as LearnerType)}
                aria-invalid={!!errors.learnerType}
              >
                <option value="">Select an option</option>
                {LEARNER_TYPES.map((lt) => (
                  <option key={lt}>{lt}</option>
                ))}
              </select>
              {errors.learnerType ? <div className="error">{errors.learnerType}</div> : null}
            </div>
          </div>

          <div className="field">
            <label htmlFor="lang">Preferred Language</label>
            <input id="lang" className="input" value={preferredLanguage} readOnly />
            <div className="hint">
              You chose this earlier — <Link to="/language">change language</Link>.
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="foot-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}
