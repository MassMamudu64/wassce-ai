/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { isSupabaseConfigured, setSupabasePersistence, supabase } from "../utils/supabase";

interface User {
  id?: string;
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

const isSupabaseAuth = Boolean(isSupabaseConfigured && supabase);

const toUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  const name = String(
    supabaseUser.user_metadata?.full_name ??
      supabaseUser.user_metadata?.name ??
      supabaseUser.email ??
      "Student",
  );
  const email = supabaseUser.email ?? supabaseUser.id;
  return {
    id: supabaseUser.id,
    name,
    email,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => (isSupabaseAuth ? null : getInitialUser()));

  useEffect(() => {
    if (!isSupabaseAuth || !supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(toUser(data.session?.user ?? null));
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session?.user ?? null));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

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
    if (isSupabaseAuth && supabase) {
      setSupabasePersistence(remember);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizeEmail(email),
        password,
      });
      if (error) throw new Error(error.message);
      setUser(toUser(data.user));
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    const directory = getDirectory();
    const existing = directory[normalizedEmail];
    if (!existing) throw new Error("No account found for that email. Create an account to continue.");
    if (existing.password !== password) throw new Error("Incorrect password. Please try again.");
    persistUser({ name: existing.name, email: existing.email }, remember);
  };

  const register: AuthContextType["register"] = async (name, email, password, remember = true) => {
    if (isSupabaseAuth && supabase) {
      const trimmedName = name.trim();
      const normalizedEmail = normalizeEmail(email);
      if (!trimmedName) throw new Error("Full Name is required.");
      if (!normalizedEmail) throw new Error("Email is required.");
      if (!password) throw new Error("Password is required.");

      setSupabasePersistence(remember);
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: trimmedName },
        },
      });
      if (error) throw new Error(error.message);
      if (!data.session) {
        throw new Error("Check your email to confirm your account before signing in.");
      }
      setUser(toUser(data.user));
      return;
    }

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
    if (isSupabaseAuth && supabase) {
      if (nextPassword) {
        const { error } = await supabase.auth.updateUser({ password: nextPassword });
        if (error) throw new Error(error.message);
        return;
      }

      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail) throw new Error("Email is required.");
      const redirectTo = `${window.location.origin}/auth/forgot-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
      if (error) throw new Error(error.message);
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    if (!nextPassword) throw new Error("New password is required.");

    const directory = getDirectory();
    const existing = directory[normalizedEmail];
    if (!existing) throw new Error("No account found for that email.");

    setDirectory({ ...directory, [normalizedEmail]: { ...existing, password: nextPassword } });
  };

  const logout = () => {
    if (isSupabaseAuth && supabase) {
      void supabase.auth.signOut();
      setUser(null);
      return;
    }

    window.localStorage.removeItem(CURRENT_USER_KEY);
    window.sessionStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    signIn,
    register,
    resetPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
