import { create } from "zustand";
import type { DiagnosticResult, StudyPlan, StudyStat, UserProgress } from "../types/domain";
import type { StudentProfile, StudyPlan as ProfileStudyPlan, StudySession } from "../types/profile";
import type { PassPaperAttempt, PassPaperStats, PlannerSession } from "../core/types/passPaper";
import type {
  ActiveSessionState,
  SessionResults,
  TopicSessionResult,
  UserLearningState,
} from "../core/types/learning";
import {
  applyDecay,
  emptyUserState,
  generateDailyPlan,
  processSessionResults,
} from "../core/learningEngine";
import {
  completeSession as completeEngineSession,
  goToQuestion,
  pauseSession,
  recordQuestionTime,
  resumeSession,
  startSession,
  submitAnswer,
} from "../core/sessionEngine";
import { getQuestionsByIds } from "../dashboard/pass-papers/seedData";
import { upsertLearningState } from "../utils/supabaseData";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type LearningStateData = {
  studentProfile: StudentProfile | null;
  userProgress: UserProgress | null;
  studyStats: StudyStat[];
  diagnosticResult: DiagnosticResult | null;
  studyPlan: StudyPlan | null;
  isFirstTime: boolean;
  passPaperAttempts: PassPaperAttempt[];
  passPaperStats: PassPaperStats[];
  studySessions: StudySession[];
  studyPlanProfile: ProfileStudyPlan | null;
  plannerSessions: PlannerSession[];
  engineState: UserLearningState;
  activeSession: ActiveSessionState | null;
};

interface LearningState extends LearningStateData {
  userRef: string | null;

  setUserRef: (userRef: string | null) => void;
  hydrate: (data: Partial<LearningStateData> | null) => void;
  setStudentProfile: (profile: StudentProfile | null) => void;
  setUserProgress: (progress: UserProgress) => void;
  updateStudyStat: (stat: StudyStat) => void;
  setDiagnosticResult: (result: DiagnosticResult) => void;
  setStudyPlan: (plan: StudyPlan) => void;
  completeFirstTime: () => void;
  addPassPaperAttempt: (attempt: PassPaperAttempt) => void;
  updatePassPaperStats: (stats: PassPaperStats) => void;
  addStudySession: (session: StudySession) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  markMissedSessions: () => void;
  setStudyPlanProfile: (plan: ProfileStudyPlan) => void;
  setPlannerSessions: (sessions: PlannerSession[]) => void;
  updatePlannerSession: (id: string, updates: Partial<PlannerSession>) => void;
  clearPlannerSessions: () => void;
  resetProgress: () => void;

  applyEngineDecay: () => void;
  processEngineResults: (results: SessionResults) => void;
  setEngineState: (state: UserLearningState) => void;
  setActiveSession: (session: ActiveSessionState | null) => void;

