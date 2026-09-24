import type { AuthSession } from "@/auth/auth-storage";
import { jaguarApi } from "@/services/jaguarApi";

function toSession(payload: Awaited<ReturnType<typeof jaguarApi.auth.session>>): AuthSession {
  return {
    expiresAt: payload.expiresAt ?? null,
    mustChangePassword: Boolean(payload.mustChangePassword),
    user: {
      id: payload.user.id,
      username: payload.user.username,
      displayName: payload.user.displayName,
      role: String(payload.user.role || "OPERATOR").toUpperCase(),
      email: payload.user.email ?? null,
    },
  };
}

export const authService = {
  async login(username: string, password: string, persistent = false): Promise<AuthSession> {
    return toSession(await jaguarApi.auth.login(username, password, persistent));
  },
  async me(): Promise<AuthSession> {
    return toSession(await jaguarApi.auth.session());
  },
  async logout() {
    await jaguarApi.auth.logout();
  },
  async changePassword(currentPassword: string, newPassword: string) {
    await jaguarApi.auth.changePassword(currentPassword, newPassword);
  },
};
