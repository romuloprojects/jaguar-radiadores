export const JAGUAR_AUTH_STORAGE_KEY = "jaguar-session-profile-v2";

export interface AuthUser {
  id: number | string;
  username: string;
  displayName: string;
  role: "ADMIN" | "OPERATOR" | string;
  email?: string | null;
}

export interface AuthSession {
  expiresAt: string | null;
  mustChangePassword: boolean;
  user: AuthUser;
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(JAGUAR_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AuthSession;
    if (!value?.user?.username) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(JAGUAR_AUTH_STORAGE_KEY);
  if (session) window.sessionStorage.setItem(JAGUAR_AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function signalAuthExpired() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("jaguar:auth-expired"));
}
