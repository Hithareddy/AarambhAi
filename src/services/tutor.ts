// Mock AI Tutor service. Replace with real API when available.
export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: string;
}

export const SUGGESTED_QUESTIONS = [
  "Can you explain what a vowel is?",
  "How do I read a long word?",
  "What is 12 × 8?",
  "Give me a tip to remember new words.",
  "How can I improve my handwriting?",
];

const REPLIES: { match: RegExp; reply: string }[] = [
  {
    match: /vowel/i,
    reply:
      "A vowel is a letter that makes an open sound: A, E, I, O, U (and sometimes Y). Every English word has at least one vowel.",
  },
  {
    match: /long word|read.*word/i,
    reply:
      "Break the word into small parts (syllables). Read each part slowly, then say them together. For example: 'un-der-stand' → 'understand'.",
  },
  {
    match: /(\d+)\s*[x×*]\s*(\d+)/i,
    reply: "",
  },
  {
    match: /remember|memori[sz]e/i,
    reply:
      "Say the word out loud, write it 3 times, then use it in your own sentence. Reviewing after a day helps too.",
  },
  {
    match: /handwriting|write neat/i,
    reply:
      "Sit comfortably, hold the pen loosely, and try to keep letters the same size. Slow, steady practice for 5 minutes a day works wonders.",
  },
];

export function mockTutorReply(userText: string): string {
  const mult = userText.match(/(\d+)\s*[x×*]\s*(\d+)/i);
  if (mult) {
    const a = Number(mult[1]);
    const b = Number(mult[2]);
    return `${a} × ${b} = ${a * b}. Great question!`;
  }
  for (const r of REPLIES) {
    if (r.match.test(userText) && r.reply) return r.reply;
  }
  return "That's a wonderful question! Let's take it step by step. Could you tell me a little more about what you'd like to learn?";
}

export function newMessage(role: TutorMessage["role"], text: string): TutorMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    text,
    at: new Date().toISOString(),
  };
}
