import { Link } from "react-router-dom";
import StudyPlanner from "../../dashboard/StudyPlanner";
import StudySession from "../../dashboard/StudySession";
import { useLearningStore } from "../../stores/learningStore";

export default function DashboardPlannerPage() {
  const { studentProfile, studySessions } = useLearningStore();

  if (!studentProfile) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 text-slate-200">
        <h1 className="text-2xl font-semibold text-white">Planner</h1>
        <p className="mt-2 text-sm text-slate-400">Set up your profile first to unlock planning and streak tracking.</p>
        <Link to="/dashboard/overview" className="mt-4 inline-flex text-emerald-200 hover:text-white">
          Go to setup →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Plan</p>
        <h1 className="text-2xl font-semibold text-white">Study planner</h1>
        <p className="mt-2 text-sm text-slate-400">Schedule focus blocks and mark them done for streak + progress tracking.</p>
        <div className="mt-6">
          <StudyPlanner />
        </div>
      </section>

      <StudySession sessions={studySessions} subjects={studentProfile.subjects} examDate={studentProfile.examDate} />
    </div>
  );
}

