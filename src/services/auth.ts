import { getItem, removeItem, setItem, StorageKeys } from "../utils/storage";

const API_BASE_URL = "https://worship-pictures-retrieved-brands.trycloudflare.com";

export type LearnerType =
  "Student" | "Senior Citizen" | "First-Generation Learner" | "Discontinued Learner";

export interface PublicUser {
  id: number;
  full_name: string;
  email: string;
  preferred_language: string | null;
  education_level: string | null;
  learner_type: string | null;
  profile_completed: boolean;
  created_at: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  language?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: PublicUser;
}

type AuthSuccess = {
  ok: true;
  user: PublicUser;
};

type AuthFailure = {
  ok: false;
  error: string;
};

type AuthResult = AuthSuccess | AuthFailure;

function getErrorMessage(data: unknown, fallback: string): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return fallback;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        preferred_language: payload.language ?? "English",
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: getErrorMessage(data, "Registration failed."),
      };
    }

    const user = data as PublicUser;

    setItem(StorageKeys.user, user);
    setItem(StorageKeys.profileComplete, user.profile_completed);

    return {
      ok: true,
      user,
    };
  } catch {
    return {
      ok: false,
      error: "Unable to connect to the server.",
    };
  }
}

export async function login(
  email: string,
  password: string,
  remember: boolean,
): Promise<AuthResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: getErrorMessage(data, "Login failed."),
      };
    }

    const loginData = data as LoginResponse;

    setItem(StorageKeys.user, loginData.user);

    setItem(StorageKeys.session, {
      accessToken: loginData.access_token,
      tokenType: loginData.token_type,
      userId: loginData.user.id,
      remember,
      issuedAt: Date.now(),
    });

    setItem(StorageKeys.profileComplete, loginData.user.profile_completed);

    return {
      ok: true,
      user: loginData.user,
    };
  } catch {
    return {
      ok: false,
      error: "Unable to connect to the server.",
    };
  }
}

export function getCurrentUser(): PublicUser | null {
  return getItem<PublicUser>(StorageKeys.user);
}

export function getAccessToken(): string | null {
  return localStorage.getItem("aarambh.accessToken");
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

export function logout(): void {
  removeItem(StorageKeys.session);
  removeItem(StorageKeys.user);
  removeItem(StorageKeys.profileComplete);
}

export async function requestPasswordReset(
  _email: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return {
    ok: false,
    error: "Password reset is not implemented in the backend yet.",
  };
}

export async function updateProfile(payload: {
  full_name: string;
  preferred_language: string;
  education_level: string;
  learner_type: string;
}): Promise<PublicUser | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return null;
    }

    const updatedUser = (await response.json()) as PublicUser;

    setItem(StorageKeys.user, updatedUser);
    setItem(StorageKeys.profileComplete, updatedUser.profile_completed);

    return updatedUser;
  } catch {
    return null;
  }
}

export function markProfileComplete(): void {
  setItem(StorageKeys.profileComplete, true);

  const user = getCurrentUser();

  if (user) {
    const updatedUser: PublicUser = {
      ...user,
      profile_completed: true,
    };

    setItem(StorageKeys.user, updatedUser);
  }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function passwordStrength(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
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

  const finalScore = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;

  return {
    score: finalScore,
    label: map[finalScore].label,
    color: map[finalScore].color,
  };
}
