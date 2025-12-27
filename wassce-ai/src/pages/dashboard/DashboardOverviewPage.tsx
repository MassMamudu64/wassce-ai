import { Link } from "react-router-dom";
import { useMemo } from "react";
import DashboardHeader from "../../dashboard/DashboardHeader";
import StatsGrid from "../../dashboard/StatsGrid";
import TopicSpotlight from "../../dashboard/TopicSpotlight";
import SuggestedTopics from "../../dashboard/SuggestedTopics";
import RecentLearning from "../../dashboard/RecentLearning";
import WeaknessDetection from "../../dashboard/WeaknessDetection";
import StudentProfileSetup from "../../dashboard/StudentProfileSetup";
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
      title: `${next.subject}${next.topic ? ` • ${next.topic}` : ""}`,
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
        helper: avgAccuracy === null ? "Tools → Quizzes" : undefined,
      },
    ];
  }, [studentProfile, streakDays, studySessions, studyStats]);

  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <StudentProfileSetup />
        <section className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-xl font-semibold text-white">What happens next</h2>
          <p className="mt-2 text-sm text-slate-400">
            After setup, your dashboard shows today’s plan, recommended tools, and progress tracking.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/dashboard/tools/quizzes"
              className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20"
            >
              Try a quick quiz
            </Link>
            <Link
              to="/dashboard/past-papers"
              className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
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
        <DashboardHeader studentProfile={studentProfile} completionRate={completionRate} nextSession={nextSession} streakDays={streakDays} />
      </div>

      <div className="col-span-12 lg:col-span-8 space-y-6">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Daily actions</p>
              <h2 className="text-2xl font-semibold text-white">Start a study block</h2>
              <p className="text-sm text-slate-400">Jump into practice, then log it in the planner.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/tools/quizzes"
                className="rounded-xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/20"
              >
                Take a quiz
              </Link>
              <Link
                to="/dashboard/past-papers"
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
              >
                Past papers
              </Link>
              <Link
                to="/dashboard/planner"
                className="rounded-xl border border-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
              >
                Open planner
              </Link>
            </div>
          </div>
        </section>

        <TopicSpotlight topics={topics} />

        <div className="grid gap-6 lg:grid-cols-2">
          <SuggestedTopics suggestions={suggestedTopics} />
          <RecentLearning items={recentLearning} />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <StatsGrid stats={overviewStats} />
        <WeaknessDetection studyStats={studyStats} studySessions={studySessions} subjects={studentProfile.subjects} />
      </div>
    </div>
  );
}

