import { isSupabaseConfigured, supabase } from "./supabase";

export type LearningStat = {
  label: string;
  value: string;
  trend: string;
  helper?: string;
};

export type StudyTopic = {
  name: string;
  mastery: number;
  focus: string;
  nextStep: string;
};

export type SessionBlock = {
  title: string;
  duration: string;
  detail: string;
  mood: string;
};

export type SuggestedTopic = {
  title: string;
  rationale: string;
  priority: "High" | "Medium" | "Low";
};

export type RecentLearning = {
  title: string;
  description: string;
  when: string;
  status: string;
};

export type LearningTool = {
  id: string;
  label: string;
  hint: string;
  status: string;
  detail: string;
};

export interface LearningSnapshot {
  stats: LearningStat[];
  topics: StudyTopic[];
  sessions: SessionBlock[];
  suggestedTopics: SuggestedTopic[];
  recentLearning: RecentLearning[];
  tools: LearningTool[];
}

const defaultSnapshot: LearningSnapshot = {
  stats: [
    { label: "Daily practice", value: "42 minutes", trend: "+12% vs last week", helper: "8-day streak" },
    { label: "Mastered topics", value: "27 / 32", trend: "3 shy of target" },
    { label: "Security score", value: "98%", trend: "Stable" },
  ],
  topics: [
    { name: "Mathematics", mastery: 82, focus: "Algebra & calculus", nextStep: "Attempt mock 2" },
    { name: "Biology", mastery: 68, focus: "Human body systems", nextStep: "Review past papers" },
    { name: "Chemistry", mastery: 58, focus: "Chemical bonding", nextStep: "Flashcard stack" },
    { name: "English", mastery: 90, focus: "Critical reading", nextStep: "Poetry drill" },
  ],
  sessions: [
    {
      title: "Morning focus • Mathematics",
      duration: "45m",
      detail: "Adaptive calculus quiz",
      mood: "On track",
    },
    {
      title: "Afternoon session • Chemistry",
      duration: "30m",
      detail: "Whiteboard concept map",
      mood: "Needs review",
    },
    {
      title: "Evening warmup • English",
      duration: "25m",
      detail: "Reading comprehension sets",
      mood: "Ready",
    },
  ],
  suggestedTopics: [
    {
      title: "Physics past papers",
      rationale: "High-yield section trending up in last exam",
      priority: "High",
    },
    {
      title: "Economics exam strategy",
      rationale: "Score gap compared to peer average",
      priority: "Medium",
    },
    {
      title: "Study games session",
      rationale: "Build recall before mock",
      priority: "Low",
    },
  ],
  recentLearning: [
    {
      title: "Mock exam 1",
      description: "Scored 82% with tightened pacing",
      when: "1h ago",
      status: "Completed",
    },
    {
      title: "Biology flashcards",
      description: "Nervous system deck, 92% retention",
      when: "3h ago",
      status: "Mastered",
    },
    {
      title: "Chemistry lab notes",
      description: "Balanced equations summary",
      when: "Yesterday",
      status: "Filed",
    },
  ],
  tools: [
    {
      id: "flashcards",
      label: "Flashcards",
      hint: "Active recall",
      status: "120 cards ready",
      detail: "AI schedules spaced repetition for every concept you flag.",
    },
    {
      id: "quizzes",
      label: "Quizzes",
      hint: "Adaptive quiz",
      status: "Next: Linear equations",
      detail: "Question bank adapts to your accuracy and timing.",
    },
    {
      id: "notes",
      label: "Notes",
      hint: "Smart notebook",
      status: "4 summaries",
      detail: "Auto-summarize lectures and connect topics.",
    },
    {
      id: "whiteboard",
      label: "Whiteboard",
      hint: "Concept mapping",
      status: "Ideal for formulas",
      detail: "Draw diagrams and plan strategy with AI prompts.",
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
      status: "Starts in 15m",
      detail: "Mini games to reset focus before mock exams.",
    },
  ],
};

export const fetchLearningSnapshot = async (userId?: string): Promise<LearningSnapshot> => {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return defaultSnapshot;
  }

  try {
    const { data, error } = await supabase
      .from("learning_snapshots")
      .select("snapshot")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (data?.snapshot) return data.snapshot as LearningSnapshot;

    await supabase.from("learning_snapshots").insert({ user_id: userId, snapshot: defaultSnapshot });
    return defaultSnapshot;
  } catch (error) {
    console.warn("Failed to load supabase snapshot, using defaults.", error);
    return defaultSnapshot;
  }
};

export const initialLearningSnapshot = defaultSnapshot;
