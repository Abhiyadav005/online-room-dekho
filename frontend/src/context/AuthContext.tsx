import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password: string, role: UserRole) => Promise<User>;
  registerUser: (values: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  registerOwner: (values: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const readStoredUser = (): User | null => {
  try {
    const value = localStorage.getItem('roomdekho_user');
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('roomdekho_token'));

  const saveSession = useCallback((nextUser: User, nextToken: string) => {
    localStorage.setItem('roomdekho_user', JSON.stringify(nextUser));
    localStorage.setItem('roomdekho_token', nextToken);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('roomdekho_user');
    localStorage.removeItem('roomdekho_token');
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    userRole: user?.role ?? null,
    async login(email, password, role) {
      const session = await authService.login({ email, password, role });
      saveSession(session.user, session.token);
      return session.user;
    },
    async registerUser(values) {
      const session = await authService.registerUser(values);
      saveSession(session.user, session.token);
      return session.user;
    },
    async registerOwner(values) {
      const session = await authService.registerOwner(values);
      saveSession(session.user, session.token);
      return session.user;
    },
    async logout() {
      try {
        if (token) await authService.logout();
      } finally {
        clearSession();
      }
    },
    updateUser(nextUser) {
      localStorage.setItem('roomdekho_user', JSON.stringify(nextUser));
      setUser(nextUser);
    },
  }), [clearSession, saveSession, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
