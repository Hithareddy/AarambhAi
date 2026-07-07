// Isolated mock adaptive-assessment service.
// Replace this module with real FastAPI calls when the backend endpoints are ready.
import { getItem, setItem, StorageKeys } from "../utils/storage";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correct: number; // index into options
}

export interface AnswerRecord {
  questionId: string;
  topic: string;
  difficulty: Difficulty;
  correct: boolean;
}

export interface AssessmentResult {
  totalQuestions: number;
  correctCount: number;
  accuracy: number; // 0..1
  level: "Beginner" | "Elementary" | "Intermediate" | "Advanced";
  strengths: string[];
  weaknesses: string[];
  topicBreakdown: { topic: string; correct: number; total: number; accuracy: number }[];
  recommendedStart: string;
  completedAt: string;
}

export const QUESTION_BANK: Question[] = [
  // Alphabet
  { id: "al-e1", topic: "Alphabet", difficulty: "easy", question: "Which letter comes after 'C'?", options: ["A", "D", "B", "E"], correct: 1 },
  { id: "al-e2", topic: "Alphabet", difficulty: "easy", question: "How many letters are in the English alphabet?", options: ["24", "25", "26", "27"], correct: 2 },
  { id: "al-m1", topic: "Alphabet", difficulty: "medium", question: "Which of these is a vowel?", options: ["B", "K", "U", "R"], correct: 2 },
  { id: "al-h1", topic: "Alphabet", difficulty: "hard", question: "Which letter is the 19th in the alphabet?", options: ["R", "S", "T", "Q"], correct: 1 },

  // Reading
  { id: "rd-e1", topic: "Reading", difficulty: "easy", question: "Read: 'The cat sat on the mat.' What sat on the mat?", options: ["Dog", "Cat", "Rat", "Bat"], correct: 1 },
  { id: "rd-m1", topic: "Reading", difficulty: "medium", question: "Choose the correctly spelled word:", options: ["Freind", "Friend", "Frend", "Freend"], correct: 1 },
  { id: "rd-h1", topic: "Reading", difficulty: "hard", question: "'She was elated' most likely means she was:", options: ["Sad", "Very happy", "Tired", "Confused"], correct: 1 },

  // Writing
  { id: "wr-e1", topic: "Writing", difficulty: "easy", question: "Which sentence ends correctly?", options: ["I like tea", "I like tea.", "i like tea", "I Like tea"], correct: 1 },
  { id: "wr-m1", topic: "Writing", difficulty: "medium", question: "Pick the correct sentence:", options: ["He go to school.", "He goes to school.", "He going to school.", "He gone school."], correct: 1 },
  { id: "wr-h1", topic: "Writing", difficulty: "hard", question: "Which word is a synonym for 'happy'?", options: ["Angry", "Joyful", "Weary", "Silent"], correct: 1 },

  // Numbers
  { id: "nu-e1", topic: "Numbers", difficulty: "easy", question: "What is 2 + 3?", options: ["4", "5", "6", "7"], correct: 1 },
  { id: "nu-m1", topic: "Numbers", difficulty: "medium", question: "What is 12 × 3?", options: ["36", "24", "32", "42"], correct: 0 },
  { id: "nu-h1", topic: "Numbers", difficulty: "hard", question: "What is 144 ÷ 12?", options: ["10", "11", "12", "14"], correct: 2 },

  // Vocabulary
  { id: "vo-e1", topic: "Vocabulary", difficulty: "easy", question: "The opposite of 'hot' is:", options: ["Warm", "Cold", "Cool", "Boiling"], correct: 1 },
  { id: "vo-m1", topic: "Vocabulary", difficulty: "medium", question: "'Rapid' means:", options: ["Slow", "Fast", "Quiet", "Loud"], correct: 1 },
  { id: "vo-h1", topic: "Vocabulary", difficulty: "hard", question: "'Benevolent' means:", options: ["Cruel", "Kind", "Angry", "Silly"], correct: 1 },
];

