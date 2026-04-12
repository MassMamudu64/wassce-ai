import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { InteractivePaper, PaperMode, WeakTopic } from "../../core/types/passPaper";
import { useUI } from "../../contexts/UIContext";
import { usePaperAttempt } from "./usePaperAttempt";
import PastPapersPage from "./PastPapersPage";
import QuestionCard from "./QuestionCard";
import PaperResult from "./PaperResult";
import { QuestionPalette, PaperFooter, PaletteOpener } from "./NavigationControls";

export interface SessionResult {
  score: number;
  accuracy: number;
  weakTopics: WeakTopic[];
}

interface PaperViewerProps {
  /** If provided, auto-starts with this paper (skips selection screen) */
  initialPaper?: InteractivePaper;
  /** Mode for the initial paper (defaults to "practice") */
  initialMode?: PaperMode;
  /** Called when a session started via initialPaper finishes */
  onSessionComplete?: (result: SessionResult) => void;
  /** Called when user exits. If not provided, resets to paper selection. */
  onExit?: () => void;
}

// Timer display helper
const formatTimer = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
};

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

export default function PaperViewer({
  initialPaper,
  initialMode,
  onSessionComplete,
  onExit,
}: PaperViewerProps = {}) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const attempt = usePaperAttempt();
  const [paletteOpen, setPaletteOpen] = useState(true);

  // Auto-start when launched from planner with an initial paper
  const autoStarted = useRef(false);
  useEffect(() => {
    if (initialPaper && !autoStarted.current) {
      autoStarted.current = true;
      attempt.start(initialPaper, initialMode ?? "practice");
      setPaletteOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent when session completes
  const reportedFinish = useRef(false);
  useEffect(() => {
    if (attempt.phase === "finished" && onSessionComplete && !reportedFinish.current) {
      reportedFinish.current = true;
      onSessionComplete({
        score: attempt.score,
        accuracy: attempt.accuracy,
        weakTopics: attempt.weakTopics,
      });
    }
    if (attempt.phase !== "finished") {
      reportedFinish.current = false;
    }
  }, [attempt.phase, attempt.score, attempt.accuracy, attempt.weakTopics, onSessionComplete]);

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else {
      attempt.reset();
    }
  }, [onExit, attempt]);

  const handleStart = useCallback(
    (paper: InteractivePaper, mode: PaperMode) => {
      attempt.start(paper, mode);
      setPaletteOpen(true);
    },
    [attempt],
  );

  const handleFinish = useCallback(() => {
    if (!window.confirm("Submit your paper? You can review answers after finishing.")) return;
    attempt.finish();
  }, [attempt]);

  // ---- Idle → show paper selection (only when not launched from planner) ----
  if (attempt.phase === "idle" || !attempt.paper) {
    if (initialPaper) return null; // will auto-start via useEffect
    return <PastPapersPage onStart={handleStart} />;
  }

  const { paper, currentIndex, answers, flaggedIds, mode, phase, timeLeftMs } = attempt;
  const questions = paper.questions;
  const activeQuestion = questions[currentIndex];
  const isFlagged = activeQuestion ? flaggedIds.has(activeQuestion.id) : false;

  // ---- Finished → show results, then allow review ----
  if (phase === "finished") {
    return (
      <div className="space-y-6">
        <PaperResult
          paper={paper}
          answers={answers}
          score={attempt.score}
          accuracy={attempt.accuracy}
          weakTopics={attempt.weakTopics}
          mode={mode}
          onRetryIncorrect={attempt.retryIncorrect}
          onReset={handleExit}
        />

        {/* Review section — browse through questions with answers revealed */}
        <section className={`rounded-3xl border ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
          <div className={`border-b px-5 py-4 ${isDark ? "border-slate-700" : "border-slate-200"}`}>
            <h3 className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              Review answers
            </h3>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Browse through your answers with explanations.
            </p>
          </div>

          <div className={`grid min-h-[400px] ${paletteOpen ? "grid-cols-1 lg:grid-cols-[16rem_1fr]" : "grid-cols-1"}`}>
            {paletteOpen && (
              <QuestionPalette
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                flaggedIds={flaggedIds}
                onJump={attempt.jumpTo}
                onCollapse={() => setPaletteOpen(false)}
              />
            )}

            <main className="flex flex-col">
              {!paletteOpen && <PaletteOpener onExpand={() => setPaletteOpen(true)} />}

              {activeQuestion && (
                <QuestionCard
                  question={activeQuestion}
                  index={currentIndex}
                  total={questions.length}
                  selectedAnswer={answers[activeQuestion.id] ?? null}
                  disabled
                  mode={mode}
                  showCorrectness
                  progressPercent={attempt.progressPercent}
                  onSelect={() => {}}
                />
              )}

              <PaperFooter
                disablePrev={currentIndex === 0}
                disableNext={currentIndex >= questions.length - 1}
                flagged={isFlagged}
                isFinished
                onPrev={attempt.prev}
                onNext={attempt.next}
                onToggleFlag={attempt.toggleFlag}
                onFinish={() => {}}
                showFinish={false}
              />
            </main>
          </div>
        </section>
      </div>
    );
  }

  // ---- Active → exam engine ----
  return (
    <div className={`overflow-hidden rounded-3xl border ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
      {/* ---- Header ---- */}
      <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Leave this paper? Your progress will be lost.")) {
                handleExit();
              }
            }}
            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit
          </button>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
              {subjectLabels[paper.subject] ?? paper.subject} {paper.year}
            </p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Paper {paper.paper} · {mode === "exam" ? "Exam mode" : "Practice mode"}
            </p>
          </div>
        </div>

        {/* Timer (exam mode only) */}
        {mode === "exam" && timeLeftMs != null && (
          <div
            className={`rounded-xl border px-4 py-2 text-sm font-mono font-semibold ${
              timeLeftMs < 300_000
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : isDark
                  ? "border-slate-700 bg-slate-800 text-slate-300"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {formatTimer(timeLeftMs)}
          </div>
        )}

        {/* Finish button */}
        <button
          type="button"
          onClick={handleFinish}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          Finish attempt
        </button>
      </header>

      {/* ---- Body ---- */}
      <div className={`grid min-h-[640px] ${paletteOpen ? "grid-cols-1 lg:grid-cols-[16rem_1fr]" : "grid-cols-1"}`}>
        {paletteOpen && (
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedIds={flaggedIds}
            onJump={attempt.jumpTo}
            onCollapse={() => setPaletteOpen(false)}
          />
        )}

        <main className="flex flex-col">
          {!paletteOpen && <PaletteOpener onExpand={() => setPaletteOpen(true)} />}

          {activeQuestion ? (
            <QuestionCard
              question={activeQuestion}
              index={currentIndex}
              total={questions.length}
              selectedAnswer={answers[activeQuestion.id] ?? null}
              disabled={false}
              mode={mode}
              showCorrectness={false}
              progressPercent={attempt.progressPercent}
              onSelect={attempt.setAnswer}
            />
          ) : (
            <div className="p-6 text-sm text-slate-500">No question loaded.</div>
          )}

          <PaperFooter
            disablePrev={currentIndex === 0}
            disableNext={currentIndex >= questions.length - 1}
            flagged={isFlagged}
            isFinished={false}
            onPrev={attempt.prev}
            onNext={attempt.next}
            onToggleFlag={attempt.toggleFlag}
            onFinish={handleFinish}
            showFinish
          />
        </main>
      </div>
    </div>
  );
}
