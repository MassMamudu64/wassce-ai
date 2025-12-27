import { PanelLeftClose } from "lucide-react";
import type { AnswerMap, QuizQuestion } from "./quizTypes";

interface QuestionPaletteProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: AnswerMap;
  flaggedIds: Set<string>;
  onJump: (index: number) => void;
  onCollapse: () => void;
}

const paletteButtonClass = (
  q: QuizQuestion,
  index: number,
  currentIndex: number,
  answers: AnswerMap,
  flaggedIds: Set<string>,
) => {
  const isCurrent = index === currentIndex;
  const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
  const isFlagged = flaggedIds.has(q.id);
  if (isCurrent) return "border-blue-500 bg-blue-50 text-blue-700";
  if (isFlagged) return "border-amber-300 bg-amber-50 text-amber-800";
  if (isAnswered) return "border-blue-600 bg-blue-600 text-white";
  return "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
};

export default function QuestionPalette({ questions, currentIndex, answers, flaggedIds, onJump, onCollapse }: QuestionPaletteProps) {
  return (
    <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Question Palette</p>
          <p className="text-xs text-slate-500">{questions.length} Questions</p>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <PanelLeftClose className="h-4 w-4" />
          Collapse
        </button>
      </div>

      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-slate-300 bg-white" />
            Not answered
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Flagged
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-blue-600 bg-white" />
            Current
          </div>
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">Section A: Objectives</p>

        <div className="mt-4 grid grid-cols-5 gap-3">
          {questions.map((q, index) => (
            <button
              key={q.id}
              type="button"
              onClick={() => onJump(index)}
              aria-current={index === currentIndex}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${paletteButtonClass(
                q,
                index,
                currentIndex,
                answers,
                flaggedIds,
              )}`}
            >
              {index + 1}
              {flaggedIds.has(q.id) ? (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-white bg-amber-400" />
              ) : null}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onCollapse}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          Collapse Sidebar
        </button>
      </div>
    </aside>
  );
}

