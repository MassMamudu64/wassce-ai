import { type SessionBlock } from "../utils/api";
import type { StudentProfile } from "../types/profile";

interface DashboardHeaderProps {
  studentProfile: StudentProfile;
  completionRate: number;
  nextSession: SessionBlock;
  streakDays: number;
}

const DashboardHeader = ({ studentProfile, completionRate, nextSession, streakDays }: DashboardHeaderProps) => {
  const examDate = studentProfile.examDate ? new Date(studentProfile.examDate) : null;
  const today = new Date();
  const daysToExam = examDate
    ? Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Welcome back</p>
          <h1 className="landing-display text-3xl font-semibold text-slate-900">{studentProfile.name}</h1>
          <p className="text-sm text-slate-600">
            WASSCE {studentProfile.examYear} | {studentProfile.subjects.length} subjects |{" "}
            {studentProfile.dailyStudyGoalMinutes} min/day goal
          </p>
          {examDate && (
            <p className="mt-1 text-xs text-emerald-700">
              {daysToExam} days to exam | {examDate.toLocaleDateString()}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-600">
              Streak: {streakDays} day{streakDays === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="text-center text-sm uppercase tracking-[0.4em] text-emerald-700">
          <p className="text-5xl font-semibold text-slate-900">{completionRate}%</p>
          <p className="text-slate-500">completion rate</p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Next session</p>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-lg font-semibold text-slate-900">{nextSession.title}</p>
          <p className="text-sm text-slate-600">{nextSession.detail}</p>
          <p className="text-xs text-slate-500">
            {nextSession.duration} | {nextSession.mood}
          </p>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
