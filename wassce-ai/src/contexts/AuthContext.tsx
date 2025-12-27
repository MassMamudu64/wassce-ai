import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";

interface User {
  name: string;
  email: string;
}

type StoredUser = User & { password: string };
type UserDirectory = Record<string, StoredUser>;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, remember?: boolean) => Promise<void>;
  resetPassword: (email: string, nextPassword: string) => Promise<void>;
  logout: () => void;
}

const CURRENT_USER_KEY = "currentUser";
const USERS_KEY = "registeredUsers";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const readJson = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const getDirectory = (): UserDirectory => {
  const stored = readJson<UserDirectory>(window.localStorage.getItem(USERS_KEY));
  return stored ?? {};
};

const setDirectory = (directory: UserDirectory) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(directory));
};

const getInitialUser = (): User | null => {
  const fromLocal = readJson<User>(window.localStorage.getItem(CURRENT_USER_KEY));
  if (fromLocal) return fromLocal;
  const fromSession = readJson<User>(window.sessionStorage.getItem(CURRENT_USER_KEY));
  return fromSession ?? null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getInitialUser());

  const persistUser = (nextUser: User, remember: boolean) => {
    const payload = JSON.stringify(nextUser);
    if (remember) {
      window.localStorage.setItem(CURRENT_USER_KEY, payload);
      window.sessionStorage.removeItem(CURRENT_USER_KEY);
    } else {
      window.sessionStorage.setItem(CURRENT_USER_KEY, payload);
      window.localStorage.removeItem(CURRENT_USER_KEY);
    }
    setUser(nextUser);
  };

  const signIn: AuthContextType["signIn"] = async (email, password, remember = true) => {
    const normalizedEmail = normalizeEmail(email);
    const directory = getDirectory();
    const existing = directory[normalizedEmail];
    if (!existing) throw new Error("No account found for that email. Create an account to continue.");
    if (existing.password !== password) throw new Error("Incorrect password. Please try again.");
    persistUser({ name: existing.name, email: existing.email }, remember);
  };

  const register: AuthContextType["register"] = async (name, email, password, remember = true) => {
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Full Name is required.");
    if (!normalizedEmail) throw new Error("Email is required.");
    if (!password) throw new Error("Password is required.");

    const directory = getDirectory();
    if (directory[normalizedEmail]) throw new Error("An account already exists for that email. Sign in instead.");

    const stored: StoredUser = { name: trimmedName, email: normalizedEmail, password };
    setDirectory({ ...directory, [normalizedEmail]: stored });
    persistUser({ name: stored.name, email: stored.email }, remember);
  };

  const resetPassword: AuthContextType["resetPassword"] = async (email, nextPassword) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    if (!nextPassword) throw new Error("New password is required.");

    const directory = getDirectory();
    const existing = directory[normalizedEmail];
    if (!existing) throw new Error("No account found for that email.");

    setDirectory({ ...directory, [normalizedEmail]: { ...existing, password: nextPassword } });
  };

  const logout = () => {
    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.sessionStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      signIn,
      register,
      resetPassword,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
