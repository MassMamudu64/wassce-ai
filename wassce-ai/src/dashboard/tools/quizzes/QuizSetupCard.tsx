import { Link } from "react-router-dom";
import type { Subject } from "../../../types/domain";
import { quizSubjects } from "./quizData";
import { formatSubjectLabel } from "./quizTypes";

interface QuizSetupCardProps {
  selectedSubject: Subject;
  onSelectedSubject: (subject: Subject) => void;
  onLaunch: () => void;
  hasApiKey: boolean;
  generationError: string | null;
  disabled?: boolean;
}

export default function QuizSetupCard({
  selectedSubject,
  onSelectedSubject,
  onLaunch,
  hasApiKey,
  generationError,
  disabled,
}: QuizSetupCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
      <p className="text-sm text-slate-200">Launch subject-based quizzes and save the result to Progress automatically.</p>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Subject</p>
        <select
          value={selectedSubject}
          onChange={(event) => onSelectedSubject(event.target.value as Subject)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
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
        className="rounded-full border border-indigo-400 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200 transition hover:bg-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Launch quiz
      </button>

      {!hasApiKey && (
        <Link to="/dashboard/settings" className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:text-white">
          Add OpenAI key to enable AI quizzes →
        </Link>
      )}

      {generationError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">{generationError}</div>
      )}
    </div>
  );
}

