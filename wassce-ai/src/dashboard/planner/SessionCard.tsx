import { BookOpen, CheckCircle2, Clock, Play } from "lucide-react";
import type { PlannerSession } from "../../core/types/passPaper";
import { useUI } from "../../contexts/UIContext";

const subjectLabels: Record<string, string> = {
  math: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  english: "English Language",
  integrated_science: "Integrated Science",
  economics: "Economics",
  government: "Government",
};

interface Props {
  session: PlannerSession;
  onStart: (session: PlannerSession) => void;
}

export default function SessionCard({ session, onStart }: Props) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const subjectLabel = subjectLabels[session.subject] ?? session.subject;
  const sourceLabel =
    session.year > 0 ? `${session.year} Paper ${session.paper}` : "Mixed years";

  if (session.completed) {
    return (
      <div
        className={`rounded-2xl border p-5 ${
          isDark
            ? "border-emerald-800 bg-emerald-950/40"
            : "border-emerald-200 bg-emerald-50/60"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark ? "bg-emerald-900 text-emerald-400" : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p
                className={`text-sm font-semibold ${
                  isDark ? "text-emerald-300" : "text-emerald-800"
                }`}
              >
                {subjectLabel} — {session.topic}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  isDark ? "text-emerald-500" : "text-emerald-600"
                }`}
              >
                Score: {session.score ?? 0}/{session.questionIds.length}
                {session.accuracy != null && ` (${session.accuracy}%)`}
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isDark
                ? "bg-emerald-900 text-emerald-300"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            Done
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        isDark
          ? "border-slate-700 bg-slate-800 hover:border-slate-600"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDark ? "bg-blue-950 text-blue-400" : "bg-blue-50 text-blue-600"
            }`}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {subjectLabel} — {session.topic}
            </p>
            <div
              className={`mt-1 flex flex-wrap items-center gap-3 text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {session.questionIds.length} questions
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {session.durationMinutes} min
              </span>
              <span>From: {sourceLabel}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onStart(session)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Play className="h-4 w-4" />
          Start
        </button>
      </div>
    </div>
  );
}
