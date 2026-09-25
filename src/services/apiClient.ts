import { signalAuthExpired } from "@/auth/auth-storage";

export class JaguarApiError extends Error {
  code?: string;
  details?: unknown;
  status: number;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "JaguarApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/jaguar/${path.replace(/^\/+/, "")}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({ ok: false, message: "Resposta inválida do servidor." }));
  if (!response.ok || payload?.ok === false) {
    if (response.status === 401 || payload?.code === "UNAUTHORIZED") signalAuthExpired();
    throw new JaguarApiError(
      payload?.message || `Erro HTTP ${response.status}`,
      response.status,
      payload?.code,
      payload?.details,
    );
  }
  return payload as T;
}

export const getJson = <T>(path: string) => apiRequest<T>(path);
export const postJson = <T>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
export const patchJson = <T>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
export const deleteJson = <T>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: "DELETE", body: JSON.stringify(body ?? {}) });

export function queryString(params: Record<string, unknown>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    q.set(key, String(value));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}
