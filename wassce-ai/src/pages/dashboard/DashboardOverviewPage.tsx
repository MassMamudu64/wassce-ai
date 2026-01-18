import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import DashboardHeader from "../../dashboard/DashboardHeader";
import StatsGrid from "../../dashboard/StatsGrid";
import TopicSpotlight from "../../dashboard/TopicSpotlight";
import SuggestedTopics from "../../dashboard/SuggestedTopics";
import RecentLearning from "../../dashboard/RecentLearning";
import WeaknessDetection from "../../dashboard/WeaknessDetection";
import StudentProfileSetup from "../../dashboard/StudentProfileSetup";
import ToolsCarousel from "../../dashboard/ToolsCarousel";
import { useLearning } from "../../contexts/LearningContext";
import { useLearningStore } from "../../stores/learningStore";
import type { LearningStat, SessionBlock } from "../../utils/api";

const toISODate = (date: Date) => date.toISOString().split("T")[0];

const getStudyStreak = (completedDates: Set<string>) => {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (completedDates.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export default function DashboardOverviewPage() {
  const { topics, suggestedTopics, recentLearning, completionRate } = useLearning();
  const { studentProfile, studySessions, studyStats } = useLearningStore();
  const [showInsights, setShowInsights] = useState(false);

  const completedDates = useMemo(() => {
    const dates = new Set<string>();
    studySessions.forEach((session) => {
      if (session.completed) {
        dates.add(session.date);
      }
    });
    return dates;
  }, [studySessions]);

  const streakDays = useMemo(() => getStudyStreak(completedDates), [completedDates]);

  const nextSession = useMemo<SessionBlock>(() => {
    if (!studentProfile) {
      return {
        title: "Set up your profile",
        duration: "--",
        detail: "Pick subjects and exam date to generate a daily plan",
        mood: "Setup",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = studySessions
      .filter((session) => !session.completed)
      .map((session) => {
        const date = new Date(session.date);
        date.setHours(0, 0, 0, 0);
        return { session, date };
      })
      .filter(({ date }) => date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const next = upcoming[0]?.session;
    if (!next) {
      return {
        title: "No sessions scheduled",
        duration: "--",
        detail: "Open the planner to schedule your next focus block",
        mood: "Plan",
      };
    }

    return {
      title: `${next.subject}${next.topic ? ` | ${next.topic}` : ""}`,
      duration: `${next.durationMinutes} min`,
      detail: next.notes || "Planned study session",
      mood: next.missed ? "Catch up" : "Ready",
    };
  }, [studentProfile, studySessions]);

  const overviewStats = useMemo<LearningStat[]>(() => {
    const today = toISODate(new Date());
    const todayCompleted = studySessions.filter((session) => session.date === today && session.completed);
    const todayMinutes = todayCompleted.reduce((sum, session) => sum + session.durationMinutes, 0);

    const avgAccuracy =
      studyStats.length === 0 ? null : Math.round(studyStats.reduce((sum, stat) => sum + stat.accuracy, 0) / studyStats.length);

    return [
      {
        label: "Study streak",
        value: `${streakDays} days`,
        trend: streakDays >= 3 ? "Keep the chain alive" : "Start a 3-day streak",
        helper: streakDays === 0 ? "Complete one session today" : undefined,
      },
      {
        label: "Today",
        value: `${todayMinutes} min`,
        trend: studentProfile ? `${studentProfile.dailyStudyGoalMinutes} min goal` : "Set a daily goal",
        helper: studentProfile && todayMinutes >= studentProfile.dailyStudyGoalMinutes ? "Goal hit" : undefined,
      },
      {
        label: "Quiz accuracy",
        value: avgAccuracy === null ? "--" : `${avgAccuracy}%`,
        trend: avgAccuracy === null ? "Take a quiz to start tracking" : avgAccuracy >= 70 ? "On track" : "Needs focus",
        helper: avgAccuracy === null ? "Tools -> Quizzes" : undefined,
      },
    ];
  }, [studentProfile, streakDays, studySessions, studyStats]);

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <StudentProfileSetup />
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-semibold text-slate-900">What happens next</h2>
          <p className="mt-2 text-sm text-slate-600">
            After setup, your dashboard shows today's plan, recommended tools, and progress tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/dashboard/tools/quizzes"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Try a quick quiz
            </Link>
            <Link
              to="/dashboard/past-papers"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Browse past papers
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <DashboardHeader
          studentProfile={studentProfile}
          completionRate={completionRate}
          nextSession={nextSession}
          streakDays={streakDays}
        />
      </div>

      <div className="col-span-12 space-y-6 lg:col-span-8">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Today</p>
              <h2 className="text-2xl font-semibold text-slate-900">One focused block</h2>
              <p className="mt-1 text-sm text-slate-600">
                Start with a quiz or a past paper set, then log the session so your plan stays accurate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard/tools/quizzes" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Take a quiz
              </Link>
              <Link
                to="/dashboard/past-papers"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                Past papers
              </Link>
              <Link
                to="/dashboard/planner"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                Planner
              </Link>
            </div>
          </div>
        </section>

        <ToolsCarousel
          title="Open a tool and start practicing"
          subtitle="Swipe through the essentials. Everything else lives on the Tools page."
          viewAllTo="/dashboard/tools"
          cards={[
            {
              id: "quizzes",
              title: "Quizzes",
              eyebrow: "Practice test",
              description: "Generate subject quizzes and get instant feedback with explanations.",
              to: "/dashboard/tools/quizzes",
              tone: "emerald",
            },
            {
              id: "flashcards",
              title: "Flashcards",
              eyebrow: "Active recall",
              description: "Generate WASSCE-style flashcards from a prompt and drill weak areas.",
              to: "/dashboard/tools/flashcards",
              tone: "indigo",
            },
            {
              id: "aichat",
              title: "AI Chat",
              eyebrow: "Tutor",
              description: "Ask questions, request step-by-step solutions, and refine your understanding.",
              to: "/dashboard/tools/aichat",
              tone: "slate",
            },
            {
              id: "notes",
              title: "Notes",
              eyebrow: "Capture",
              description: "Write quick notes during study sessions and keep key formulas handy.",
              to: "/dashboard/tools/notes",
              tone: "amber",
            },
          ]}
        />

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Activity</p>
              <h3 className="text-xl font-semibold text-slate-900">Keep it light</h3>
              <p className="mt-1 text-sm text-slate-600">A quick snapshot. Use "View all" when you are ready.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/topics"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300"
              >
                View all topics
              </Link>
              <Link
                to="/dashboard/progress"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300"
              >
                View progress
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <SuggestedTopics suggestions={suggestedTopics} maxItems={2} variant="compact" />
            <RecentLearning items={recentLearning} maxItems={2} variant="compact" />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Insights</p>
              <h3 className="text-xl font-semibold text-slate-900">Go deeper when you want</h3>
              <p className="mt-1 text-sm text-slate-600">
                Topic spotlight and weakness detection are available, but hidden by default to keep this page focused.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowInsights((prev) => !prev)}
              aria-expanded={showInsights}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:border-slate-300"
            >
              {showInsights ? "Hide insights" : "Show insights"}
            </button>
          </div>

          {showInsights ? (
            <div className="mt-6 space-y-6">
              <TopicSpotlight topics={topics} />
              <WeaknessDetection studyStats={studyStats} studySessions={studySessions} subjects={studentProfile.subjects} />
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Tip: If you feel stuck, open insights to see where to focus next and what to review this week.
            </div>
          )}
        </section>
      </div>

      <div className="col-span-12 space-y-6 lg:col-span-4">
        <StatsGrid stats={overviewStats} layout="stacked" />

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Shortcuts</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">View full pages</h3>
          <p className="mt-1 text-sm text-slate-600">When you want the full detail, jump straight in.</p>
          <div className="mt-4 grid gap-2">
            {[
              { label: "Planner", to: "/dashboard/planner" },
              { label: "Past papers", to: "/dashboard/past-papers" },
              { label: "Tools", to: "/dashboard/tools" },
              { label: "Topics", to: "/dashboard/topics" },
              { label: "Progress", to: "/dashboard/progress" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
