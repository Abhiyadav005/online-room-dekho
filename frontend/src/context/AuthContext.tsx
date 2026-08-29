import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { demoUsers } from '../data/demoRooms';
import { authService } from '../services/auth';
import type { User, UserRole } from '../types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (values: { name: string; email: string; phone: string; password: string; role: UserRole }) => Promise<User>;
  logout: () => Promise<void>;
  continueAsDemo: (role: UserRole) => void;
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
    isDemo: token === 'demo-session-token',
    async login(email, password) {
      const session = await authService.login({ email, password });
      saveSession(session.user, session.token);
      return session.user;
    },
    async register(values) {
      const session = await authService.register(values);
      saveSession(session.user, session.token);
      return session.user;
    },
    async logout() {
      try {
        if (token && token !== 'demo-session-token') await authService.logout();
      } finally {
        clearSession();
      }
    },
    continueAsDemo(role) {
      const match = demoUsers.find((candidate) => candidate.role === role) || demoUsers[0];
      saveSession(match, 'demo-session-token');
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
