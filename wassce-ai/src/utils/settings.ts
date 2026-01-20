import { fetchUserProfile, fetchUserSettings, upsertUserProfile, upsertUserSettings, deleteUserProfile } from "./supabaseData";
import { isSupabaseConfigured } from "./supabase";

export type UserSettings = {
  openAiApiKey?: string;
  theme?: "light" | "dark";
};

export type UserProfile = {
  displayName: string;
  avatarDataUrl?: string;
  updatedAt: string;
};

let currentUserId: string | null = null;
let cachedSettings: UserSettings | null = null;
let cachedProfile: UserProfile | null = null;

export const setSettingsUser = (userId: string | null) => {
  currentUserId = userId;
  cachedSettings = null;
  cachedProfile = null;
};

export const getOpenAiApiKey = (): string | null => {
  const fromSettings = cachedSettings?.openAiApiKey?.trim();
  if (fromSettings) return fromSettings;

  const fromEnv =
    import.meta.env.VITE_AI_API_KEY?.trim() ??
    import.meta.env.VITE_OPENAI_API_KEY?.trim() ??
    import.meta.env.VITE_OPENAI_KEY?.trim() ??
    import.meta.env.VITE_API_KEY?.trim();
  return fromEnv ? fromEnv : null;
};

export const loadUserSettings = async (userId: string) => {
  if (!isSupabaseConfigured) return null;
  const settings = await fetchUserSettings(userId);
  cachedSettings = settings ?? {};
  return cachedSettings;
};

export const setOpenAiApiKey = async (value: string | null) => {
  if (!currentUserId) return;
  const trimmed = value?.trim();
  cachedSettings = { ...(cachedSettings ?? {}), openAiApiKey: trimmed ? trimmed : undefined };
  await upsertUserSettings(currentUserId, cachedSettings);
};

export const getThemePreference = (): UserSettings["theme"] => cachedSettings?.theme;

export const setThemePreference = async (next: UserSettings["theme"]) => {
  if (!currentUserId) return;
  cachedSettings = { ...(cachedSettings ?? {}), theme: next };
  await upsertUserSettings(currentUserId, cachedSettings);
};

export const loadUserProfile = async (userId: string) => {
  if (!isSupabaseConfigured) return null;
  const profile = await fetchUserProfile(userId);
  cachedProfile = profile;
  return profile;
};

export const getUserProfile = (): UserProfile | null => cachedProfile;

export const setUserProfile = async (userRef: string, profile: Omit<UserProfile, "updatedAt">) => {
  const next: UserProfile = { ...profile, updatedAt: new Date().toISOString() };
  cachedProfile = next;
  await upsertUserProfile(userRef, next);
};

export const removeUserProfile = async (userRef: string) => {
  cachedProfile = null;
  await deleteUserProfile(userRef);
};
