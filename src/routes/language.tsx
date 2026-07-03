import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import "../styles/theme.css";
import "../styles/language.css";
import { Logo } from "../components/Logo";
import { getItem, setItem, StorageKeys } from "../utils/storage";

export const Route = createFileRoute("/language")({
  head: () => ({
    meta: [
      { title: "Choose Your Language — Aarambh AI" },
      {
        name: "description",
        content:
          "Select your preferred language to start learning with Aarambh AI, a friendly AI-powered literacy companion.",
      },
    ],
  }),
  component: LanguagePage,
});

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

function LanguagePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>(
    () => getItem<string>(StorageKeys.language) ?? "en",
  );

  const onContinue = () => {
    const chosen = LANGUAGES.find((l) => l.code === selected) ?? LANGUAGES[0];
    setItem(StorageKeys.language, chosen.label);
    navigate({ to: "/welcome" });
  };

  return (
    <main className="auth-shell">
      <section className="card" aria-labelledby="lang-title">
        <div className="card-header">
          <Logo withName />
          <h1 id="lang-title">Choose Your Preferred Language</h1>
          <p>You can change this later from your profile.</p>
        </div>

        <div className="lang-list" role="radiogroup" aria-labelledby="lang-title">
          {LANGUAGES.map((lang) => {
            const active = selected === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={active}
                className={`lang-option${active ? " active" : ""}`}
                onClick={() => setSelected(lang.code)}
              >
                <span>{lang.label}</span>
                <span className="lang-native">{lang.native}</span>
              </button>
            );
          })}
        </div>

        <button className="btn btn-primary" onClick={onContinue}>
          Continue
        </button>
      </section>
    </main>
  );
}
