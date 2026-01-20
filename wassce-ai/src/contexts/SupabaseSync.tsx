import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";
import { useLearningStore } from "../stores/learningStore";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useBillingStore } from "../stores/billingStore";
import { fetchBillingState, fetchLearningState, fetchWorkspaceState } from "../utils/supabaseData";
import { getThemePreference, loadUserProfile, loadUserSettings, setSettingsUser, setThemePreference } from "../utils/settings";

export default function SupabaseSync({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { setTheme, theme } = useUI();
  const setLearningUserRef = useLearningStore((state) => state.setUserRef);
  const hydrateLearning = useLearningStore((state) => state.hydrate);
  const setWorkspaceUserRef = useWorkspaceStore((state) => state.setUserRef);
  const hydrateWorkspace = useWorkspaceStore((state) => state.hydrate);
  const setBillingUserRef = useBillingStore((state) => state.setUserRef);
  const hydrateBilling = useBillingStore((state) => state.hydrate);
  const settingsReadyRef = useRef(false);

  useEffect(() => {
    const userId = user?.id ?? null;
    setSettingsUser(userId);
    setLearningUserRef(userId);
    setWorkspaceUserRef(userId);
    setBillingUserRef(userId);
    settingsReadyRef.current = false;

    if (!userId) {
      hydrateLearning(null);
      hydrateWorkspace(null);
      hydrateBilling(null);
      return;
    }

    let active = true;

    Promise.all([
      loadUserSettings(userId),
      loadUserProfile(userId),
      fetchLearningState(userId),
      fetchWorkspaceState(userId),
      fetchBillingState(userId),
    ])
      .then(([, , learningState, workspaceState, billingState]) => {
        if (!active) return;
        hydrateLearning(learningState);
        hydrateWorkspace(workspaceState);
        hydrateBilling(billingState);
        const preferredTheme = getThemePreference();
        if (preferredTheme) setTheme(preferredTheme);
        settingsReadyRef.current = true;
      })
      .catch(() => {
        if (!active) return;
        settingsReadyRef.current = true;
      });

    return () => {
      active = false;
    };
  }, [hydrateBilling, hydrateLearning, hydrateWorkspace, setBillingUserRef, setLearningUserRef, setTheme, setWorkspaceUserRef, user?.id]);

  useEffect(() => {
    if (!user?.id || !settingsReadyRef.current) return;
    void setThemePreference(theme).catch(() => {});
  }, [theme, user?.id]);

  return <>{children}</>;
}
