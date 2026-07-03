import { createFileRoute, Link } from "@tanstack/react-router";
import "../styles/theme.css";
import "../styles/welcome.css";
import logo from "../assets/logo.png";
import hero from "../assets/hero-illustration.jpg";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Aarambh AI — Begin Learning, Anytime" },
      {
        name: "description",
        content:
          "A simple, friendly AI-powered learning companion helping senior citizens and first-generation learners improve reading, writing, and digital literacy.",
      },
      { property: "og:title", content: "Aarambh AI — Begin Learning, Anytime" },
      {
        property: "og:description",
        content:
          "Friendly AI-powered literacy support for senior citizens and first-generation learners.",
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <main className="welcome-shell">
      <div className="welcome-grid">
        <div>
          <span className="welcome-brand">
            <img src={logo} alt="Aarambh AI logo" width={64} height={64} />
            <span>Aarambh AI</span>
          </span>
          <h1 className="welcome-title">Aarambh AI</h1>
          <p className="welcome-tagline">Begin Learning, Anytime</p>
          <p className="welcome-desc">
            A simple and friendly learning companion designed to help senior
            citizens and first-generation learners improve reading, writing, and
            digital literacy through personalized AI-powered learning.
          </p>
          <div className="welcome-actions">
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Create Account
            </Link>
          </div>
        </div>

        <div className="welcome-illustration">
          <img
            src={hero}
            alt="An elderly learner smiling while using a tablet with a friendly AI assistant"
            width={1280}
            height={1024}
          />
        </div>
      </div>
    </main>
  );
}
