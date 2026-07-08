// Isolated mock services for the Admin frontend. Replace each function
// with real FastAPI calls when the backend endpoints are available.

export type Difficulty = "easy" | "medium" | "hard";
export type ContentLevel = "Beginner" | "Intermediate" | "Advanced";

export interface AdminQuestion {
  id: string;
  topic: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  active: boolean;
  updatedAt: string;
}

export interface AdminContent {
  id: string;
  topic: string;
  title: string;
  description: string;
  objectives: string[];
  explanation: string;
  examples: string[];
  keyPoints: string[];
  practice: { prompt: string; answer: string };
  level: ContentLevel;
  active: boolean;
  updatedAt: string;
}

export interface AdminLearner {
  id: string;
  name: string;
  email: string;
  level: ContentLevel;
  assessmentCompleted: boolean;
  progressPercent: number;
  streakDays: number;
  weakAreas: string[];
  strongAreas: string[];
  lastActive: string;
  topicPerformance: { topic: string; accuracy: number; completed: number; total: number }[];
  activity: { at: string; title: string }[];
}

const TOPICS = ["Alphabet", "Reading", "Writing", "Numbers", "Vocabulary"] as const;

// ---------- In-memory stores (persist across navigations, reset on reload) ----------

let questions: AdminQuestion[] = [
  {
    id: "q-001",
    topic: "Alphabet",
    difficulty: "easy",
    question: "Which letter comes after 'C'?",
    options: ["A", "D", "B", "E"],
    correctIndex: 1,
    explanation: "The alphabet order is A, B, C, D — so D follows C.",
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "q-002",
    topic: "Reading",
    difficulty: "medium",
    question: "Choose the correctly spelled word.",
    options: ["Freind", "Friend", "Frend", "Freend"],
    correctIndex: 1,
    explanation: "Remember: 'i before e except after c'.",
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "q-003",
    topic: "Numbers",
    difficulty: "medium",
    question: "What is 12 × 3?",
    options: ["36", "24", "32", "42"],
    correctIndex: 0,
    explanation: "12 × 3 = 36.",
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "q-004",
    topic: "Vocabulary",
    difficulty: "hard",
    question: "'Benevolent' means:",
    options: ["Cruel", "Kind", "Angry", "Silly"],
    correctIndex: 1,
    explanation: "Benevolent = well-meaning and kindly.",
    active: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "q-005",
    topic: "Writing",
    difficulty: "easy",
    question: "Which sentence ends correctly?",
    options: ["I like tea", "I like tea.", "i like tea", "I Like tea"],
    correctIndex: 1,
    explanation: "Sentences end with a period.",
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

let contents: AdminContent[] = [
  {
    id: "c-001",
    topic: "Alphabet",
    title: "Learning the Vowels",
    description: "Introduction to the five vowels and their sounds.",
    objectives: ["Identify vowels", "Recognize vowel sounds"],
    explanation:
      "Vowels are A, E, I, O, U. Every English word contains at least one vowel.",
    examples: ["Apple → A", "Egg → E", "Ink → I"],
    keyPoints: ["A E I O U are vowels", "Y is sometimes a vowel"],
    practice: { prompt: "Type any three vowels.", answer: "aei" },
    level: "Beginner",
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c-002",
    topic: "Reading",
    title: "Reading Simple Sentences",
    description: "Practice reading short, everyday sentences.",
    objectives: ["Read short sentences", "Understand meaning"],
    explanation: "Read left to right. Pause at the period.",
    examples: ["The cat sat.", "I like tea.", "We go home."],
    keyPoints: ["Read slowly", "Look at every word"],
    practice: { prompt: "What sat on the mat? 'The cat sat on the mat.'", answer: "cat" },
    level: "Beginner",
    active: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c-003",
    topic: "Numbers",
    title: "Multiplication Basics",
    description: "Multiplying single-digit numbers.",
    objectives: ["Know 2-10 tables", "Solve × problems"],
    explanation: "Multiplication is repeated addition. 3 × 4 = 4 + 4 + 4.",
    examples: ["2 × 3 = 6", "5 × 4 = 20"],
    keyPoints: ["Practice daily", "Memorize small tables"],
    practice: { prompt: "What is 6 × 7?", answer: "42" },
    level: "Intermediate",
    active: true,
    updatedAt: new Date().toISOString(),
  },
];

const learners: AdminLearner[] = [
  {
    id: "l-001",
    name: "Anita Sharma",
    email: "anita@example.com",
    level: "Beginner",
    assessmentCompleted: true,
    progressPercent: 32,
    streakDays: 4,
    weakAreas: ["Vocabulary"],
    strongAreas: ["Alphabet", "Reading"],
    lastActive: new Date(Date.now() - 3 * 3600_000).toISOString(),
    topicPerformance: [
      { topic: "Alphabet", accuracy: 0.9, completed: 3, total: 4 },
      { topic: "Reading", accuracy: 0.75, completed: 2, total: 4 },
      { topic: "Vocabulary", accuracy: 0.4, completed: 1, total: 4 },
      { topic: "Numbers", accuracy: 0.6, completed: 2, total: 4 },
    ],
    activity: [
      { at: new Date(Date.now() - 3 * 3600_000).toISOString(), title: "Reading Simple Sentences" },
      { at: new Date(Date.now() - 26 * 3600_000).toISOString(), title: "Learning the Vowels" },
    ],
  },
  {
    id: "l-002",
    name: "Ramesh Patel",
    email: "ramesh@example.com",
    level: "Intermediate",
    assessmentCompleted: true,
    progressPercent: 58,
    streakDays: 9,
    weakAreas: ["Writing"],
    strongAreas: ["Numbers"],
    lastActive: new Date(Date.now() - 40 * 60_000).toISOString(),
    topicPerformance: [
      { topic: "Numbers", accuracy: 0.85, completed: 4, total: 4 },
      { topic: "Writing", accuracy: 0.45, completed: 1, total: 3 },
      { topic: "Vocabulary", accuracy: 0.7, completed: 2, total: 3 },
    ],
    activity: [
      { at: new Date(Date.now() - 40 * 60_000).toISOString(), title: "Multiplication Basics" },
    ],
  },
  {
    id: "l-003",
    name: "Kavita Rao",
    email: "kavita@example.com",
    level: "Beginner",
    assessmentCompleted: false,
    progressPercent: 0,
    streakDays: 0,
    weakAreas: [],
    strongAreas: [],
    lastActive: new Date(Date.now() - 5 * 86400_000).toISOString(),
    topicPerformance: [],
    activity: [],
  },
  {
    id: "l-004",
    name: "Suresh Kumar",
    email: "suresh@example.com",
    level: "Advanced",
    assessmentCompleted: true,
    progressPercent: 82,
    streakDays: 21,
    weakAreas: [],
    strongAreas: ["Reading", "Vocabulary", "Numbers"],
    lastActive: new Date(Date.now() - 2 * 3600_000).toISOString(),
    topicPerformance: [
      { topic: "Reading", accuracy: 0.95, completed: 4, total: 4 },
      { topic: "Vocabulary", accuracy: 0.9, completed: 4, total: 4 },
      { topic: "Numbers", accuracy: 0.88, completed: 4, total: 4 },
      { topic: "Writing", accuracy: 0.7, completed: 3, total: 4 },
    ],
    activity: [
      { at: new Date(Date.now() - 2 * 3600_000).toISOString(), title: "Advanced Reading" },
    ],
  },
  {
    id: "l-005",
    name: "Meera Iyer",
    email: "meera@example.com",
    level: "Beginner",
    assessmentCompleted: true,
    progressPercent: 12,
    streakDays: 1,
    weakAreas: ["Reading", "Writing"],
    strongAreas: [],
    lastActive: new Date(Date.now() - 12 * 86400_000).toISOString(),
    topicPerformance: [
      { topic: "Reading", accuracy: 0.35, completed: 1, total: 4 },
      { topic: "Writing", accuracy: 0.4, completed: 1, total: 4 },
    ],
    activity: [],
  },
];

// ---------- Question APIs ----------

export function listQuestions(): AdminQuestion[] {
  return [...questions];
}

export function getQuestion(id: string): AdminQuestion | undefined {
  return questions.find((q) => q.id === id);
}

export function createQuestion(q: Omit<AdminQuestion, "id" | "updatedAt">): AdminQuestion {
  const created: AdminQuestion = {
    ...q,
    id: `q-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  questions = [created, ...questions];
  return created;
}

export function updateQuestion(id: string, patch: Partial<AdminQuestion>): AdminQuestion | null {
  const idx = questions.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  const updated = { ...questions[idx], ...patch, id, updatedAt: new Date().toISOString() };
  questions[idx] = updated;
  return updated;
}

export function deleteQuestion(id: string): void {
  questions = questions.filter((q) => q.id !== id);
}

// ---------- Content APIs ----------

export function listContent(): AdminContent[] {
  return [...contents];
}

export function getContent(id: string): AdminContent | undefined {
  return contents.find((c) => c.id === id);
}

export function createContent(c: Omit<AdminContent, "id" | "updatedAt">): AdminContent {
  const created: AdminContent = {
    ...c,
    id: `c-${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  contents = [created, ...contents];
  return created;
}

export function updateContent(id: string, patch: Partial<AdminContent>): AdminContent | null {
  const idx = contents.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = { ...contents[idx], ...patch, id, updatedAt: new Date().toISOString() };
  contents[idx] = updated;
  return updated;
}

export function deleteContent(id: string): void {
  contents = contents.filter((c) => c.id !== id);
}

// ---------- Learner APIs ----------

export function listLearners(): AdminLearner[] {
  return [...learners];
}

export function getLearner(id: string): AdminLearner | undefined {
  return learners.find((l) => l.id === id);
}

// ---------- Dashboard summary ----------

export interface AdminDashboardSummary {
  totalLearners: number;
  activeLearners: number;
  assessmentsCompleted: number;
  needsAttention: number;
  questionsTotal: number;
  questionsActive: number;
  contentTotal: number;
  contentActive: number;
  recentActivity: { learner: string; title: string; at: string }[];
}

export function getAdminDashboard(): AdminDashboardSummary {
  const active = learners.filter(
    (l) => Date.now() - new Date(l.lastActive).getTime() < 7 * 86400_000,
  ).length;
  const needsAttention = learners.filter(
    (l) =>
      !l.assessmentCompleted ||
      l.weakAreas.length >= 2 ||
      Date.now() - new Date(l.lastActive).getTime() > 7 * 86400_000,
  ).length;
  const recent: { learner: string; title: string; at: string }[] = [];
  for (const l of learners) {
    for (const a of l.activity) {
      recent.push({ learner: l.name, title: a.title, at: a.at });
    }
  }
  recent.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return {
    totalLearners: learners.length,
    activeLearners: active,
    assessmentsCompleted: learners.filter((l) => l.assessmentCompleted).length,
    needsAttention,
    questionsTotal: questions.length,
    questionsActive: questions.filter((q) => q.active).length,
    contentTotal: contents.length,
    contentActive: contents.filter((c) => c.active).length,
    recentActivity: recent.slice(0, 6),
  };
}

export const ADMIN_TOPICS = TOPICS;
