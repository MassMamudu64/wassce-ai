import { Link } from "react-router-dom";
import PlannerPage from "../../dashboard/planner/PlannerPage";
import { useUI } from "../../contexts/UIContext";
import { useLearningStore } from "../../stores/learningStore";

export default function DashboardPlannerPage() {
  const { studentProfile } = useLearningStore();
  const { theme } = useUI();
  const isDark = theme === "dark";

  if (!studentProfile) {
    return (
      <div
        className={`rounded-3xl border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${
          isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border-slate-200 bg-white/80 text-slate-700"
        }`}
      >
        <h1 className={`text-2xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Planner
        </h1>
        <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Set up your profile first to unlock the adaptive study planner.
        </p>
        <Link
          to="/dashboard/overview"
          className={`mt-4 inline-flex text-sm font-semibold ${
            isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900"
          }`}
        >
          Go to setup
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header
        className={`rounded-3xl border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white/80"
        }`}
      >
        <p
          className={`text-xs uppercase tracking-[0.4em] ${
            isDark ? "text-slate-500" : "text-slate-500"
          }`}
        >
          Adaptive planner
        </p>
        <h1
          className={`text-2xl font-semibold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          Study planner
        </h1>
        <p
          className={`mt-2 text-sm ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Personalized sessions built from real WASSCE past questions. Complete
          sessions to update your progress — the planner adapts to your weak
          topics.
        </p>
      </header>

      <section
        className={`rounded-3xl border p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] ${
          isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white/80"
        }`}
      >
        <PlannerPage />
      </section>
    </div>
  );
}
