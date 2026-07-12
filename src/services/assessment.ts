// Aarambh AI Adaptive Assessment Engine V2
// Frontend implementation.
// Later this engine can be replaced by FastAPI assessment endpoints.

import { getItem, setItem, StorageKeys } from "../utils/storage";

export type Difficulty = "easy" | "medium" | "hard";

export type Skill = "Listening" | "Speaking" | "Reading" | "Writing";

export type QuestionType =
  | "mcq"
  | "listening-mcq"
  | "speaking"
  | "writing";

export type LearnerLevel =
  | "Beginner"
  | "Elementary"
  | "Intermediate"
  | "Advanced";

export interface Question {
  id: string;

  skill: Skill;

  // Kept for compatibility with the current assessment UI.
  topic: string;

  difficulty: Difficulty;

  type: QuestionType;

  question: string;

  options: string[];

  correct: number;

  audioText?: string;

  expectedAnswer?: string;
}

export interface AnswerRecord {
  questionId: string;

  skill: Skill;

  topic: string;

  difficulty: Difficulty;

  correct: boolean;
}

export interface SkillBreakdown {
  skill: Skill;

  correct: number;

  total: number;

  accuracy: number;

  level: LearnerLevel;

  finalDifficulty: Difficulty;
}

export interface TopicBreakdown {
  topic: string;

  correct: number;

  total: number;

  accuracy: number;
}

export interface AssessmentResult {
  totalQuestions: number;

  correctCount: number;

  accuracy: number;

  level: LearnerLevel;

  strengths: string[];

  weaknesses: string[];

  topicBreakdown: TopicBreakdown[];

  skillBreakdown: SkillBreakdown[];

  recommendedStart: string;

  completedAt: string;
}

interface SkillState {
  difficulty: Difficulty;

  streakCorrect: number;

  streakWrong: number;

  correct: number;

  total: number;
}

const SKILLS: Skill[] = [
  "Listening",
  "Speaking",
  "Reading",
  "Writing",
];

const TOTAL_QUESTIONS = 12;

