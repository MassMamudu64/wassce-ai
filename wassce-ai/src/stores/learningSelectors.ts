import { useMemo } from "react";
import { getAvailableSubjects, getTopicsForSubject } from "../dashboard/pass-papers/seedData";
import {
  generateDailyPlan,
  generateInsights,
  getDecayedMastery,
  getDueTopics,
} from "../core/learningEngine";
import type { TopicLearningState } from "../core/types/learning";
import { useLearningStore } from "./learningStore";
import { subjectLabel } from "../utils/subjects";

// ---------------------------------------------------------------------------
// Shared selector types
// ---------------------------------------------------------------------------

export interface TopicMastery {
  subject: string;
  topic: string;
  mastery: number;
  accuracy: number;
  attempts: number;
  lastPracticed: string | null;
  status: "weak" | "medium" | "strong" | "untested";
  isDue: boolean;
  isDecaying: boolean;
  confidence: number;
  daysUntilReview: number | null;
}

export interface SubjectSummary {
  subject: string;
  label: string;
  accuracy: number;
  topicCount: number;
  masteredCount: number;
  weakCount: number;
  untestedCount: number;
  dueCount: number;
}

export interface InsightMessage {
  type: "warning" | "success" | "info";
  text: string;
  action?: { label: string; to: string };
}

export interface RecommendedSessionView {
  id: string;
  subject: string;
  topic: string;
  reason: "due" | "weak" | "new" | "revision";
  durationMinutes: number;
  questionCount: number;
  source: "active" | "planned" | "generated";
}

const toISODate = (date: Date) => date.toISOString().slice(0, 10);
const topicKey = (subject: string, topic: string) => `${subject}::${topic}`;

function daysBetween(fromIso: string, toIso: string): number {
  return (new Date(toIso).getTime() - new Date(fromIso).getTime()) / (1000 * 60 * 60 * 24);
}

function statusFromMastery(mastery: number, attempts: number): TopicMastery["status"] {
  if (attempts === 0) return "untested";
  if (mastery < 0.4) return "weak";
  if (mastery < 0.75) return "medium";
  return "strong";
}

const reasonRank: Record<RecommendedSessionView["reason"], number> = {
  due: 4,
  weak: 3,
  new: 2,
  revision: 1,
};

// ---------------------------------------------------------------------------
// Topic mastery
// ---------------------------------------------------------------------------

