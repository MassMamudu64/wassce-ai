import { CalendarDays, Target, TrendingUp, Zap } from "lucide-react";
import type { PlannerSession } from "../../core/types/passPaper";
import { useUI } from "../../contexts/UIContext";

interface Props {
  sessions: PlannerSession[];
  date: string;
}

export default function DailyPlanCard({ sessions, date }: Props) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const totalQuestions = sessions.reduce((s, sess) => s + sess.questionIds.length, 0);
  const completedSessions = sessions.filter((s) => s.completed);
  const totalMinutes = sessions.reduce((s, sess) => s + sess.durationMinutes, 0);
  const averageAccuracy =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((s, sess) => s + (sess.accuracy ?? 0), 0) /
            completedSessions.length,
        )
      : null;

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-2">
        <CalendarDays
          className={`h-5 w-5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
        />
        <h3
          className={`text-sm font-semibold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {displayDate}
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          className={`rounded-xl border p-3 ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Target
              className={`h-3.5 w-3.5 ${isDark ? "text-blue-400" : "text-blue-600"}`}
            />
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Sessions
            </p>
          </div>
          <p
            className={`mt-1 text-lg font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {completedSessions.length}/{sessions.length}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Zap
              className={`h-3.5 w-3.5 ${
                isDark ? "text-amber-400" : "text-amber-600"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Questions
            </p>
          </div>
          <p
            className={`mt-1 text-lg font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {totalQuestions}
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <CalendarDays
              className={`h-3.5 w-3.5 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Time
            </p>
          </div>
          <p
            className={`mt-1 text-lg font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {totalMinutes} min
          </p>
        </div>

        <div
          className={`rounded-xl border p-3 ${
            isDark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <TrendingUp
              className={`h-3.5 w-3.5 ${
                isDark ? "text-violet-400" : "text-violet-600"
              }`}
            />
            <p
              className={`text-xs font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Accuracy
            </p>
          </div>
          <p
            className={`mt-1 text-lg font-semibold ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            {averageAccuracy != null ? `${averageAccuracy}%` : "—"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {sessions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>
              Daily progress
            </span>
            <span
              className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {Math.round((completedSessions.length / sessions.length) * 100)}%
            </span>
          </div>
          <div
            className={`mt-1.5 h-2 rounded-full ${
              isDark ? "bg-slate-700" : "bg-slate-200"
            }`}
          >
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${Math.round(
                  (completedSessions.length / sessions.length) * 100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
