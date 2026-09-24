import type { AuthSession } from "@/auth/auth-storage";

const MOCK_USER = {
  id: 1,
  username: "admin",
  displayName: "Lucas",
  role: "ADMIN",
} as const;

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const authService = {
  async login(username: string, password: string): Promise<AuthSession> {
    await delay();
    if (!username.trim() || !password) throw new Error("Informe usuário e senha.");
    return {
      token: `mock-${Date.now()}`,
      expiresAt: null,
      mustChangePassword: false,
      user: { ...MOCK_USER, username: username.trim(), displayName: username.trim().toLowerCase() === "admin" ? "Lucas" : username.trim() },
    };
  },

  async me(_token: string): Promise<Omit<AuthSession, "token">> {
    await delay(80);
    return { expiresAt: null, mustChangePassword: false, user: MOCK_USER };
  },

  async logout(_token: string) {
    await delay(80);
  },

  async changePassword(_token: string, _currentPassword: string, _newPassword: string) {
    await delay(120);
    return { ok: true };
  },
};