export const QUESTION_BANK: Question[] = [
  // LISTENING
  {
    id: "li-e1",
    skill: "Listening",
    topic: "Listening",
    difficulty: "easy",
    type: "listening-mcq",
    question: "Listen to the sentence. What animal was mentioned?",
    audioText: "The cat is sleeping.",
    options: ["Dog", "Cat", "Bird", "Cow"],
    correct: 1,
  },

  {
    id: "li-e2",
    skill: "Listening",
    topic: "Listening",
    difficulty: "easy",
    type: "listening-mcq",
    question: "Listen carefully. What color was mentioned?",
    audioText: "The ball is red.",
    options: ["Blue", "Green", "Red", "Yellow"],
    correct: 2,
  },

  {
    id: "li-m1",
    skill: "Listening",
    topic: "Listening",
    difficulty: "medium",
    type: "listening-mcq",
    question: "Listen to the sentence. Where is Rahul going?",
    audioText: "Rahul is going to the library to study.",
    options: ["Market", "Library", "School", "Park"],
    correct: 1,
  },

  {
    id: "li-h1",
    skill: "Listening",
    topic: "Listening",
    difficulty: "hard",
    type: "listening-mcq",
    question: "Listen carefully. Why did Meera carry an umbrella?",
    audioText:
      "Although the sky was clear in the morning, Meera carried an umbrella because rain was expected later.",
    options: [
      "It was sunny",
      "Rain was expected",
      "She lost her bag",
      "She was going swimming",
    ],
    correct: 1,
  },

  // SPEAKING
  // Temporary MCQ fallback.
  // These questions will later use Speech-to-Text.

  {
    id: "sp-e1",
    skill: "Speaking",
    topic: "Speaking",
    difficulty: "easy",
    type: "mcq",
    question: "Choose the correct response to: How are you?",
    options: [
      "I am fine.",
      "My name is book.",
      "Yesterday.",
      "Blue.",
    ],
    correct: 0,
  },

  {
    id: "sp-e2",
    skill: "Speaking",
    topic: "Speaking",
    difficulty: "easy",
    type: "mcq",
    question: "Which sentence correctly introduces yourself?",
    options: [
      "My name is Riya.",
      "Name Riya my.",
      "Riya name.",
      "My Riya is name.",
    ],
    correct: 0,
  },

  {
    id: "sp-m1",
    skill: "Speaking",
    topic: "Speaking",
    difficulty: "medium",
    type: "mcq",
    question: "Choose the most appropriate response: What did you do yesterday?",
    options: [
      "I will go tomorrow.",
      "I studied for my exam.",
      "I am a student yesterday.",
      "I studying now yesterday.",
    ],
    correct: 1,
  },

  {
    id: "sp-h1",
    skill: "Speaking",
    topic: "Speaking",
    difficulty: "hard",
    type: "mcq",
    question: "Choose the clearest way to express an opinion.",
    options: [
      "Because yes.",
      "I believe online learning is useful because it gives students flexible access to resources.",
      "Learning good.",
      "I opinion online.",
    ],
    correct: 1,
  },

  // READING

  {
    id: "rd-e1",
    skill: "Reading",
    topic: "Reading",
    difficulty: "easy",
    type: "mcq",
    question: "Read: The cat sat on the mat. What sat on the mat?",
    options: ["Dog", "Cat", "Rat", "Bird"],
    correct: 1,
  },

  {
    id: "rd-e2",
    skill: "Reading",
    topic: "Reading",
    difficulty: "easy",
    type: "mcq",
    question: "Choose the correctly spelled word.",
    options: ["Bokk", "Book", "Bok", "Boock"],
    correct: 1,
  },

  {
    id: "rd-m1",
    skill: "Reading",
    topic: "Reading",
    difficulty: "medium",
    type: "mcq",
    question: "The word rapid is closest in meaning to:",
    options: ["Slow", "Fast", "Quiet", "Weak"],
    correct: 1,
  },

  {
    id: "rd-h1",
    skill: "Reading",
    topic: "Reading",
    difficulty: "hard",
    type: "mcq",
    question:
      "Despite several failures, Arun continued experimenting until he succeeded. What quality did Arun demonstrate?",
    options: [
      "Carelessness",
      "Persistence",
      "Fear",
      "Confusion",
    ],
    correct: 1,
  },

  // WRITING
  // Temporary MCQ fallback.
  // Free-text evaluation will be added later.

  {
    id: "wr-e1",
    skill: "Writing",
    topic: "Writing",
    difficulty: "easy",
    type: "mcq",
    question: "Choose the correctly written sentence.",
    options: [
      "i like tea.",
      "I like tea.",
      "I like tea",
      "i Like Tea.",
    ],
    correct: 1,
  },

  {
    id: "wr-e2",
    skill: "Writing",
    topic: "Writing",
    difficulty: "easy",
    type: "mcq",
    question: "Choose the sentence with correct word order.",
    options: [
      "School I go to.",
      "I go to school.",
      "Go school I.",
      "To I school go.",
    ],
    correct: 1,
  },

  {
    id: "wr-m1",
    skill: "Writing",
    topic: "Writing",
    difficulty: "medium",
    type: "mcq",
    question: "Choose the grammatically correct sentence.",
    options: [
      "He go to school every day.",
      "He goes to school every day.",
      "He going to school every day.",
      "He gone to school every day.",
    ],
    correct: 1,
  },

  {
    id: "wr-h1",
    skill: "Writing",
    topic: "Writing",
    difficulty: "hard",
    type: "mcq",
    question: "Choose the clearest and most grammatically correct sentence.",
    options: [
      "Although it was raining, we continued playing.",
      "Although raining we continue played.",
      "Rain although we playing.",
      "We continued because although raining.",
    ],
    correct: 0,
  },
];

function createInitialSkillState(): Record<Skill, SkillState> {
  return {
    Listening: {
      difficulty: "easy",
      streakCorrect: 0,
      streakWrong: 0,
      correct: 0,
      total: 0,
    },

    Speaking: {
      difficulty: "easy",
      streakCorrect: 0,
      streakWrong: 0,
      correct: 0,
      total: 0,
    },

    Reading: {
      difficulty: "easy",
      streakCorrect: 0,
      streakWrong: 0,
      correct: 0,
      total: 0,
    },

    Writing: {
      difficulty: "easy",
      streakCorrect: 0,
      streakWrong: 0,
      correct: 0,
      total: 0,
    },
  };
}

function increaseDifficulty(difficulty: Difficulty): Difficulty {
  if (difficulty === "easy") return "medium";

  return "hard";
}

function decreaseDifficulty(difficulty: Difficulty): Difficulty {
  if (difficulty === "hard") return "medium";

  return "easy";
}

function calculateLevel(accuracy: number): LearnerLevel {
  if (accuracy >= 0.85) return "Advanced";

  if (accuracy >= 0.65) return "Intermediate";

  if (accuracy >= 0.4) return "Elementary";

  return "Beginner";
}

