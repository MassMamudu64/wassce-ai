import { create } from 'zustand'
import type { UserProgress, StudyStat, DiagnosticResult, StudyPlan } from '../types/domain'
import type { PassPaperAttempt, PassPaperStats, PlannerSession } from '../core/types/passPaper'
import type { StudentProfile, StudySession, StudyPlan as ProfileStudyPlan } from '../types/profile'
import type { UserLearningState, ActiveSessionState, SessionResults } from '../core/types/learning'
import { emptyUserState, applyDecay, processSessionResults } from '../core/learningEngine'
import { upsertLearningState } from '../utils/supabaseData'

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type LearningStateData = {
  studentProfile: StudentProfile | null
  userProgress: UserProgress | null
  studyStats: StudyStat[]
  diagnosticResult: DiagnosticResult | null
  studyPlan: StudyPlan | null
  isFirstTime: boolean
  passPaperAttempts: PassPaperAttempt[]
  passPaperStats: PassPaperStats[]
  studySessions: StudySession[]
  studyPlanProfile: ProfileStudyPlan | null
  plannerSessions: PlannerSession[]
  /** Adaptive learning engine state — mastery, decay, spaced repetition. */
  engineState: UserLearningState
  /** Currently active study session (null when idle). */
  activeSession: ActiveSessionState | null
}

interface LearningState extends LearningStateData {
  userRef: string | null

  // ── Existing actions ──
  setUserRef: (userRef: string | null) => void
  hydrate: (data: Partial<LearningStateData> | null) => void
  setStudentProfile: (profile: StudentProfile | null) => void
  setUserProgress: (progress: UserProgress) => void
  updateStudyStat: (stat: StudyStat) => void
  setDiagnosticResult: (result: DiagnosticResult) => void
  setStudyPlan: (plan: StudyPlan) => void
  completeFirstTime: () => void
  addPassPaperAttempt: (attempt: PassPaperAttempt) => void
  updatePassPaperStats: (stats: PassPaperStats) => void
  addStudySession: (session: StudySession) => void
  updateStudySession: (id: string, updates: Partial<StudySession>) => void
  markMissedSessions: () => void
  setStudyPlanProfile: (plan: ProfileStudyPlan) => void
  setPlannerSessions: (sessions: PlannerSession[]) => void
  updatePlannerSession: (id: string, updates: Partial<PlannerSession>) => void
  clearPlannerSessions: () => void
  resetProgress: () => void

  // ── Engine actions ──
  /** Apply time-based decay to all topics. Call on app load. */
  applyEngineDecay: () => void
  /** Process completed session results through the learning engine. */
  processEngineResults: (results: SessionResults) => void
  /** Directly set the engine state (used by hydrate). */
  setEngineState: (state: UserLearningState) => void
  /** Set / clear the active session. */
  setActiveSession: (session: ActiveSessionState | null) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const serialize = (data: LearningStateData) =>
  JSON.parse(JSON.stringify(data)) as LearningStateData

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
})

