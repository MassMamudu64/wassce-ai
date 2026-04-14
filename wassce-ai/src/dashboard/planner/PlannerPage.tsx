import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  Clock,
  RefreshCcw,
  Sparkles,
  Target,
} from "lucide-react";
import type {
  InteractivePaper,
  PlannerSession,
} from "../../core/types/passPaper";
import type { EngineSession } from "../../core/types/learning";
import { generateDailyPlan, getDueTopics, getDecayedMastery } from "../../core/learningEngine";
import { useUI } from "../../contexts/UIContext";
import { useLearningStore } from "../../stores/learningStore";
import { getQuestionsByIds } from "../pass-papers/seedData";
import { subjectLabel } from "../../utils/subjects";
import PaperViewer from "../pass-papers/PaperViewer";
import type { SessionResult } from "../pass-papers/PaperViewer";
import DailyPlanCard from "./DailyPlanCard";
import SessionCard from "./SessionCard";

const today = () => new Date().toISOString().slice(0, 10);

/** Convert an EngineSession to the existing PlannerSession shape. */
function toPlannerSession(es: EngineSession): PlannerSession {
  return {
    id: es.id,
    subject: es.subject,
    topic: es.topic,
    type: "past_paper",
    year: 0,
    paper: 0,
    questionIds: es.questionIds,
    durationMinutes: es.durationMinutes,
    scheduledAt: es.scheduledAt,
    completed: false,
  };
}

const REASON_LABELS: Record<EngineSession["reason"], { label: string; color: string }> = {
  due: { label: "Due for review", color: "text-rose-600 dark:text-rose-400" },
  weak: { label: "Weak — needs practice", color: "text-amber-600 dark:text-amber-400" },
  new: { label: "New topic", color: "text-blue-600 dark:text-blue-400" },
  revision: { label: "Revision", color: "text-emerald-600 dark:text-emerald-400" },
};

