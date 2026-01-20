export type StorageKey = "demoUser" | "registeredUsers" | "appSettings" | "userProfiles";

const isBrowser = typeof window !== "undefined";

const parseSafe = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error("storage parse failed", error);
    return null;
  }
};

export const storage = {
  get: <T>(key: StorageKey): T | null => {
    if (!isBrowser) return null;
    try {
      const stored = window.localStorage.getItem(key);
      return parseSafe<T>(stored);
    } catch (error) {
      console.error("storage get error", error);
      return null;
    }
  },
  set: <T>(key: StorageKey, value: T) => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("storage set error", error);
    }
  },
  remove: (key: StorageKey) => {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error("storage remove error", error);
    }
  },
};