const TOPICS = ["Alphabet", "Reading", "Writing", "Numbers", "Vocabulary"];
const TOTAL_QUESTIONS = 10;

function pickQuestion(
  difficulty: Difficulty,
  askedIds: Set<string>,
  preferTopic?: string,
): Question {
  const bank = QUESTION_BANK.filter((q) => !askedIds.has(q.id));
  const byDiff = bank.filter((q) => q.difficulty === difficulty);
  const candidates = byDiff.length ? byDiff : bank;
  if (preferTopic) {
    const t = candidates.filter((q) => q.topic === preferTopic);
    if (t.length) return t[Math.floor(Math.random() * t.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export class AdaptiveAssessment {
  private askedIds = new Set<string>();
  private topicCursor = 0;
  private streakCorrect = 0;
  private streakWrong = 0;
  private difficulty: Difficulty = "medium";
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
    const topic = TOPICS[this.topicCursor % TOPICS.length];
    this.topicCursor++;
    const q = pickQuestion(this.difficulty, this.askedIds, topic);
    this.askedIds.add(q.id);
    return q;
  }

  submit(q: Question, selected: number): boolean {
    const correct = selected === q.correct;
    this.answers.push({
      questionId: q.id,
      topic: q.topic,
      difficulty: q.difficulty,
      correct,
    });
    if (correct) {
      this.streakCorrect++;
      this.streakWrong = 0;
      if (this.streakCorrect >= 2) {
        this.difficulty = this.difficulty === "easy" ? "medium" : "hard";
        this.streakCorrect = 0;
      }
    } else {
      this.streakWrong++;
      this.streakCorrect = 0;
      if (this.streakWrong >= 2) {
        this.difficulty = this.difficulty === "hard" ? "medium" : "easy";
        this.streakWrong = 0;
      }
    }
    return correct;
  }

  finalize(): AssessmentResult {
    const correctCount = this.answers.filter((a) => a.correct).length;
    const total = this.answers.length || 1;
    const accuracy = correctCount / total;

    const byTopic = new Map<string, { correct: number; total: number }>();
    for (const t of TOPICS) byTopic.set(t, { correct: 0, total: 0 });
    for (const a of this.answers) {
      const b = byTopic.get(a.topic) ?? { correct: 0, total: 0 };
      b.total++;
      if (a.correct) b.correct++;
      byTopic.set(a.topic, b);
    }

    const topicBreakdown = Array.from(byTopic.entries())
      .filter(([, v]) => v.total > 0)
      .map(([topic, v]) => ({
        topic,
        correct: v.correct,
        total: v.total,
        accuracy: v.correct / v.total,
      }));

    const strengths = topicBreakdown.filter((t) => t.accuracy >= 0.75).map((t) => t.topic);
    const weaknesses = topicBreakdown.filter((t) => t.accuracy < 0.5).map((t) => t.topic);

    let level: AssessmentResult["level"] = "Beginner";
    if (accuracy >= 0.85) level = "Advanced";
    else if (accuracy >= 0.65) level = "Intermediate";
    else if (accuracy >= 0.4) level = "Elementary";

    const recommendedStart =
      weaknesses[0] ?? topicBreakdown.sort((a, b) => a.accuracy - b.accuracy)[0]?.topic ?? "Alphabet";

    const result: AssessmentResult = {
      totalQuestions: total,
      correctCount,
      accuracy,
      level,
      strengths,
      weaknesses,
      topicBreakdown,
      recommendedStart,
      completedAt: new Date().toISOString(),
    };
    setItem(StorageKeys.assessmentResult, result);
    setItem(StorageKeys.assessmentCompleted, true);
    return result;
  }
}

export function getAssessmentResult(): AssessmentResult | null {
  return getItem<AssessmentResult>(StorageKeys.assessmentResult);
}

export function hasCompletedAssessment(): boolean {
  return getItem<boolean>(StorageKeys.assessmentCompleted) === true;
}

export function resetAssessment(): void {
  setItem(StorageKeys.assessmentCompleted, false);
}