const persistState = (userRef: string | null, data: LearningStateData) => {
  if (!userRef) return
  void upsertLearningState(userRef, serialize(data)).catch(() => {})
}

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
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useLearningStore = create<LearningState>()((set, get) => ({
  userRef: null,
  ...initialState,

  setUserRef: (userRef) => set({ userRef }),

  hydrate: (data) => {
    const next = { ...initialState, ...(data ?? {}) }
    // Ensure engineState is always a valid object
    if (!next.engineState || !next.engineState.topics) {
      next.engineState = emptyUserState()
    }
    set({ ...next })
  },

  setStudentProfile: (profile) => {
    set({ studentProfile: profile })
    persistState(get().userRef, selectState(get()))
  },

  setUserProgress: (progress) => {
    set({ userProgress: progress })
    persistState(get().userRef, selectState(get()))
  },

  updateStudyStat: (newStat) => {
    const stats = get().studyStats
    const existingIndex = stats.findIndex(
      (stat) => stat.subject === newStat.subject && stat.topic === newStat.topic,
    )

    if (existingIndex < 0) {
      set({ studyStats: [...stats, newStat] })
      persistState(get().userRef, selectState(get()))
      return
    }

    const existing = stats[existingIndex]
    const existingAttempts = Math.max(0, existing.attempts)
    const nextAttempts = Math.max(0, newStat.attempts)
    const totalAttempts = existingAttempts + nextAttempts

    const mergedAccuracy =
      totalAttempts === 0
        ? newStat.accuracy
        : Math.round(
            ((existing.accuracy * existingAttempts) + (newStat.accuracy * nextAttempts)) /
              totalAttempts,
          )

    const merged: StudyStat = {
      subject: existing.subject,
      topic: existing.topic,
      accuracy: mergedAccuracy,
      attempts: totalAttempts,
    }

    const next = stats.slice()
    next[existingIndex] = merged
    set({ studyStats: next })
    persistState(get().userRef, selectState(get()))
  },

  setDiagnosticResult: (result) => {
    set({ diagnosticResult: result })
    persistState(get().userRef, selectState(get()))
  },

  setStudyPlan: (plan) => {
    set({ studyPlan: plan })
    persistState(get().userRef, selectState(get()))
  },

  completeFirstTime: () => {
    set({ isFirstTime: false })
    persistState(get().userRef, selectState(get()))
  },

  addPassPaperAttempt: (attempt) => {
    const attempts = get().passPaperAttempts
    set({ passPaperAttempts: [...attempts, attempt] })
    persistState(get().userRef, selectState(get()))
  },

  updatePassPaperStats: (newStats) => {
    const stats = [...get().passPaperStats]
    const existingIndex = stats.findIndex((s) => s.subject === newStats.subject)
    if (existingIndex >= 0) {
      stats[existingIndex] = newStats
    } else {
      stats.push(newStats)
    }
    set({ passPaperStats: stats })
    persistState(get().userRef, selectState(get()))
  },

  addStudySession: (session) => {
    const sessions = get().studySessions
    if (sessions.some((existing) => existing.id === session.id)) return
    set({ studySessions: [...sessions, { ...session, missed: false }] })
    persistState(get().userRef, selectState(get()))
  },

  updateStudySession: (id, updates) => {
    const sessions = get().studySessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    )
    set({ studySessions: sessions })
    persistState(get().userRef, selectState(get()))
  },

  markMissedSessions: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessions = get().studySessions.map((session) => {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)
      if (session.completed) return { ...session, missed: false }
      return { ...session, missed: sessionDate < today }
    })
    set({ studySessions: sessions })
    persistState(get().userRef, selectState(get()))
  },

  setStudyPlanProfile: (plan) => {
    set({ studyPlanProfile: plan })
    persistState(get().userRef, selectState(get()))
  },

  setPlannerSessions: (sessions) => {
    set({ plannerSessions: sessions })
    persistState(get().userRef, selectState(get()))
  },

  updatePlannerSession: (id, updates) => {
    const sessions = get().plannerSessions.map((s) =>
      s.id === id ? { ...s, ...updates } : s,
    )
    set({ plannerSessions: sessions })
    persistState(get().userRef, selectState(get()))
  },

  clearPlannerSessions: () => {
    set({ plannerSessions: [] })
    persistState(get().userRef, selectState(get()))
  },

  resetProgress: () => {
    set({ ...initialState })
    persistState(get().userRef, selectState(get()))
  },

  // ── Engine actions ──

  applyEngineDecay: () => {
    const current = get().engineState
    if (!current || Object.keys(current.topics).length === 0) return
    const decayed = applyDecay(current)
    set({ engineState: decayed })
    persistState(get().userRef, selectState(get()))
  },

  processEngineResults: (results) => {
    const current = get().engineState ?? emptyUserState()
    const updated = processSessionResults(current, results)
    set({ engineState: updated })
    persistState(get().userRef, selectState(get()))
  },

  setEngineState: (engineState) => {
    set({ engineState })
    persistState(get().userRef, selectState(get()))
  },

  setActiveSession: (activeSession) => {
    set({ activeSession })
    persistState(get().userRef, selectState(get()))
  },
}))
