export const JAGUAR_AUTH_STORAGE_KEY = "jaguar-access-session-v1";

export interface AuthUser {
  id: number | string;
  username: string;
  displayName: string;
  role: "ADMIN" | "ATENDIMENTO" | "FINANCEIRO" | "VIEWER" | string;
}

export interface AuthSession {
  token: string;
  expiresAt: string | null;
  mustChangePassword: boolean;
  user: AuthUser;
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(JAGUAR_AUTH_STORAGE_KEY) ?? window.sessionStorage.getItem(JAGUAR_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as AuthSession;
    if (!value?.token || !value?.user?.username) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession | null, persistent = false) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(JAGUAR_AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(JAGUAR_AUTH_STORAGE_KEY);
  if (!session) return;
  (persistent ? window.localStorage : window.sessionStorage).setItem(JAGUAR_AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function signalAuthExpired() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("jaguar:auth-expired"));
}
