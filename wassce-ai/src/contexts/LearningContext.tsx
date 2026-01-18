/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchLearningSnapshot,
  initialLearningSnapshot,
  type LearningSnapshot,
} from "../utils/api";
import { useAuth } from "./AuthContext";

interface LearningContextValue extends LearningSnapshot {
  completionRate: number;
  activeTool: string;
  selectTool: (id: string) => void;
}

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<LearningSnapshot>(initialLearningSnapshot);
  const [activeTool, setActiveTool] = useState(initialLearningSnapshot.tools[0].id);

  useEffect(() => {
    let mounted = true;

    fetchLearningSnapshot(user?.id).then((data) => {
      if (!mounted) return;
      setSnapshot(data);
      setActiveTool((previous) => data.tools.find((tool) => tool.id === previous)?.id ?? data.tools[0].id);
    });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const selectTool = useCallback((id: string) => setActiveTool(id), []);

  const completionRate = useMemo(() => {
    if (!snapshot.topics.length) return 0;
    const total = snapshot.topics.reduce((sum, topic) => sum + topic.mastery, 0);
    return Math.round(total / snapshot.topics.length);
  }, [snapshot.topics]);

  const value = useMemo(
    () => ({
      ...snapshot,
      completionRate,
      activeTool,
      selectTool,
    }),
    [snapshot, completionRate, activeTool, selectTool],
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within LearningProvider");
  }
  return context;
};
