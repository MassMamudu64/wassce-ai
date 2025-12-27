import { PanelLeftOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { Subject } from "../../../types/domain";
import type { AnswerMap, QuizQuestion } from "./quizTypes";
import QuizFooter from "./QuizFooter";
import QuizHeader from "./QuizHeader";
import QuestionCard from "./QuestionCard";
import QuestionPalette from "./QuestionPalette";

interface QuizRunnerProps {
  subject: Subject;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: AnswerMap;
  flaggedIds: Set<string>;
  paletteCollapsed: boolean;
  timeLeftMs: number | null;
  progressPercent: number;
  isFinished: boolean;
  showReviewAnswers: boolean;
  score: number;
  accuracy: number;
  savedResult: boolean;
  onCollapsePalette: () => void;
  onExpandPalette: () => void;
  onJump: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleFlag: () => void;
  onSelectAnswer: (optionIndex: number) => void;
  onFinish: () => void;
  onReset: () => void;
  onToggleShowAnswers: (next: boolean) => void;
  hasApiKey: boolean;
  premium: boolean;
  studentId: string;
}

export default function QuizRunner({
  subject,
  questions,
  currentIndex,
  answers,
  flaggedIds,
  paletteCollapsed,
  timeLeftMs,
  progressPercent,
  isFinished,
  showReviewAnswers,
  score,
  accuracy,
  savedResult,
  onCollapsePalette,
  onExpandPalette,
  onJump,
  onPrev,
  onNext,
  onToggleFlag,
  onSelectAnswer,
  onFinish,
  onReset,
  onToggleShowAnswers,
  hasApiKey,
  premium,
  studentId,
}: QuizRunnerProps) {
  const activeQuestion = questions[currentIndex];
  const selectedAnswer = activeQuestion ? answers[activeQuestion.id] ?? null : null;
  const flagged = activeQuestion ? flaggedIds.has(activeQuestion.id) : false;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-slate-900">
      <QuizHeader
        subject={subject}
        timerMs={timeLeftMs}
        studentId={studentId}
        isFinished={isFinished}
        centerNode={
          isFinished ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Score: <span className="font-semibold text-slate-900">{score}</span> / {questions.length} ({accuracy}%)
              <span className="ml-3 text-xs text-slate-500">{savedResult ? "Saved to Progress" : "Saving…"}</span>
            </div>
          ) : undefined
        }
        rightAction={
          isFinished ? (
            <button
              type="button"
              onClick={onReset}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              New Attempt
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Finish Attempt
            </button>
          )
        }
      />

      <div className={`grid min-h-[640px] ${paletteCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[18rem_1fr]"}`}>
        {!paletteCollapsed ? (
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedIds={flaggedIds}
            onJump={onJump}
            onCollapse={onCollapsePalette}
          />
        ) : null}

        <main className="flex flex-col bg-slate-50">
          {paletteCollapsed ? (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
              <p className="text-sm font-semibold text-slate-900">Question Palette</p>
              <button
                type="button"
                onClick={onExpandPalette}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <PanelLeftOpen className="h-4 w-4" />
                Open
              </button>
            </div>
          ) : null}

          {activeQuestion ? (
            <>
              <QuestionCard
                subject={subject}
                index={currentIndex}
                total={questions.length}
                progressPercent={progressPercent}
                question={activeQuestion}
                selectedAnswer={selectedAnswer}
                disabled={isFinished}
                showCorrectness={isFinished && showReviewAnswers}
                onSelect={onSelectAnswer}
                hasApiKey={hasApiKey}
                premium={premium}
              />

              {isFinished ? (
                <div className="mx-5 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm">
                  <div className="text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {Object.values(answers).filter((v) => v !== null && v !== undefined).length}/{questions.length}
                    </span>{" "}
                    answered • <span className="font-semibold text-slate-900">{flaggedIds.size}</span> flagged •{" "}
                    <Link to="/dashboard/progress" className="font-semibold text-blue-700 hover:text-blue-800">
                      View progress
                    </Link>
                  </div>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={showReviewAnswers}
                      onChange={(event) => onToggleShowAnswers(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Show answers
                  </label>
                </div>
              ) : null}
            </>
          ) : (
            <div className="p-6 text-sm text-slate-700">No question loaded.</div>
          )}

          <QuizFooter
            disablePrev={currentIndex === 0}
            disableNext={currentIndex >= questions.length - 1}
            flagged={flagged}
            isFinished={isFinished}
            onPrev={onPrev}
            onNext={onNext}
            onToggleFlag={onToggleFlag}
          />
        </main>
      </div>
    </div>
  );
}
