import type { PlannerSession } from "../../core/types/passPaper";
import type { StudyStat } from "../../types/domain";
import {
  getAllQuestions,
  getQuestionsBySubject,
  getQuestionsByTopic,
  getTopicsForSubject,
  getAvailableSubjects,
} from "../pass-papers/seedData";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const QUESTIONS_PER_SESSION = 10;
const MINUTES_PER_QUESTION = 1.5;
const WEAK_THRESHOLD = 60; // topics below this accuracy are "weak"
const STRONG_THRESHOLD = 80;
const MAX_SESSIONS_PER_DAY = 4;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shuffle array in-place (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Get today's date as YYYY-MM-DD */
const today = () => new Date().toISOString().slice(0, 10);

/** Build a unique session ID */
const sessionId = () => `planner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------------------------
// Topic classification
// ---------------------------------------------------------------------------

interface TopicStrength {
  subject: string;
  topic: string;
  accuracy: number;
  attempts: number;
}

/**
 * Classify all available topics into weak / untested / strong buckets
 * using the accumulated study stats.
 */
export function classifyTopics(
  subjects: string[],
  studyStats: StudyStat[],
): { weak: TopicStrength[]; untested: TopicStrength[]; strong: TopicStrength[] } {
  const statMap = new Map<string, StudyStat>();
  for (const s of studyStats) {
    statMap.set(`${s.subject}::${s.topic}`, s);
  }

  const weak: TopicStrength[] = [];
  const untested: TopicStrength[] = [];
  const strong: TopicStrength[] = [];

  const availableSubjects = getAvailableSubjects();

  for (const subject of subjects) {
    if (!availableSubjects.includes(subject)) continue;
    const topics = getTopicsForSubject(subject);
    for (const topic of topics) {
      const stat = statMap.get(`${subject}::${topic}`);
      if (!stat) {
        untested.push({ subject, topic, accuracy: 0, attempts: 0 });
      } else if (stat.accuracy < WEAK_THRESHOLD) {
        weak.push({ subject, topic, accuracy: stat.accuracy, attempts: stat.attempts });
      } else if (stat.accuracy >= STRONG_THRESHOLD) {
        strong.push({ subject, topic, accuracy: stat.accuracy, attempts: stat.attempts });
      } else {
        // Medium — treat as mild weak for scheduling purposes
        weak.push({ subject, topic, accuracy: stat.accuracy, attempts: stat.attempts });
      }
    }
  }

  // Sort weak by accuracy ascending (worst first)
  weak.sort((a, b) => a.accuracy - b.accuracy);

  return { weak, untested, strong };
}

// ---------------------------------------------------------------------------
// Session generation
// ---------------------------------------------------------------------------

/**
 * Build a single PlannerSession from a topic, selecting up to `count`
 * questions. Mixes years for variety.
 */
function buildTopicSession(
  subject: string,
  topic: string,
  count: number,
  scheduledDate: string,
  excludeIds: Set<string>,
): PlannerSession | null {
  let pool = getQuestionsByTopic(subject, topic).filter((q) => !excludeIds.has(q.id));
  if (pool.length === 0) return null;

  shuffle(pool);
  const selected = pool.slice(0, count);
  if (selected.length === 0) return null;

  // Determine the primary year/paper from the first question (for display)
  const yearCounts = new Map<number, number>();
  for (const q of selected) {
    yearCounts.set(q.year, (yearCounts.get(q.year) ?? 0) + 1);
  }
  let primaryYear = selected[0].year;
  let maxCount = 0;
  for (const [y, c] of yearCounts) {
    if (c > maxCount) {
      maxCount = c;
      primaryYear = y;
    }
  }

  return {
    id: sessionId(),
    subject,
    topic,
    type: "past_paper",
    year: primaryYear,
    paper: selected[0].paper,
    questionIds: selected.map((q) => q.id),
    durationMinutes: Math.ceil(selected.length * MINUTES_PER_QUESTION),
    scheduledAt: scheduledDate,
    completed: false,
  };
}

/**
 * Build a mixed-topic session from a subject. Uses questions from multiple
 * topics across multiple years.
 */
function buildMixedSession(
  subject: string,
  count: number,
  scheduledDate: string,
  excludeIds: Set<string>,
): PlannerSession | null {
  let pool = getQuestionsBySubject(subject).filter((q) => !excludeIds.has(q.id));
  if (pool.length === 0) return null;

  shuffle(pool);
  const selected = pool.slice(0, count);
  if (selected.length === 0) return null;

  const topics = Array.from(new Set(selected.map((q) => q.topic)));

  return {
    id: sessionId(),
    subject,
    topic: topics.length > 2 ? `Mixed (${topics.length} topics)` : topics.join(", "),
    type: "past_paper",
    year: selected[0].year,
    paper: selected[0].paper,
    questionIds: selected.map((q) => q.id),
    durationMinutes: Math.ceil(selected.length * MINUTES_PER_QUESTION),
    scheduledAt: scheduledDate,
    completed: false,
  };
}

// ---------------------------------------------------------------------------
// Main generation API
// ---------------------------------------------------------------------------

export interface GenerateOptions {
  subjects: string[];
  studyStats: StudyStat[];
  completedQuestionIds?: string[];
  date?: string;
  maxSessions?: number;
}

/**
 * Generate adaptive study sessions for a given day.
 *
 * Priority order:
 * 1. Weak topics (accuracy < 60%) get dedicated sessions
 * 2. Untested topics get introduction sessions
 * 3. Strong topics get mixed revision sessions
 */
export function generateSessions({
  subjects,
  studyStats,
  completedQuestionIds = [],
  date,
  maxSessions = MAX_SESSIONS_PER_DAY,
}: GenerateOptions): PlannerSession[] {
  const scheduledDate = date ?? today();
  const sessions: PlannerSession[] = [];
  const usedIds = new Set(completedQuestionIds);

  const { weak, untested, strong } = classifyTopics(subjects, studyStats);

  // 1. Weak topics — one session each (capped)
  for (const t of weak) {
    if (sessions.length >= maxSessions) break;
    const session = buildTopicSession(
      t.subject,
      t.topic,
      QUESTIONS_PER_SESSION,
      scheduledDate,
      usedIds,
    );
    if (session) {
      session.questionIds.forEach((id) => usedIds.add(id));
      sessions.push(session);
    }
  }

  // 2. Untested topics — introduction sessions
  for (const t of shuffle([...untested])) {
    if (sessions.length >= maxSessions) break;
    const session = buildTopicSession(
      t.subject,
      t.topic,
      QUESTIONS_PER_SESSION,
      scheduledDate,
      usedIds,
    );
    if (session) {
      session.questionIds.forEach((id) => usedIds.add(id));
      sessions.push(session);
    }
  }

  // 3. Strong topics — mixed revision
  const strongSubjects = Array.from(new Set(strong.map((s) => s.subject)));
  for (const subject of shuffle([...strongSubjects])) {
    if (sessions.length >= maxSessions) break;
    const session = buildMixedSession(
      subject,
      QUESTIONS_PER_SESSION,
      scheduledDate,
      usedIds,
    );
    if (session) {
      session.questionIds.forEach((id) => usedIds.add(id));
      sessions.push(session);
    }
  }

  return sessions;
}

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

/**
 * Generate a retry session from incorrect question IDs.
 */
export function buildRetrySession(
  subject: string,
  topic: string,
  incorrectIds: string[],
): PlannerSession | null {
  if (incorrectIds.length === 0) return null;

  return {
    id: sessionId(),
    subject,
    topic: `Retry: ${topic}`,
    type: "past_paper",
    year: 0, // mixed
    paper: 0,
    questionIds: incorrectIds,
    durationMinutes: Math.ceil(incorrectIds.length * MINUTES_PER_QUESTION),
    scheduledAt: today(),
    completed: false,
  };
}

/**
 * Generate sessions targeting weak topics identified from recent results.
 */
export function generateWeakTopicSessions(
  weakTopics: { topic: string; subject: string; questionIds: string[] }[],
): PlannerSession[] {
  const sessions: PlannerSession[] = [];
  for (const wt of weakTopics) {
    const session = buildTopicSession(
      wt.subject,
      wt.topic,
      QUESTIONS_PER_SESSION,
      today(),
      new Set(), // no exclusions for retry
    );
    if (session) sessions.push(session);
  }
  return sessions;
}
