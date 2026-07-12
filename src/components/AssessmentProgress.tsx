import { SKILL_ICON, SKILL_LABEL, type Skill } from "../services/assessment";

interface Props {
  currentIndex: number;   // 0-based
  total: number;
  currentSkill: Skill;
}

export function AssessmentProgress({ currentIndex, total, currentSkill }: Props) {
  const answered = currentIndex; // questions completed before this one
  const percent = total ? Math.round((answered / total) * 100) : 0;

  return (
    <div className="assessment-progress" aria-live="polite">
      <div className="ap-top">
        <div className="ap-skill">
          <span className="ap-skill-icon" aria-hidden>{SKILL_ICON[currentSkill]}</span>
          <div>
            <div className="stat-label">Current skill</div>
            <div className="ap-skill-name">{SKILL_LABEL[currentSkill]}</div>
          </div>
        </div>
        <div className="ap-count">
          Question {Math.min(currentIndex + 1, total)} of {total}
        </div>
      </div>
      <div className="progress-bar" aria-hidden>
        <span style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-label">
        <span>Overall progress</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}
