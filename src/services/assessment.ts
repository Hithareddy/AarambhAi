// Adaptive LSRW Assessment service (frontend-only stub).
// The real adaptive/AI logic will replace this module; the shape below is
// designed so a backend can drop in without changing UI components.
//
// - Sessions are addressed by `assessmentSessionId` and persisted to
//   localStorage so a session can be resumed after refresh.
// - Speaking/Writing are NOT scored in the frontend — we only record the
//   learner's response and mark the question answered.
// - The legacy `AssessmentResult` fields (level/accuracy/strengths/
//   weaknesses/topicBreakdown/recommendedStart) are preserved for
//   compatibility with `learning.ts` and the existing dashboard.

import { getItem, setItem, removeItem, StorageKeys as BaseKeys } from "../utils/storage";

/* ---------- Storage keys ---------- */
const KEYS = {
  ...BaseKeys,
  learnerProfile: "aarambh.assessment.learnerProfile",
  sessionPrefix: "aarambh.assessment.session.",
  activeSession: "aarambh.assessment.activeSessionId",
  history: "aarambh.assessment.history",
} as const;

/* ---------- Types ---------- */
export type Skill = "listening" | "speaking" | "reading" | "writing";
export const SKILLS: Skill[] = ["listening", "speaking", "reading", "writing"];
export const SKILL_LABEL: Record<Skill, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
};
export const SKILL_ICON: Record<Skill, string> = {
  listening: "🎧",
  speaking: "🎤",
  reading: "📖",
  writing: "✍️",
};

export type SkillLevel = "Beginner" | "Elementary" | "Intermediate" | "Advanced";

export interface LearnerProfile {
  ageGroup: string;         // e.g. "18-24"
  educationLevel: string;   // e.g. "High School"
  language: string;         // e.g. "English" / "Hindi" / "Telugu"
  learningGoal: string;     // e.g. "Improve daily conversation"
  selfProficiency: SkillLevel;
}

export const DEFAULT_PROFILE: LearnerProfile = {
  ageGroup: "25-34",
  educationLevel: "High School",
  language: "English",
  learningGoal: "Improve everyday conversation",
  selfProficiency: "Beginner",
};

/* --- Question variants (discriminated union) --- */
export interface BaseQuestion {
  id: string;
  skill: Skill;
  index: number;    // 1-based within session
  total: number;    // planned total for the session
}

export interface ListeningQuestion extends BaseQuestion {
  skill: "listening";
  type: "listening_mcq";
  instruction: string;      // shown to learner
  audioText: string;        // spoken by TTS, NEVER shown
  language: string;         // BCP-47 hint for TTS voice picking
  options: string[];
  correctIndex: number;     // frontend uses to record correctness silently
}

export interface SpeakingQuestion extends BaseQuestion {
  skill: "speaking";
  type: "speaking_prompt";
  instruction: string;
  targetPhrase: string;     // what the learner should try to say
  language: string;         // BCP-47 hint for STT
}

