import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProgress, StudyStat, DiagnosticResult, StudyPlan } from '../types/domain'
import type { PassPaperAttempt, PassPaperStats } from '../core/types/passPaper'
import type { StudentProfile, StudySession, StudyPlan as ProfileStudyPlan } from '../types/profile'

interface LearningState {
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

  // Actions
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
  resetProgress: () => void
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
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

      setStudentProfile: (profile) => set({ studentProfile: profile }),

      setUserProgress: (progress) => set({ userProgress: progress }),

      updateStudyStat: (newStat) => {
        const stats = get().studyStats
        const existingIndex = stats.findIndex((stat) => stat.subject === newStat.subject && stat.topic === newStat.topic)

        if (existingIndex < 0) {
          set({ studyStats: [...stats, newStat] })
          return
        }

        const existing = stats[existingIndex]
        const existingAttempts = Math.max(0, existing.attempts)
        const nextAttempts = Math.max(0, newStat.attempts)
        const totalAttempts = existingAttempts + nextAttempts

        const mergedAccuracy =
          totalAttempts === 0
            ? newStat.accuracy
            : Math.round(((existing.accuracy * existingAttempts) + (newStat.accuracy * nextAttempts)) / totalAttempts)

        const merged: StudyStat = {
          subject: existing.subject,
          topic: existing.topic,
          accuracy: mergedAccuracy,
          attempts: totalAttempts,
        }

        const next = stats.slice()
        next[existingIndex] = merged
        set({ studyStats: next })
      },

      setDiagnosticResult: (result) => set({ diagnosticResult: result }),

      setStudyPlan: (plan) => set({ studyPlan: plan }),

      completeFirstTime: () => set({ isFirstTime: false }),

      addPassPaperAttempt: (attempt) => {
        const attempts = get().passPaperAttempts;
        set({ passPaperAttempts: [...attempts, attempt] });
      },

      updatePassPaperStats: (newStats) => {
        const stats = get().passPaperStats;
        const existingIndex = stats.findIndex(s => s.subject === newStats.subject);
        if (existingIndex >= 0) {
          stats[existingIndex] = newStats;
        } else {
          stats.push(newStats);
        }
        set({ passPaperStats: [...stats] });
      },

      addStudySession: (session) => {
        const sessions = get().studySessions;
        if (sessions.some((existing) => existing.id === session.id)) return;
        set({ studySessions: [...sessions, { ...session, missed: false }] });
      },

      updateStudySession: (id, updates) => {
        const sessions = get().studySessions.map(s =>
          s.id === id ? { ...s, ...updates } : s
        );
        set({ studySessions: sessions });
      },

      markMissedSessions: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessions = get().studySessions.map((session) => {
          const sessionDate = new Date(session.date);
          sessionDate.setHours(0, 0, 0, 0);
          if (session.completed) {
            return { ...session, missed: false };
          }
          const isMissed = sessionDate < today;
          return { ...session, missed: isMissed };
        });
        set({ studySessions: sessions });
      },

      setStudyPlanProfile: (plan) => set({ studyPlanProfile: plan }),

      resetProgress: () => set({
        studentProfile: null,
        userProgress: null,
        studyStats: [],
        diagnosticResult: null,
        studyPlan: null,
        isFirstTime: true,
        passPaperAttempts: [],
        passPaperStats: [],
        studySessions: [],
        studyPlanProfile: null
      })
    }),
    {
      name: 'learning-storage'
    }
  )
)
