// ---------------------------------------------------------------------------
// Adaptive Learning Engine — Core Types
// ---------------------------------------------------------------------------

/**
 * Per-topic knowledge state tracked by the learning engine.
 * Mastery and confidence are 0–1 floats. Decay is applied automatically
 * based on time since last review.
 */
export interface TopicLearningState {
  topic: string;
  subject: string;

  /** Current mastery level (0–1). Affected by accuracy, recency, speed. */
  mastery: number;

  /** Confidence in the mastery estimate (0–1). Increases with more attempts. */
  confidence: number;

  /** ISO date-time of the last review. */
  lastReviewedAt: string;

  /** ISO date-time when the next review is scheduled. */
  nextReviewAt: string;

  /**
   * Per-day decay rate (0–1 range, typically 0.02–0.08).
   * Higher = topic is forgotten faster. Decreases as mastery stabilises.
   */
  decayRate: number;

  /** Spaced-repetition interval in days. Doubles on correct, resets on wrong. */
  intervalDays: number;

  /** Consecutive correct reviews (streak resets on wrong answer). */
  streak: number;

  /** Lifetime attempt count for this topic. */
  attempts: number;

  /** Lifetime correct answer count. */
  correct: number;

  /** Rolling average time per question in milliseconds. */
  averageTimeMs: number;
}

/**
 * Root learning state persisted per user.
 */
export interface UserLearningState {
  /** Map of "subject::topic" → TopicLearningState */
  topics: Record<string, TopicLearningState>;

  /** Current consecutive-day study streak. */
  streak: number;

  /** ISO date of the last day the user completed at least one session. */
  lastActiveDate: string;
}

// ---------------------------------------------------------------------------
// Engine input / output types
// ---------------------------------------------------------------------------

/** Result of answering a single question, fed into the engine. */
export interface QuestionResult {
  topic: string;
  subject: string;
  correct: boolean;
  /** Time taken to answer in milliseconds. */
  timeMs: number;
}

/** A batch of results from a completed session. */
export interface SessionResults {
  sessionId: string;
  results: QuestionResult[];
  completedAt: string; // ISO
}

/** A single planned session produced by the engine. */
export interface EngineSession {
  id: string;
  subject: string;
  topic: string;
  /** Why this session was scheduled. */
  reason: "due" | "weak" | "new" | "revision";
  questionIds: string[];
  durationMinutes: number;
  scheduledAt: string; // YYYY-MM-DD
}

/** Insight with a mandatory actionable payload. */
export interface EngineInsight {
  type: "warning" | "success" | "info";
  message: string;
  action: {
    type: "start_session" | "navigate";
    topic?: string;
    subject?: string;
    to?: string;
  };
}

// ---------------------------------------------------------------------------
// Session engine types
// ---------------------------------------------------------------------------

export type ActiveSessionPhase = "idle" | "active" | "paused" | "complete";

/** Persistent state for an in-progress session. */
export interface ActiveSessionState {
  sessionId: string;
  subject: string;
  topic: string;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number | null>;
  /** Per-question time spent in ms. */
  questionTimes: Record<string, number>;
  startedAt: string; // ISO
  phase: ActiveSessionPhase;
}
