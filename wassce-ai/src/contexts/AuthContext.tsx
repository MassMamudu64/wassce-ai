/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { setSupabasePersistence, supabase } from "../utils/supabase";

interface User {
  id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, remember?: boolean) => Promise<void>;
  resetPassword: (email: string, nextPassword: string) => Promise<void>;
  logout: () => void;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

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
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!supabase) return;
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

  const signIn: AuthContextType["signIn"] = async (email, password, remember = true) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    setSupabasePersistence(remember);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) throw new Error(error.message);
    setUser(toUser(data.user));
  };

  const register: AuthContextType["register"] = async (name, email, password, remember = true) => {
    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Full Name is required.");
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error("Email is required.");
    if (!password) throw new Error("Password is required.");

    if (!supabase) throw new Error("Supabase is not configured.");
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
  };

  const resetPassword: AuthContextType["resetPassword"] = async (email, nextPassword) => {
    if (!supabase) throw new Error("Supabase is not configured.");
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
  };

  const logout = () => {
    if (!supabase) return;
    void supabase.auth.signOut();
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
