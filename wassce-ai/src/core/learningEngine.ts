// ---------------------------------------------------------------------------
// Adaptive Learning Engine
// ---------------------------------------------------------------------------

import type {
  EngineInsight,
  EngineSession,
  QuestionResult,
  SessionResults,
  TopicLearningState,
  TopicReviewResult,
  UserLearningState,
} from "./types/learning";
import {
  getAvailableSubjects,
  getQuestionsBySubject,
  getQuestionsByTopic,
  getTopicsForSubject,
} from "../dashboard/pass-papers/seedData";

const INITIAL_DECAY_RATE = 0.05;
const MIN_DECAY_RATE = 0.01;
const MAX_DECAY_RATE = 0.09;
const INITIAL_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 60;
const MIN_SESSION_QUESTIONS = 5;
const MAX_SESSION_QUESTIONS = 10;
const MINUTES_PER_QUESTION = 1.5;
const DEFAULT_MAX_SESSIONS = 5;
const DEFAULT_DAILY_CAPACITY_MINUTES = 75;
const WEAK_MASTERY_THRESHOLD = 0.6;
const STRONG_MASTERY_THRESHOLD = 0.8;
const EXPECTED_TIME_MS = 60_000;
const REVIEW_PRIORITY_WEIGHT = 100;
const WEAK_PRIORITY_WEIGHT = 60;
const NEW_PRIORITY_WEIGHT = 30;
const REVISION_PRIORITY_WEIGHT = 10;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const topicKey = (subject: string, topic: string) => `${subject}::${topic}`;

