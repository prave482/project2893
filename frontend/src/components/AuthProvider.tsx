'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

type AuthUser = {
  name: string;
  email: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => { ok: boolean; message?: string };
  signup: (input: SignUpInput) => { ok: boolean; message?: string };
  logout: () => void;
};

const AUTH_USER_KEY = 'life-os-auth-user';
const AUTH_PASSWORD_KEY = 'life-os-auth-password';
const AUTH_CHANGE_EVENT = 'life-os-auth-change';

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const savedUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function emitAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, readStoredUser, () => null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady: true,
      isAuthenticated: Boolean(user),
      login: ({ email, password }) => {
        const savedUser = readStoredUser();
        const savedPassword =
          typeof window !== 'undefined' ? window.localStorage.getItem(AUTH_PASSWORD_KEY) : null;

        if (!savedUser || !savedPassword) {
          return { ok: false, message: 'No account found yet. Please sign up first.' };
        }

        if (savedUser.email !== email || savedPassword !== password) {
          return { ok: false, message: 'Incorrect email or password.' };
        }

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(savedUser));
        }
        emitAuthChange();
        return { ok: true };
      },
      signup: ({ name, email, password }) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ name, email }));
          window.localStorage.setItem(AUTH_PASSWORD_KEY, password);
        }
        emitAuthChange();
        return { ok: true };
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(AUTH_USER_KEY);
        }
        emitAuthChange();
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
