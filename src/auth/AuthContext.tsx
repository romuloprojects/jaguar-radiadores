import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import { readAuthSession, writeAuthSession, type AuthSession } from "@/auth/auth-storage";

interface AuthContextValue {
  session: AuthSession | null;
  checking: boolean;
  login: (username: string, password: string, persistent?: boolean) => Promise<AuthSession>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshSession: () => Promise<AuthSession | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());
  const [checking, setChecking] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const next = await authService.me();
      writeAuthSession(next);
      setSession(next);
      return next;
    } catch {
      writeAuthSession(null);
      setSession(null);
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshSession().finally(() => setChecking(false));
  }, [refreshSession]);

  useEffect(() => {
    const expire = () => {
      writeAuthSession(null);
      setSession(null);
    };
    window.addEventListener("jaguar:auth-expired", expire);
    return () => window.removeEventListener("jaguar:auth-expired", expire);
  }, []);

  const login = useCallback(async (username: string, password: string, persistent = false) => {
    const next = await authService.login(username, password, persistent);
    writeAuthSession(next);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      writeAuthSession(null);
      setSession(null);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await authService.changePassword(currentPassword, newPassword);
    await refreshSession();
  }, [refreshSession]);

  const value = useMemo(
    () => ({ session, checking, login, logout, changePassword, refreshSession }),
    [session, checking, login, logout, changePassword, refreshSession],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}
