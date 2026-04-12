import { ChevronLeft, ChevronRight, Flag, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { PastQuestion } from "../../core/types/passPaper";
import type { AnswerMap } from "./usePaperAttempt";
import { useUI } from "../../contexts/UIContext";

// ---------------------------------------------------------------------------
// Question Palette (sidebar)
// ---------------------------------------------------------------------------

interface PaletteProps {
  questions: PastQuestion[];
  currentIndex: number;
  answers: AnswerMap;
  flaggedIds: Set<string>;
  onJump: (index: number) => void;
  onCollapse: () => void;
}

export function QuestionPalette({
  questions,
  currentIndex,
  answers,
  flaggedIds,
  onJump,
  onCollapse,
}: PaletteProps) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <aside
      className={`flex flex-col border-r ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
    >
      <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Questions
        </p>
        <button
          type="button"
          onClick={onCollapse}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
            isDark
              ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
          Hide
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, i) => {
            const answered = answers[q.id] != null;
            const flagged = flaggedIds.has(q.id);
            const isCurrent = i === currentIndex;

            let bgClass = isDark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-600";
            if (answered) bgClass = isDark ? "bg-emerald-900 text-emerald-300" : "bg-emerald-100 text-emerald-700";
            if (isCurrent) bgClass = "bg-blue-600 text-white";

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => onJump(i)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition ${bgClass} hover:opacity-80`}
              >
                {i + 1}
                {flagged && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={`border-t px-4 py-3 text-xs ${isDark ? "border-slate-700 text-slate-500" : "border-slate-200 text-slate-500"}`}>
        <div className="flex flex-wrap gap-3">
          <span className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${isDark ? "bg-emerald-900" : "bg-emerald-100"}`} /> Answered
          </span>
          <span className="flex items-center gap-1">
            <span className={`inline-block h-3 w-3 rounded ${isDark ? "bg-slate-800" : "bg-slate-100"}`} /> Unanswered
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Flagged
          </span>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Footer Controls (prev / flag / next / finish)
// ---------------------------------------------------------------------------

interface FooterProps {
  disablePrev: boolean;
  disableNext: boolean;
  flagged: boolean;
  isFinished: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onFinish: () => void;
  showFinish: boolean;
}

export function PaperFooter({
  disablePrev,
  disableNext,
  flagged,
  isFinished,
  onPrev,
  onNext,
  onToggleFlag,
  onFinish,
  showFinish,
}: FooterProps) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <footer
      className={`mt-auto flex items-center justify-between gap-3 border-t px-5 py-4 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}
    >
      <button
        type="button"
        disabled={disablePrev}
        onClick={onPrev}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-3">
        {!isFinished && (
          <button
            type="button"
            onClick={onToggleFlag}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              flagged
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : isDark
                  ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Flag className="h-4 w-4" />
            {flagged ? "Flagged" : "Flag"}
          </button>
        )}

        {showFinish && !isFinished && (
          <button
            type="button"
            onClick={onFinish}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Finish attempt
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={disableNext}
        onClick={onNext}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Collapsed palette opener
// ---------------------------------------------------------------------------

interface OpenerProps {
  onExpand: () => void;
}

export function PaletteOpener({ onExpand }: OpenerProps) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center justify-between gap-3 border-b px-5 py-3 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
        Question palette
      </p>
      <button
        type="button"
        onClick={onExpand}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
          isDark
            ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        <PanelLeftOpen className="h-4 w-4" />
        Open
      </button>
    </div>
  );
}
