// Isolated mock learning-path & lesson service.
// Backend replacement point: swap localStorage reads with FastAPI calls.
import { getItem, setItem, StorageKeys } from "../utils/storage";
import { getAssessmentResult } from "./assessment";

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";

export interface Lesson {
  id: string;
  topic: string;
  title: string;
  objective: string;
  explanation: string;
  examples: string[];
  keyPoints: string[];
  practice: { prompt: string; answer: string };
}

export const LESSONS: Lesson[] = [
  {
    id: "alphabet-1",
    topic: "Alphabet",
    title: "Recognizing Letters A–J",
    objective: "Identify and pronounce the first 10 letters of the alphabet.",
    explanation:
      "The English alphabet begins with A, B, C, D, E, F, G, H, I, J. Each letter has a name and a sound. Practicing them helps you read words later.",
    examples: ["A — Apple", "B — Ball", "C — Cat", "D — Dog"],
    keyPoints: [
      "There are 26 letters in total.",
      "Vowels among A–J are A, E, I.",
      "Capital and small letters look different but are the same letter.",
    ],
    practice: { prompt: "Which letter comes right after 'F'?", answer: "G" },
  },
  {
    id: "reading-1",
    topic: "Reading",
    title: "Reading Simple Sentences",
    objective: "Read and understand short sentences with common words.",
    explanation:
      "A sentence is a group of words that shares a complete idea. It starts with a capital letter and ends with a full stop.",
    examples: ["The sun is bright.", "I like warm tea.", "We walk to school."],
    keyPoints: [
      "Every sentence ends with . ? or !",
      "Read slowly, one word at a time.",
      "Try to picture what the sentence describes.",
    ],
    practice: { prompt: "Which mark ends a question?", answer: "?" },
  },
  {
    id: "writing-1",
    topic: "Writing",
    title: "Writing Your First Words",
    objective: "Practice writing 5 common words neatly.",
    explanation:
      "Writing helps us share ideas. Start with simple, everyday words. Sit comfortably and hold your pen with a relaxed grip.",
    examples: ["cat", "sun", "book", "home", "tea"],
    keyPoints: [
      "Leave a small space between words.",
      "Keep letters roughly the same size.",
      "Practice a little every day.",
    ],
    practice: { prompt: "Write a 3-letter word for a warm drink.", answer: "tea" },
  },
  {
    id: "numbers-1",
    topic: "Numbers",
    title: "Counting 1 to 20",
    objective: "Count aloud and recognize numbers 1 through 20.",
    explanation:
      "Numbers help us count things around us. After 10 comes 11, 12, 13… all the way to 20.",
    examples: ["1, 2, 3 apples", "10 fingers", "20 pages"],
    keyPoints: ["11 is 'eleven'.", "20 is 'twenty'.", "Count real objects to practice."],
    practice: { prompt: "What number comes after 14?", answer: "15" },
  },
  {
    id: "vocabulary-1",
    topic: "Vocabulary",
    title: "Everyday Words",
    objective: "Learn 10 everyday words and their meanings.",
    explanation:
      "Vocabulary is the collection of words you know. The more words you know, the more you can read, write, and speak.",
    examples: ["Kitchen — where we cook", "Market — where we buy things", "Friend — someone we like"],
    keyPoints: [
      "Try to use new words in a sentence.",
      "Repeat words aloud to remember.",
      "Ask others what a word means.",
    ],
    practice: { prompt: "What do we call the place where we cook?", answer: "kitchen" },
  },
  {
    id: "reading-2",
    topic: "Reading",
    title: "Understanding Short Stories",
    objective: "Read a short story and answer questions about it.",
    explanation:
      "Stories have a beginning, middle, and end. Ask yourself: Who is in the story? What happens? Where does it happen?",
    examples: ["A bird flew home.", "The girl helped her friend.", "The rain stopped."],
    keyPoints: ["Look for the main character.", "Notice what changes.", "Enjoy the story!"],
    practice: { prompt: "In a story, who is the 'main character'?", answer: "the most important person" },
  },
];

