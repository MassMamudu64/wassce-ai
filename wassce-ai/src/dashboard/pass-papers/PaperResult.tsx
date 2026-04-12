import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, RefreshCcw, RotateCcw, TrendingUp } from "lucide-react";
import type { InteractivePaper, WeakTopic, PaperMode } from "../../core/types/passPaper";
import type { AnswerMap } from "./usePaperAttempt";
import { useUI } from "../../contexts/UIContext";

interface Props {
  paper: InteractivePaper;
  answers: AnswerMap;
  score: number;
  accuracy: number;
  weakTopics: WeakTopic[];
  mode: PaperMode;
  onRetryIncorrect: () => void;
  onReset: () => void;
}

export default function PaperResult({
  paper,
  answers,
  score,
  accuracy,
  weakTopics,
  mode,
  onRetryIncorrect,
  onReset,
}: Props) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const total = paper.questions.length;
  const incorrectCount = total - score;
  const unanswered = paper.questions.filter((q) => answers[q.id] == null).length;

  // Grade band
  const gradeBand =
    accuracy >= 80 ? "Excellent" : accuracy >= 60 ? "Good" : accuracy >= 40 ? "Fair" : "Needs work";
  const gradeColor =
    accuracy >= 80
      ? "text-emerald-600"
      : accuracy >= 60
        ? "text-blue-600"
        : accuracy >= 40
          ? "text-amber-600"
          : "text-rose-600";

  return (
    <div className="space-y-6 px-1 py-2">
      {/* ---- Score card ---- */}
      <section className={`rounded-3xl border p-6 text-center ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <p className={`text-xs font-semibold uppercase tracking-[0.3em] ${isDark ? "text-slate-500" : "text-slate-500"}`}>
          {mode === "exam" ? "Exam" : "Practice"} complete
        </p>
        <h2 className={`mt-2 text-5xl font-bold ${gradeColor}`}>
          {score} / {total}
        </h2>
        <p className={`mt-1 text-lg font-semibold ${gradeColor}`}>
          {accuracy}% — {gradeBand}
        </p>

        {/* Mini stats row */}
        <div className={`mx-auto mt-6 flex max-w-md justify-around rounded-2xl border px-4 py-3 text-sm ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <div>
            <p className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>{score}</p>
            <p className={isDark ? "text-slate-500" : "text-slate-500"}>Correct</p>
          </div>
          <div className={`border-l ${isDark ? "border-slate-700" : "border-slate-200"}`} />
          <div>
            <p className={`font-semibold ${isDark ? "text-rose-400" : "text-rose-600"}`}>{incorrectCount}</p>
            <p className={isDark ? "text-slate-500" : "text-slate-500"}>Incorrect</p>
          </div>
          <div className={`border-l ${isDark ? "border-slate-700" : "border-slate-200"}`} />
          <div>
            <p className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>{unanswered}</p>
            <p className={isDark ? "text-slate-500" : "text-slate-500"}>Skipped</p>
          </div>
        </div>
      </section>

      {/* ---- Weak topics ---- */}
      {weakTopics.length > 0 && (
        <section className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Weak topics detected
            </h3>
          </div>
          <p className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            Topics below 60% accuracy need more study.
          </p>
          <div className="mt-3 space-y-2">
            {weakTopics.map((wt) => (
              <div
                key={wt.topic}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}
              >
                <div>
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{wt.topic}</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {wt.attempts} question{wt.attempts > 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    wt.accuracy === 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {wt.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Strong topics ---- */}
      {(() => {
        const strongTopics = paper.questions.reduce<Record<string, { c: number; t: number }>>((acc, q) => {
          const e = acc[q.topic] ?? { c: 0, t: 0 };
          e.t += 1;
          if (answers[q.id] === q.correctIndex) e.c += 1;
          acc[q.topic] = e;
          return acc;
        }, {});

        const strong = Object.entries(strongTopics)
          .map(([topic, data]) => ({ topic, accuracy: Math.round((data.c / data.t) * 100) }))
          .filter((t) => t.accuracy >= 80)
          .sort((a, b) => b.accuracy - a.accuracy);

        if (strong.length === 0) return null;
        return (
          <section className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                Strong topics
              </h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {strong.map((s) => (
                <span
                  key={s.topic}
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {s.topic} ({s.accuracy}%)
                </span>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ---- Suggested actions ---- */}
      <section className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          What to do next
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {incorrectCount > 0 && (
            <button
              type="button"
              onClick={onRetryIncorrect}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <RotateCcw className="h-5 w-5 text-amber-500" />
              <div>
                <p>Retry incorrect</p>
                <p className={`text-xs font-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  {incorrectCount} question{incorrectCount > 1 ? "s" : ""} to redo
                </p>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <RefreshCcw className="h-5 w-5 text-blue-500" />
            <div>
              <p>Try another paper</p>
              <p className={`text-xs font-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Go back to paper selection
              </p>
            </div>
          </button>

          <Link
            to="/dashboard/tools/quizzes"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div>
              <p>Take a quiz</p>
              <p className={`text-xs font-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                Generate a quiz from weak topics
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard/progress"
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <div>
              <p>View progress</p>
              <p className={`text-xs font-normal ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                See how your stats have updated
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
