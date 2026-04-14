import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { InteractivePaper, PaperMode, PastQuestion, WeakTopic } from "../../core/types/passPaper";
import type { TopicSessionResult } from "../../core/types/learning";
import { getSessionProgress } from "../../core/sessionEngine";
import { useUI } from "../../contexts/UIContext";
import { useLearningStore } from "../../stores/learningStore";
import { subjectLabel } from "../../utils/subjects";
import { usePaperAttempt } from "./usePaperAttempt";
import PastPapersPage from "./PastPapersPage";
import QuestionCard from "./QuestionCard";
import PaperResult from "./PaperResult";
import { PaperFooter, PaletteOpener, QuestionPalette } from "./NavigationControls";

export interface SessionResult {
  score: number;
  accuracy: number;
  weakTopics: WeakTopic[];
  topicResults: TopicSessionResult[];
}

interface PaperViewerProps {
  initialPaper?: InteractivePaper;
  initialMode?: PaperMode;
  questions?: PastQuestion[];
  sessionId?: string;
  sessionTitle?: string;
  sessionSubject?: string;
  sessionTopic?: string;
  sessionDurationMinutes?: number;
  onSessionComplete?: (result: SessionResult) => void;
  onExit?: () => void;
}

const formatTimer = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
};

function toWeakTopics(topicResults: TopicSessionResult[]): WeakTopic[] {
  return topicResults
    .filter((topic) => topic.accuracy < 0.6)
    .sort((left, right) => left.accuracy - right.accuracy)
    .map((topic) => ({
      topic: topic.topic,
      subject: topic.subject,
      accuracy: Math.round(topic.accuracy * 100),
      attempts: topic.total,
      questionIds: [],
    }));
}

