// Simple typed wrapper over localStorage for the auth module.
const isBrowser = typeof window !== "undefined";

export function getItem<T = string>(key: string): T | null {
  if (!isBrowser) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return null;
  }
}

export function setItem(key: string, value: unknown): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeItem(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const StorageKeys = {
  language: "aarambh.language",
  user: "aarambh.user",
  session: "aarambh.session",
  profileComplete: "aarambh.profileComplete",
  assessmentCompleted: "aarambh.assessmentCompleted",
  assessmentResult: "aarambh.assessmentResult",
  learningProgress: "aarambh.learningProgress",
  tutorHistory: "aarambh.tutorHistory",
} as const;
