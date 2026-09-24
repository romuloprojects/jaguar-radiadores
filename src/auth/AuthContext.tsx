import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { readAuthSession, writeAuthSession, type AuthSession } from "@/auth/auth-storage";

interface AuthContextValue {
  session: AuthSession | null;
  checking: boolean;
  login: (username: string, password: string, persistent?: boolean) => Promise<AuthSession>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = readAuthSession();
    setSession(stored);
    setChecking(false);
  }, []);

  useEffect(() => {
    const expire = () => {
      writeAuthSession(null);
      setSession(null);
    };
    window.addEventListener("jaguar:auth-expired", expire);
    return () => window.removeEventListener("jaguar:auth-expired", expire);
  }, []);

  const login = useCallback(async (username: string, password: string, persistent = false) => {
    const next = await authService.login(username, password);
    writeAuthSession(next, persistent);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    const current = session;
    writeAuthSession(null);
    setSession(null);
    if (current?.token) await authService.logout(current.token);
  }, [session]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!session?.token) throw new Error("Sessão inválida.");
    await authService.changePassword(session.token, currentPassword, newPassword);
  }, [session]);

  const value = useMemo(() => ({ session, checking, login, logout, changePassword }), [session, checking, login, logout, changePassword]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
