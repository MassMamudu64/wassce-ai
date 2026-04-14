// ---------------------------------------------------------------------------
// Adaptive Learning Engine
// ---------------------------------------------------------------------------
// Implements:  weighted mastery · time-based decay · spaced repetition
//              intelligent scheduling · daily plan generation
// ---------------------------------------------------------------------------

import type {
  TopicLearningState,
  UserLearningState,
  QuestionResult,
  SessionResults,
  EngineSession,
  EngineInsight,
} from "./types/learning";
import {
  getQuestionsByTopic,
  getQuestionsBySubject,
  getTopicsForSubject,
  getAvailableSubjects,
} from "../dashboard/pass-papers/seedData";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_DECAY_RATE = 0.06; // mastery lost per day without review
const MIN_DECAY_RATE = 0.01;
const INITIAL_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 60;
const QUESTIONS_PER_SESSION = 10;
const MINUTES_PER_QUESTION = 1.5;
const MAX_DAILY_SESSIONS = 5;
const WEAK_MASTERY_THRESHOLD = 0.5;
const DUE_BUFFER_HOURS = 4; // topics within 4h of due are included

/** Median expected time per question in ms — used for speed scoring. */
const EXPECTED_TIME_MS = 60_000; // 60 seconds

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const topicKey = (subject: string, topic: string) => `${subject}::${topic}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();
const uid = () => `eng-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function daysBetween(a: string, b: string): number {
  const msA = new Date(a).getTime();
  const msB = new Date(b).getTime();
  return Math.abs(msB - msA) / (1000 * 60 * 60 * 24);
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// ---------------------------------------------------------------------------
// 1. Create / initialise a topic state
// ---------------------------------------------------------------------------

export function createTopicState(subject: string, topic: string): TopicLearningState {
  return {
    topic,
    subject,
    mastery: 0,
    confidence: 0,
    lastReviewedAt: nowISO(),
    nextReviewAt: nowISO(), // due immediately (new topic)
    decayRate: INITIAL_DECAY_RATE,
    intervalDays: INITIAL_INTERVAL_DAYS,
    streak: 0,
    attempts: 0,
    correct: 0,
    averageTimeMs: EXPECTED_TIME_MS,
  };
}

export function emptyUserState(): UserLearningState {
  return { topics: {}, streak: 0, lastActiveDate: "" };
}

// ---------------------------------------------------------------------------
// 2. Update mastery after answering questions on a topic
// ---------------------------------------------------------------------------

/**
 * Weighted mastery update model.
 *
 * mastery_delta = f(accuracy, speedBonus, confidenceWeight)
 *
 * - Fast + correct  → large positive delta
 * - Slow + correct  → small positive delta
 * - Incorrect       → negative delta + confidence penalty
 */
export function updateMastery(
  state: TopicLearningState,
  results: QuestionResult[],
): TopicLearningState {
  if (results.length === 0) return state;

  const next = { ...state };
  const now = nowISO();

  let totalCorrect = 0;
  let totalTimeMs = 0;

  for (const r of results) {
    next.attempts += 1;
    totalTimeMs += r.timeMs;

    if (r.correct) {
      totalCorrect += 1;
      next.correct += 1;
      next.streak += 1;
    } else {
      next.streak = 0;
    }
  }

  const accuracy = totalCorrect / results.length; // 0–1
  const avgTimeMs = totalTimeMs / results.length;

  // Speed bonus: answering faster than expected boosts mastery gain
  // speedFactor: 1.5 (very fast) → 1.0 (expected) → 0.5 (very slow)
  const speedRatio = clamp(EXPECTED_TIME_MS / Math.max(avgTimeMs, 1000), 0.5, 1.5);

  // Confidence grows with more attempts (asymptotic toward 1)
  next.confidence = clamp(1 - 1 / (1 + next.attempts * 0.15), 0, 1);

  // Mastery delta
  const gain = accuracy * speedRatio * 0.2; // max +0.30 per session (fast + perfect)
  const loss = (1 - accuracy) * 0.15;        // max -0.15 per session (all wrong)
  next.mastery = clamp(next.mastery + gain - loss, 0, 1);

  // Rolling average time
  const alpha = 0.3; // exponential moving average weight
  next.averageTimeMs = Math.round(next.averageTimeMs * (1 - alpha) + avgTimeMs * alpha);

  // Schedule next review (spaced repetition)
  if (accuracy >= 0.7) {
    // Correct: increase interval
    next.intervalDays = clamp(
      next.intervalDays * (1.5 + accuracy * 0.5), // 2.0x at 100%, 1.85x at 70%
      INITIAL_INTERVAL_DAYS,
      MAX_INTERVAL_DAYS,
    );
    // Reduce decay rate for well-known topics
    next.decayRate = clamp(
      next.decayRate * 0.85,
      MIN_DECAY_RATE,
      INITIAL_DECAY_RATE,
    );
  } else {
    // Incorrect: reset interval, increase decay
    next.intervalDays = INITIAL_INTERVAL_DAYS;
    next.decayRate = clamp(
      next.decayRate * 1.2,
      MIN_DECAY_RATE,
      INITIAL_DECAY_RATE * 1.5,
    );
  }

  next.lastReviewedAt = now;
  next.nextReviewAt = addDays(now, next.intervalDays);

  return next;
}

// ---------------------------------------------------------------------------
// 3. Apply time-based decay to ALL topics
// ---------------------------------------------------------------------------

/**
 * Reduces mastery for topics that haven't been reviewed recently.
 *
 *   mastery -= daysSinceLastReview × decayRate
 *
 * Should be called once on app load / daily.
 */
export function applyDecay(state: UserLearningState): UserLearningState {
  const now = nowISO();
  const next: UserLearningState = {
    ...state,
    topics: { ...state.topics },
  };

  for (const [key, topic] of Object.entries(next.topics)) {
    const days = daysBetween(topic.lastReviewedAt, now);
    if (days < 0.1) continue; // reviewed within ~2.4h, skip

    const decayAmount = days * topic.decayRate;
    const decayed = clamp(topic.mastery - decayAmount, 0, 1);

    if (decayed !== topic.mastery) {
      next.topics[key] = { ...topic, mastery: decayed };
    }
  }

  return next;
}

/**
 * Apply decay to a single topic (for display purposes).
 * Returns the decayed mastery value without mutating state.
 */
export function getDecayedMastery(topic: TopicLearningState): number {
  const days = daysBetween(topic.lastReviewedAt, nowISO());
  return clamp(topic.mastery - days * topic.decayRate, 0, 1);
}

// ---------------------------------------------------------------------------
// 4. Get due topics
// ---------------------------------------------------------------------------

export interface DueTopic {
  key: string;
  state: TopicLearningState;
  overdueDays: number;
  decayedMastery: number;
}

/**
 * Returns topics where nextReviewAt ≤ now (+ buffer).
 * Sorted by most overdue first.
 */
export function getDueTopics(state: UserLearningState): DueTopic[] {
  const now = new Date();
  const bufferMs = DUE_BUFFER_HOURS * 60 * 60 * 1000;
  const cutoff = new Date(now.getTime() + bufferMs);

  const due: DueTopic[] = [];

  for (const [key, topic] of Object.entries(state.topics)) {
    const reviewAt = new Date(topic.nextReviewAt);
    if (reviewAt <= cutoff) {
      const overdueDays = Math.max(0, daysBetween(topic.nextReviewAt, now.toISOString()));
      due.push({
        key,
        state: topic,
        overdueDays,
        decayedMastery: getDecayedMastery(topic),
      });
    }
  }

  // Most overdue first
  due.sort((a, b) => b.overdueDays - a.overdueDays);
  return due;
}

// ---------------------------------------------------------------------------
// 5. Generate daily plan  (engine-driven)
// ---------------------------------------------------------------------------

interface DailyPlanOptions {
  userState: UserLearningState;
  subjects: string[];
  maxSessions?: number;
  completedQuestionIds?: string[];
  date?: string;
}

/**
 * Generates an optimal daily plan:
 *   1. Due topics (overdue reviews — highest priority)
 *   2. Weak topics (mastery < threshold)
 *   3. New/untested topics (if capacity remains)
 *   4. Strong topic revision (if still room)
 */
export function generateDailyPlan({
  userState,
  subjects,
  maxSessions = MAX_DAILY_SESSIONS,
  completedQuestionIds = [],
  date,
}: DailyPlanOptions): EngineSession[] {
  const scheduledDate = date ?? todayISO();
  const sessions: EngineSession[] = [];
  const usedIds = new Set(completedQuestionIds);
  const availableSubjects = getAvailableSubjects();
  const activeSubjects = subjects.filter((s) => availableSubjects.includes(s));

  // ── 1. Due topics ──
  const dueTopics = getDueTopics(userState);
  for (const due of dueTopics) {
    if (sessions.length >= maxSessions) break;
    if (!activeSubjects.includes(due.state.subject)) continue;
    const session = buildSession(
      due.state.subject,
      due.state.topic,
      "due",
      scheduledDate,
      usedIds,
    );
    if (session) sessions.push(session);
  }

  // ── 2. Weak topics (not already scheduled as due) ──
  const scheduledKeys = new Set(sessions.map((s) => topicKey(s.subject, s.topic)));
  const weakTopics = Object.values(userState.topics)
    .filter((t) =>
      activeSubjects.includes(t.subject) &&
      getDecayedMastery(t) < WEAK_MASTERY_THRESHOLD &&
      t.attempts > 0 &&
      !scheduledKeys.has(topicKey(t.subject, t.topic)),
    )
    .sort((a, b) => getDecayedMastery(a) - getDecayedMastery(b));

  for (const weak of weakTopics) {
    if (sessions.length >= maxSessions) break;
    const session = buildSession(
      weak.subject,
      weak.topic,
      "weak",
      scheduledDate,
      usedIds,
    );
    if (session) sessions.push(session);
  }

  // ── 3. New / untested topics ──
  const knownKeys = new Set(Object.keys(userState.topics));
  const untested: { subject: string; topic: string }[] = [];
  for (const subject of activeSubjects) {
    for (const topic of getTopicsForSubject(subject)) {
      const key = topicKey(subject, topic);
      if (!knownKeys.has(key) && !scheduledKeys.has(key)) {
        untested.push({ subject, topic });
      }
    }
  }

  for (const t of shuffle(untested)) {
    if (sessions.length >= maxSessions) break;
    const session = buildSession(t.subject, t.topic, "new", scheduledDate, usedIds);
    if (session) sessions.push(session);
  }

  // ── 4. Strong revision (fill remaining slots) ──
  const strongTopics = Object.values(userState.topics)
    .filter((t) =>
      activeSubjects.includes(t.subject) &&
      getDecayedMastery(t) >= 0.7 &&
      !scheduledKeys.has(topicKey(t.subject, t.topic)),
    );

  for (const strong of shuffle(strongTopics)) {
    if (sessions.length >= maxSessions) break;
    const session = buildSession(
      strong.subject,
      strong.topic,
      "revision",
      scheduledDate,
      usedIds,
    );
    if (session) sessions.push(session);
  }

  return sessions;
}

// ---------------------------------------------------------------------------
// Session builder helper
// ---------------------------------------------------------------------------

function buildSession(
  subject: string,
  topic: string,
  reason: EngineSession["reason"],
  scheduledAt: string,
  usedIds: Set<string>,
): EngineSession | null {
  let pool = getQuestionsByTopic(subject, topic).filter((q) => !usedIds.has(q.id));

  // Fallback to subject-wide pool if topic pool exhausted
  if (pool.length < 3) {
    pool = getQuestionsBySubject(subject).filter((q) => !usedIds.has(q.id));
  }
  if (pool.length === 0) return null;

  const selected = shuffle(pool).slice(0, QUESTIONS_PER_SESSION);
  selected.forEach((q) => usedIds.add(q.id));

  return {
    id: uid(),
    subject,
    topic,
    reason,
    questionIds: selected.map((q) => q.id),
    durationMinutes: Math.ceil(selected.length * MINUTES_PER_QUESTION),
    scheduledAt,
  };
}

// ---------------------------------------------------------------------------
// 6. Process session results (batch update)
// ---------------------------------------------------------------------------

/**
 * Processes a completed session's results into the user learning state.
 * Groups question results by topic and calls updateMastery for each.
 * Also updates streak.
 */
export function processSessionResults(
  state: UserLearningState,
  results: SessionResults,
): UserLearningState {
  const next: UserLearningState = {
    ...state,
    topics: { ...state.topics },
  };

  // Group results by topic
  const byTopic = new Map<string, QuestionResult[]>();
  for (const r of results.results) {
    const key = topicKey(r.subject, r.topic);
    const list = byTopic.get(key) ?? [];
    list.push(r);
    byTopic.set(key, list);
  }

  // Update each topic
  for (const [key, topicResults] of byTopic) {
    const existing = next.topics[key] ??
      createTopicState(topicResults[0].subject, topicResults[0].topic);
    next.topics[key] = updateMastery(existing, topicResults);
  }

  // Update streak
  const today = todayISO();
  if (next.lastActiveDate === today) {
    // Already active today — no change
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (next.lastActiveDate === yesterdayStr) {
      next.streak += 1;
    } else if (next.lastActiveDate !== today) {
      next.streak = 1; // streak broken
    }
    next.lastActiveDate = today;
  }

  return next;
}

// ---------------------------------------------------------------------------
// 7. Generate engine insights
// ---------------------------------------------------------------------------

export function generateInsights(
  state: UserLearningState,
  subjects: string[],
): EngineInsight[] {
  const insights: EngineInsight[] = [];
  const availableSubjects = getAvailableSubjects();
  const activeSubjects = subjects.filter((s) => availableSubjects.includes(s));

  // Due topics
  const due = getDueTopics(state);
  const activeDue = due.filter((d) => activeSubjects.includes(d.state.subject));
  if (activeDue.length > 0) {
    const worst = activeDue[0];
    insights.push({
      type: "warning",
      message: `${worst.state.topic} is overdue for review (${Math.round(worst.decayedMastery * 100)}% mastery, decaying)`,
      action: {
        type: "start_session",
        topic: worst.state.topic,
        subject: worst.state.subject,
      },
    });
  }

  // Weak topics
  const weakTopics = Object.values(state.topics)
    .filter((t) => activeSubjects.includes(t.subject) && getDecayedMastery(t) < WEAK_MASTERY_THRESHOLD && t.attempts > 0)
    .sort((a, b) => getDecayedMastery(a) - getDecayedMastery(b));

  if (weakTopics.length > 0) {
    const w = weakTopics[0];
    insights.push({
      type: "warning",
      message: `You are weak in ${w.topic} (${Math.round(getDecayedMastery(w) * 100)}% mastery)`,
      action: { type: "start_session", topic: w.topic, subject: w.subject },
    });
  }

  // Untested topics
  const knownKeys = new Set(Object.keys(state.topics));
  let untestedCount = 0;
  for (const subject of activeSubjects) {
    for (const topic of getTopicsForSubject(subject)) {
      if (!knownKeys.has(topicKey(subject, topic))) untestedCount++;
    }
  }
  if (untestedCount > 0) {
    insights.push({
      type: "info",
      message: `${untestedCount} topic${untestedCount > 1 ? "s" : ""} not yet practiced`,
      action: { type: "navigate", to: "/dashboard/planner" },
    });
  }

  // Streak
  if (state.streak >= 7) {
    insights.push({
      type: "success",
      message: `${state.streak}-day study streak — incredible consistency!`,
      action: { type: "navigate", to: "/dashboard/progress" },
    });
  } else if (state.streak >= 3) {
    insights.push({
      type: "success",
      message: `${state.streak}-day streak — keep the momentum!`,
      action: { type: "navigate", to: "/dashboard/progress" },
    });
  }

  // Strong topics celebration
  const strong = Object.values(state.topics)
    .filter((t) => activeSubjects.includes(t.subject) && getDecayedMastery(t) >= 0.7);
  const totalKnown = Object.values(state.topics)
    .filter((t) => activeSubjects.includes(t.subject)).length;
  if (totalKnown > 0 && strong.length > 0) {
    const pct = Math.round((strong.length / totalKnown) * 100);
    if (pct >= 50) {
      insights.push({
        type: "success",
        message: `${pct}% of practiced topics at strong mastery`,
        action: { type: "navigate", to: "/dashboard/topics" },
      });
    }
  }

  return insights;
}
