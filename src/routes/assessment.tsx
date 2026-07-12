import { RequireAuth } from "../components/RequireAuth";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import "../styles/theme.css";
import "../styles/learner.css";
import { Logo } from "../components/Logo";
import {
  DEFAULT_PROFILE,
  getAssessmentResult,
  getLearnerProfile,
  hasCompletedAssessment,
  saveLearnerProfile,
  startAssessmentSession,
  type LearnerProfile,
  type SkillLevel,
} from "../services/assessment";
import { SkillResultCard } from "../components/SkillResultCard";
import { getCurrentUser } from "../services/auth";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — Aarambh AI" },
      {
        name: "description",
        content:
          "Take or retake your LSRW (Listening, Speaking, Reading, Writing) assessment to personalize your learning path.",
      },
    ],
  }),
  component: () => (<RequireAuth><AssessmentIntro /></RequireAuth>),
});

const AGE_GROUPS = ["Under 18", "18-24", "25-34", "35-49", "50-64", "65+"];
const EDU_LEVELS = ["No formal schooling", "Primary", "High School", "Undergraduate", "Postgraduate"];
const LANGUAGES = ["English", "Hindi", "Telugu"];
const LEVELS: SkillLevel[] = ["Beginner", "Elementary", "Intermediate", "Advanced"];

function AssessmentIntro() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearnerProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const previous = hasCompletedAssessment() ? getAssessmentResult() : null;
  const isReturning = !!previous;

  useEffect(() => {
    if (!getCurrentUser()) { navigate({ to: "/login" }); return; }
    setProfile(getLearnerProfile());
  }, [navigate]);

  const updateProfile = <K extends keyof LearnerProfile>(k: K, v: LearnerProfile[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
  };

  const start = () => {
    saveLearnerProfile(profile);
    const session = startAssessmentSession(profile);
    navigate({ to: "/assessment-quiz", search: { s: session.id } });
  };

  return (
    <main className="app-shell">
      <div className="app-main">
        <div className="panel" style={{ textAlign: "center" }}>
          <Logo withName />
          <h1 style={{ marginTop: "0.75rem" }}>
            {isReturning ? "Retake your assessment" : "Ready to begin?"}
          </h1>
          <p className="muted" style={{ maxWidth: 620, margin: "0.5rem auto 0" }}>
            This short assessment covers all four language skills — Listening, Speaking, Reading and
            Writing. It helps us recommend the best starting point for you.
          </p>
          <div className="chip-row" style={{ justifyContent: "center", marginTop: "1rem" }}>
            <span className="chip">🎧 Listening</span>
            <span className="chip">🎤 Speaking</span>
            <span className="chip">📖 Reading</span>
            <span className="chip">✍️ Writing</span>
          </div>
        </div>

        {isReturning && previous ? (
          <div className="panel">
            <div className="panel-header">
              <div>
                <h2 style={{ margin: 0 }}>Your latest results</h2>
                <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                  Taken on {new Date(previous.completedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="chip chip-strong">Overall: {previous.overallLevel ?? previous.level}</div>
            </div>
            <div className="skill-result-grid">
              {(previous.skillOutcomes ?? []).map((o) => (
                <SkillResultCard key={o.skill} outcome={o} />
              ))}
            </div>
            <div className="quiz-actions" style={{ marginTop: "1rem" }}>
              <Link to="/assessment-results" className="btn btn-secondary">
                View Full Results
              </Link>
            </div>
          </div>
        ) : null}

        <div className="panel">
          <div className="panel-header">
            <h2 style={{ margin: 0 }}>Confirm your details</h2>
            <button className="btn-ghost" onClick={() => setEditing((e) => !e)}>
              {editing ? "Done" : "Edit"}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 0 }}>
            We use these details to tailor the assessment to you. You can update them anytime.
          </p>

          <div className="profile-grid">
            <ProfileField label="Age group" editing={editing} value={profile.ageGroup}
              options={AGE_GROUPS} onChange={(v) => updateProfile("ageGroup", v)} />
            <ProfileField label="Education level" editing={editing} value={profile.educationLevel}
              options={EDU_LEVELS} onChange={(v) => updateProfile("educationLevel", v)} />
            <ProfileField label="Preferred language" editing={editing} value={profile.language}
              options={LANGUAGES} onChange={(v) => updateProfile("language", v)} />
            <ProfileField label="Self-reported proficiency" editing={editing}
              value={profile.selfProficiency} options={LEVELS}
              onChange={(v) => updateProfile("selfProficiency", v as SkillLevel)} />
            <div className="profile-field profile-field-wide">
              <label htmlFor="goal">Learning goal</label>
              {editing ? (
                <input id="goal" className="input" value={profile.learningGoal}
                  onChange={(e) => updateProfile("learningGoal", e.target.value)} />
              ) : (
                <div className="profile-value">{profile.learningGoal || "—"}</div>
              )}
            </div>
          </div>
        </div>

        <div className="panel" style={{ textAlign: "center" }}>
          <button className="btn btn-primary" style={{ width: "auto", padding: "0.9rem 2rem" }} onClick={start}>
            {isReturning ? "Retake Assessment" : "Start Assessment"}
          </button>
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            {isReturning
              ? "Retaking will save a new result — your previous results are kept."
              : "Don't worry — this isn't a graded test."}
          </p>
        </div>
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  editing: boolean;
  options: string[];
  onChange: (v: string) => void;
}
function ProfileField({ label, value, editing, options, onChange }: FieldProps) {
  return (
    <div className="profile-field">
      <label>{label}</label>
      {editing ? (
        <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className="profile-value">{value || "—"}</div>
      )}
    </div>
  );
}