export default function PaperViewer({
  initialPaper,
  initialMode,
  questions,
  sessionId,
  sessionTitle,
  sessionSubject,
  sessionTopic,
  sessionDurationMinutes,
  onSessionComplete,
  onExit,
}: PaperViewerProps = {}) {
  const { theme } = useUI();
  const isDark = theme === "dark";
  const attempt = usePaperAttempt();
  const [paletteOpen, setPaletteOpen] = useState(true);

  const activeSession = useLearningStore((state) => state.activeSession);
  const startPlannerSession = useLearningStore((state) => state.startPlannerSession);
  const pauseActiveSession = useLearningStore((state) => state.pauseActiveSession);
  const recordActiveQuestionTime = useLearningStore((state) => state.recordActiveQuestionTime);
  const submitActiveAnswer = useLearningStore((state) => state.submitActiveAnswer);
  const goToActiveQuestion = useLearningStore((state) => state.goToActiveQuestion);
  const completeActiveSession = useLearningStore((state) => state.completeActiveSession);

  const injectedPaper = useMemo<InteractivePaper | null>(() => {
    if (!questions || !sessionId || !sessionSubject) return null;

    return {
      id: sessionId,
      subject: sessionSubject,
      year: 0,
      paper: 0,
      title: sessionTitle ?? `${subjectLabel(sessionSubject)} - ${sessionTopic ?? "Focused review"}`,
      durationMinutes:
        sessionDurationMinutes ?? Math.max(15, Math.ceil(questions.length * 1.5)),
      questions,
    };
  }, [questions, sessionDurationMinutes, sessionId, sessionSubject, sessionTitle, sessionTopic]);

  const questionEnteredAt = useRef(0);

  const flushPlannerTime = useCallback(() => {
    if (!activeSession || !injectedPaper) return;
    const activeQuestion = injectedPaper.questions[activeSession.currentIndex];
    if (!activeQuestion) return;

    const elapsed = Date.now() - questionEnteredAt.current;
    if (elapsed > 0) {
      recordActiveQuestionTime(activeQuestion.id, elapsed);
    }
    questionEnteredAt.current = Date.now();
  }, [activeSession, injectedPaper, recordActiveQuestionTime]);

  useEffect(() => {
    if (!injectedPaper || !sessionId) return;
    startPlannerSession(sessionId);
    questionEnteredAt.current = Date.now();
  }, [injectedPaper, sessionId, startPlannerSession]);

  useEffect(() => {
    if (!injectedPaper || !sessionId) return undefined;

    return () => {
      if (!activeSession || activeSession.sessionId !== sessionId || activeSession.phase !== "active") {
        return;
      }
      flushPlannerTime();
      pauseActiveSession();
    };
  }, [activeSession, flushPlannerTime, injectedPaper, pauseActiveSession, sessionId]);

  const autoStarted = useRef(false);
  useEffect(() => {
    if (injectedPaper || !initialPaper || autoStarted.current) return;
    autoStarted.current = true;
    attempt.start(initialPaper, initialMode ?? "practice");
  }, [attempt, injectedPaper, initialMode, initialPaper]);

  const reportedFinish = useRef(false);
  useEffect(() => {
    if (attempt.phase === "finished" && onSessionComplete && !reportedFinish.current) {
      reportedFinish.current = true;
      onSessionComplete({
        score: attempt.score,
        accuracy: attempt.accuracy,
        weakTopics: attempt.weakTopics,
        topicResults: attempt.topicResults,
      });
    }

    if (attempt.phase !== "finished") {
      reportedFinish.current = false;
    }
  }, [attempt.accuracy, attempt.phase, attempt.score, attempt.topicResults, attempt.weakTopics, onSessionComplete]);

  const handleExit = useCallback(() => {
    if (injectedPaper && activeSession?.phase === "active") {
      flushPlannerTime();
      pauseActiveSession();
    }

    if (onExit) {
      onExit();
      return;
    }

    if (injectedPaper) return;
    attempt.reset();
  }, [activeSession?.phase, attempt, flushPlannerTime, injectedPaper, onExit, pauseActiveSession]);

  const handleStart = useCallback(
    (paper: InteractivePaper, mode: PaperMode) => {
      attempt.start(paper, mode);
      setPaletteOpen(true);
    },
    [attempt],
  );

  const handlePlannerFinish = useCallback(() => {
    if (!window.confirm("Submit this study session?")) return;
    flushPlannerTime();
    const completed = completeActiveSession();
    if (!completed) return;

    onSessionComplete?.({
      score: completed.score,
      accuracy: completed.accuracy,
      weakTopics: toWeakTopics(completed.topicResults),
      topicResults: completed.topicResults,
    });
    onExit?.();
  }, [completeActiveSession, flushPlannerTime, onExit, onSessionComplete]);

  const plannerProgress = useMemo(
    () => (activeSession ? getSessionProgress(activeSession) : { answered: 0, total: 0, percent: 0 }),
    [activeSession],
  );

  const plannerPaper = injectedPaper;
  const plannerQuestion = plannerPaper && activeSession ? plannerPaper.questions[activeSession.currentIndex] : null;
  const plannerFlaggedIds = useMemo(() => new Set<string>(), []);

  if (plannerPaper && activeSession) {
    return (
      <div className={`overflow-hidden rounded-3xl border ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
        <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!window.confirm("Leave this session for now? Your progress will be saved so you can resume later.")) return;
                handleExit();
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
                {subjectLabel(plannerPaper.subject)}
              </p>
              <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {plannerPaper.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlannerFinish}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Finish session
          </button>
        </header>

        <div className={`grid min-h-[640px] ${paletteOpen ? "grid-cols-1 lg:grid-cols-[16rem_1fr]" : "grid-cols-1"}`}>
          {paletteOpen && (
            <QuestionPalette
              questions={plannerPaper.questions}
              currentIndex={activeSession.currentIndex}
              answers={activeSession.answers}
              flaggedIds={plannerFlaggedIds}
              onJump={(index) => {
                flushPlannerTime();
                goToActiveQuestion(index);
              }}
              onCollapse={() => setPaletteOpen(false)}
            />
          )}

          <main className="flex flex-col">
            {!paletteOpen && <PaletteOpener onExpand={() => setPaletteOpen(true)} />}

            {plannerQuestion ? (
              <QuestionCard
                question={plannerQuestion}
                index={activeSession.currentIndex}
                total={plannerPaper.questions.length}
                selectedAnswer={activeSession.answers[plannerQuestion.id] ?? null}
                disabled={false}
                mode="practice"
                showCorrectness={false}
                progressPercent={plannerProgress.percent}
                onSelect={(optionIndex) => {
                  const elapsed = Date.now() - questionEnteredAt.current;
                  submitActiveAnswer(plannerQuestion.id, optionIndex, elapsed);
                  questionEnteredAt.current = Date.now();
                }}
              />
            ) : (
              <div className="p-6 text-sm text-slate-500">No question loaded.</div>
            )}

            <PaperFooter
              disablePrev={activeSession.currentIndex === 0}
              disableNext={activeSession.currentIndex >= plannerPaper.questions.length - 1}
              flagged={false}
              isFinished={false}
              onPrev={() => {
                flushPlannerTime();
                goToActiveQuestion(activeSession.currentIndex - 1);
              }}
              onNext={() => {
                flushPlannerTime();
                goToActiveQuestion(activeSession.currentIndex + 1);
              }}
              onToggleFlag={() => {}}
              onFinish={handlePlannerFinish}
              showFinish
            />
          </main>
        </div>
      </div>
    );
  }

  if (attempt.phase === "idle" || !attempt.paper) {
    if (initialPaper || plannerPaper) return null;
    return <PastPapersPage onStart={handleStart} />;
  }

  const { paper, currentIndex, answers, flaggedIds, mode, phase, timeLeftMs } = attempt;
  const questionsList = paper.questions;
  const activeQuestion = questionsList[currentIndex];
  const isFlagged = activeQuestion ? flaggedIds.has(activeQuestion.id) : false;

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
                questions={questionsList}
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
                  total={questionsList.length}
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
                disableNext={currentIndex >= questionsList.length - 1}
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

  return (
    <div className={`overflow-hidden rounded-3xl border ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
      <header className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-slate-700 bg-slate-950" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("Leave this paper? Your progress will be lost.")) return;
              handleExit();
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
              {subjectLabel(paper.subject)}
            </p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
              Paper {paper.paper} | {mode === "exam" ? "Exam mode" : "Practice mode"}
            </p>
          </div>
        </div>

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

        <button
          type="button"
          onClick={() => {
            if (!window.confirm("Submit your paper? You can review answers after finishing.")) return;
            attempt.finish();
          }}
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
        >
          Finish attempt
        </button>
      </header>

      <div className={`grid min-h-[640px] ${paletteOpen ? "grid-cols-1 lg:grid-cols-[16rem_1fr]" : "grid-cols-1"}`}>
        {paletteOpen && (
          <QuestionPalette
            questions={questionsList}
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
              total={questionsList.length}
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
            disableNext={currentIndex >= questionsList.length - 1}
            flagged={isFlagged}
            isFinished={false}
            onPrev={attempt.prev}
            onNext={attempt.next}
            onToggleFlag={attempt.toggleFlag}
            onFinish={() => {
              if (!window.confirm("Submit your paper? You can review answers after finishing.")) return;
              attempt.finish();
            }}
            showFinish
          />
        </main>
      </div>
    </div>
  );
}