export interface ReadingQuestion extends BaseQuestion {
  skill: "reading";
  type: "reading_mcq";
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface WritingQuestion extends BaseQuestion {
  skill: "writing";
  type: "writing_prompt";
  instruction: string;
  minWords: number;
}

export type Question =
  | ListeningQuestion
  | SpeakingQuestion
  | ReadingQuestion
  | WritingQuestion;

/* --- Answers --- */
export type AnswerResponse =
  | { kind: "mcq"; selectedIndex: number }
  | { kind: "speech"; transcript: string; durationMs: number }
  | { kind: "writing"; text: string; wordCount: number };

export interface RecordedAnswer {
  questionId: string;
  skill: Skill;
  response: AnswerResponse;
  // For MCQ we record correctness silently for later scoring.
  // For speech/writing this stays undefined (not scored in frontend).
  correct?: boolean;
  submittedAt: string;
}

/* --- Session --- */
export type SessionStatus = "active" | "completed" | "abandoned";

export interface AssessmentSession {
  id: string;
  profile: LearnerProfile;
  createdAt: string;
  status: SessionStatus;
  plan: Question[];             // pre-generated sequence (backend will replace)
  currentIndex: number;         // 0-based cursor into plan
  answers: RecordedAnswer[];
  skillCounts: Record<Skill, { asked: number; total: number }>;
}

/* --- Result --- */
export interface SkillOutcome {
  skill: Skill;
  level: SkillLevel;
  score: number | null;   // 0..1 for scored skills, null for speaking/writing
  asked: number;
}

export interface AssessmentResult {
  // -- new LSRW-focused fields --
  sessionId: string;
  completedAt: string;
  language: string;
  overallLevel: SkillLevel;
  skillOutcomes: SkillOutcome[];
  strengths: string[];         // skill labels (kept as strings for legacy)
  improvements: string[];      // skill labels
  recommendedFocus: string;    // skill label
  recommendedLearningPath: string[]; // ordered skill labels

