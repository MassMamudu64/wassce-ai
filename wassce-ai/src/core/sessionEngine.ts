// ---------------------------------------------------------------------------
// Session Engine
// ---------------------------------------------------------------------------

import type {
  ActiveSessionState,
  QuestionResult,
  TopicSessionResult,
} from "./types/learning";

const nowISO = () => new Date().toISOString();

export function startSession(
  sessionId: string,
  subject: string,
  topic: string,
  questionIds: string[],
): ActiveSessionState {
  const answers: Record<string, number | null> = {};
  const questionTimes: Record<string, number> = {};

  for (const questionId of questionIds) {
    answers[questionId] = null;
    questionTimes[questionId] = 0;
  }

  const startedAt = nowISO();

  return {
    sessionId,
    subject,
    topic,
    questionIds,
    currentIndex: 0,
    answers,
    questionTimes,
    startedAt,
    lastInteractionAt: startedAt,
    phase: "active",
  };
}

export function resumeSession(session: ActiveSessionState): ActiveSessionState {
  if (session.phase === "complete") return session;
  return {
    ...session,
    phase: "active",
    lastInteractionAt: nowISO(),
  };
}

export function pauseSession(session: ActiveSessionState): ActiveSessionState {
  if (session.phase !== "active") return session;
  return {
    ...session,
    phase: "paused",
    lastInteractionAt: nowISO(),
  };
}

export function recordQuestionTime(
  session: ActiveSessionState,
  questionId: string,
  timeSpentMs: number,
): ActiveSessionState {
  return {
    ...session,
    questionTimes: {
      ...session.questionTimes,
      [questionId]: (session.questionTimes[questionId] ?? 0) + Math.max(0, timeSpentMs),
    },
    lastInteractionAt: nowISO(),
  };
}

export function submitAnswer(
  session: ActiveSessionState,
  questionId: string,
  selectedIndex: number,
  timeSpentMs = 0,
): ActiveSessionState {
  const withTime = recordQuestionTime(session, questionId, timeSpentMs);

  return {
    ...withTime,
    answers: {
      ...withTime.answers,
      [questionId]: selectedIndex,
    },
    lastInteractionAt: nowISO(),
  };
}

export function goToQuestion(session: ActiveSessionState, index: number): ActiveSessionState {
  const clampedIndex = Math.max(0, Math.min(index, session.questionIds.length - 1));
  return {
    ...session,
    currentIndex: clampedIndex,
    lastInteractionAt: nowISO(),
  };
}

export function isSessionFullyAnswered(session: ActiveSessionState): boolean {
  return session.questionIds.every((questionId) => session.answers[questionId] != null);
}

export function getSessionProgress(session: ActiveSessionState): {
  answered: number;
  total: number;
  percent: number;
} {
  const total = session.questionIds.length;
  const answered = session.questionIds.filter((questionId) => session.answers[questionId] != null).length;

  return {
    answered,
    total,
    percent: total === 0 ? 0 : Math.round((answered / total) * 100),
  };
}

export interface CompletedSessionData {
  session: ActiveSessionState;
  results: QuestionResult[];
  topicResults: TopicSessionResult[];
  totalTimeMs: number;
}

export function completeSession(
  session: ActiveSessionState,
  correctMap: Record<string, number>,
  topicMap: Record<string, string>,
): CompletedSessionData {
  const results: QuestionResult[] = [];
  let totalTimeMs = 0;

  for (const questionId of session.questionIds) {
    const selectedIndex = session.answers[questionId];
    const timeMs = session.questionTimes[questionId] ?? 0;
    totalTimeMs += timeMs;

    results.push({
      topic: topicMap[questionId] ?? session.topic,
      subject: session.subject,
      correct: selectedIndex === correctMap[questionId],
      timeMs,
    });
  }

  const grouped = new Map<string, TopicSessionResult>();
  for (const result of results) {
    const key = `${result.subject}::${result.topic}`;
    const existing = grouped.get(key) ?? {
      topic: result.topic,
      subject: result.subject,
      correct: 0,
      total: 0,
      accuracy: 0,
      timeSpentMs: 0,
    };

    existing.total += 1;
    existing.timeSpentMs += result.timeMs;
    if (result.correct) {
      existing.correct += 1;
    }

    grouped.set(key, existing);
  }

  const topicResults = [...grouped.values()].map((entry) => ({
    ...entry,
    accuracy: entry.total === 0 ? 0 : entry.correct / entry.total,
  }));

  return {
    session: {
      ...session,
      phase: "complete",
      lastInteractionAt: nowISO(),
    },
    results,
    topicResults,
    totalTimeMs,
  };
}
