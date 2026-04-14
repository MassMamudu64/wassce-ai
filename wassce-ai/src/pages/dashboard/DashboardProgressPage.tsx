import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLearningStore } from "../../stores/learningStore";
import {
  useStudyStreak,
  useTodayStats,
  useOverallAccuracy,
  useInsights,
  useSubjectSummaries,
  useTopicMastery,
  useWeeklyActivity,
} from "../../stores/learningSelectors";
import { subjectLabel } from "../../utils/subjects";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Flame,
  RefreshCcw,
  Target,
  TrendingUp,
} from "lucide-react";

const gradeFromScore = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  if (score >= 45) return "E";
  return "F";
};

export default function DashboardProgressPage() {
  const { studentProfile, studySessions, studyStats, passPaperAttempts } = useLearningStore();
  const streak = useStudyStreak();
  const todayStats = useTodayStats();
  const overallAccuracy = useOverallAccuracy();
  const insights = useInsights();
  const subjectSummaries = useSubjectSummaries();
  const topicMastery = useTopicMastery();
  const weeklyActivity = useWeeklyActivity();

  const predictedGrade = overallAccuracy !== null ? gradeFromScore(overallAccuracy) : "--";

  // Aggregate stats
  const totalSessions = studySessions.filter((s) => s.completed).length;
  const totalMinutes = studySessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalAttempts = passPaperAttempts.length;

  // Weekly comparison
  const thisWeekMinutes = weeklyActivity.reduce((sum, d) => sum + d.minutes, 0);
  const thisWeekSessions = weeklyActivity.reduce((sum, d) => sum + d.sessions, 0);

  // Weak topics sorted by accuracy
  const weakTopics = useMemo(
    () =>
      topicMastery
        .filter((t) => t.status === "weak")
        .sort((a, b) => a.accuracy - b.accuracy),
    [topicMastery],
  );

  // Strong topics
  const strongTopics = useMemo(
    () => topicMastery.filter((t) => t.status === "strong").sort((a, b) => b.accuracy - a.accuracy),
    [topicMastery],
  );

  // Improvement detection — subjects with accuracy > 60% and attempts > 2
  const improvingSubjects = useMemo(
    () =>
      subjectSummaries
        .filter((s) => s.accuracy >= 60 && s.masteredCount > 0)
        .sort((a, b) => b.accuracy - a.accuracy),
    [subjectSummaries],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Progress</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Feedback and analytics</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          All data is derived from your quiz results, past paper attempts, and completed sessions.
        </p>
      </header>

      {/* ═══════ Key Metrics Grid ═══════ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Readiness */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-slate-400" />
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Readiness</p>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
            {overallAccuracy !== null ? `${overallAccuracy}%` : "--"}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {overallAccuracy !== null ? `Predicted: ${predictedGrade}` : "Complete a quiz to start"}
          </p>
        </div>

        {/* Streak */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Flame className={`h-4 w-4 ${streak >= 3 ? "text-orange-500" : "text-slate-400"}`} />
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Streak</p>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{streak} day{streak !== 1 ? "s" : ""}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {streak >= 7 ? "Incredible!" : streak >= 3 ? "Keep going!" : "Build consistency"}
          </p>
        </div>

        {/* Study Time */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Total study time</p>
          </div>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
            {totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {totalSessions} session{totalSessions !== 1 ? "s" : ""} completed
          </p>
        </div>

        {/* Today */}
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Today</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{todayStats.minutes} min</p>
          <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${todayStats.goalProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {todayStats.goalProgress >= 100 ? "Goal hit!" : `${todayStats.goal} min goal`}
          </p>
        </div>
      </div>

      {/* ═══════ Weekly Activity Chart ═══════ */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Last 7 days</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Study consistency</h2>
            <p className="text-xs text-slate-500">
              {thisWeekMinutes} min | {thisWeekSessions} session{thisWeekSessions !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-end gap-2" style={{ height: "120px" }}>
          {weeklyActivity.map((day) => {
            const maxMin = Math.max(...weeklyActivity.map((d) => d.minutes), 1);
            const height = Math.max(4, (day.minutes / maxMin) * 100);
            const isToday = day.date === new Date().toISOString().slice(0, 10);
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-slate-500">
                  {day.minutes > 0 ? `${day.minutes}m` : ""}
                </span>
                <div
                  className={`w-full rounded-lg transition-all ${
                    day.minutes > 0
                      ? isToday
                        ? "bg-emerald-500"
                        : "bg-emerald-400 dark:bg-emerald-600"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  style={{ height: `${height}px` }}
                />
                <span className={`text-[10px] ${isToday ? "font-bold text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════ Actionable Insights ═══════ */}
      {insights.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Actionable insights</p>
          </div>
          <div className="mt-4 space-y-3">
            {insights.map((insight, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-2xl border p-4 ${
                  insight.type === "warning"
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                    : insight.type === "success"
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />}
                  {insight.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
                  {insight.type === "info" && <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
                  <p className={`text-sm ${
                    insight.type === "warning" ? "text-amber-800 dark:text-amber-300"
                      : insight.type === "success" ? "text-emerald-800 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {insight.text}
                  </p>
                </div>
                {insight.action && (
                  <Link
                    to={insight.action.to}
                    className="ml-3 shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Target className="h-3 w-3" />
                    {insight.action.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ Subject Mastery Breakdown ═══════ */}
      {subjectSummaries.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Subject breakdown</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Mastery by subject</h2>
          <div className="mt-4 space-y-4">
            {subjectSummaries.map((s) => (
              <div key={s.subject} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
                    <p className="text-xs text-slate-500">
                      {s.topicCount} topics | {s.masteredCount} mastered | {s.weakCount} weak | {s.untestedCount} untested
                    </p>
                  </div>
                  <span className={`text-xl font-semibold ${
                    s.accuracy >= 75 ? "text-emerald-600" : s.accuracy >= 50 ? "text-amber-600" : s.accuracy > 0 ? "text-rose-600" : "text-slate-400"
                  }`}>
                    {s.accuracy > 0 ? `${s.accuracy}%` : "--"}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all ${
                      s.accuracy >= 75 ? "bg-emerald-500" : s.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${s.accuracy}%` }}
                  />
                </div>
                {s.weakCount > 0 && (
                  <Link
                    to="/dashboard/topics"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {s.weakCount} weak topic{s.weakCount > 1 ? "s" : ""} — view details
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ Weak Topics — Action Required ═══════ */}
      {weakTopics.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-xs uppercase tracking-[0.4em] text-amber-700 dark:text-amber-400">Action required</p>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-amber-900 dark:text-amber-200">Weak topics ({weakTopics.length})</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {weakTopics.slice(0, 6).map((t) => (
              <div key={`${t.subject}-${t.topic}`} className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.topic}</p>
                    <p className="text-xs text-slate-500">{subjectLabel(t.subject)} | {t.accuracy}% | {t.attempts} attempts</p>
                  </div>
                  <Link
                    to="/dashboard/planner"
                    className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                  >
                    <RefreshCcw className="h-3 w-3" />
                    Practice
                  </Link>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${t.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>
          {weakTopics.length > 6 && (
            <Link to="/dashboard/topics" className="mt-4 inline-flex text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400">
              View all {weakTopics.length} weak topics
            </Link>
          )}
        </section>
      )}

      {/* ═══════ Strong Topics — Celebration ═══════ */}
      {strongTopics.length > 0 && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">Mastered</p>
          </div>
          <h2 className="mt-1 text-lg font-semibold text-emerald-900 dark:text-emerald-200">
            Strong topics ({strongTopics.length})
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {strongTopics.map((t) => (
              <span
                key={`${t.subject}-${t.topic}`}
                className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                {t.topic} ({t.accuracy}%)
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ No Profile State ═══════ */}
      {!studentProfile && (
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Set up your profile to unlock subject-based progress tracking.
          <Link to="/dashboard/overview" className="ml-2 font-semibold text-slate-900 hover:text-slate-700 dark:text-white">
            Go to setup
          </Link>
        </section>
      )}
    </div>
  );
}
