// Mock auth service — stores users in localStorage for demo purposes.
// Replace with real API calls when a backend is available.
import { getItem, setItem, StorageKeys } from "../utils/storage";

export type LearnerType =
  | "Student"
  | "Senior Citizen"
  | "First-Generation Learner"
  | "Discontinued Learner";

export interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  age?: number;
  gender?: string;
  educationLevel?: string;
  learnerType?: LearnerType;
  language?: string;
  createdAt: string;
}

export interface PublicUser extends Omit<StoredUser, "passwordHash"> {}

const USERS_KEY = "aarambh.users";

// Tiny non-crypto hash — this is a demo module, not real credential storage.
function hash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return `h_${h}`;
}

function loadUsers(): StoredUser[] {
  return getItem<StoredUser[]>(USERS_KEY) ?? [];
}

function saveUsers(users: StoredUser[]) {
  setItem(USERS_KEY, users);
}

function toPublic(u: StoredUser): PublicUser {
  const { passwordHash: _pw, ...rest } = u;
  return rest;
}

export function register(payload: {
  fullName: string;
  email: string;
  password: string;
  age?: number;
  gender?: string;
  educationLevel?: string;
  learnerType?: LearnerType;
  language?: string;
}): { ok: true; user: PublicUser } | { ok: false; error: string } {
  const users = loadUsers();
  const email = payload.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user: StoredUser = {
    id: `u_${Date.now()}`,
    fullName: payload.fullName.trim(),
    email,
    passwordHash: hash(payload.password),
    age: payload.age,
    gender: payload.gender,
    educationLevel: payload.educationLevel,
    learnerType: payload.learnerType,
    language: payload.language,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setItem(StorageKeys.user, toPublic(user));
  setItem(StorageKeys.session, { userId: user.id, issuedAt: Date.now() });
  setItem(StorageKeys.profileComplete, false);
  return { ok: true, user: toPublic(user) };
}

export function login(
  email: string,
  password: string,
  remember: boolean,
): { ok: true; user: PublicUser } | { ok: false; error: string } {
  const users = loadUsers();
  const found = users.find((u) => u.email === email.trim().toLowerCase());
  if (!found) return { ok: false, error: "No account found with this email." };
  if (found.passwordHash !== hash(password)) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }
  setItem(StorageKeys.user, toPublic(found));
  setItem(StorageKeys.session, {
    userId: found.id,
    issuedAt: Date.now(),
    remember,
  });
  return { ok: true, user: toPublic(found) };
}

export function requestPasswordReset(email: string): { ok: true } | { ok: false; error: string } {
  const users = loadUsers();
  if (!users.some((u) => u.email === email.trim().toLowerCase())) {
    return { ok: false, error: "No account found with this email." };
  }
  return { ok: true };
}

export function updateProfile(patch: Partial<PublicUser>): PublicUser | null {
  const current = getItem<PublicUser>(StorageKeys.user);
  if (!current) return null;
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === current.id);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  const next = toPublic(users[idx]);
  setItem(StorageKeys.user, next);
  return next;
}

export function markProfileComplete() {
  setItem(StorageKeys.profileComplete, true);
}

export function getCurrentUser(): PublicUser | null {
  return getItem<PublicUser>(StorageKeys.user);
}

// ---------- Validators ----------
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#dc2626" },
    { label: "Weak", color: "#ef4444" },
    { label: "Fair", color: "#f59e0b" },
    { label: "Good", color: "#3b82f6" },
    { label: "Strong", color: "#22c55e" },
  ] as const;
  const s = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return { score: s, label: map[s].label, color: map[s].color };
}