interface ProgressState {
  completedLessonIds: string[];
  streakDays: number;
  lastActiveDate: string; // yyyy-mm-dd
  activity: { lessonId: string; title: string; at: string }[];
}

function loadProgress(): ProgressState {
  return (
    getItem<ProgressState>(StorageKeys.learningProgress) ?? {
      completedLessonIds: [],
      streakDays: 0,
      lastActiveDate: "",
      activity: [],
    }
  );
}

function saveProgress(p: ProgressState) {
  setItem(StorageKeys.learningProgress, p);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function getLearningPath(): { lesson: Lesson; status: LessonStatus }[] {
  const result = getAssessmentResult();
  const p = loadProgress();
  const preferredTopic = result?.recommendedStart;

  const ordered = [...LESSONS].sort((a, b) => {
    if (!preferredTopic) return 0;
    const aw = a.topic === preferredTopic ? -1 : 0;
    const bw = b.topic === preferredTopic ? -1 : 0;
    return aw - bw;
  });

  return ordered.map((lesson, idx) => {
    const completed = p.completedLessonIds.includes(lesson.id);
    let status: LessonStatus = "locked";
    if (completed) status = "completed";
    else {
      const prev = ordered[idx - 1];
      const prevDone = !prev || p.completedLessonIds.includes(prev.id);
      status = prevDone ? "available" : "locked";
    }
    return { lesson, status };
  });
}

export function getLessonById(id: string): Lesson | null {
  return LESSONS.find((l) => l.id === id) ?? null;
}

export function getNextLesson(currentId: string): Lesson | null {
  const path = getLearningPath();
  const idx = path.findIndex((p) => p.lesson.id === currentId);
  if (idx === -1) return null;
  return path[idx + 1]?.lesson ?? null;
}

export function markLessonComplete(lesson: Lesson): void {
  const p = loadProgress();
  if (!p.completedLessonIds.includes(lesson.id)) {
    p.completedLessonIds.push(lesson.id);
  }
  p.activity.unshift({
    lessonId: lesson.id,
    title: lesson.title,
    at: new Date().toISOString(),
  });
  p.activity = p.activity.slice(0, 10);

  const t = today();
  if (p.lastActiveDate !== t) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    p.streakDays = p.lastActiveDate === yesterday ? p.streakDays + 1 : 1;
    p.lastActiveDate = t;
  }
  saveProgress(p);
}

export function getProgressSummary() {
  const p = loadProgress();
  const path = getLearningPath();
  const total = path.length;
  const completed = p.completedLessonIds.length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const topicStats = new Map<string, { total: number; done: number }>();
  for (const { lesson } of path) {
    const s = topicStats.get(lesson.topic) ?? { total: 0, done: 0 };
    s.total++;
    if (p.completedLessonIds.includes(lesson.id)) s.done++;
    topicStats.set(lesson.topic, s);
  }
  const topics = Array.from(topicStats.entries()).map(([topic, s]) => ({
    topic,
    ...s,
    percent: s.total ? Math.round((s.done / s.total) * 100) : 0,
  }));

  const result = getAssessmentResult();
  const strong = result?.strengths ?? [];
  const weak = result?.weaknesses ?? [];
  const improving = topics
    .filter((t) => t.done > 0 && weak.includes(t.topic))
    .map((t) => t.topic);

  return {
    totalLessons: total,
    completedLessons: completed,
    percent,
    topics,
    strong,
    weak,
    improving,
    streakDays: p.streakDays,
    activity: p.activity,
    level: result?.level ?? "Beginner",
  };
}

export function getContinueLesson(): Lesson | null {
  const path = getLearningPath();
  return path.find((p) => p.status === "available" || p.status === "in-progress")?.lesson ?? null;
}
