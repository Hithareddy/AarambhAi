import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import "../styles/theme.css";
import { Logo } from "../components/Logo";
import { getCurrentUser, updateProfile, type LearnerType } from "../services/auth";

export const Route = createFileRoute("/profile-setup")({
  head: () => ({
    meta: [
      { title: "Profile Setup — Aarambh AI" },
      {
        name: "description",
        content: "Set up your Aarambh AI profile to personalize your learning experience.",
      },
    ],
  }),
  component: ProfileSetupPage,
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
const LANGUAGES = ["English", "Telugu", "Hindi", "Tamil", "Kannada"];

function ProfileSetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("English");
  const [educationLevel, setEducationLevel] = useState("");
  const [learnerType, setLearnerType] = useState<LearnerType | "">("");

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      navigate({ to: "/login" });
      return;
    }

    setName(user.full_name || "");
    setLanguage(user.preferred_language || "English");
    setEducationLevel(user.education_level || "");
    setLearnerType((user.learner_type as LearnerType) || "");
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updatedUser = await updateProfile({
      full_name: name.trim(),
      preferred_language: language,
      education_level: educationLevel,
      learner_type: learnerType,
    });

    if (!updatedUser) {
      return;
    }

    navigate({ to: "/assessment" });
  };

  return (
    <main className="auth-shell">
      <section className="card card-wide" aria-labelledby="ps-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="ps-title">Welcome to Aarambh AI!</h1>
          <p>Confirm your details so we can personalize your learning.</p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="ps-name">Name</label>
            <input
              id="ps-name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label htmlFor="ps-lang">Preferred Language</label>
              <select
                id="ps-lang"
                className="select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="ps-edu">Education Level</label>
              <select
                id="ps-edu"
                className="select"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                required
              >
                <option value="">Select an option</option>
                {EDUCATION_LEVELS.map((lv) => (
                  <option key={lv}>{lv}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="ps-learner">Learner Type</label>
            <select
              id="ps-learner"
              className="select"
              value={learnerType}
              onChange={(e) => setLearnerType(e.target.value as LearnerType)}
              required
            >
              <option value="">Select an option</option>
              {LEARNER_TYPES.map((lt) => (
                <option key={lt}>{lt}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            Continue
          </button>
        </form>
      </section>
    </main>
  );
}
