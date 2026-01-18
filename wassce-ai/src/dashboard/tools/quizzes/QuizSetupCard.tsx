import { Link } from "react-router-dom";
import type { Subject } from "../../../types/domain";
import { quizSubjects } from "./quizData";
import { formatSubjectLabel } from "./quizTypes";

interface QuizSetupCardProps {
  selectedSubject: Subject;
  onSelectedSubject: (subject: Subject) => void;
  onLaunch: () => void;
  hasApiKey: boolean;
  premium: boolean;
  generationError: string | null;
  disabled?: boolean;
}

export default function QuizSetupCard({
  selectedSubject,
  onSelectedSubject,
  onLaunch,
  hasApiKey,
  premium,
  generationError,
  disabled,
}: QuizSetupCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <p className="text-sm text-slate-600">
        Launch subject-based quizzes and save the result to Progress automatically.
      </p>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Subject</p>
        <select
          value={selectedSubject}
          onChange={(event) => onSelectedSubject(event.target.value as Subject)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        >
          {quizSubjects.map((subject) => (
            <option key={subject} value={subject}>
              {formatSubjectLabel(subject)}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onLaunch}
        disabled={disabled}
        className="rounded-full bg-slate-900 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Launch quiz
      </button>

      {!hasApiKey && (
        <Link to="/dashboard/settings" className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-slate-600 hover:text-slate-900">
          Add OpenAI key to enable AI quizzes
        </Link>
      )}
      {hasApiKey && !premium && (
        <Link to="/dashboard/billing" className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-amber-700 hover:text-amber-900">
          Unlock Premium to generate AI quizzes
        </Link>
      )}

      {generationError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{generationError}</div>
      )}
    </div>
  );
}
