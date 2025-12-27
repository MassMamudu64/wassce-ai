import { useMemo } from "react";
import StatsGrid from "../../dashboard/StatsGrid";
import WeaknessDetection from "../../dashboard/WeaknessDetection";
import { useLearningStore } from "../../stores/learningStore";
import type { LearningStat } from "../../utils/api";

const toISODate = (date: Date) => date.toISOString().split("T")[0];

const gradeFromScore = (score: number) => {
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  if (score >= 45) return "E";
  return "F";
};

export default function DashboardProgressPage() {
  const { studentProfile, studySessions, studyStats } = useLearningStore();

  const progressStats = useMemo<LearningStat[]>(() => {
    const today = toISODate(new Date());
    const last7Start = new Date();
    last7Start.setDate(last7Start.getDate() - 6);
    last7Start.setHours(0, 0, 0, 0);

    const sessionsLast7 = studySessions.filter((session) => new Date(session.date) >= last7Start);
    const completedLast7 = sessionsLast7.filter((session) => session.completed);

    const minutesLast7 = completedLast7.reduce((sum, session) => sum + session.durationMinutes, 0);
    const completedDays = new Set(completedLast7.map((session) => session.date)).size;

    const avgAccuracy =
      studyStats.length === 0 ? null : Math.round(studyStats.reduce((sum, stat) => sum + stat.accuracy, 0) / studyStats.length);

    const predictedGrade = avgAccuracy === null ? "--" : gradeFromScore(avgAccuracy);

    const todayMinutes = studySessions
      .filter((session) => session.date === today && session.completed)
      .reduce((sum, session) => sum + session.durationMinutes, 0);

    return [
      {
        label: "Readiness",
        value: avgAccuracy === null ? "--" : `${avgAccuracy}%`,
        trend: avgAccuracy === null ? "Complete a quiz to compute readiness" : `Predicted grade: ${predictedGrade}`,
        helper: avgAccuracy === null ? "Tools → Quizzes" : undefined,
      },
      {
        label: "Last 7 days",
        value: `${minutesLast7} min`,
        trend: `${completedDays} active day${completedDays === 1 ? "" : "s"}`,
        helper: minutesLast7 === 0 ? "Start with a 20-min block" : undefined,
      },
      {
        label: "Today",
        value: `${todayMinutes} min`,
        trend: studentProfile ? `${studentProfile.dailyStudyGoalMinutes} min goal` : "Set a daily goal",
      },
    ];
  }, [studentProfile, studySessions, studyStats]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Progress</p>
        <h1 className="text-2xl font-semibold text-white">Feedback & analytics</h1>
        <p className="mt-2 text-sm text-slate-400">This page uses real data from your quiz results and completed sessions.</p>
      </header>

      <StatsGrid stats={progressStats} />

      {studentProfile ? (
        <WeaknessDetection studyStats={studyStats} studySessions={studySessions} subjects={studentProfile.subjects} />
      ) : (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-300">
          Set up your profile to unlock subject-based weakness detection.
        </section>
      )}
    </div>
  );
}