function pickQuestion(
  skill: Skill,
  difficulty: Difficulty,
  askedIds: Set<string>,
): Question | null {
  const unansweredSkillQuestions = QUESTION_BANK.filter(
    (question) =>
      question.skill === skill &&
      !askedIds.has(question.id),
  );

  if (!unansweredSkillQuestions.length) {
    return null;
  }

  const matchingDifficulty = unansweredSkillQuestions.filter(
    (question) => question.difficulty === difficulty,
  );

  const candidates = matchingDifficulty.length
    ? matchingDifficulty
    : unansweredSkillQuestions;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

export class AdaptiveAssessment {
  private askedIds = new Set<string>();

  private skillCursor = 0;

  private skillStates = createInitialSkillState();

  answers: AnswerRecord[] = [];

  get total() {
    return TOTAL_QUESTIONS;
  }

  get answered() {
    return this.answers.length;
  }

  get isDone() {
    return this.answers.length >= TOTAL_QUESTIONS;
  }

  next(): Question | null {
    if (this.isDone) return null;

    // Try every skill until a valid unanswered question is found.
    for (let attempt = 0; attempt < SKILLS.length; attempt++) {
      const skill = SKILLS[this.skillCursor % SKILLS.length];

      this.skillCursor++;

      const state = this.skillStates[skill];

      const question = pickQuestion(
        skill,
        state.difficulty,
        this.askedIds,
      );

      if (question) {
        this.askedIds.add(question.id);

        return question;
      }
    }

    return null;
  }

  submit(question: Question, selected: number): boolean {
    const correct = selected === question.correct;

    const state = this.skillStates[question.skill];

    this.answers.push({
      questionId: question.id,
      skill: question.skill,
      topic: question.topic,
      difficulty: question.difficulty,
      correct,
    });

    state.total++;

    if (correct) {
      state.correct++;

      state.streakCorrect++;

      state.streakWrong = 0;

      if (state.streakCorrect >= 2) {
        state.difficulty = increaseDifficulty(state.difficulty);

        state.streakCorrect = 0;
      }
    } else {
      state.streakWrong++;

      state.streakCorrect = 0;

      if (state.streakWrong >= 2) {
        state.difficulty = decreaseDifficulty(state.difficulty);

        state.streakWrong = 0;
      }
    }

    return correct;
  }

  finalize(): AssessmentResult {
    const totalQuestions = this.answers.length;

    const correctCount = this.answers.filter(
      (answer) => answer.correct,
    ).length;

    const accuracy = totalQuestions
      ? correctCount / totalQuestions
      : 0;

    const skillBreakdown: SkillBreakdown[] = SKILLS.map((skill) => {
      const state = this.skillStates[skill];

      const skillAccuracy = state.total
        ? state.correct / state.total
        : 0;

      return {
        skill,
        correct: state.correct,
        total: state.total,
        accuracy: skillAccuracy,
        level: calculateLevel(skillAccuracy),
        finalDifficulty: state.difficulty,
      };
    });

    // Kept for compatibility with the existing results page.
    const topicBreakdown: TopicBreakdown[] = skillBreakdown
      .filter((skill) => skill.total > 0)
      .map((skill) => ({
        topic: skill.skill,
        correct: skill.correct,
        total: skill.total,
        accuracy: skill.accuracy,
      }));

    const strengths = skillBreakdown
      .filter(
        (skill) =>
          skill.total > 0 &&
          skill.accuracy >= 0.75,
      )
      .map((skill) => skill.skill);

    const weaknesses = skillBreakdown
      .filter(
        (skill) =>
          skill.total > 0 &&
          skill.accuracy < 0.5,
      )
      .map((skill) => skill.skill);

    const weakestSkill = [...skillBreakdown]
      .filter((skill) => skill.total > 0)
      .sort((a, b) => a.accuracy - b.accuracy)[0];

    const result: AssessmentResult = {
      totalQuestions,

      correctCount,

      accuracy,

      level: calculateLevel(accuracy),

      strengths,

      weaknesses,

      topicBreakdown,

      skillBreakdown,

      recommendedStart: weakestSkill?.skill ?? "Listening",

      completedAt: new Date().toISOString(),
    };

    setItem(StorageKeys.assessmentResult, result);

    setItem(StorageKeys.assessmentCompleted, true);

    return result;
  }
}

export function getAssessmentResult(): AssessmentResult | null {
  return getItem<AssessmentResult>(
    StorageKeys.assessmentResult,
  );
}

export function hasCompletedAssessment(): boolean {
  return (
    getItem<boolean>(
      StorageKeys.assessmentCompleted,
    ) === true
  );
}

export function resetAssessment(): void {
  setItem(StorageKeys.assessmentCompleted, false);
}