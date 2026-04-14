import { useCallback, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Brain,
  Clock,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import type { PlannerSession } from "../../core/types/passPaper";
import { useLearningStore } from "../../stores/learningStore";
import { useDueTopicMastery, useRecommendedSession } from "../../stores/learningSelectors";
import { getQuestionsByIds } from "../pass-papers/seedData";
import PaperViewer from "../pass-papers/PaperViewer";
import DailyPlanCard from "./DailyPlanCard";
import SessionCard from "./SessionCard";

const todayISO = () => new Date().toISOString().slice(0, 10);

const reasonLabels: Record<PlannerSession["reason"], { label: string; color: string }> = {
  due: { label: "Due review", color: "text-rose-600 dark:text-rose-400" },
  weak: { label: "Weak topic", color: "text-amber-600 dark:text-amber-400" },
  new: { label: "New topic", color: "text-blue-600 dark:text-blue-400" },
  revision: { label: "Revision", color: "text-emerald-600 dark:text-emerald-400" },
};

export default function PlannerPage() {
  const studentProfile = useLearningStore((state) => state.studentProfile);
  const plannerSessions = useLearningStore((state) => state.plannerSessions);
  const activeSession = useLearningStore((state) => state.activeSession);
  const ensureDailyPlan = useLearningStore((state) => state.ensureDailyPlan);
  const regenerateDailyPlan = useLearningStore((state) => state.regenerateDailyPlan);
  const startPlannerSession = useLearningStore((state) => state.startPlannerSession);
  const clearActiveSession = useLearningStore((state) => state.clearActiveSession);

  const today = todayISO();
  const dueTopics = useDueTopicMastery(3);
  const recommendedSession = useRecommendedSession();

  useEffect(() => {
    ensureDailyPlan(today);
  }, [ensureDailyPlan, today]);

  const todaysSessions = useMemo(
    () => plannerSessions.filter((session) => session.scheduledAt === today),
    [plannerSessions, today],
  );

  const activePlannerSession = useMemo(
    () =>
      activeSession
        ? plannerSessions.find((session) => session.id === activeSession.sessionId) ?? null
        : null,
    [activeSession, plannerSessions],
  );

  const activeQuestions = useMemo(
    () => (activePlannerSession ? getQuestionsByIds(activePlannerSession.questionIds) : []),
    [activePlannerSession],
  );

  const pendingSessions = todaysSessions.filter((session) => !session.completed);
  const completedSessions = todaysSessions.filter((session) => session.completed);
  const allCompleted = todaysSessions.length > 0 && pendingSessions.length === 0;
  const recommendedPlannerSession = useMemo(
    () =>
      recommendedSession
        ? todaysSessions.find((session) => session.id === recommendedSession.id) ?? null
        : null,
    [recommendedSession, todaysSessions],
  );

  const handleStartSession = useCallback(
    (session: PlannerSession) => {
      startPlannerSession(session.id);
    },
    [startPlannerSession],
  );

  const handleRegenerate = useCallback(() => {
    regenerateDailyPlan(today);
  }, [regenerateDailyPlan, today]);

  if (!studentProfile || studentProfile.subjects.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Set up your student profile first to unlock the adaptive study planner.
        </p>
      </div>
    );
  }

  if (activeSession?.phase === "active" && activePlannerSession && activeQuestions.length > 0) {
    return (
      <PaperViewer
        sessionId={activePlannerSession.id}
        sessionSubject={activePlannerSession.subject}
        sessionTopic={activePlannerSession.topic}
        sessionTitle={`${activePlannerSession.topic} - ${reasonLabels[activePlannerSession.reason].label}`}
        sessionDurationMinutes={activePlannerSession.durationMinutes}
        questions={activeQuestions}
        onSessionComplete={() => {}}
        onExit={() => {}}
      />
    );
  }

  if (todaysSessions.length === 0) {
    return (
      <div className="space-y-6">
        {dueTopics.length > 0 && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                {dueTopics.length} due topic{dueTopics.length > 1 ? "s" : ""} need review today
              </p>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">
                {dueTopics.map((topic) => topic.topic).join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <Brain className="mx-auto h-10 w-10 text-blue-600 dark:text-blue-400" />
          <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            Adaptive study plan ready
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            The engine will prioritize due reviews, weak topics, and only then add new material.
          </p>
          <button
            type="button"
            onClick={handleRegenerate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            Build today&apos;s plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DailyPlanCard sessions={todaysSessions} date={today} />

      {recommendedSession && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
                Recommended next session
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {recommendedSession.topic}
              </p>
              <p className="text-xs text-slate-500">
                {reasonLabels[recommendedSession.reason].label} | {recommendedSession.questionCount} questions | {recommendedSession.durationMinutes} min
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!recommendedPlannerSession) return;
                handleStartSession(recommendedPlannerSession);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Target className="h-4 w-4" />
              Start now
            </button>
          </div>
        </div>
      )}

      {dueTopics.length > 0 && pendingSessions.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Review path is locked on due topics first
              </p>
              <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">
                {dueTopics.map((topic) => topic.topic).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSession?.phase === "paused" && activePlannerSession && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                Resume saved session
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {activePlannerSession.topic} is ready where you left off.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleStartSession(activePlannerSession)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Resume
              </button>
              <button
                type="button"
                onClick={clearActiveSession}
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingSessions.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Up next
          </h3>
          <div className="space-y-3">
            {pendingSessions.map((session) => {
              const reason = reasonLabels[session.reason];
              const resumable = activeSession?.phase === "paused" && activeSession.sessionId === session.id;
              return (
                <div key={session.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-1">
                    <Target className={`h-3 w-3 ${reason.color}`} />
                    <span className={`text-[10px] font-semibold uppercase tracking-wide ${reason.color}`}>
                      {reason.label}
                    </span>
                  </div>
                  <SessionCard
                    session={session}
                    onStart={handleStartSession}
                    resumable={Boolean(resumable)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {completedSessions.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Completed
          </h3>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <SessionCard key={session.id} session={session} onStart={handleStartSession} />
            ))}
          </div>
        </section>
      )}

      {allCompleted && (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Today&apos;s required reviews are complete.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Regenerate the plan if you want extra revision or fresh topics.
          </p>
          <button
            type="button"
            onClick={handleRegenerate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Generate more sessions
          </button>
        </div>
      )}

      {!allCompleted && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleRegenerate}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Rebuild plan
          </button>
        </div>
      )}

      {pendingSessions.length === 0 && completedSessions.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                No sessions could be generated yet
              </p>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Try a past paper or quiz to seed the engine with real mastery data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
