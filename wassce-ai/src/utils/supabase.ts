// This module initializes the Supabase client with custom authentication storage that supports both localStorage and sessionStorage.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const isBrowser = typeof window !== "undefined";

const hasSupabaseToken = (store: Storage) => {
  for (let i = 0; i < store.length; i += 1) {
    const key = store.key(i);
    if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
  }
  return false;
};

// Determine initial storage target based on existing tokens
let authStorageTarget: Storage | null = null;

if (isBrowser) {
  authStorageTarget = hasSupabaseToken(window.sessionStorage) ? window.sessionStorage : window.localStorage;
}

const authStorage = {
  getItem: (key: string) => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (!isBrowser) return;
    const target = authStorageTarget ?? window.localStorage;
    target.setItem(key, value);
    const other = target === window.localStorage ? window.sessionStorage : window.localStorage;
    other.removeItem(key);
  },
  removeItem: (key: string) => {
    if (!isBrowser) return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export const setSupabasePersistence = (remember: boolean) => {
  if (!isBrowser) return;
  authStorageTarget = remember ? window.localStorage : window.sessionStorage;
  const source = remember ? window.sessionStorage : window.localStorage;

  for (let i = source.length - 1; i >= 0; i -= 1) {
    const key = source.key(i);
    if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
    const value = source.getItem(key);
    if (value) authStorageTarget.setItem(key, value);
    source.removeItem(key);
  }
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;