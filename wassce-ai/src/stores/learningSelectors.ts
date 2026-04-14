import { useMemo } from "react";
import { useLearningStore } from "./learningStore";
import { getTopicsForSubject, getAvailableSubjects } from "../dashboard/pass-papers/seedData";
import { getDecayedMastery, getDueTopics, generateInsights } from "../core/learningEngine";
import type { TopicLearningState } from "../core/types/learning";
import { subjectLabel } from "../utils/subjects";

// ---------------------------------------------------------------------------
// Types shared across dashboard sections
// ---------------------------------------------------------------------------

export interface TopicMastery {
  subject: string;
  topic: string;
  /** Engine mastery (0–1) with decay applied. */
  mastery: number;
  /** Legacy accuracy percentage (0–100) for display. */
  accuracy: number;
  attempts: number;
  lastPracticed: string | null; // ISO date or null
  status: "weak" | "medium" | "strong" | "untested";
  /** Whether this topic is due or overdue for spaced-repetition review. */
  isDue: boolean;
  /** Whether mastery is actively decaying (not reviewed recently). */
  isDecaying: boolean;
  /** Confidence in the mastery estimate (0–1). */
  confidence: number;
  /** Days until next scheduled review (negative = overdue). */
  daysUntilReview: number | null;
}

export interface SubjectSummary {
  subject: string;
  label: string;
  /** Average mastery (0–100) across tested topics, derived from engine. */
  accuracy: number;
  topicCount: number;
  masteredCount: number;
  weakCount: number;
  untestedCount: number;
  /** Count of topics due for review. */
  dueCount: number;
}

