import { Flag, FlagOff } from "lucide-react";

interface QuizFooterProps {
  disablePrev: boolean;
  disableNext: boolean;
  flagged: boolean;
  isFinished: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
}

export default function QuizFooter({ disablePrev, disableNext, flagged, isFinished, onPrev, onNext, onToggleFlag }: QuizFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-white px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={disablePrev}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {isFinished ? null : (
            <button
              type="button"
              onClick={onToggleFlag}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                flagged ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {flagged ? <FlagOff className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
              {flagged ? "Unflag" : "Flag"}
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={disableNext}
            className="rounded-xl border border-blue-600 bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next question
          </button>
        </div>
      </div>
    </footer>
  );
}
