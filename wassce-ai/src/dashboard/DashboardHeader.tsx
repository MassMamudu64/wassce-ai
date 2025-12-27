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
  const daysToExam = examDate ? Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-950 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Welcome back</p>
          <h1 className="text-3xl font-bold text-white">{studentProfile.name}</h1>
          <p className="text-sm text-slate-400">
            WASSCE {studentProfile.examYear} • {studentProfile.subjects.length} subjects • {studentProfile.dailyStudyGoalMinutes} min/day goal
          </p>
          {examDate && (
            <p className="text-xs text-emerald-300 mt-1">
              {daysToExam} days to exam • {examDate.toLocaleDateString()}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
              Streak: {streakDays} day{streakDays === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="text-center text-sm uppercase tracking-[0.4em] text-emerald-300">
          <p className="text-5xl font-semibold text-white">{completionRate}%</p>
          <p className="text-slate-400">completion rate</p>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Next session</p>
        <div className="mt-2 flex flex-col gap-1">
          <p className="text-lg font-semibold text-white">{nextSession.title}</p>
          <p className="text-sm text-slate-400">{nextSession.detail}</p>
          <p className="text-xs text-slate-500">{nextSession.duration} • {nextSession.mood}</p>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
