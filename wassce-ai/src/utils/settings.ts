import { storage } from "./storage";

type AppSettings = {
  openAiApiKey?: string;
};

const SETTINGS_KEY = "appSettings" as const;

const getSettings = (): AppSettings => storage.get<AppSettings>(SETTINGS_KEY) ?? {};

export const getOpenAiApiKey = (): string | null => {
  const fromSettings = getSettings().openAiApiKey?.trim();
  if (fromSettings) return fromSettings;

  const fromEnv =
    import.meta.env.VITE_AI_API_KEY?.trim() ??
    import.meta.env.VITE_OPENAI_API_KEY?.trim() ??
    import.meta.env.VITE_OPENAI_KEY?.trim() ??
    import.meta.env.VITE_API_KEY?.trim();
  return fromEnv ? fromEnv : null;
};

export const setOpenAiApiKey = (value: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) {
    const settings = getSettings();
    if (!settings.openAiApiKey) return;
    const { openAiApiKey: _removed, ...rest } = settings;
    storage.set(SETTINGS_KEY, rest);
    return;
  }

  storage.set(SETTINGS_KEY, { ...getSettings(), openAiApiKey: trimmed });
};