export interface InsightMessage {
  type: "warning" | "success" | "info";
  text: string;
  action?: { label: string; to: string };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const toISODate = (d: Date) => d.toISOString().split("T")[0];

const topicKey = (subject: string, topic: string) => `${subject}::${topic}`;

function statusFromMastery(mastery: number, attempts: number): TopicMastery["status"] {
  if (attempts === 0) return "untested";
  if (mastery < 0.4) return "weak";
  if (mastery < 0.7) return "medium";
  return "strong";
}

function daysBetween(a: string, b: string): number {
  return (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24);
}

// ---------------------------------------------------------------------------
// Hook: useTopicMastery
// Derives per-topic mastery from engineState with decay applied
// ---------------------------------------------------------------------------

export function useTopicMastery(): TopicMastery[] {
  const { studentProfile, studySessions, engineState } = useLearningStore();

  return useMemo(() => {
    const subjects = studentProfile?.subjects ?? [];
    const available = getAvailableSubjects();
    const activeSubjects = subjects.filter((s) => available.includes(s));

    // Build last-practiced lookup from sessions
    const lastPracticedMap = new Map<string, string>();
    for (const session of studySessions) {
      if (!session.completed || !session.topic) continue;
      const key = `${session.subject}::${session.topic}`;
      const existing = lastPracticedMap.get(key);
      if (!existing || session.date > existing) {
        lastPracticedMap.set(key, session.date);
      }
    }

    // Build due-topics set for quick lookup
    const dueSet = new Set<string>();
    for (const d of getDueTopics(engineState)) {
      dueSet.add(d.key);
    }

    const nowISO = new Date().toISOString();
    const results: TopicMastery[] = [];

    for (const subject of activeSubjects) {
      const topics = getTopicsForSubject(subject);
      for (const topic of topics) {
        const key = topicKey(subject, topic);
        const engineTopic: TopicLearningState | undefined = engineState.topics[key];

        if (engineTopic) {
          const decayed = getDecayedMastery(engineTopic);
          const daysSinceReview = daysBetween(engineTopic.lastReviewedAt, nowISO);
          const daysUntil = daysBetween(nowISO, engineTopic.nextReviewAt);

          results.push({
            subject,
            topic,
            mastery: decayed,
            accuracy: Math.round(decayed * 100),
            attempts: engineTopic.attempts,
            lastPracticed: lastPracticedMap.get(key) ?? engineTopic.lastReviewedAt.slice(0, 10),
            status: statusFromMastery(decayed, engineTopic.attempts),
            isDue: dueSet.has(key),
            isDecaying: daysSinceReview > 1 && decayed < engineTopic.mastery,
            confidence: engineTopic.confidence,
            daysUntilReview: Math.round(daysUntil),
          });
        } else {
          // Topic not yet in engine — untested
          results.push({
            subject,
            topic,
            mastery: 0,
            accuracy: 0,
            attempts: 0,
            lastPracticed: lastPracticedMap.get(key) ?? null,
            status: "untested",
            isDue: false,
            isDecaying: false,
            confidence: 0,
            daysUntilReview: null,
          });
        }
      }
    }

    return results;
  }, [studentProfile, studySessions, engineState]);
}

// ---------------------------------------------------------------------------
// Hook: useSubjectSummaries
// Aggregated subject-level stats from engine mastery
// ---------------------------------------------------------------------------

export function useSubjectSummaries(): SubjectSummary[] {
  const topics = useTopicMastery();

  return useMemo(() => {
    const grouped = new Map<string, TopicMastery[]>();
    for (const t of topics) {
      const list = grouped.get(t.subject) ?? [];
      list.push(t);
      grouped.set(t.subject, list);
    }

    return Array.from(grouped.entries()).map(([subject, items]) => {
      const tested = items.filter((i) => i.attempts > 0);
      const avgAccuracy =
        tested.length === 0
          ? 0
          : Math.round(tested.reduce((s, i) => s + i.accuracy, 0) / tested.length);

      return {
        subject,
        label: subjectLabel(subject),
        accuracy: avgAccuracy,
        topicCount: items.length,
        masteredCount: items.filter((i) => i.status === "strong").length,
        weakCount: items.filter((i) => i.status === "weak").length,
        untestedCount: items.filter((i) => i.status === "untested").length,
        dueCount: items.filter((i) => i.isDue).length,
      };
    });
  }, [topics]);
}

// ---------------------------------------------------------------------------
// Hook: useStudyStreak
// Uses engine streak with fallback to session-based calculation
// ---------------------------------------------------------------------------

export function useStudyStreak(): number {
  const { engineState, studySessions } = useLearningStore();

  return useMemo(() => {
    // Prefer engine streak if user has been active
    if (engineState.streak > 0) return engineState.streak;

    // Fallback to session-based streak for legacy data
    const completedDates = new Set<string>();
    for (const session of studySessions) {
      if (session.completed) completedDates.add(session.date);
    }

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (completedDates.has(toISODate(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [engineState, studySessions]);
}

// ---------------------------------------------------------------------------
// Hook: useTodayStats
// ---------------------------------------------------------------------------

export function useTodayStats() {
  const { studySessions, studentProfile } = useLearningStore();

  return useMemo(() => {
    const today = toISODate(new Date());
    const todaySessions = studySessions.filter((s) => s.date === today);
    const completed = todaySessions.filter((s) => s.completed);
    const minutes = completed.reduce((sum, s) => sum + s.durationMinutes, 0);
    const goal = studentProfile?.dailyStudyGoalMinutes ?? 60;
    const goalProgress = Math.min(100, Math.round((minutes / goal) * 100));

    return { minutes, completedCount: completed.length, totalCount: todaySessions.length, goal, goalProgress };
  }, [studySessions, studentProfile]);
}

// ---------------------------------------------------------------------------
// Hook: useOverallAccuracy
// Derives from engine mastery (decayed) instead of raw studyStats
// ---------------------------------------------------------------------------

export function useOverallAccuracy(): number | null {
  const { engineState } = useLearningStore();

  return useMemo(() => {
    const topics = Object.values(engineState.topics);
    if (topics.length === 0) return null;
    const avg = topics.reduce((s, t) => s + getDecayedMastery(t), 0) / topics.length;
    return Math.round(avg * 100);
  }, [engineState]);
}

// ---------------------------------------------------------------------------
// Hook: useDueTopicsCount
// Quick count of topics due for review across active subjects
// ---------------------------------------------------------------------------

export function useDueTopicsCount(): number {
  const { studentProfile, engineState } = useLearningStore();

  return useMemo(() => {
    const subjects = studentProfile?.subjects ?? [];
    const due = getDueTopics(engineState);
    return due.filter((d) => subjects.includes(d.state.subject)).length;
  }, [studentProfile, engineState]);
}

// ---------------------------------------------------------------------------
// Hook: useInsights
// Uses engine-generated insights, mapped to the InsightMessage format
// ---------------------------------------------------------------------------

export function useInsights(): InsightMessage[] {
  const { studentProfile, engineState, studySessions } = useLearningStore();

  return useMemo(() => {
    const subjects = studentProfile?.subjects ?? [];
    if (subjects.length === 0) return [];

    const engineInsights = generateInsights(engineState, subjects);
    const insights: InsightMessage[] = [];

    for (const ei of engineInsights) {
      const actionTo = ei.action.to ?? "/dashboard/planner";
      let label = "View";
      if (ei.action.type === "start_session") label = "Practice now";
      else if (ei.action.to?.includes("progress")) label = "View progress";
      else if (ei.action.to?.includes("topics")) label = "View topics";

      insights.push({
        type: ei.type,
        text: ei.message,
        action: { label, to: actionTo },
      });
    }

    // Fallback: if engine has no data yet, show starter insight
    if (insights.length === 0 && Object.keys(engineState.topics).length === 0) {
      const recentSessions = studySessions.filter((s) => s.completed);
      if (recentSessions.length === 0) {
        insights.push({
          type: "info",
          text: "Complete your first quiz or past paper to start tracking progress",
          action: { label: "Take a quiz", to: "/dashboard/tools/quizzes" },
        });
      }
    }

    return insights;
  }, [studentProfile, engineState, studySessions]);
}

// ---------------------------------------------------------------------------
// Hook: useWeeklyActivity
// Returns per-day activity for the last 7 days
// ---------------------------------------------------------------------------

export interface DayActivity {
  date: string;
  dayLabel: string;
  minutes: number;
  sessions: number;
}

export function useWeeklyActivity(): DayActivity[] {
  const { studySessions } = useLearningStore();

  return useMemo(() => {
    const days: DayActivity[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = toISODate(d);
      const daySessions = studySessions.filter((s) => s.date === dateStr && s.completed);
      days.push({
        date: dateStr,
        dayLabel: dayNames[d.getDay()],
        minutes: daySessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        sessions: daySessions.length,
      });
    }

    return days;
  }, [studySessions]);
}
