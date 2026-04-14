// ---------------------------------------------------------------------------
// Adaptive Learning Engine - Core Types
// ---------------------------------------------------------------------------

export interface TopicLearningState {
  topic: string;
  subject: string;

  // Current estimated mastery for the topic, in the range 0..1.
  mastery: number;

  // Confidence in the mastery estimate, in the range 0..1.
  confidence: number;

  // ISO date-time of the last completed review.
  lastReviewedAt: string;

  // ISO date-time of the next scheduled review.
  nextReviewAt: string;

  // Per-day decay rate applied when the topic is not reviewed.
  decayRate: number;

  // Lifetime attempt count for the topic.
  attempts: number;

  // Lifetime correct count for the topic.
  correct: number;

  // Rolling average response time in milliseconds.
  averageTimeMs: number;

  // Spaced-repetition interval in days. This is an engine helper field.
  intervalDays: number;

  // Consecutive successful review streak for the topic.
  streak: number;

  // ISO date-time of the last decay application so we do not double-apply decay.
  lastDecayAppliedAt: string;
}

export interface UserLearningState {
  topics: Record<string, TopicLearningState>;
  streak: number;
  lastActiveDate: string;
}

// ---------------------------------------------------------------------------
// Engine inputs / outputs
// ---------------------------------------------------------------------------

export interface QuestionResult {
  topic: string;
  subject: string;
  correct: boolean;
  timeMs: number;
}

export interface TopicReviewResult {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpentMs: number;
  averageTimeMs: number;
  masteryBefore: number;
  masteryAfter: number;
  confidenceAfter: number;
}

export interface TopicSessionResult {
  topic: string;
  subject: string;
  correct: number;
  total: number;
  accuracy: number;
  timeSpentMs: number;
}

export interface SessionResults {
  sessionId: string;
  results: QuestionResult[];
  completedAt: string;
  source?: "planner" | "past_paper" | "quiz";
}

export interface EngineSession {
  id: string;
  subject: string;
  topic: string;
  reason: "due" | "weak" | "new" | "revision";
  questionIds: string[];
  durationMinutes: number;
  scheduledAt: string;
  priorityScore: number;
}

export interface EngineInsight {
  type: "warning" | "success" | "info";
  message: string;
  action: {
    type: "start_session" | "navigate";
    topic?: string;
    subject?: string;
    sessionId?: string;
    to?: string;
  };
}

export type ActiveSessionPhase = "idle" | "active" | "paused" | "complete";

export interface ActiveSessionState {
  sessionId: string;
  subject: string;
  topic: string;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, number | null>;
  questionTimes: Record<string, number>;
  startedAt: string;
  lastInteractionAt: string;
  phase: ActiveSessionPhase;
}
