import { SKILLS, SKILL_ICON, SKILL_LABEL, type Skill } from "../services/assessment";

interface Props {
  counts: Record<Skill, { asked: number; total: number }>;
  currentSkill: Skill;
}

export function SkillProgressPanel({ counts, currentSkill }: Props) {
  return (
    <div className="skill-panel" aria-label="Skill progress">
      {SKILLS.map((skill) => {
        const { asked, total } = counts[skill];
        const percent = total ? Math.round((asked / total) * 100) : 0;
        const status = asked === 0 ? "Not started" : asked >= total ? "Done" : "In progress";
        const isCurrent = currentSkill === skill;
        return (
          <div key={skill} className={`skill-row${isCurrent ? " is-current" : ""}`}>
            <div className="skill-row-head">
              <span className="skill-icon" aria-hidden>{SKILL_ICON[skill]}</span>
              <span className="skill-name">{SKILL_LABEL[skill]}</span>
              <span className="skill-meta">{asked}/{total}</span>
            </div>
            <div className="progress-bar" aria-hidden>
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="skill-status">{status}</div>
          </div>
        );
      })}
    </div>
  );
}
