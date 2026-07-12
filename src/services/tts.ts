// Browser Text-to-Speech wrapper using the Web Speech Synthesis API.
// Kept intentionally isolated from assessment logic.

export type TTSStatus = "idle" | "speaking" | "unsupported" | "error";

export function isTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (!isTTSSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang?.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;
  const prefix = lang.split("-")[0].toLowerCase();
  return voices.find((v) => v.lang?.toLowerCase().startsWith(prefix)) ?? null;
}

export interface SpeakOptions {
  text: string;
  lang?: string;      // BCP-47 (e.g. "en-US", "hi-IN", "te-IN")
  rate?: number;      // 0.5..2, default 0.95 (slightly slower for learners)
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export function speak(opts: SpeakOptions): void {
  if (!isTTSSupported()) {
    opts.onError?.("Text-to-Speech is not supported in this browser.");
    return;
  }
  cancelSpeech();
  const utter = new SpeechSynthesisUtterance(opts.text);
  utter.lang = opts.lang ?? "en-US";
  utter.rate = opts.rate ?? 0.95;
  const voice = pickVoice(utter.lang);
  if (voice) utter.voice = voice;
  utter.onstart = () => opts.onStart?.();
  utter.onend = () => { currentUtterance = null; opts.onEnd?.(); };
  utter.onerror = (e) => {
    currentUtterance = null;
    opts.onError?.(e.error || "Playback failed.");
  };
  currentUtterance = utter;
  window.speechSynthesis.speak(utter);
}

export function cancelSpeech(): void {
  if (!isTTSSupported()) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

// Voices load asynchronously on many browsers. Consumers can subscribe.
export function onVoicesReady(cb: () => void): () => void {
  if (!isTTSSupported()) return () => {};
  const handler = () => cb();
  window.speechSynthesis.addEventListener("voiceschanged", handler);
  // Trigger initial fetch
  window.speechSynthesis.getVoices();
  return () => window.speechSynthesis.removeEventListener("voiceschanged", handler);
}