  // -- legacy fields preserved so dashboard.tsx / learning.ts keep working --
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  level: SkillLevel;                    // == overallLevel
  weaknesses: string[];                 // == improvements
  topicBreakdown: {
    topic: string; correct: number; total: number; accuracy: number;
  }[];
  recommendedStart: string;             // == recommendedFocus
}

/* ---------- Question bank (frontend stub) ---------- */
// Kept intentionally small; backend will replace this with adaptive generation.
type QBankEntry =
  | Omit<ListeningQuestion, "index" | "total">
  | Omit<SpeakingQuestion, "index" | "total">
  | Omit<ReadingQuestion, "index" | "total">
  | Omit<WritingQuestion, "index" | "total">;

const LISTENING_BANK: Omit<ListeningQuestion, "index" | "total">[] = [
  {
    id: "L-1", skill: "listening", type: "listening_mcq",
    instruction: "Listen carefully and choose what you heard.",
    audioText: "The train leaves at nine in the morning.",
    language: "en-US",
    options: ["The train leaves at nine.", "The bus leaves at five.", "The plane arrives at nine.", "The train arrives at nine."],
    correctIndex: 0,
  },
  {
    id: "L-2", skill: "listening", type: "listening_mcq",
    instruction: "Listen and answer the question.",
    audioText: "My sister bought three red apples from the market.",
    language: "en-US",
    options: ["Two red apples", "Three red apples", "Three green apples", "Three oranges"],
    correctIndex: 1,
  },
  {
    id: "L-3", skill: "listening", type: "listening_mcq",
    instruction: "Listen and pick the correct meaning.",
    audioText: "Please close the door quietly.",
    language: "en-US",
    options: ["Open the door", "Close the door softly", "Lock the door", "Paint the door"],
    correctIndex: 1,
  },
];

const SPEAKING_BANK: Omit<SpeakingQuestion, "index" | "total">[] = [
  {
    id: "S-1", skill: "speaking", type: "speaking_prompt",
    instruction: "Read the sentence aloud clearly.",
    targetPhrase: "I am learning a new language every day.",
    language: "en-US",
  },
  {
    id: "S-2", skill: "speaking", type: "speaking_prompt",
    instruction: "Introduce yourself in one short sentence.",
    targetPhrase: "My name is ______ and I live in ______.",
    language: "en-US",
  },
  {
    id: "S-3", skill: "speaking", type: "speaking_prompt",
    instruction: "Say the following phrase clearly.",
    targetPhrase: "Could you please help me find the station?",
    language: "en-US",
  },
];

const READING_BANK: Omit<ReadingQuestion, "index" | "total">[] = [
  {
    id: "R-1", skill: "reading", type: "reading_mcq",
    passage: "Priya wakes up at six every morning. She drinks a glass of warm water, then goes for a short walk in the park before starting her day.",
    question: "What does Priya do first after waking up?",
    options: ["Goes for a walk", "Drinks warm water", "Eats breakfast", "Reads the newspaper"],
    correctIndex: 1,
  },
  {
    id: "R-2", skill: "reading", type: "reading_mcq",
    passage: "The library opens at 9 a.m. on weekdays and closes at 6 p.m. On Sundays it stays closed. Members can borrow up to five books at a time.",
    question: "How many books can a member borrow at once?",
    options: ["Three", "Four", "Five", "Six"],
    correctIndex: 2,
  },
  {
    id: "R-3", skill: "reading", type: "reading_mcq",
    passage: "Small habits, repeated daily, lead to big changes over time. What matters most is not how much you do in a single day, but how consistent you are.",
    question: "The passage suggests success comes from:",
    options: ["Working very hard on one day", "Consistency over time", "Avoiding mistakes", "Learning many topics at once"],
    correctIndex: 1,
  },
];

const WRITING_BANK: Omit<WritingQuestion, "index" | "total">[] = [
  {
    id: "W-1", skill: "writing", type: "writing_prompt",
    instruction: "Write 2–3 sentences describing your favourite place.",
    minWords: 15,
  },
  {
    id: "W-2", skill: "writing", type: "writing_prompt",
    instruction: "In a few sentences, describe what you did yesterday.",
    minWords: 20,
  },
  {
    id: "W-3", skill: "writing", type: "writing_prompt",
    instruction: "Write a short note (2–3 sentences) inviting a friend to a meal.",
    minWords: 15,
  },
];

const ALL_BANKS: Record<Skill, QBankEntry[]> = {
  listening: LISTENING_BANK,
  speaking: SPEAKING_BANK,
  reading: READING_BANK,
  writing: WRITING_BANK,
};

/* ---------- Session plan generation ---------- */
// Balanced round-robin across LSRW. UI does NOT depend on this exact count.
const QUESTIONS_PER_SKILL = 3;

function buildPlan(profile: LearnerProfile): Question[] {
  const order: Skill[] = ["listening", "reading", "speaking", "writing"];
  const perSkill: Record<Skill, QBankEntry[]> = {
    listening: [...ALL_BANKS.listening],
    speaking: [...ALL_BANKS.speaking],
    reading: [...ALL_BANKS.reading],
    writing: [...ALL_BANKS.writing],
  };
  const plan: Question[] = [];
  const total = QUESTIONS_PER_SKILL * order.length;
  for (let round = 0; round < QUESTIONS_PER_SKILL; round++) {
    for (const skill of order) {
      const bank = perSkill[skill];
      if (!bank.length) continue;
      const entry = bank.shift()!;
      const q = { ...entry, index: plan.length + 1, total } as Question;
      // For listening/speaking, seed language hint from profile if available.
      if (q.skill === "listening" || q.skill === "speaking") {
        // best-effort BCP-47 mapping from selected language name
        const lang = profile.language?.toLowerCase() ?? "";
        if (lang.startsWith("hindi")) q.language = "hi-IN";
        else if (lang.startsWith("telugu")) q.language = "te-IN";
        else q.language = "en-US";
      }
      plan.push(q);
    }
  }
  return plan;
}

/* ---------- Profile persistence ---------- */
export function getLearnerProfile(): LearnerProfile {
  const stored = getItem<LearnerProfile>(KEYS.learnerProfile);
  return stored ?? DEFAULT_PROFILE;
}
export function saveLearnerProfile(profile: LearnerProfile): void {
  setItem(KEYS.learnerProfile, profile);
}

/* ---------- Session persistence ---------- */
function sessionKey(id: string) { return `${KEYS.sessionPrefix}${id}`; }

function generateSessionId() {
  return `asmt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function persist(session: AssessmentSession) {
  setItem(sessionKey(session.id), session);
}

export function getSession(id: string): AssessmentSession | null {
  return getItem<AssessmentSession>(sessionKey(id));
}

export function getActiveSessionId(): string | null {
  return getItem<string>(KEYS.activeSession);
}

export function getActiveSession(): AssessmentSession | null {
  const id = getActiveSessionId();
  if (!id) return null;
  const s = getSession(id);
  return s && s.status === "active" ? s : null;
}

export function startAssessmentSession(profile: LearnerProfile): AssessmentSession {
  saveLearnerProfile(profile);
  const plan = buildPlan(profile);
  const skillCounts: AssessmentSession["skillCounts"] = {
    listening: { asked: 0, total: 0 },
    speaking:  { asked: 0, total: 0 },
    reading:   { asked: 0, total: 0 },
    writing:   { asked: 0, total: 0 },
  };
  for (const q of plan) skillCounts[q.skill].total++;
  const session: AssessmentSession = {
    id: generateSessionId(),
    profile,
    createdAt: new Date().toISOString(),
    status: "active",
    plan,
    currentIndex: 0,
    answers: [],
    skillCounts,
  };
  persist(session);
  setItem(KEYS.activeSession, session.id);
  return session;
}

export function abandonSession(id: string): void {
  const s = getSession(id);
  if (!s) return;
  s.status = "abandoned";
  persist(s);
  const active = getActiveSessionId();
  if (active === id) removeItem(KEYS.activeSession);
}

export function getCurrentQuestion(id: string): Question | null {
  const s = getSession(id);
  if (!s || s.status !== "active") return null;
  return s.plan[s.currentIndex] ?? null;
}

export function submitAnswer(
  id: string,
  response: AnswerResponse,
): { session: AssessmentSession; nextQuestion: Question | null; done: boolean } {
  const s = getSession(id);
  if (!s) throw new Error("Assessment session not found");
  const q = s.plan[s.currentIndex];
  if (!q) throw new Error("No current question");

  let correct: boolean | undefined;
  if (response.kind === "mcq" && (q.type === "listening_mcq" || q.type === "reading_mcq")) {
    correct = response.selectedIndex === q.correctIndex;
  }
  // Speech and writing are NOT scored on the frontend.

  s.answers.push({
    questionId: q.id,
    skill: q.skill,
    response,
    correct,
    submittedAt: new Date().toISOString(),
  });
  s.skillCounts[q.skill].asked++;
  s.currentIndex++;
  const done = s.currentIndex >= s.plan.length;
  if (done) s.status = "completed";
  persist(s);

  return { session: s, nextQuestion: done ? null : s.plan[s.currentIndex], done };
}

/* ---------- Finalize / results ---------- */
function levelFromScore(score: number | null, fallback: SkillLevel): SkillLevel {
  if (score == null) return fallback;
  if (score >= 0.85) return "Advanced";
  if (score >= 0.6) return "Intermediate";
  if (score >= 0.35) return "Elementary";
  return "Beginner";
}

export function finalizeSession(id: string): AssessmentResult {
  const s = getSession(id);
  if (!s) throw new Error("Assessment session not found");
  if (s.status === "active") {
    s.status = "completed";
    persist(s);
  }

  const bySkill: Record<Skill, { correct: number; total: number; asked: number }> = {
    listening: { correct: 0, total: 0, asked: 0 },
    speaking:  { correct: 0, total: 0, asked: 0 },
    reading:   { correct: 0, total: 0, asked: 0 },
    writing:   { correct: 0, total: 0, asked: 0 },
  };
  for (const a of s.answers) {
    const b = bySkill[a.skill];
    b.asked++;
    if (a.correct === true) { b.correct++; b.total++; }
    else if (a.correct === false) { b.total++; }
  }

  const skillOutcomes: SkillOutcome[] = SKILLS.map((skill) => {
    const b = bySkill[skill];
    const scored = skill === "listening" || skill === "reading";
    const score = scored && b.total > 0 ? b.correct / b.total : null;
    return {
      skill,
      score,
      asked: b.asked,
      level: levelFromScore(score, s.profile.selfProficiency),
    };
  });

  const scoredValues = skillOutcomes.map((o) => o.score).filter((v): v is number => v != null);
  const avgScored = scoredValues.length
    ? scoredValues.reduce((a, b) => a + b, 0) / scoredValues.length
    : null;
  const overallLevel: SkillLevel = levelFromScore(avgScored, s.profile.selfProficiency);

  const ordered = [...skillOutcomes].sort(
    (a, b) => (b.score ?? -1) - (a.score ?? -1),
  );
  const strengthsSkills = ordered.filter((o) => (o.score ?? 0) >= 0.65);
  const improvementsSkills = ordered.filter((o) => o.score != null && o.score < 0.5);

  const strengths = (strengthsSkills.length ? strengthsSkills : ordered.slice(0, 1))
    .map((o) => SKILL_LABEL[o.skill]);
  const improvements = (
    improvementsSkills.length ? improvementsSkills : ordered.slice(-1)
  ).map((o) => SKILL_LABEL[o.skill]);

  const recommendedFocus = improvements[0] ?? SKILL_LABEL[ordered[ordered.length - 1].skill];
  const recommendedLearningPath = [
    recommendedFocus,
    ...SKILLS.map((s) => SKILL_LABEL[s]).filter((l) => l !== recommendedFocus),
  ];

  const totalQ = s.answers.length || 1;
  const correctCount = s.answers.filter((a) => a.correct === true).length;

  const topicBreakdown = SKILLS.map((skill) => {
    const b = bySkill[skill];
    return {
      topic: SKILL_LABEL[skill],
      correct: b.correct,
      total: b.total || b.asked,
      accuracy: b.total ? b.correct / b.total : 0,
    };
  });

  const result: AssessmentResult = {
    sessionId: s.id,
    completedAt: new Date().toISOString(),
    language: s.profile.language,
    overallLevel,
    skillOutcomes,
    strengths,
    improvements,
    recommendedFocus,
    recommendedLearningPath,

    // legacy
    totalQuestions: totalQ,
    correctCount,
    accuracy: correctCount / totalQ,
    level: overallLevel,
    weaknesses: improvements,
    topicBreakdown,
    recommendedStart: recommendedFocus,
  };

  // Save latest + append to history
  setItem(KEYS.assessmentResult, result);
  setItem(KEYS.assessmentCompleted, true);
  const history = getResultHistory();
  history.unshift(result);
  setItem(KEYS.history, history.slice(0, 20));

  // Clear active pointer (but keep the session record for potential review)
  const active = getActiveSessionId();
  if (active === s.id) removeItem(KEYS.activeSession);

  return result;
}

export function getResultHistory(): AssessmentResult[] {
  return getItem<AssessmentResult[]>(KEYS.history) ?? [];
}

export function getAssessmentResult(): AssessmentResult | null {
  return getItem<AssessmentResult>(KEYS.assessmentResult);
}

export function hasCompletedAssessment(): boolean {
  return getItem<boolean>(KEYS.assessmentCompleted) === true;
}

export function resetAssessment(): void {
  setItem(KEYS.assessmentCompleted, false);
}

/* ---------- Legacy compatibility shim ---------- */
// A few existing routes still import `AdaptiveAssessment` / `Question` as a
// value/type. We keep a thin no-op class so those imports keep type-checking
// if any linger; new code should use `startAssessmentSession` instead.
export class AdaptiveAssessment {
  answers: RecordedAnswer[] = [];
  get total() { return 0; }
  get answered() { return 0; }
  get isDone() { return true; }
  next(): Question | null { return null; }
  submit(_q: Question, _selected: number): boolean { return false; }
  finalize(): AssessmentResult | null { return getAssessmentResult(); }
}
