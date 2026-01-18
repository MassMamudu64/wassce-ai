/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "light" | "dark";

interface UIContextValue {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  theme: ThemeMode;
  toggleTheme: () => void;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("wassce-ai-theme");
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const value = useMemo(
    () => ({
      sidebarOpen,
      sidebarCollapsed,
      toggleSidebar: () => setSidebarOpen((prev) => !prev),
      setSidebarOpen,
      toggleSidebarCollapsed: () => setSidebarCollapsed((prev) => !prev),
      theme,
      toggleTheme: () => setTheme((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [sidebarCollapsed, sidebarOpen, theme],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("wassce-ai-theme", theme);
  }, [theme]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};
