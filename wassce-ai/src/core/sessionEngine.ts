// ---------------------------------------------------------------------------
// Session Engine — manages active study session state
// ---------------------------------------------------------------------------
// Handles: start, resume, answer submission, completion, time tracking.
// All state is serialisable for persistence in the Zustand store.
// ---------------------------------------------------------------------------

import type { ActiveSessionState, QuestionResult } from "./types/learning";

// ---------------------------------------------------------------------------
// Create / start a new session
// ---------------------------------------------------------------------------

export function startSession(
  sessionId: string,
  subject: string,
  topic: string,
  questionIds: string[],
): ActiveSessionState {
  const answers: Record<string, number | null> = {};
  const questionTimes: Record<string, number> = {};
  for (const id of questionIds) {
    answers[id] = null;
    questionTimes[id] = 0;
  }

  return {
    sessionId,
    subject,
    topic,
    questionIds,
    currentIndex: 0,
    answers,
    questionTimes,
    startedAt: new Date().toISOString(),
    phase: "active",
  };
}

// ---------------------------------------------------------------------------
// Resume a paused session (just change phase)
// ---------------------------------------------------------------------------

export function resumeSession(session: ActiveSessionState): ActiveSessionState {
  if (session.phase === "complete") return session;
  return { ...session, phase: "active" };
}

// ---------------------------------------------------------------------------
// Submit an answer for the current question
// ---------------------------------------------------------------------------

export function submitAnswer(
  session: ActiveSessionState,
  questionId: string,
  selectedIndex: number,
  timeSpentMs: number,
): ActiveSessionState {
  return {
    ...session,
    answers: { ...session.answers, [questionId]: selectedIndex },
    questionTimes: {
      ...session.questionTimes,
      [questionId]: (session.questionTimes[questionId] ?? 0) + timeSpentMs,
    },
  };
}

// ---------------------------------------------------------------------------
// Navigate
// ---------------------------------------------------------------------------

export function goToQuestion(
  session: ActiveSessionState,
  index: number,
): ActiveSessionState {
  const clamped = Math.max(0, Math.min(index, session.questionIds.length - 1));
  return { ...session, currentIndex: clamped };
}

// ---------------------------------------------------------------------------
// Complete session — extracts QuestionResult[] for the learning engine
// ---------------------------------------------------------------------------

export interface CompletedSessionData {
  session: ActiveSessionState;
  results: QuestionResult[];
  totalTimeMs: number;
}

/**
 * Marks the session as complete and builds QuestionResult[] from the answers.
 *
 * @param correctMap  questionId → correctIndex  (from the paper's question data)
 * @param topicMap    questionId → topic string   (from the paper's question data)
 */
export function completeSession(
  session: ActiveSessionState,
  correctMap: Record<string, number>,
  topicMap: Record<string, string>,
): CompletedSessionData {
  const results: QuestionResult[] = [];
  let totalTimeMs = 0;

  for (const qid of session.questionIds) {
    const selectedIndex = session.answers[qid];
    const timeMs = session.questionTimes[qid] ?? 0;
    totalTimeMs += timeMs;

    results.push({
      topic: topicMap[qid] ?? session.topic,
      subject: session.subject,
      correct: selectedIndex === correctMap[qid],
      timeMs,
    });
  }

  return {
    session: { ...session, phase: "complete" },
    results,
    totalTimeMs,
  };
}

// ---------------------------------------------------------------------------
// Pause
// ---------------------------------------------------------------------------

export function pauseSession(session: ActiveSessionState): ActiveSessionState {
  if (session.phase !== "active") return session;
  return { ...session, phase: "paused" };
}

// ---------------------------------------------------------------------------
// Utility: check if session has an answer for all questions
// ---------------------------------------------------------------------------

export function isSessionFullyAnswered(session: ActiveSessionState): boolean {
  return session.questionIds.every((qid) => session.answers[qid] != null);
}

export function getSessionProgress(session: ActiveSessionState): {
  answered: number;
  total: number;
  percent: number;
} {
  const total = session.questionIds.length;
  const answered = session.questionIds.filter((qid) => session.answers[qid] != null).length;
  return { answered, total, percent: total === 0 ? 0 : Math.round((answered / total) * 100) };
}
