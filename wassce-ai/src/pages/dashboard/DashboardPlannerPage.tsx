import { Link } from "react-router-dom";
import StudyPlanner from "../../dashboard/StudyPlanner";
import StudySession from "../../dashboard/StudySession";
import { useLearningStore } from "../../stores/learningStore";

export default function DashboardPlannerPage() {
  const { studentProfile, studySessions } = useLearningStore();

  if (!studentProfile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-slate-700 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <h1 className="text-2xl font-semibold text-slate-900">Planner</h1>
        <p className="mt-2 text-sm text-slate-600">Set up your profile first to unlock planning and streak tracking.</p>
        <Link to="/dashboard/overview" className="mt-4 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900">
          Go to setup
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Plan</p>
        <h1 className="text-2xl font-semibold text-slate-900">Study planner</h1>
        <p className="mt-2 text-sm text-slate-600">Schedule focus blocks and mark them done for streak and progress tracking.</p>
        <div className="mt-6">
          <StudyPlanner />
        </div>
      </section>

      <StudySession sessions={studySessions} subjects={studentProfile.subjects} examDate={studentProfile.examDate} />
    </div>
  );
}