const nowISO = () => new Date().toISOString();
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => `eng-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function diffDays(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return (to - from) / MS_PER_DAY;
}

function addDays(iso: string, days: number): string {
  const next = new Date(iso);
  next.setDate(next.getDate() + Math.round(days));
  return next.toISOString();
}

function getDecayAnchor(topic: TopicLearningState): string {
  return topic.lastDecayAppliedAt || topic.lastReviewedAt;
}

function getQuestionCountForMinutes(minutesRemaining: number): number {
  const estimate = Math.floor(minutesRemaining / MINUTES_PER_QUESTION);
  return clamp(estimate, MIN_SESSION_QUESTIONS, MAX_SESSION_QUESTIONS);
}

function interleaveQuestionsByYear<T extends { year: number; paper: number; id: string }>(
  questions: T[],
): T[] {
  const byYear = new Map<number, T[]>();
  for (const question of questions) {
    const group = byYear.get(question.year) ?? [];
    group.push(question);
    byYear.set(question.year, group);
  }

  const sortedYears = [...byYear.keys()].sort((a, b) => b - a);
  for (const year of sortedYears) {
    const group = byYear.get(year) ?? [];
    group.sort((a, b) => a.paper - b.paper || a.id.localeCompare(b.id));
    byYear.set(year, group);
  }

  const ordered: T[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const year of sortedYears) {
      const group = byYear.get(year) ?? [];
      const nextQuestion = group.shift();
      if (!nextQuestion) continue;
      ordered.push(nextQuestion);
      added = true;
    }
  }

  return ordered;
}

function summariseResults(
  state: TopicLearningState,
  results: QuestionResult[],
  reviewedAt: string,
): TopicReviewResult {
  const total = results.length;
  const correct = results.filter((result) => result.correct).length;
  const accuracy = total === 0 ? 0 : correct / total;
  const timeSpentMs = results.reduce((sum, result) => sum + result.timeMs, 0);
  const averageTimeMs = total === 0 ? state.averageTimeMs : timeSpentMs / total;
  const masteryBefore = getDecayedMastery(state, reviewedAt);

  return {
    topic: state.topic,
    subject: state.subject,
    correct,
    total,
    accuracy,
    timeSpentMs,
    averageTimeMs,
    masteryBefore,
    masteryAfter: masteryBefore,
    confidenceAfter: state.confidence,
  };
}

function sortByPriority<T extends { priorityScore: number }>(items: T[]): T[] {
  return [...items].sort((left, right) => right.priorityScore - left.priorityScore);
}

export function createTopicState(subject: string, topic: string, createdAt = nowISO()): TopicLearningState {
  return {
    topic,
    subject,
    mastery: 0,
    confidence: 0,
    lastReviewedAt: createdAt,
    nextReviewAt: createdAt,
    decayRate: INITIAL_DECAY_RATE,
    attempts: 0,
    correct: 0,
    averageTimeMs: EXPECTED_TIME_MS,
    intervalDays: INITIAL_INTERVAL_DAYS,
    streak: 0,
    lastDecayAppliedAt: createdAt,
  };
}

export function emptyUserState(): UserLearningState {
  return {
    topics: {},
    streak: 0,
    lastActiveDate: "",
  };
}

export function getDecayedMastery(topic: TopicLearningState, asOf = nowISO()): number {
  const decayStart = getDecayAnchor(topic);
  const elapsedDays = Math.max(0, diffDays(decayStart, asOf));
  return clamp(topic.mastery - elapsedDays * topic.decayRate, 0, 1);
}

export function scheduleNextReview(
  topic: TopicLearningState,
  review: Pick<TopicReviewResult, "accuracy" | "averageTimeMs">,
  reviewedAt = nowISO(),
): Pick<TopicLearningState, "intervalDays" | "nextReviewAt"> {
  const speedFactor = clamp(EXPECTED_TIME_MS / Math.max(review.averageTimeMs, 1000), 0.75, 1.35);

  if (review.accuracy >= 0.7) {
    const baseGrowth = 1.6 + review.accuracy * 0.9;
    const nextInterval = clamp(
      topic.intervalDays * baseGrowth * speedFactor,
      INITIAL_INTERVAL_DAYS,
      MAX_INTERVAL_DAYS,
    );

    return {
      intervalDays: nextInterval,
      nextReviewAt: addDays(reviewedAt, nextInterval),
    };
  }

  return {
    intervalDays: INITIAL_INTERVAL_DAYS,
    nextReviewAt: addDays(reviewedAt, 1),
  };
}

export function updateMastery(
  state: TopicLearningState,
  results: QuestionResult[],
  reviewedAt = nowISO(),
): TopicLearningState {
  if (results.length === 0) return state;

  const review = summariseResults(state, results, reviewedAt);
  const speedFactor = clamp(EXPECTED_TIME_MS / Math.max(review.averageTimeMs, 1000), 0.65, 1.35);
  const attemptFactor = clamp(1 / Math.sqrt(Math.max(state.attempts, 1)), 0.35, 1);
  const recencyAdjustedMastery = review.masteryBefore;

  const gain =
    review.accuracy *
    speedFactor *
    (0.18 + (1 - recencyAdjustedMastery) * 0.18) *
    (0.55 + attemptFactor * 0.45);

  const loss =
    (1 - review.accuracy) *
    (0.12 + recencyAdjustedMastery * 0.16) *
    clamp(1.2 - speedFactor * 0.15, 0.9, 1.2);

  const nextAttempts = state.attempts + review.total;
  const nextCorrect = state.correct + review.correct;
  const evidenceGain = clamp(review.total / 12, 0.05, 0.25);

  const nextMastery = clamp(recencyAdjustedMastery + gain - loss, 0, 1);
  const nextConfidence = clamp(
    state.confidence +
      evidenceGain * (0.35 + review.accuracy * 0.45) -
      (1 - review.accuracy) * 0.08,
    0,
    1,
  );

  const rollingAverageTime =
    nextAttempts === review.total
      ? review.averageTimeMs
      : (state.averageTimeMs * state.attempts + review.timeSpentMs) / nextAttempts;

  const nextDecayRate =
    review.accuracy >= 0.7
      ? clamp(state.decayRate * 0.88, MIN_DECAY_RATE, MAX_DECAY_RATE)
      : clamp(state.decayRate * 1.18, MIN_DECAY_RATE, MAX_DECAY_RATE);

  const streak = review.accuracy >= 0.7 ? state.streak + 1 : 0;
  const scheduled = scheduleNextReview(
    {
      ...state,
      mastery: nextMastery,
      confidence: nextConfidence,
      decayRate: nextDecayRate,
      attempts: nextAttempts,
      correct: nextCorrect,
      averageTimeMs: rollingAverageTime,
      streak,
      lastReviewedAt: reviewedAt,
      lastDecayAppliedAt: reviewedAt,
    },
    review,
    reviewedAt,
  );

  review.masteryAfter = nextMastery;
  review.confidenceAfter = nextConfidence;

  return {
    ...state,
    mastery: nextMastery,
    confidence: nextConfidence,
    lastReviewedAt: reviewedAt,
    nextReviewAt: scheduled.nextReviewAt,
    decayRate: nextDecayRate,
    attempts: nextAttempts,
    correct: nextCorrect,
    averageTimeMs: Math.round(rollingAverageTime),
    intervalDays: scheduled.intervalDays,
    streak,
    lastDecayAppliedAt: reviewedAt,
  };
}

export function applyDecay(state: UserLearningState, asOf = nowISO()): UserLearningState {
  if (Object.keys(state.topics).length === 0) return state;

  let changed = false;
  const nextTopics: UserLearningState["topics"] = {};

  for (const [key, topic] of Object.entries(state.topics)) {
    const decayStart = getDecayAnchor(topic);
    const elapsedDays = Math.max(0, diffDays(decayStart, asOf));

    if (elapsedDays < 0.01) {
      nextTopics[key] = topic;
      continue;
    }

    const nextMastery = clamp(topic.mastery - elapsedDays * topic.decayRate, 0, 1);
    const nextTopic =
      nextMastery === topic.mastery && decayStart === asOf
        ? topic
        : {
            ...topic,
            mastery: nextMastery,
            lastDecayAppliedAt: asOf,
          };

    if (nextTopic !== topic) changed = true;
    nextTopics[key] = nextTopic;
  }

  if (!changed) return state;
  return {
    ...state,
    topics: nextTopics,
  };
}

export interface DueTopic {
  key: string;
  state: TopicLearningState;
  overdueDays: number;
  decayedMastery: number;
  priorityScore: number;
}

export function getDueTopics(state: UserLearningState, asOf = nowISO()): DueTopic[] {
  const dueTopics: DueTopic[] = [];

  for (const [key, topic] of Object.entries(state.topics)) {
    const isDue = new Date(topic.nextReviewAt).getTime() <= new Date(asOf).getTime();
    if (!isDue) continue;

    const overdueDays = Math.max(0, diffDays(topic.nextReviewAt, asOf));
    const decayedMastery = getDecayedMastery(topic, asOf);
    const priorityScore =
      REVIEW_PRIORITY_WEIGHT +
      overdueDays * 18 +
      (1 - decayedMastery) * 40 +
      (1 - topic.confidence) * 12;

    dueTopics.push({
      key,
      state: topic,
      overdueDays,
      decayedMastery,
      priorityScore,
    });
  }

  return sortByPriority(dueTopics);
}

interface DailyPlanOptions {
  userState: UserLearningState;
  subjects: string[];
  maxSessions?: number;
  completedQuestionIds?: string[];
  date?: string;
  dailyCapacityMinutes?: number;
}

function buildSession(
  subject: string,
  topic: string,
  reason: EngineSession["reason"],
  scheduledAt: string,
  usedIds: Set<string>,
  minutesRemaining: number,
  priorityScore: number,
): EngineSession | null {
  const desiredQuestionCount = getQuestionCountForMinutes(minutesRemaining);

  let pool = getQuestionsByTopic(subject, topic).filter((question) => !usedIds.has(question.id));
  if (pool.length < MIN_SESSION_QUESTIONS) {
    pool = getQuestionsBySubject(subject).filter((question) => !usedIds.has(question.id));
  }
  if (pool.length === 0) return null;

  const orderedPool = interleaveQuestionsByYear(pool);
  const selected = orderedPool.slice(0, desiredQuestionCount);
  if (selected.length === 0) return null;

  for (const question of selected) {
    usedIds.add(question.id);
  }

  return {
    id: uid(),
    subject,
    topic,
    reason,
    questionIds: selected.map((question) => question.id),
    durationMinutes: Math.ceil(selected.length * MINUTES_PER_QUESTION),
    scheduledAt,
    priorityScore,
  };
}

export function generateDailyPlan({
  userState,
  subjects,
  maxSessions = DEFAULT_MAX_SESSIONS,
  completedQuestionIds = [],
  date,
  dailyCapacityMinutes = DEFAULT_DAILY_CAPACITY_MINUTES,
}: DailyPlanOptions): EngineSession[] {
  const scheduledAt = date ?? todayISO();
  const availableSubjects = new Set(getAvailableSubjects());
  const activeSubjects = subjects.filter((subject) => availableSubjects.has(subject));
  const usedIds = new Set(completedQuestionIds);
  const sessions: EngineSession[] = [];
  let minutesRemaining = Math.max(dailyCapacityMinutes, MIN_SESSION_QUESTIONS * MINUTES_PER_QUESTION);

  const dueTopics = getDueTopics(userState)
    .filter((entry) => activeSubjects.includes(entry.state.subject))
    .map((entry) => ({
      subject: entry.state.subject,
      topic: entry.state.topic,
      reason: "due" as const,
      priorityScore: entry.priorityScore,
    }));

  const scheduledKeys = new Set<string>();
  for (const due of dueTopics) {
    if (sessions.length >= maxSessions || minutesRemaining < MINUTES_PER_QUESTION) break;
    const session = buildSession(
      due.subject,
      due.topic,
      due.reason,
      scheduledAt,
      usedIds,
      minutesRemaining,
      due.priorityScore,
    );
    if (!session) continue;
    sessions.push(session);
    scheduledKeys.add(topicKey(session.subject, session.topic));
    minutesRemaining -= session.durationMinutes;
  }

  const weakTopics = Object.values(userState.topics)
    .filter((topic) => activeSubjects.includes(topic.subject))
    .map((topic) => ({
      topic,
      decayedMastery: getDecayedMastery(topic),
    }))
    .filter(
      ({ topic, decayedMastery }) =>
        topic.attempts > 0 &&
        decayedMastery < WEAK_MASTERY_THRESHOLD &&
        !scheduledKeys.has(topicKey(topic.subject, topic.topic)),
    )
    .sort((left, right) => {
      if (left.decayedMastery !== right.decayedMastery) {
        return left.decayedMastery - right.decayedMastery;
      }
      return left.topic.topic.localeCompare(right.topic.topic);
    });

  for (const weak of weakTopics) {
    if (sessions.length >= maxSessions || minutesRemaining < MINUTES_PER_QUESTION) break;
    const priorityScore =
      WEAK_PRIORITY_WEIGHT +
      (1 - weak.decayedMastery) * 35 +
      (1 - weak.topic.confidence) * 12;

    const session = buildSession(
      weak.topic.subject,
      weak.topic.topic,
      "weak",
      scheduledAt,
      usedIds,
      minutesRemaining,
      priorityScore,
    );
    if (!session) continue;
    sessions.push(session);
    scheduledKeys.add(topicKey(session.subject, session.topic));
    minutesRemaining -= session.durationMinutes;
  }

  const knownKeys = new Set(Object.keys(userState.topics));
  const newTopics: { subject: string; topic: string; priorityScore: number }[] = [];
  for (const subject of activeSubjects) {
    const topics = getTopicsForSubject(subject);
    for (const topic of topics) {
      const key = topicKey(subject, topic);
      if (knownKeys.has(key) || scheduledKeys.has(key)) continue;
      newTopics.push({
        subject,
        topic,
        priorityScore: NEW_PRIORITY_WEIGHT,
      });
    }
  }

  for (const fresh of newTopics) {
    if (sessions.length >= maxSessions || minutesRemaining < MINUTES_PER_QUESTION) break;
    const session = buildSession(
      fresh.subject,
      fresh.topic,
      "new",
      scheduledAt,
      usedIds,
      minutesRemaining,
      fresh.priorityScore,
    );
    if (!session) continue;
    sessions.push(session);
    scheduledKeys.add(topicKey(session.subject, session.topic));
    minutesRemaining -= session.durationMinutes;
  }

  const revisionCandidates = Object.values(userState.topics)
    .filter(
      (topic) =>
        activeSubjects.includes(topic.subject) &&
        !scheduledKeys.has(topicKey(topic.subject, topic.topic)) &&
        getDecayedMastery(topic) >= STRONG_MASTERY_THRESHOLD,
    )
    .sort((left, right) => {
      const leftDue = diffDays(nowISO(), left.nextReviewAt);
      const rightDue = diffDays(nowISO(), right.nextReviewAt);
      if (leftDue !== rightDue) return leftDue - rightDue;
      return left.topic.localeCompare(right.topic);
    });

  for (const revision of revisionCandidates) {
    if (sessions.length >= maxSessions || minutesRemaining < MINUTES_PER_QUESTION) break;
    const priorityScore =
      REVISION_PRIORITY_WEIGHT +
      clamp(7 - diffDays(nowISO(), revision.nextReviewAt), 0, 7) * 2;

    const session = buildSession(
      revision.subject,
      revision.topic,
      "revision",
      scheduledAt,
      usedIds,
      minutesRemaining,
      priorityScore,
    );
    if (!session) continue;
    sessions.push(session);
    scheduledKeys.add(topicKey(session.subject, session.topic));
    minutesRemaining -= session.durationMinutes;
  }

  return sortByPriority(sessions);
}

export function processSessionResults(
  state: UserLearningState,
  session: SessionResults,
): UserLearningState {
  const completedAt = session.completedAt || nowISO();
  const nextState: UserLearningState = {
    ...state,
    topics: { ...state.topics },
  };

  const resultsByTopic = new Map<string, QuestionResult[]>();
  for (const result of session.results) {
    const key = topicKey(result.subject, result.topic);
    const group = resultsByTopic.get(key) ?? [];
    group.push(result);
    resultsByTopic.set(key, group);
  }

  for (const [key, results] of resultsByTopic) {
    const existing = nextState.topics[key] ?? createTopicState(results[0].subject, results[0].topic, completedAt);
    nextState.topics[key] = updateMastery(existing, results, completedAt);
  }

  const completedDay = completedAt.slice(0, 10);
  if (nextState.lastActiveDate !== completedDay) {
    const previous = nextState.lastActiveDate;
    const yesterday = new Date(`${completedDay}T00:00:00.000Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);

    nextState.streak = previous === yesterdayIso ? nextState.streak + 1 : 1;
    nextState.lastActiveDate = completedDay;
  }

  return nextState;
}

