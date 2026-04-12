import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PastQuestion, PaperMode } from "../../core/types/passPaper";
import { useUI } from "../../contexts/UIContext";

interface Props {
  question: PastQuestion;
  index: number;
  total: number;
  selectedAnswer: number | null;
  disabled: boolean;
  mode: PaperMode;
  showCorrectness: boolean;
  progressPercent: number;
  onSelect: (optionIndex: number) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function QuestionCard({
  question,
  index,
  total,
  selectedAnswer,
  disabled,
  mode,
  showCorrectness,
  progressPercent,
  onSelect,
}: Props) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  // In practice mode we show instant feedback after selecting
  const showPracticeFeedback = mode === "practice" && selectedAnswer != null;
  const shouldReveal = showCorrectness || showPracticeFeedback;

  const difficultyColor = useMemo(() => {
    switch (question.difficulty) {
      case "easy":
        return "bg-emerald-100 text-emerald-700";
      case "medium":
        return "bg-amber-100 text-amber-700";
      case "hard":
        return "bg-rose-100 text-rose-700";
    }
  }, [question.difficulty]);

  return (
    <div className="flex-1 space-y-5 px-5 py-6">
      {/* ---- Header row ---- */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Question {index + 1}{" "}
            <span className={`text-sm font-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              of {total}
            </span>
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${difficultyColor}`}>
              {question.difficulty}
            </span>
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              {question.topic}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="min-w-[200px] space-y-2">
          <div className={`flex items-center justify-between text-sm ${isDark ? "text-slate-400" : "text-slate-700"}`}>
            <span className="font-semibold">Progress</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className={`h-2 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`}>
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ---- Question body ---- */}
      <section className={`rounded-3xl border p-6 shadow-sm ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <p className={`text-xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          {question.question}
        </p>

        {/* Options */}
        <div className="mt-6 space-y-3">
          {question.options.map((option, optionIndex) => {
            const selected = selectedAnswer === optionIndex;
            const correct = question.correctIndex === optionIndex;

            // Visual states
            let borderClass = isDark ? "border-slate-700" : "border-slate-200";
            let bgClass = isDark ? "bg-slate-800" : "bg-white";
            let ringClass = "";

            if (selected && !shouldReveal) {
              borderClass = "border-blue-600";
              bgClass = isDark ? "bg-blue-950" : "bg-blue-50";
            }

            if (shouldReveal) {
              if (correct) {
                ringClass = "ring-2 ring-emerald-400";
                bgClass = isDark ? "bg-emerald-950" : "bg-emerald-50";
                borderClass = "border-emerald-400";
              } else if (selected && !correct) {
                ringClass = "ring-2 ring-rose-300";
                bgClass = isDark ? "bg-rose-950" : "bg-rose-50";
                borderClass = "border-rose-300";
              }
            }

            return (
              <button
                key={`${question.id}-opt-${optionIndex}`}
                type="button"
                disabled={disabled || (mode === "practice" && selectedAnswer != null)}
                onClick={() => onSelect(optionIndex)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${borderClass} ${bgClass} ${ringClass} ${
                  disabled || (mode === "practice" && selectedAnswer != null)
                    ? "cursor-default"
                    : isDark
                      ? "hover:border-slate-600"
                      : "hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                      selected && !shouldReveal
                        ? "border-blue-600 bg-blue-600 text-white"
                        : shouldReveal && correct
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : shouldReveal && selected
                            ? "border-rose-400 bg-rose-400 text-white"
                            : isDark
                              ? "border-slate-600 bg-slate-700 text-slate-300"
                              : "border-slate-300 bg-white text-slate-600"
                    }`}
                  >
                    {LETTERS[optionIndex] ?? "?"}
                  </span>
                  <span className={isDark ? "text-slate-200" : "text-slate-900"}>
                    {option}
                  </span>
                </div>

                {shouldReveal && correct && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {shouldReveal && selected && !correct && (
                  <XCircle className="h-5 w-5 text-rose-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation (practice mode: shown after answer; review: always shown) */}
        {shouldReveal && (
          <div className={`mt-5 rounded-2xl border p-4 text-sm ${isDark ? "border-slate-700 bg-slate-900 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Explanation</p>
            <p className="mt-1">{question.explanation}</p>
          </div>
        )}
      </section>
    </div>
  );
}
