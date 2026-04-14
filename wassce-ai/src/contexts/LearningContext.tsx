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
import {
  useDueTopicMastery,
  useOverallAccuracy,
  useRecommendedSession,
  useSubjectSummaries,
  useTopicMastery,
} from "../stores/learningSelectors";
import { subjectLabel } from "../utils/subjects";
import type { LearningTool, RecentLearning, StudyTopic, SuggestedTopic } from "../utils/api";

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
  const dueTopics = useDueTopicMastery(3);
  const recommendedSession = useRecommendedSession();
  const [activeTool, setActiveTool] = useState("flashcards");

  const selectTool = useCallback((id: string) => setActiveTool(id), []);

  const topics = useMemo<StudyTopic[]>(() => {
    return subjectSummaries.map((summary) => {
      const weakTopics = topicMastery
        .filter((topic) => topic.subject === summary.subject && topic.status === "weak")
        .sort((left, right) => left.accuracy - right.accuracy);

      const focus =
        weakTopics.length > 0
          ? weakTopics[0].topic
          : summary.untestedCount > 0
            ? "Explore new topics"
            : "Revision";

      const nextStep =
        weakTopics.length > 0
          ? `Practice ${weakTopics[0].topic} (${weakTopics[0].accuracy}%)`
          : summary.dueCount > 0
            ? `${summary.dueCount} review topics due`
            : summary.untestedCount > 0
              ? `${summary.untestedCount} untested topics`
              : "Review past papers";

      return {
        name: summary.label,
        mastery: summary.accuracy,
        focus,
        nextStep,
      };
    });
  }, [subjectSummaries, topicMastery]);

  const suggestedTopics = useMemo<SuggestedTopic[]>(() => {
    const suggestions: SuggestedTopic[] = [];

    if (recommendedSession) {
      suggestions.push({
        title: `${recommendedSession.topic} (${subjectLabel(recommendedSession.subject)})`,
        rationale: `${recommendedSession.reason} session queued for today`,
        priority: "High",
      });
    }

    for (const topic of dueTopics) {
      suggestions.push({
        title: `${topic.topic} (${subjectLabel(topic.subject)})`,
        rationale:
          topic.daysUntilReview != null && topic.daysUntilReview <= 0
            ? `Overdue review with ${topic.accuracy}% effective mastery`
            : "Due for review soon",
        priority: "High",
      });
    }

    const weakByAccuracy = topicMastery
      .filter((topic) => topic.status === "weak")
      .sort((left, right) => left.accuracy - right.accuracy);

    for (const topic of weakByAccuracy.slice(0, 2)) {
      suggestions.push({
        title: `${topic.topic} (${subjectLabel(topic.subject)})`,
        rationale: `Only ${topic.accuracy}% mastery after ${topic.attempts} attempts`,
        priority: "Medium",
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        title: "Start with a past paper",
        rationale: "Complete a quiz or past paper to initialize the adaptive engine",
        priority: "Medium",
      });
    }

    return suggestions.slice(0, 4);
  }, [dueTopics, recommendedSession, topicMastery]);

  const recentLearning = useMemo<RecentLearning[]>(() => {
    const today = new Date();
    const completedStudySessions = [...studySessions]
      .filter((session) => session.completed)
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 5);

    const completedPlannerSessions = [...plannerSessions]
      .filter((session) => session.completed)
      .sort((left, right) => right.scheduledAt.localeCompare(left.scheduledAt))
      .slice(0, 3);

    const items: RecentLearning[] = [];

    for (const session of completedStudySessions) {
      const date = new Date(session.date);
      const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const when = dayDiff === 0 ? "Today" : dayDiff === 1 ? "Yesterday" : `${dayDiff} days ago`;

      items.push({
        title: `${subjectLabel(session.subject)}${session.topic ? ` - ${session.topic}` : ""}`,
        description: `${session.durationMinutes} min ${session.kind ?? "study"} session`,
        when,
        status: "Completed",
      });
    }

    for (const session of completedPlannerSessions) {
      if (items.length >= 5) break;
      const date = new Date(session.scheduledAt);
      const dayDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      const when = dayDiff === 0 ? "Today" : dayDiff === 1 ? "Yesterday" : `${dayDiff} days ago`;

      items.push({
        title: `${subjectLabel(session.subject)} - ${session.topic}`,
        description:
          session.accuracy != null
            ? `Score: ${session.accuracy}%`
            : `${session.durationMinutes} min session`,
        when,
        status: session.accuracy != null && session.accuracy >= 70 ? "Mastered" : "Completed",
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
  }, [plannerSessions, studySessions]);

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