export function generateInsights(state: UserLearningState, subjects: string[]): EngineInsight[] {
  const activeSubjects = new Set(subjects.filter((subject) => getAvailableSubjects().includes(subject)));
  const insights: EngineInsight[] = [];

  const dueTopics = getDueTopics(state).filter((entry) => activeSubjects.has(entry.state.subject));
  if (dueTopics.length > 0) {
    const topDue = dueTopics[0];
    insights.push({
      type: "warning",
      message: `${topDue.state.topic} is due now with ${Math.round(topDue.decayedMastery * 100)}% effective mastery`,
      action: {
        type: "navigate",
        to: "/dashboard/planner",
        topic: topDue.state.topic,
        subject: topDue.state.subject,
      },
    });
  }

  const weakTopics = Object.values(state.topics)
    .filter((topic) => activeSubjects.has(topic.subject))
    .map((topic) => ({ topic, decayedMastery: getDecayedMastery(topic) }))
    .filter(({ topic, decayedMastery }) => topic.attempts > 0 && decayedMastery < WEAK_MASTERY_THRESHOLD)
    .sort((left, right) => left.decayedMastery - right.decayedMastery);

  if (weakTopics.length > 0) {
    const weakest = weakTopics[0];
    insights.push({
      type: "warning",
      message: `You are weak in ${weakest.topic.topic}. Schedule a targeted review before moving on.`,
      action: {
        type: "navigate",
        to: "/dashboard/planner",
        topic: weakest.topic.topic,
        subject: weakest.topic.subject,
      },
    });
  }

  const totalKnownTopics = Object.values(state.topics).filter((topic) => activeSubjects.has(topic.subject));
  const strongTopics = totalKnownTopics.filter((topic) => getDecayedMastery(topic) >= STRONG_MASTERY_THRESHOLD);

  if (totalKnownTopics.length > 0 && strongTopics.length > 0) {
    const strongShare = Math.round((strongTopics.length / totalKnownTopics.length) * 100);
    if (strongShare >= 50) {
      insights.push({
        type: "success",
        message: `${strongShare}% of your tracked topics are in strong mastery`,
        action: {
          type: "navigate",
          to: "/dashboard/topics",
        },
      });
    }
  }

  let untrackedTopics = 0;
  for (const subject of activeSubjects) {
    for (const topic of getTopicsForSubject(subject)) {
      if (!state.topics[topicKey(subject, topic)]) {
        untrackedTopics += 1;
      }
    }
  }

  if (untrackedTopics > 0) {
    insights.push({
      type: "info",
      message: `${untrackedTopics} topics still need a baseline session`,
      action: {
        type: "navigate",
        to: "/dashboard/planner",
      },
    });
  }

  if (state.streak >= 3) {
    insights.push({
      type: "success",
      message: `${state.streak}-day study streak. Keep reinforcing the review cycle.`,
      action: {
        type: "navigate",
        to: "/dashboard/progress",
      },
    });
  }

  return insights;
}
