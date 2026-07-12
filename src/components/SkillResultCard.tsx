import { SKILL_ICON, SKILL_LABEL, type SkillOutcome } from "../services/assessment";

interface Props {
  outcome: SkillOutcome;
}

export function SkillResultCard({ outcome }: Props) {
  const scoreLabel = outcome.score == null
    ? "Response recorded"
    : `${Math.round(outcome.score * 100)}% accuracy`;

  return (
    <div className="skill-result-card">
      <div className="src-head">
        <span className="src-icon" aria-hidden>{SKILL_ICON[outcome.skill]}</span>
        <div>
          <div className="stat-label">{SKILL_LABEL[outcome.skill]}</div>
          <div className="src-level">{outcome.level}</div>
        </div>
      </div>
      <div className="src-meta">
        <span>{outcome.asked} question{outcome.asked === 1 ? "" : "s"}</span>
        <span>{scoreLabel}</span>
      </div>
    </div>
  );
}
