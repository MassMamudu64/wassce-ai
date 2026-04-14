import { Link } from "react-router-dom";
import { useMemo } from "react";
import StudentProfileSetup from "../../dashboard/StudentProfileSetup";
import { useLearningStore } from "../../stores/learningStore";
import {
  useStudyStreak,
  useTodayStats,
  useOverallAccuracy,
  useInsights,
  useSubjectSummaries,
  useWeeklyActivity,
  useDueTopicsCount,
} from "../../stores/learningSelectors";
import { useLearning } from "../../contexts/LearningContext";
import { subjectLabel } from "../../utils/subjects";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Clock,
  FileText,
  Flame,
  Lightbulb,
  Play,
  RefreshCcw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const { studentProfile, studySessions, plannerSessions } = useLearningStore();
  const { recentLearning, suggestedTopics } = useLearning();
  const streak = useStudyStreak();
  const todayStats = useTodayStats();
  const overallAccuracy = useOverallAccuracy();
  const insights = useInsights();
  const subjectSummaries = useSubjectSummaries();
  const weeklyActivity = useWeeklyActivity();
  const dueTopicsCount = useDueTopicsCount();

  // Find weakest subject for AI card
  const weakestSubject = useMemo(() => {
    if (subjectSummaries.length === 0) return null;
    const tested = subjectSummaries.filter((s) => s.accuracy > 0);
    if (tested.length === 0) return null;
    return tested.reduce((a, b) => (a.accuracy < b.accuracy ? a : b));
  }, [subjectSummaries]);

  // Today's planner sessions
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayPlannerSessions = useMemo(
    () => plannerSessions.filter((s) => s.scheduledAt === todayStr),
    [plannerSessions, todayStr],
  );
  const pendingPlannerSessions = todayPlannerSessions.filter((s) => !s.completed);
  const completedPlannerSessions = todayPlannerSessions.filter((s) => s.completed);

  // Last incomplete session for "resume" action
  const lastIncomplete = useMemo(() => {
    const incomplete = studySessions.filter((s) => !s.completed && !s.missed);
    return incomplete.length > 0 ? incomplete[incomplete.length - 1] : null;
  }, [studySessions]);

  // Weak topics from engine state
  const weakTopicSubjects = useMemo(() => {
    const weak = subjectSummaries.filter((s) => s.weakCount > 0);
    return weak.length > 0;
  }, [subjectSummaries]);

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <StudentProfileSetup />
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">What happens next</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            After setup, your dashboard shows today's plan, recommended tools, and progress tracking — all personalized to your subjects and weak areas.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/dashboard/tools/quizzes" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">
              Try a quick quiz
            </Link>
            <Link to="/dashboard/past-papers" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300">
              Browse past papers
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const examDate = studentProfile.examDate ? new Date(studentProfile.examDate) : null;
  const daysToExam = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* ═══════════════ AI SESSION CARD ═══════════════ */}
      <section className="col-span-12 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-emerald-900 dark:from-emerald-950/40 dark:to-slate-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700 dark:text-emerald-400">AI study advisor</p>
            </div>
            {weakestSubject ? (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  You are {weakestSubject.accuracy}% strong in {weakestSubject.label}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Today: {pendingPlannerSessions.length > 0
                    ? `${pendingPlannerSessions.length} session${pendingPlannerSessions.length > 1 ? "s" : ""} planned (${pendingPlannerSessions.reduce((s, p) => s + p.questionIds.length, 0)} questions)`
                    : "Generate a study plan to start"}
                  {todayStats.minutes > 0 && ` | ${todayStats.minutes} min studied`}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Welcome back, {studentProfile.name}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Complete a quiz or past paper to unlock personalized AI recommendations.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/dashboard/planner" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              <Play className="h-4 w-4" />
              {pendingPlannerSessions.length > 0 ? "Start session" : "Generate plan"}
            </Link>
            <Link to="/dashboard/past-papers" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/60">
              <FileText className="h-4 w-4" />
              Past papers
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ DUE TOPICS ALERT ═══════════════ */}
      {dueTopicsCount > 0 && (
        <section className="col-span-12 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
              {dueTopicsCount} topic{dueTopicsCount > 1 ? "s" : ""} overdue for review
            </p>
            <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-400">
              Mastery is decaying on topics you haven't reviewed. Generate a study plan to prevent knowledge loss.
            </p>
          </div>
          <Link to="/dashboard/planner" className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-200 dark:border-rose-800 dark:bg-rose-900 dark:text-rose-300 dark:hover:bg-rose-800">
            <AlertTriangle className="h-3.5 w-3.5" />
            Review now
          </Link>
        </section>
      )}

      {/* ═══════════════ LEFT COLUMN ═══════════════ */}
      <div className="col-span-12 space-y-6 lg:col-span-8">

        {/* ── Today's Plan ── */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Today's plan</p>
              </div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                {todayPlannerSessions.length > 0
                  ? `${completedPlannerSessions.length}/${todayPlannerSessions.length} sessions done`
                  : "No sessions scheduled"}
              </h2>
            </div>
            <Link to="/dashboard/planner" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400">
              Open planner
            </Link>
          </div>

          {todayPlannerSessions.length > 0 ? (
            <div className="mt-4 space-y-2">
              {todayPlannerSessions.slice(0, 4).map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 ${
                    session.completed
                      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${session.completed ? "text-emerald-800 dark:text-emerald-300" : "text-slate-900 dark:text-white"}`}>
                      {subjectLabel(session.subject)} — {session.topic}
                    </p>
                    <p className="text-xs text-slate-500">
                      {session.questionIds.length} questions | {session.durationMinutes} min
                      {session.accuracy != null && ` | ${session.accuracy}%`}
                    </p>
                  </div>
                  {session.completed ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400">Done</span>
                  ) : (
                    <Link to="/dashboard/planner" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                      Start
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-700">
              <p className="text-sm text-slate-500">Open the planner to generate today's adaptive study sessions.</p>
              <Link to="/dashboard/planner" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                <CalendarDays className="h-4 w-4" />
                Generate plan
              </Link>
            </div>
          )}
        </section>

        {/* ── Quick Actions ── */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Quick actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lastIncomplete && (
              <Link to="/dashboard/planner" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                <Play className="h-4 w-4" />
                Resume {subjectLabel(lastIncomplete.subject)}
              </Link>
            )}
            <Link to="/dashboard/tools/quizzes" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
              <Target className="h-4 w-4" />
              Take a quiz
            </Link>
            <Link to="/dashboard/past-papers" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300">
              <FileText className="h-4 w-4" />
              Past papers
            </Link>
            {weakTopicSubjects && (
              <Link to="/dashboard/planner" className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                <RefreshCcw className="h-4 w-4" />
                Retry weak topics
              </Link>
            )}
          </div>
        </section>

        {/* ── Insights ── */}
        {insights.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Insights</p>
            </div>
            <div className="mt-3 space-y-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-2xl border p-3 ${
                    insight.type === "warning"
                      ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
                      : insight.type === "success"
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <p className={`text-sm ${
                    insight.type === "warning" ? "text-amber-800 dark:text-amber-300"
                      : insight.type === "success" ? "text-emerald-800 dark:text-emerald-300"
                        : "text-slate-700 dark:text-slate-300"
                  }`}>
                    {insight.text}
                  </p>
                  {insight.action && (
                    <Link to={insight.action.to} className="ml-3 shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {insight.action.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Weekly Activity Chart ── */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">This week</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Study activity</h3>
            </div>
            <Link to="/dashboard/progress" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400">
              Full progress
            </Link>
          </div>
          <div className="mt-4 flex items-end gap-2">
            {weeklyActivity.map((day) => {
              const maxMin = Math.max(...weeklyActivity.map((d) => d.minutes), 1);
              const height = Math.max(4, (day.minutes / maxMin) * 80);
              return (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-slate-500">{day.minutes > 0 ? `${day.minutes}m` : ""}</span>
                  <div
                    className={`w-full rounded-lg transition-all ${
                      day.minutes > 0
                        ? "bg-emerald-400 dark:bg-emerald-500"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    style={{ height: `${height}px` }}
                  />
                  <span className="text-[10px] text-slate-500">{day.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Recent Learning ── */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Recent activity</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Learning log</h3>
            </div>
            <Link to="/dashboard/topics" className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400">
              All topics
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {recentLearning.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    item.status === "Mastered" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-400"
                      : item.status === "Completed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                  }`}>
                    {item.status}
                  </span>
                  {item.when && <p className="mt-0.5 text-[10px] text-slate-400">{item.when}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ═══════════════ RIGHT COLUMN ═══════════════ */}
      <div className="col-span-12 space-y-6 lg:col-span-4">

        {/* ── Stats Snapshot ── */}
        <div className="space-y-4">
          {/* Streak */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Flame className={`h-5 w-5 ${streak >= 3 ? "text-orange-500" : "text-slate-400"}`} />
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Study streak</p>
            </div>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{streak} day{streak !== 1 ? "s" : ""}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {streak >= 7 ? "Incredible consistency!" : streak >= 3 ? "Keep the chain alive!" : "Start a 3-day streak"}
            </p>
          </div>

          {/* Today's Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Today</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{todayStats.minutes} min</p>
            <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${todayStats.goalProgress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {todayStats.goalProgress >= 100 ? "Daily goal reached!" : `${todayStats.goal - todayStats.minutes} min to goal`}
            </p>
          </div>

          {/* Accuracy */}
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-slate-400" />
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Overall accuracy</p>
            </div>
            <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">
              {overallAccuracy !== null ? `${overallAccuracy}%` : "--"}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {overallAccuracy === null
                ? "Take a quiz to start tracking"
                : overallAccuracy >= 70 ? "On track for WASSCE" : "Focus on weak areas"}
            </p>
          </div>

          {/* Exam Countdown */}
          {daysToExam !== null && (
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Exam countdown</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-white">{daysToExam} days</p>
              <p className="text-xs text-slate-500">{examDate!.toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* ── Subject Overview ── */}
        {subjectSummaries.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Subjects</p>
            </div>
            <div className="mt-3 space-y-3">
              {subjectSummaries.map((s) => (
                <Link key={s.subject} to="/dashboard/topics" className="block rounded-2xl border border-slate-200 p-3 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.label}</p>
                    <span className={`text-sm font-semibold ${
                      s.accuracy >= 75 ? "text-emerald-600" : s.accuracy >= 50 ? "text-amber-600" : s.accuracy > 0 ? "text-rose-600" : "text-slate-400"
                    }`}>
                      {s.accuracy > 0 ? `${s.accuracy}%` : "--"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        s.accuracy >= 75 ? "bg-emerald-500" : s.accuracy >= 50 ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {s.masteredCount} mastered | {s.weakCount} weak | {s.untestedCount} untested
                    {s.dueCount > 0 && <span className="text-rose-600 dark:text-rose-400"> | {s.dueCount} due</span>}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Suggested Topics ── */}
        {suggestedTopics.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Suggested next</p>
            <div className="mt-3 space-y-2">
              {suggestedTopics.slice(0, 3).map((topic) => (
                <Link key={topic.title} to="/dashboard/planner" className="block rounded-2xl border border-slate-200 p-3 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{topic.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      topic.priority === "High"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400"
                        : topic.priority === "Medium"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400"
                          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}>
                      {topic.priority}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{topic.rationale}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Navigation Shortcuts ── */}
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Navigate</p>
          <div className="mt-3 grid gap-2">
            {[
              { label: "Planner", to: "/dashboard/planner", icon: CalendarDays },
              { label: "Past papers", to: "/dashboard/past-papers", icon: FileText },
              { label: "Tools", to: "/dashboard/tools", icon: Target },
              { label: "Topics", to: "/dashboard/topics", icon: BookOpen },
              { label: "Progress", to: "/dashboard/progress", icon: TrendingUp },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <item.icon className="h-4 w-4 text-slate-400" />
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