export function useTopicMastery(): TopicMastery[] {
  const { studentProfile, studySessions, engineState } = useLearningStore();

  return useMemo(() => {
    const subjects = studentProfile?.subjects ?? [];
    const activeSubjects = subjects.filter((subject) => getAvailableSubjects().includes(subject));
    const dueSet = new Set(getDueTopics(engineState).map((entry) => entry.key));
    const lastPracticedMap = new Map<string, string>();
    const now = new Date().toISOString();

    for (const session of studySessions) {
      if (!session.completed || !session.topic) continue;
      const key = topicKey(session.subject, session.topic);
      const existing = lastPracticedMap.get(key);
      if (!existing || session.date > existing) {
        lastPracticedMap.set(key, session.date);
      }
    }

    const topics: TopicMastery[] = [];
    for (const subject of activeSubjects) {
      for (const topic of getTopicsForSubject(subject)) {
        const key = topicKey(subject, topic);
        const engineTopic: TopicLearningState | undefined = engineState.topics[key];

        if (!engineTopic) {
          topics.push({
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
          continue;
        }

        const mastery = getDecayedMastery(engineTopic);
        const daysSinceReview = Math.max(0, daysBetween(engineTopic.lastReviewedAt, now));
        const daysUntilReview = Math.round(daysBetween(now, engineTopic.nextReviewAt));

        topics.push({
          subject,
          topic,
          mastery,
          accuracy: Math.round(mastery * 100),
          attempts: engineTopic.attempts,
          lastPracticed: lastPracticedMap.get(key) ?? engineTopic.lastReviewedAt.slice(0, 10),
          status: statusFromMastery(mastery, engineTopic.attempts),
          isDue: dueSet.has(key),
          isDecaying: daysSinceReview >= 1 && mastery < engineTopic.mastery,
          confidence: engineTopic.confidence,
          daysUntilReview,
        });
      }
    }

    return topics;
  }, [engineState, studentProfile, studySessions]);
}

// ---------------------------------------------------------------------------
// Subject summaries
// ---------------------------------------------------------------------------

export function useSubjectSummaries(): SubjectSummary[] {
  const topics = useTopicMastery();

  return useMemo(() => {
    const grouped = new Map<string, TopicMastery[]>();
    for (const topic of topics) {
      const group = grouped.get(topic.subject) ?? [];
      group.push(topic);
      grouped.set(topic.subject, group);
    }

    return [...grouped.entries()].map(([subject, subjectTopics]) => {
      const testedTopics = subjectTopics.filter((topic) => topic.attempts > 0);
      const accuracy =
        testedTopics.length === 0
          ? 0
          : Math.round(
              testedTopics.reduce((sum, topic) => sum + topic.accuracy, 0) / testedTopics.length,
            );

      return {
        subject,
        label: subjectLabel(subject),
        accuracy,
        topicCount: subjectTopics.length,
        masteredCount: subjectTopics.filter((topic) => topic.status === "strong").length,
        weakCount: subjectTopics.filter((topic) => topic.status === "weak").length,
        untestedCount: subjectTopics.filter((topic) => topic.status === "untested").length,
        dueCount: subjectTopics.filter((topic) => topic.isDue).length,
      };
    });
  }, [topics]);
}

// ---------------------------------------------------------------------------
// Due topics and recommended sessions
// ---------------------------------------------------------------------------

export function useDueTopicsCount(): number {
  const { studentProfile, engineState } = useLearningStore();

  return useMemo(() => {
    const subjects = new Set(studentProfile?.subjects ?? []);
    return getDueTopics(engineState).filter((entry) => subjects.has(entry.state.subject)).length;
  }, [engineState, studentProfile]);
}

export function useDueTopicMastery(limit?: number): TopicMastery[] {
  const topics = useTopicMastery();

  return useMemo(() => {
    const due = topics
      .filter((topic) => topic.isDue)
      .sort((left, right) => {
        const leftRank = left.daysUntilReview ?? 0;
        const rightRank = right.daysUntilReview ?? 0;
        if (leftRank !== rightRank) return leftRank - rightRank;
        return left.accuracy - right.accuracy;
      });

    return typeof limit === "number" ? due.slice(0, limit) : due;
  }, [limit, topics]);
}

export function useRecommendedSession(): RecommendedSessionView | null {
  const { studentProfile, plannerSessions, engineState, activeSession } = useLearningStore();

  return useMemo(() => {
    if (!studentProfile || studentProfile.subjects.length === 0) return null;

    const today = toISODate(new Date());

    if (activeSession) {
      const planned = plannerSessions.find((session) => session.id === activeSession.sessionId);
      return {
        id: activeSession.sessionId,
        subject: activeSession.subject,
        topic: activeSession.topic,
        reason: planned?.reason ?? "due",
        durationMinutes: planned?.durationMinutes ?? Math.ceil(activeSession.questionIds.length * 1.5),
        questionCount: activeSession.questionIds.length,
        source: "active",
      };
    }

    const pendingSessions = plannerSessions
      .filter((session) => session.scheduledAt === today && !session.completed)
      .sort((left, right) => {
        const leftRank = reasonRank[left.reason];
        const rightRank = reasonRank[right.reason];
        if (leftRank !== rightRank) return rightRank - leftRank;
        return (right.priorityScore ?? 0) - (left.priorityScore ?? 0);
      });

    if (pendingSessions.length > 0) {
      const next = pendingSessions[0];
      return {
        id: next.id,
        subject: next.subject,
        topic: next.topic,
        reason: next.reason,
        durationMinutes: next.durationMinutes,
        questionCount: next.questionIds.length,
        source: "planned",
      };
    }

    const generated = generateDailyPlan({
      userState: engineState,
      subjects: studentProfile.subjects,
      date: today,
      maxSessions: 1,
      dailyCapacityMinutes: studentProfile.dailyStudyGoalMinutes,
    })[0];

    if (!generated) return null;

    return {
      id: generated.id,
      subject: generated.subject,
      topic: generated.topic,
      reason: generated.reason,
      durationMinutes: generated.durationMinutes,
      questionCount: generated.questionIds.length,
      source: "generated",
    };
  }, [activeSession, engineState, plannerSessions, studentProfile]);
}

// ---------------------------------------------------------------------------
// Progress and activity
// ---------------------------------------------------------------------------

export function useStudyStreak(): number {
  const { engineState, studySessions } = useLearningStore();

  return useMemo(() => {
    if (engineState.streak > 0) return engineState.streak;

    const completedDates = new Set(
      studySessions.filter((session) => session.completed).map((session) => session.date),
    );

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    while (completedDates.has(toISODate(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [engineState, studySessions]);
}

export function useTodayStats() {
  const { studySessions, studentProfile } = useLearningStore();

  return useMemo(() => {
    const today = toISODate(new Date());
    const todaySessions = studySessions.filter((session) => session.date === today);
    const completedSessions = todaySessions.filter((session) => session.completed);
    const minutes = completedSessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const goal = studentProfile?.dailyStudyGoalMinutes ?? 60;

    return {
      minutes,
      completedCount: completedSessions.length,
      totalCount: todaySessions.length,
      goal,
      goalProgress: Math.min(100, Math.round((minutes / goal) * 100)),
    };
  }, [studentProfile, studySessions]);
}

export function useOverallAccuracy(): number | null {
  const { engineState } = useLearningStore();

  return useMemo(() => {
    const topics = Object.values(engineState.topics).filter((topic) => topic.attempts > 0);
    if (topics.length === 0) return null;

    const average =
      topics.reduce((sum, topic) => sum + getDecayedMastery(topic), 0) / topics.length;
    return Math.round(average * 100);
  }, [engineState]);
}

export interface DayActivity {
  date: string;
  dayLabel: string;
  minutes: number;
  sessions: number;
}

export function useWeeklyActivity(): DayActivity[] {
  const { studySessions } = useLearningStore();

  return useMemo(() => {
    const activity: DayActivity[] = [];
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      day.setHours(0, 0, 0, 0);
      const date = toISODate(day);
      const sessions = studySessions.filter(
        (session) => session.completed && session.date === date,
      );

      activity.push({
        date,
        dayLabel: labels[day.getDay()],
        minutes: sessions.reduce((sum, session) => sum + session.durationMinutes, 0),
        sessions: sessions.length,
      });
    }

    return activity;
  }, [studySessions]);
}

// ---------------------------------------------------------------------------
// Exam readiness (composite WAEC readiness score)
// ---------------------------------------------------------------------------

export interface ReadinessScore {
  /** 0–100 composite readiness, or null before any topic is attempted. */
  score: number | null;
  /** Human band used for copy and colour. */
  band: "ready" | "on-track" | "building" | "starting" | "none";
  label: string;
  /** Share of the syllabus the student has actually practised (0–1). */
  coverage: number;
  testedCount: number;
  totalCount: number;
}

function readinessBand(score: number): { band: ReadinessScore["band"]; label: string } {
  if (score >= 75) return { band: "ready", label: "Exam ready" };
  if (score >= 50) return { band: "on-track", label: "On track" };
  if (score >= 25) return { band: "building", label: "Building up" };
  return { band: "starting", label: "Getting started" };
}

/**
 * Blends effective mastery with syllabus coverage into a single motivating
 * readiness number. Mastery answers "how good are you on what you've tried",
 * coverage answers "how much of the exam have you faced" — WAEC needs both.
 */
export function useReadinessScore(): ReadinessScore {
  const topics = useTopicMastery();

  return useMemo(() => {
    const totalCount = topics.length;
    const tested = topics.filter((topic) => topic.attempts > 0);

    if (totalCount === 0 || tested.length === 0) {
      return { score: null, band: "none", label: "Not started", coverage: 0, testedCount: 0, totalCount };
    }

    const avgMastery = tested.reduce((sum, topic) => sum + topic.mastery, 0) / tested.length;
    const coverage = tested.length / totalCount;
    const score = Math.round((avgMastery * 0.65 + coverage * 0.35) * 100);
    const { band, label } = readinessBand(score);

    return { score, band, label, coverage, testedCount: tested.length, totalCount };
  }, [topics]);
}

// ---------------------------------------------------------------------------
// Weekly study totals (for goal rings / streak hero)
// ---------------------------------------------------------------------------

export interface WeeklyStats {
  minutes: number;
  goalMinutes: number;
  goalProgress: number;
  activeDays: number;
}

export function useWeeklyStats(): WeeklyStats {
  const activity = useWeeklyActivity();
  const { studentProfile } = useLearningStore();

  return useMemo(() => {
    const minutes = activity.reduce((sum, day) => sum + day.minutes, 0);
    const activeDays = activity.filter((day) => day.minutes > 0).length;
    const goalMinutes = (studentProfile?.dailyStudyGoalMinutes ?? 60) * 7;

    return {
      minutes,
      goalMinutes,
      goalProgress: goalMinutes > 0 ? Math.min(100, Math.round((minutes / goalMinutes) * 100)) : 0,
      activeDays,
    };
  }, [activity, studentProfile]);
}

// ---------------------------------------------------------------------------
// Insights
// ---------------------------------------------------------------------------

export function useInsights(): InsightMessage[] {
  const { studentProfile, engineState, studySessions } = useLearningStore();

  return useMemo(() => {
    const subjects = studentProfile?.subjects ?? [];
    if (subjects.length === 0) return [];

    const engineInsights = generateInsights(engineState, subjects);
    const insights = engineInsights.map<InsightMessage>((insight) => {
      const to = insight.action.to ?? "/dashboard/planner";
      const label =
        insight.action.type === "start_session"
          ? "Start review"
          : to.includes("progress")
            ? "View progress"
            : to.includes("topics")
              ? "View topics"
              : "Open planner";

      return {
        type: insight.type,
        text: insight.message,
        action: { label, to },
      };
    });

    if (insights.length === 0 && studySessions.filter((session) => session.completed).length === 0) {
      return [
        {
          type: "info",
          text: "Complete a past paper or quiz to initialize your adaptive learning state",
          action: { label: "Start practice", to: "/dashboard/planner" },
        },
      ];
    }

    return insights;
  }, [engineState, studentProfile, studySessions]);
}