export default function PlannerPage() {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const {
    studentProfile,
    studyStats,
    plannerSessions,
    engineState,
    setPlannerSessions,
    updatePlannerSession,
    processEngineResults,
  } = useLearningStore();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  // Track the reason for each generated session for display
  const [sessionReasons, setSessionReasons] = useState<Record<string, EngineSession["reason"]>>({});

  const subjects = studentProfile?.subjects ?? [];
  const todayStr = today();

  // Sessions for today
  const todaySessions = useMemo(
    () => plannerSessions.filter((s) => s.scheduledAt === todayStr),
    [plannerSessions, todayStr],
  );

  const allCompleted =
    todaySessions.length > 0 && todaySessions.every((s) => s.completed);

  // Due topics from the engine
  const dueTopics = useMemo(
    () => getDueTopics(engineState),
    [engineState],
  );
  const activeDueCount = dueTopics.filter((d) =>
    subjects.includes(d.state.subject),
  ).length;

  // ── Generate plan using learning engine ──
  const handleGenerate = useCallback(() => {
    if (subjects.length === 0) return;
    const completedIds = plannerSessions
      .filter((s) => s.completed)
      .flatMap((s) => s.questionIds);

    const engineSessions = generateDailyPlan({
      userState: engineState,
      subjects,
      completedQuestionIds: completedIds,
      date: todayStr,
    });

    // Track reasons
    const reasons: Record<string, EngineSession["reason"]> = {};
    for (const es of engineSessions) {
      reasons[es.id] = es.reason;
    }
    setSessionReasons((prev) => ({ ...prev, ...reasons }));

    // Keep completed sessions, replace pending ones for today
    const kept = plannerSessions.filter(
      (s) => s.scheduledAt !== todayStr || s.completed,
    );
    setPlannerSessions([
      ...kept,
      ...engineSessions.map(toPlannerSession),
    ]);
  }, [subjects, engineState, plannerSessions, setPlannerSessions, todayStr]);

  // ── Launch a session ──
  const activeSession = useMemo(
    () => plannerSessions.find((s) => s.id === activeSessionId) ?? null,
    [plannerSessions, activeSessionId],
  );

  const activePaper = useMemo<InteractivePaper | null>(() => {
    if (!activeSession) return null;
    const questions = getQuestionsByIds(activeSession.questionIds);
    if (questions.length === 0) return null;
    return {
      id: `planner-${activeSession.id}`,
      subject: activeSession.subject,
      year: activeSession.year,
      paper: activeSession.paper,
      title: `${activeSession.topic} — Study Session`,
      durationMinutes: activeSession.durationMinutes,
      questions,
    };
  }, [activeSession]);

  const handleStartSession = useCallback((session: PlannerSession) => {
    setActiveSessionId(session.id);
  }, []);

  const handleSessionComplete = useCallback(
    (result: SessionResult) => {
      if (!activeSessionId) return;
      updatePlannerSession(activeSessionId, {
        completed: true,
        score: result.score,
        accuracy: result.accuracy,
      });
      // Note: usePaperAttempt already calls processEngineResults,
      // so the engine state is updated automatically.
    },
    [activeSessionId, updatePlannerSession],
  );

  const handleExitSession = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  // ── Active session render ──
  if (activeSessionId && activePaper) {
    return (
      <PaperViewer
        initialPaper={activePaper}
        initialMode="practice"
        onSessionComplete={handleSessionComplete}
        onExit={handleExitSession}
      />
    );
  }

  // ── No profile ──
  if (!studentProfile || subjects.length === 0) {
    return (
      <div
        className={`rounded-2xl border p-8 text-center ${
          isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
        }`}
      >
        <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Set up your student profile first to unlock the adaptive study planner.
        </p>
      </div>
    );
  }

  // ── Empty plan ──
  if (todaySessions.length === 0) {
    return (
      <div className="space-y-6">
        {/* Due topics alert */}
        {activeDueCount > 0 && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              isDark
                ? "border-rose-800 bg-rose-950/40"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            <Clock
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                isDark ? "text-rose-400" : "text-rose-600"
              }`}
            />
            <div>
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-rose-300" : "text-rose-800"
                }`}
              >
                {activeDueCount} topic{activeDueCount > 1 ? "s" : ""} overdue for review
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  isDark ? "text-rose-400" : "text-rose-700"
                }`}
              >
                Mastery is decaying. Generate a plan to review these topics before they fade.
              </p>
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl border border-dashed p-10 text-center ${
            isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <Brain
            className={`mx-auto h-10 w-10 ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          />
          <h3
            className={`mt-4 text-lg font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Adaptive study plan
          </h3>
          <p
            className={`mt-2 text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            The learning engine builds your plan from due reviews, weak topics,
            and new material — using spaced repetition and mastery decay.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Sparkles className="h-4 w-4" />
            Generate today's plan
          </button>
        </div>
      </div>
    );
  }

  // ── Active plan ──
  const pendingSessions = todaySessions.filter((s) => !s.completed);
  const completedSessions = todaySessions.filter((s) => s.completed);
  const weakResults = completedSessions.filter(
    (s) => s.accuracy != null && s.accuracy < 60,
  );

  return (
    <div className="space-y-6">
      {/* Daily overview */}
      <DailyPlanCard sessions={todaySessions} date={todayStr} />

      {/* Due topics alert */}
      {activeDueCount > 0 && pendingSessions.length === 0 && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 ${
            isDark
              ? "border-rose-800 bg-rose-950/40"
              : "border-rose-200 bg-rose-50"
          }`}
        >
          <Clock
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              isDark ? "text-rose-400" : "text-rose-600"
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-rose-300" : "text-rose-800"
              }`}
            >
              {activeDueCount} additional topic{activeDueCount > 1 ? "s" : ""} still overdue
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? "border-rose-700 bg-rose-900 text-rose-300 hover:bg-rose-800"
                  : "border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200"
              }`}
            >
              <RefreshCcw className="h-3 w-3" />
              Add review sessions
            </button>
          </div>
        </div>
      )}

      {/* Weak topic alert */}
      {weakResults.length > 0 && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 ${
            isDark
              ? "border-amber-800 bg-amber-950/40"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <AlertTriangle
            className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
              isDark ? "text-amber-400" : "text-amber-600"
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-amber-300" : "text-amber-800"
              }`}
            >
              Weak topics detected
            </p>
            <p
              className={`mt-0.5 text-xs ${
                isDark ? "text-amber-400" : "text-amber-700"
              }`}
            >
              {weakResults.map((s) => s.topic).join(", ")} scored below 60%.
              The engine will schedule follow-up reviews.
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              className={`mt-2 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? "border-amber-700 bg-amber-900 text-amber-300 hover:bg-amber-800"
                  : "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
              }`}
            >
              <RefreshCcw className="h-3 w-3" />
              Regenerate plan
            </button>
          </div>
        </div>
      )}

      {/* Pending sessions */}
      {pendingSessions.length > 0 && (
        <section>
          <h3
            className={`mb-3 text-xs font-semibold uppercase tracking-[0.3em] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Up next
          </h3>
          <div className="space-y-3">
            {pendingSessions.map((session) => {
              const reason = sessionReasons[session.id];
              const reasonInfo = reason ? REASON_LABELS[reason] : null;
              return (
                <div key={session.id} className="space-y-1">
                  {reasonInfo && (
                    <div className="flex items-center gap-1.5 px-1">
                      <Target className={`h-3 w-3 ${reasonInfo.color}`} />
                      <span className={`text-[10px] font-semibold uppercase tracking-wide ${reasonInfo.color}`}>
                        {reasonInfo.label}
                      </span>
                    </div>
                  )}
                  <SessionCard
                    session={session}
                    onStart={handleStartSession}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Completed sessions */}
      {completedSessions.length > 0 && (
        <section>
          <h3
            className={`mb-3 text-xs font-semibold uppercase tracking-[0.3em] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Completed
          </h3>
          <div className="space-y-3">
            {completedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onStart={handleStartSession}
              />
            ))}
          </div>
        </section>
      )}

      {/* All done */}
      {allCompleted && (
        <div
          className={`rounded-2xl border border-dashed p-6 text-center ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-emerald-400" : "text-emerald-700"
            }`}
          >
            All sessions complete for today!
          </p>
          <p
            className={`mt-1 text-xs ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            The engine has updated your mastery. Generate more sessions if you want extra practice.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Generate more sessions
          </button>
        </div>
      )}

      {/* Regenerate */}
      {!allCompleted && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGenerate}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Regenerate plan
          </button>
        </div>
      )}
    </div>
  );
}
