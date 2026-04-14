/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useLearningStore } from "../stores/learningStore";
import { useTopicMastery, useSubjectSummaries, useOverallAccuracy } from "../stores/learningSelectors";
import { subjectLabel } from "../utils/subjects";
import type { StudyTopic, SuggestedTopic, RecentLearning, LearningTool } from "../utils/api";

interface LearningContextValue {
  topics: StudyTopic[];
  suggestedTopics: SuggestedTopic[];
  recentLearning: RecentLearning[];
  tools: LearningTool[];
  completionRate: number;
  activeTool: string;
  selectTool: (id: string) => void;
}

const LearningContext = createContext<LearningContextValue | undefined>(undefined);

const TOOLS: LearningTool[] = [
  {
    id: "flashcards",
    label: "Flashcards",
    hint: "Active recall",
    status: "Ready",
    detail: "AI schedules spaced repetition for every concept you flag.",
  },
  {
    id: "quizzes",
    label: "Quizzes",
    hint: "Adaptive quiz",
    status: "Ready",
    detail: "Question bank adapts to your accuracy and timing.",
  },
  {
    id: "notes",
    label: "Notes",
    hint: "Smart notebook",
    status: "Ready",
    detail: "Capture key points during study sessions.",
  },
  {
    id: "whiteboard",
    label: "Whiteboard",
    hint: "Concept mapping",
    status: "Ready",
    detail: "Draw diagrams and plan strategy visually.",
  },
  {
    id: "calculator",
    label: "Calculator",
    hint: "Exam-ready",
    status: "Scientific mode",
    detail: "Step-by-step solutions for practice problems.",
  },
  {
    id: "aichat",
    label: "AI Chat",
    hint: "Study assistant",
    status: "Online",
    detail: "Get instant help with questions, explanations, and study tips.",
  },
  {
    id: "funbreak",
    label: "Fun Break",
    hint: "Brain recharge",
    status: "Ready",
    detail: "Mini games to reset focus before next session.",
  },
];

export const LearningProvider = ({ children }: { children: ReactNode }) => {
  const { studySessions, plannerSessions } = useLearningStore();
  const topicMastery = useTopicMastery();
  const subjectSummaries = useSubjectSummaries();
  const overallAccuracy = useOverallAccuracy();
  const [activeTool, setActiveTool] = useState("flashcards");

  const selectTool = useCallback((id: string) => setActiveTool(id), []);

  // Derive StudyTopic[] from real mastery data (per subject)
  const topics = useMemo<StudyTopic[]>(() => {
    return subjectSummaries.map((s) => {
      const weakTopics = topicMastery
        .filter((t) => t.subject === s.subject && t.status === "weak")
        .sort((a, b) => a.accuracy - b.accuracy);
      const focus = weakTopics.length > 0
        ? weakTopics[0].topic
        : s.untestedCount > 0
          ? "Explore new topics"
          : "Revision";
      const nextStep = weakTopics.length > 0
        ? `Practice ${weakTopics[0].topic} (${weakTopics[0].accuracy}%)`
        : s.untestedCount > 0
          ? `${s.untestedCount} untested topics`
          : "Review past papers";

      return {
        name: s.label,
        mastery: s.accuracy,
        focus,
        nextStep,
      };
    });
  }, [subjectSummaries, topicMastery]);

  // Derive suggested topics from weak/untested areas
  const suggestedTopics = useMemo<SuggestedTopic[]>(() => {
    const suggestions: SuggestedTopic[] = [];

    // Weak topics get high priority
    const weakByAccuracy = topicMastery
      .filter((t) => t.status === "weak")
      .sort((a, b) => a.accuracy - b.accuracy);
    for (const t of weakByAccuracy.slice(0, 2)) {
      suggestions.push({
        title: `${t.topic} (${subjectLabel(t.subject)})`,
        rationale: `Only ${t.accuracy}% accuracy after ${t.attempts} attempts`,
        priority: "High",
      });
    }

    // Untested topics get medium priority
    const untested = topicMastery.filter((t) => t.status === "untested");
    if (untested.length > 0) {
      const sample = untested.slice(0, 2);
      for (const t of sample) {
        suggestions.push({
          title: `${t.topic} (${subjectLabel(t.subject)})`,
          rationale: "Not yet practiced — try a session to establish baseline",
          priority: "Medium",
        });
      }
    }

    // If no data, suggest getting started
    if (suggestions.length === 0) {
      suggestions.push({
        title: "Start with a quiz",
        rationale: "Complete a quiz or past paper to unlock personalized suggestions",
        priority: "Medium",
      });
    }

    return suggestions.slice(0, 4);
  }, [topicMastery]);

  // Derive recent learning from completed sessions
  const recentLearning = useMemo<RecentLearning[]>(() => {
    const today = new Date();
    const sorted = [...studySessions]
      .filter((s) => s.completed)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    // Also include completed planner sessions
    const completedPlanner = [...plannerSessions]
      .filter((s) => s.completed)
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
      .slice(0, 3);

    const items: RecentLearning[] = [];

    for (const s of sorted) {
      const d = new Date(s.date);
      const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const when = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`;
      items.push({
        title: `${subjectLabel(s.subject)}${s.topic ? ` — ${s.topic}` : ""}`,
        description: `${s.durationMinutes} min ${s.kind ?? "study"} session`,
        when,
        status: "Completed",
      });
    }

    for (const s of completedPlanner) {
      if (items.length >= 5) break;
      const d = new Date(s.scheduledAt);
      const diff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const when = diff === 0 ? "Today" : diff === 1 ? "Yesterday" : `${diff} days ago`;
      items.push({
        title: `${subjectLabel(s.subject)} — ${s.topic}`,
        description: s.accuracy != null ? `Score: ${s.accuracy}%` : `${s.durationMinutes} min session`,
        when,
        status: s.accuracy != null && s.accuracy >= 70 ? "Mastered" : "Completed",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "No sessions yet",
        description: "Complete a quiz, past paper, or planner session to see activity here",
        when: "",
        status: "Pending",
      });
    }

    return items.slice(0, 5);
  }, [studySessions, plannerSessions]);

  const completionRate = useMemo(() => overallAccuracy ?? 0, [overallAccuracy]);

  const value = useMemo(
    () => ({
      topics,
      suggestedTopics,
      recentLearning,
      tools: TOOLS,
      completionRate,
      activeTool,
      selectTool,
    }),
    [topics, suggestedTopics, recentLearning, completionRate, activeTool, selectTool],
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
