import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Subject } from "../../../types/domain";
import { generateQuizHint } from "../../../utils/quizHints";
import { formatSubjectLabel } from "./quizTypes";
import type { QuizQuestion } from "./quizTypes";

interface QuestionCardProps {
  subject: Subject;
  index: number;
  total: number;
  progressPercent: number;
  question: QuizQuestion;
  selectedAnswer: number | null;
  disabled: boolean;
  showCorrectness: boolean;
  onSelect: (optionIndex: number) => void;
  hasApiKey: boolean;
  premium: boolean;
}

export default function QuestionCard({
  subject,
  index,
  total,
  progressPercent,
  question,
  selectedAnswer,
  disabled,
  showCorrectness,
  onSelect,
  hasApiKey,
  premium,
}: QuestionCardProps) {
  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const letters = useMemo(() => ["A", "B", "C", "D"], []);

  const handleHint = async () => {
    if (!premium) {
      setHintError("Unlock Premium to generate AI hints.");
      return;
    }
    if (!hasApiKey) {
      setHintError("Add your OpenAI API key in Settings to generate AI hints.");
      return;
    }
    setHintError(null);
    setHintLoading(true);
    try {
      const content = await generateQuizHint(subject, question.question, question.options);
      setHint(content);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to generate hint.";
      setHintError(message);
    } finally {
      setHintLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-5 px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            Question {index + 1} <span className="text-sm font-normal text-slate-500">({total})</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600">Select the best answer from the options below.</p>
        </div>

        <div className="min-w-[240px] space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-700">
            <span className="font-semibold">Progress</span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xl font-semibold text-slate-900">{question.question}</p>

        <div className="mt-6 space-y-4" data-testid="quiz-options">
          {question.options.map((option, optionIndex) => {
            const selected = selectedAnswer === optionIndex;
            const correct = question.correctIndex === optionIndex;
            const correctnessClass = showCorrectness
              ? correct
                ? "ring-2 ring-emerald-400"
                : selected
                  ? "ring-2 ring-rose-300"
                  : ""
              : "";
            const borderClass = selected ? "border-blue-600" : "border-slate-200";
            const bgClass = selected ? "bg-blue-50" : "bg-white";

            return (
              <button
                key={`${question.id}-${option}`}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(optionIndex)}
                data-testid={`quiz-option-${optionIndex}`}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${borderClass} ${bgClass} ${correctnessClass} ${
                  disabled ? "cursor-default" : "hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                      selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-600"
                    }`}
                    aria-hidden="true"
                  >
                    {letters[optionIndex] ?? "?"}
                  </span>
                  <span className="text-base text-slate-900">{option}</span>
                </div>
                <span
                  className={`h-5 w-5 rounded-full border ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        {showCorrectness ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Explanation</p>
            <p className="mt-1">{question.explanation}</p>
          </div>
        ) : null}
      </section>

      <details className="rounded-2xl border border-slate-200 bg-blue-50/60 px-5 py-4">
        <summary className="cursor-pointer list-none">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Need a hint?</p>
              <p className="text-sm text-slate-600">Generate a subtle clue (no final answer).</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Open</span>
          </div>
        </summary>
        <div className="mt-4 space-y-3">
          {hint ? (
            <p className="text-sm text-slate-800">{hint}</p>
          ) : (
            <p className="text-sm text-slate-700">Tip: eliminate two options first, then check keywords in the stem.</p>
          )}
          {hintError ? <p className="text-sm text-rose-700">{hintError}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleHint}
              disabled={hintLoading || !hasApiKey || !premium}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {hintLoading ? "Generating hint..." : "Generate AI hint"}
            </button>
            {!premium ? (
              <Link
                to="/dashboard/billing"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Unlock Premium
              </Link>
            ) : null}
            <Link
              to="/dashboard/tools/aichat"
              state={{
                prefill: `I'm answering a ${formatSubjectLabel(subject)} multiple-choice question. Give a subtle hint (no final answer).\n\nQuestion: ${question.question}\nOptions: ${question.options.join(", ")}`,
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ask AI tutor
            </Link>
          </div>
        </div>
      </details>
    </div>
  );
}