  ensureDailyPlan: (date?: string) => void;
  regenerateDailyPlan: (date?: string) => void;
  startPlannerSession: (sessionId: string) => void;
  resumeActiveSession: () => void;
  pauseActiveSession: () => void;
  recordActiveQuestionTime: (questionId: string, timeSpentMs: number) => void;
  submitActiveAnswer: (questionId: string, selectedIndex: number, timeSpentMs?: number) => void;
  goToActiveQuestion: (index: number) => void;
  completeActiveSession: () => {
    sessionId: string;
    score: number;
    accuracy: number;
    topicResults: TopicSessionResult[];
  } | null;
  clearActiveSession: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const todayISO = () => new Date().toISOString().slice(0, 10);

const serialize = (data: LearningStateData) =>
  JSON.parse(JSON.stringify(data)) as LearningStateData;

const normalizePlannerSession = (session: PlannerSession): PlannerSession => ({
  ...session,
  reason: session.reason ?? "revision",
  priorityScore: session.priorityScore ?? 0,
});

const normalizeEngineState = (engineState: UserLearningState | null | undefined): UserLearningState => {
  const base = engineState ?? emptyUserState();
  const topics: UserLearningState["topics"] = {};

  for (const [key, topic] of Object.entries(base.topics ?? {})) {
    const timestamp = topic.lastReviewedAt || new Date().toISOString();
    topics[key] = {
      ...topic,
      attempts: topic.attempts ?? 0,
      correct: topic.correct ?? 0,
      mastery: topic.mastery ?? 0,
      confidence: topic.confidence ?? 0,
      averageTimeMs: topic.averageTimeMs ?? 60_000,
      decayRate: topic.decayRate ?? 0.05,
      intervalDays: topic.intervalDays ?? 1,
      streak: topic.streak ?? 0,
      lastReviewedAt: timestamp,
      nextReviewAt: topic.nextReviewAt ?? timestamp,
      lastDecayAppliedAt: topic.lastDecayAppliedAt ?? timestamp,
    };
  }

  return {
    topics,
    streak: base.streak ?? 0,
    lastActiveDate: base.lastActiveDate ?? "",
  };
};

const selectState = (state: LearningState): LearningStateData => ({
  studentProfile: state.studentProfile,
  userProgress: state.userProgress,
  studyStats: state.studyStats,
  diagnosticResult: state.diagnosticResult,
  studyPlan: state.studyPlan,
  isFirstTime: state.isFirstTime,
  passPaperAttempts: state.passPaperAttempts,
  passPaperStats: state.passPaperStats,
  studySessions: state.studySessions,
  studyPlanProfile: state.studyPlanProfile,
  plannerSessions: state.plannerSessions,
  engineState: state.engineState,
  activeSession: state.activeSession,
});

const persistState = (userRef: string | null, data: LearningStateData) => {
  if (!userRef) return;
  void upsertLearningState(userRef, serialize(data)).catch(() => {});
};

const buildPlannerSessions = (
  profile: StudentProfile | null,
  engineState: UserLearningState,
  existingSessions: PlannerSession[],
  date: string,
): PlannerSession[] => {
  if (!profile || profile.subjects.length === 0) return existingSessions;

  const completedQuestionIds = existingSessions
    .filter((session) => session.completed)
    .flatMap((session) => session.questionIds);

  return generateDailyPlan({
    userState: engineState,
    subjects: profile.subjects,
    completedQuestionIds,
    date,
    dailyCapacityMinutes: profile.dailyStudyGoalMinutes,
  }).map((session) =>
    normalizePlannerSession({
      id: session.id,
      subject: session.subject,
      topic: session.topic,
      type: "past_paper",
      reason: session.reason,
      year: 0,
      paper: 0,
      questionIds: session.questionIds,
      durationMinutes: session.durationMinutes,
      scheduledAt: session.scheduledAt,
      completed: false,
      priorityScore: session.priorityScore,
    }),
  );
};

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: LearningStateData = {
  studentProfile: null,
  userProgress: null,
  studyStats: [],
  diagnosticResult: null,
  studyPlan: null,
  isFirstTime: true,
  passPaperAttempts: [],
  passPaperStats: [],
  studySessions: [],
  studyPlanProfile: null,
  plannerSessions: [],
  engineState: emptyUserState(),
  activeSession: null,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLearningStore = create<LearningState>()((set, get) => ({
  userRef: null,
  ...initialState,

  setUserRef: (userRef) => set({ userRef }),

  hydrate: (data) => {
    const next = { ...initialState, ...(data ?? {}) };
    next.engineState = applyDecay(normalizeEngineState(next.engineState));
    next.plannerSessions = (next.plannerSessions ?? []).map(normalizePlannerSession);
    set(next);
  },

  setStudentProfile: (studentProfile) => {
    set({ studentProfile });
    get().ensureDailyPlan();
    persistState(get().userRef, selectState(get()));
  },

  setUserProgress: (userProgress) => {
    set({ userProgress });
    persistState(get().userRef, selectState(get()));
  },

  updateStudyStat: (newStat) => {
    const currentStats = get().studyStats;
    const existingIndex = currentStats.findIndex(
      (stat) => stat.subject === newStat.subject && stat.topic === newStat.topic,
    );

    if (existingIndex < 0) {
      set({ studyStats: [...currentStats, newStat] });
      persistState(get().userRef, selectState(get()));
      return;
    }

    const existing = currentStats[existingIndex];
    const existingAttempts = Math.max(0, existing.attempts);
    const nextAttempts = Math.max(0, newStat.attempts);
    const totalAttempts = existingAttempts + nextAttempts;

    const mergedAccuracy =
      totalAttempts === 0
        ? newStat.accuracy
        : Math.round(
            (existing.accuracy * existingAttempts + newStat.accuracy * nextAttempts) /
              totalAttempts,
          );

    const merged: StudyStat = {
      subject: existing.subject,
      topic: existing.topic,
      accuracy: mergedAccuracy,
      attempts: totalAttempts,
    };

    const next = [...currentStats];
    next[existingIndex] = merged;
    set({ studyStats: next });
    persistState(get().userRef, selectState(get()));
  },

  setDiagnosticResult: (diagnosticResult) => {
    set({ diagnosticResult });
    persistState(get().userRef, selectState(get()));
  },

  setStudyPlan: (studyPlan) => {
    set({ studyPlan });
    persistState(get().userRef, selectState(get()));
  },

  completeFirstTime: () => {
    set({ isFirstTime: false });
    persistState(get().userRef, selectState(get()));
  },

  addPassPaperAttempt: (attempt) => {
    set({ passPaperAttempts: [...get().passPaperAttempts, attempt] });
    persistState(get().userRef, selectState(get()));
  },

  updatePassPaperStats: (stats) => {
    const current = [...get().passPaperStats];
    const existingIndex = current.findIndex((entry) => entry.subject === stats.subject);
    if (existingIndex >= 0) {
      current[existingIndex] = stats;
    } else {
      current.push(stats);
    }

    set({ passPaperStats: current });
    persistState(get().userRef, selectState(get()));
  },

  addStudySession: (session) => {
    if (get().studySessions.some((existing) => existing.id === session.id)) return;
    set({ studySessions: [...get().studySessions, { ...session, missed: false }] });
    persistState(get().userRef, selectState(get()));
  },

  updateStudySession: (id, updates) => {
    set({
      studySessions: get().studySessions.map((session) =>
        session.id === id ? { ...session, ...updates } : session,
      ),
    });
    persistState(get().userRef, selectState(get()));
  },

  markMissedSessions: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    set({
      studySessions: get().studySessions.map((session) => {
        const sessionDate = new Date(`${session.date}T00:00:00`);
        if (session.completed) return { ...session, missed: false };
        return {
          ...session,
          missed: sessionDate < today,
        };
      }),
    });
    persistState(get().userRef, selectState(get()));
  },

  setStudyPlanProfile: (studyPlanProfile) => {
    set({ studyPlanProfile });
    persistState(get().userRef, selectState(get()));
  },

  setPlannerSessions: (plannerSessions) => {
    set({ plannerSessions: plannerSessions.map(normalizePlannerSession) });
    persistState(get().userRef, selectState(get()));
  },

  updatePlannerSession: (id, updates) => {
    set({
      plannerSessions: get().plannerSessions.map((session) =>
        session.id === id ? normalizePlannerSession({ ...session, ...updates }) : session,
      ),
    });
    persistState(get().userRef, selectState(get()));
  },

  clearPlannerSessions: () => {
    set({ plannerSessions: [] });
    persistState(get().userRef, selectState(get()));
  },

  resetProgress: () => {
    set({ ...initialState });
    persistState(get().userRef, selectState(get()));
  },

  applyEngineDecay: () => {
    const engineState = applyDecay(get().engineState);
    set({ engineState });
    persistState(get().userRef, selectState(get()));
  },

  processEngineResults: (results) => {
    const engineState = processSessionResults(get().engineState ?? emptyUserState(), results);
    set({ engineState });
    if (!get().activeSession) {
      get().regenerateDailyPlan();
    } else {
      get().ensureDailyPlan();
    }
    persistState(get().userRef, selectState(get()));
  },

  setEngineState: (engineState) => {
    set({ engineState: normalizeEngineState(engineState) });
    if (!get().activeSession) {
      get().regenerateDailyPlan();
    } else {
      get().ensureDailyPlan();
    }
    persistState(get().userRef, selectState(get()));
  },

  setActiveSession: (activeSession) => {
    set({ activeSession });
    persistState(get().userRef, selectState(get()));
  },

  ensureDailyPlan: (date = todayISO()) => {
    const { studentProfile, plannerSessions, engineState, activeSession } = get();
    if (!studentProfile || studentProfile.subjects.length === 0) return;

    const todaysSessions = plannerSessions.filter((session) => session.scheduledAt === date);
    if (todaysSessions.length > 0) return;

    const nextSessions = buildPlannerSessions(studentProfile, engineState, plannerSessions, date);
    const preserved = plannerSessions.filter((session) => session.scheduledAt !== date);

    set({
      plannerSessions: [
        ...preserved,
        ...nextSessions,
      ],
      activeSession,
    });
    persistState(get().userRef, selectState(get()));
  },

  regenerateDailyPlan: (date = todayISO()) => {
    const { studentProfile, plannerSessions, engineState, activeSession } = get();
    if (!studentProfile || studentProfile.subjects.length === 0) return;

    const generated = buildPlannerSessions(studentProfile, engineState, plannerSessions, date);
    const preserved = plannerSessions.filter((session) => {
      if (session.scheduledAt !== date) return true;
      if (session.completed) return true;
      if (activeSession && session.id === activeSession.sessionId) return true;
      return false;
    });

    set({
      plannerSessions: [...preserved, ...generated],
    });
    persistState(get().userRef, selectState(get()));
  },

  startPlannerSession: (sessionId) => {
    const { plannerSessions, activeSession } = get();
    const plannerSession = plannerSessions.find((session) => session.id === sessionId);
    if (!plannerSession) return;

    if (activeSession && activeSession.sessionId === sessionId) {
      set({ activeSession: resumeSession(activeSession) });
      persistState(get().userRef, selectState(get()));
      return;
    }

    const nextSession = startSession(
      plannerSession.id,
      plannerSession.subject,
      plannerSession.topic,
      plannerSession.questionIds,
    );

    set({
      activeSession: nextSession,
      plannerSessions: plannerSessions.map((session) =>
        session.id === sessionId ? { ...session, completed: false } : session,
      ),
    });
    persistState(get().userRef, selectState(get()));
  },

  resumeActiveSession: () => {
    const activeSession = get().activeSession;
    if (!activeSession) return;
    set({ activeSession: resumeSession(activeSession) });
    persistState(get().userRef, selectState(get()));
  },

  pauseActiveSession: () => {
    const activeSession = get().activeSession;
    if (!activeSession) return;
    set({ activeSession: pauseSession(activeSession) });
    persistState(get().userRef, selectState(get()));
  },

  recordActiveQuestionTime: (questionId, timeSpentMs) => {
    const activeSession = get().activeSession;
    if (!activeSession) return;
    set({ activeSession: recordQuestionTime(activeSession, questionId, timeSpentMs) });
    persistState(get().userRef, selectState(get()));
  },

  submitActiveAnswer: (questionId, selectedIndex, timeSpentMs = 0) => {
    const activeSession = get().activeSession;
    if (!activeSession) return;
    set({
      activeSession: submitAnswer(activeSession, questionId, selectedIndex, timeSpentMs),
    });
    persistState(get().userRef, selectState(get()));
  },

  goToActiveQuestion: (index) => {
    const activeSession = get().activeSession;
    if (!activeSession) return;
    set({ activeSession: goToQuestion(activeSession, index) });
    persistState(get().userRef, selectState(get()));
  },

  completeActiveSession: () => {
    const activeSession = get().activeSession;
    if (!activeSession) return null;

    const questions = getQuestionsByIds(activeSession.questionIds);
    if (questions.length === 0) return null;

    const correctMap = Object.fromEntries(
      questions.map((question) => [question.id, question.correctIndex]),
    );
    const topicMap = Object.fromEntries(questions.map((question) => [question.id, question.topic]));

    const completed = completeEngineSession(activeSession, correctMap, topicMap);
    const score = completed.results.filter((result) => result.correct).length;
    const accuracy =
      completed.results.length === 0
        ? 0
        : Math.round((score / completed.results.length) * 100);
    const completedDate = new Date().toISOString();
    const completedDay = completedDate.slice(0, 10);

    const engineState = processSessionResults(get().engineState, {
      sessionId: activeSession.sessionId,
      results: completed.results,
      completedAt: completedDate,
      source: "planner",
    });

    const plannerSessions = get().plannerSessions.map((session) =>
      session.id === activeSession.sessionId
        ? {
            ...session,
            completed: true,
            score,
            accuracy,
          }
        : session,
    );
    const studentProfile = get().studentProfile;

    const studyStats = [...get().studyStats];
    for (const topicResult of completed.topicResults) {
      const existingIndex = studyStats.findIndex(
        (stat) => stat.subject === topicResult.subject && stat.topic === topicResult.topic,
      );
      const nextStat: StudyStat = {
        subject: topicResult.subject as StudyStat["subject"],
        topic: topicResult.topic,
        accuracy: Math.round(topicResult.accuracy * 100),
        attempts: topicResult.total,
      };

      if (existingIndex < 0) {
        studyStats.push(nextStat);
        continue;
      }

      const existing = studyStats[existingIndex];
      const totalAttempts = existing.attempts + nextStat.attempts;
      studyStats[existingIndex] = {
        subject: existing.subject,
        topic: existing.topic,
        accuracy:
          totalAttempts === 0
            ? nextStat.accuracy
            : Math.round(
                (existing.accuracy * existing.attempts + nextStat.accuracy * nextStat.attempts) /
                  totalAttempts,
              ),
        attempts: totalAttempts,
      };
    }

    const studySessions = [
      ...get().studySessions,
      {
        id: `planner-complete-${activeSession.sessionId}`,
        subject: activeSession.subject,
        durationMinutes: Math.max(1, Math.round(completed.totalTimeMs / 60_000)),
        completed: true,
        date: completedDay,
        topic: activeSession.topic,
        kind: "past_paper" as const,
        notes: `Planner session completed: ${accuracy}%`,
        missed: false,
      },
    ];

    const refreshedPlannerSessions =
      studentProfile && studentProfile.subjects.length > 0
        ? [
            ...plannerSessions.filter(
              (session) => session.scheduledAt !== completedDay || session.completed,
            ),
            ...buildPlannerSessions(studentProfile, engineState, plannerSessions, completedDay),
          ]
        : plannerSessions;

    set({
      activeSession: null,
      engineState,
      plannerSessions: refreshedPlannerSessions,
      studyStats,
      studySessions,
    });
    persistState(get().userRef, selectState(get()));

    return {
      sessionId: activeSession.sessionId,
      score,
      accuracy,
      topicResults: completed.topicResults,
    };
  },

  clearActiveSession: () => {
    set({ activeSession: null });
    persistState(get().userRef, selectState(get()));
  },
}));
