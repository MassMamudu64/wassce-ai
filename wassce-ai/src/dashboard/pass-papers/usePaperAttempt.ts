import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AttemptRecord,
  InteractivePaper,
  PaperMode,
  PassPaperAttempt,
  PassPaperStats,
  WeakTopic,
} from "../../core/types/passPaper";
import type { Subject, StudyStat } from "../../types/domain";
import type { StudySession } from "../../types/profile";
import { useLearningStore } from "../../stores/learningStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaperPhase = "idle" | "active" | "finished";

export type AnswerMap = Record<string, number | null>;

export interface UsePaperAttempt {
  // State
  phase: PaperPhase;
  mode: PaperMode;
  paper: InteractivePaper | null;
  currentIndex: number;
  answers: AnswerMap;
  flaggedIds: Set<string>;
  records: AttemptRecord[];
  timeLeftMs: number | null;
  showFeedback: boolean;

  // Derived
  answeredCount: number;
  progressPercent: number;
  score: number;
  accuracy: number;
  weakTopics: WeakTopic[];

  // Actions
  start: (paper: InteractivePaper, mode: PaperMode) => void;
  setAnswer: (optionIndex: number) => void;
  jumpTo: (index: number) => void;
  prev: () => void;
  next: () => void;
  toggleFlag: () => void;
  finish: () => void;
  reset: () => void;
  retryIncorrect: () => void;
}

// ---------------------------------------------------------------------------
// Weak-topic detection threshold
// ---------------------------------------------------------------------------
const WEAK_THRESHOLD = 60; // topics below 60% accuracy are "weak"

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const usePaperAttempt = (): UsePaperAttempt => {
  const [phase, setPhase] = useState<PaperPhase>("idle");
  const [mode, setMode] = useState<PaperMode>("practice");
  const [paper, setPaper] = useState<InteractivePaper | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [records, setRecords] = useState<AttemptRecord[]>([]);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Per-question timer
  const questionEnteredAt = useRef<number>(Date.now());
  const questionTimeAccum = useRef<Record<string, number>>({});

  // Learning store integration
  const addPassPaperAttempt = useLearningStore((s) => s.addPassPaperAttempt);
  const updatePassPaperStats = useLearningStore((s) => s.updatePassPaperStats);
  const updateStudyStat = useLearningStore((s) => s.updateStudyStat);
  const addStudySession = useLearningStore((s) => s.addStudySession);
  const processEngineResults = useLearningStore((s) => s.processEngineResults);

  // ------- Derived state -------

  const questions = paper?.questions ?? [];

  const answeredCount = useMemo(
    () => questions.reduce((c, q) => (answers[q.id] != null ? c + 1 : c), 0),
    [answers, questions],
  );

  const progressPercent =
    questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);

  const score = useMemo(
    () =>
      phase !== "finished"
        ? 0
        : questions.reduce((c, q) => (answers[q.id] === q.correctIndex ? c + 1 : c), 0),
    [answers, phase, questions],
  );

  const accuracy =
    questions.length === 0 ? 0 : Math.round((score / questions.length) * 100);

  const weakTopics = useMemo<WeakTopic[]>(() => {
    if (phase !== "finished" || records.length === 0) return [];

    const byTopic: Record<string, { correct: number; total: number; ids: string[] }> = {};
    for (const r of records) {
      const entry = byTopic[r.topic] ?? { correct: 0, total: 0, ids: [] };
      entry.total += 1;
      if (r.correct) entry.correct += 1;
      entry.ids.push(r.questionId);
      byTopic[r.topic] = entry;
    }

    return Object.entries(byTopic)
      .map(([topic, data]) => ({
        topic,
        subject: paper?.subject ?? "",
        accuracy: Math.round((data.correct / data.total) * 100),
        attempts: data.total,
        questionIds: data.ids,
      }))
      .filter((t) => t.accuracy < WEAK_THRESHOLD)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, [phase, records, paper]);

  // ------- Countdown timer (exam mode) -------

  useEffect(() => {
    if (phase !== "active" || mode !== "exam" || timeLeftMs == null) return;
    if (timeLeftMs <= 0) return;

    const id = window.setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev == null) return null;
        const next = prev - 1000;
        if (next <= 0) return 0;
        return next;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [phase, mode, timeLeftMs]);

  // Auto-finish when timer reaches zero
  useEffect(() => {
    if (phase === "active" && timeLeftMs != null && timeLeftMs <= 0) {
      finalise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftMs, phase]);

  // Track time per question when the index changes
  useEffect(() => {
    if (phase !== "active" || !paper) return;
    const q = paper.questions[currentIndex];
    if (!q) return;

    // Save elapsed time for previous question
    const elapsed = Date.now() - questionEnteredAt.current;
    const prevAccum = questionTimeAccum.current;
    // Attribute elapsed to whichever question was showing before this effect
    // We don't know the "old" index here, so we accumulate on every render.
    // Instead we handle it in the answer tracking below.

    questionEnteredAt.current = Date.now();
    // Initialise accumulator for this question if missing
    if (prevAccum[q.id] == null) prevAccum[q.id] = 0;
  }, [currentIndex, phase, paper]);

  // ------- Helpers -------

  const accumulateTimeForCurrent = useCallback(() => {
    if (!paper) return;
    const q = paper.questions[currentIndex];
    if (!q) return;
    const elapsed = Date.now() - questionEnteredAt.current;
    questionTimeAccum.current[q.id] = (questionTimeAccum.current[q.id] ?? 0) + elapsed;
    questionEnteredAt.current = Date.now();
  }, [paper, currentIndex]);

  const buildRecords = useCallback((): AttemptRecord[] => {
    if (!paper) return [];
    return paper.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? null,
      correct: answers[q.id] === q.correctIndex,
      timeSpent: Math.round((questionTimeAccum.current[q.id] ?? 0) / 1000),
      topic: q.topic,
    }));
  }, [paper, answers]);

  const persistResults = useCallback(
    (finalRecords: AttemptRecord[]) => {
      if (!paper) return;

      // 1. PassPaperAttempt
      const attempt: PassPaperAttempt = {
        id: `${paper.id}-${Date.now()}`,
        paperId: paper.id,
        answers: Object.fromEntries(
          paper.questions.map((q) => [q.id, String(answers[q.id] ?? -1)]),
        ),
        score: finalRecords.filter((r) => r.correct).length,
        totalMarks: paper.questions.length,
        timeSpent: Math.round(
          finalRecords.reduce((s, r) => s + r.timeSpent, 0) / 60,
        ),
        completedAt: new Date(),
        mode,
        records: finalRecords,
      };
      addPassPaperAttempt(attempt);

      // 2. PassPaperStats (aggregate per subject)
      const topicAcc: Record<string, { c: number; t: number }> = {};
      for (const r of finalRecords) {
        const e = topicAcc[r.topic] ?? { c: 0, t: 0 };
        e.t += 1;
        if (r.correct) e.c += 1;
        topicAcc[r.topic] = e;
      }
      const topicAccuracy: Record<string, number> = {};
      for (const [topic, data] of Object.entries(topicAcc)) {
        topicAccuracy[topic] = Math.round((data.c / data.t) * 100);
      }

      const stats: PassPaperStats = {
        subject: paper.subject,
        totalAttempts: 1,
        averageScore: Math.round((attempt.score / attempt.totalMarks) * 100),
        topicAccuracy,
        yearTrends: { [paper.year]: Math.round((attempt.score / attempt.totalMarks) * 100) },
      };
      updatePassPaperStats(stats);

      // 3. Update per-topic StudyStats (feeds the global learning system)
      for (const [topic, data] of Object.entries(topicAcc)) {
        const stat: StudyStat = {
          subject: paper.subject as Subject,
          topic,
          accuracy: Math.round((data.c / data.t) * 100),
          attempts: data.t,
        };
        updateStudyStat(stat);
      }

      // 4. Record study session
      const session: StudySession = {
        id: `pp-${paper.id}-${Date.now()}`,
        subject: paper.subject,
        durationMinutes: attempt.timeSpent || 1,
        completed: true,
        date: new Date().toISOString().slice(0, 10),
        topic: `Past Paper ${paper.year} P${paper.paper}`,
        kind: "past_paper",
      };
      addStudySession(session);

      // 5. Feed results into the adaptive learning engine
      processEngineResults({
        sessionId: attempt.id,
        results: finalRecords.map((r) => ({
          topic: r.topic,
          subject: paper.subject,
          correct: r.correct,
          timeMs: r.timeSpent * 1000, // convert seconds to ms
        })),
        completedAt: new Date().toISOString(),
      });
    },
    [paper, answers, mode, addPassPaperAttempt, updatePassPaperStats, updateStudyStat, addStudySession, processEngineResults],
  );

  // ------- finalise (internal) -------

  const finalise = useCallback(() => {
    if (phase !== "active") return;
    accumulateTimeForCurrent();
    const finalRecords = buildRecords();
    setRecords(finalRecords);
    setPhase("finished");
    setShowFeedback(true);
    persistResults(finalRecords);
  }, [phase, accumulateTimeForCurrent, buildRecords, persistResults]);

  // ------- Public actions -------

  const start = useCallback(
    (nextPaper: InteractivePaper, nextMode: PaperMode) => {
      const init: AnswerMap = {};
      nextPaper.questions.forEach((q) => (init[q.id] = null));
      setAnswers(init);
      setPaper(nextPaper);
      setMode(nextMode);
      setCurrentIndex(0);
      setFlaggedIds(new Set());
      setRecords([]);
      setShowFeedback(false);
      questionTimeAccum.current = {};
      questionEnteredAt.current = Date.now();

      if (nextMode === "exam") {
        setTimeLeftMs(nextPaper.durationMinutes * 60 * 1000);
      } else {
        setTimeLeftMs(null);
      }
      setPhase("active");
    },
    [],
  );

  const setAnswer = useCallback(
    (optionIndex: number) => {
      if (phase !== "active" || !paper) return;
      const q = paper.questions[currentIndex];
      if (!q) return;
      setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
    },
    [phase, paper, currentIndex],
  );

  const jumpTo = useCallback(
    (index: number) => {
      if (!paper) return;
      accumulateTimeForCurrent();
      setCurrentIndex(Math.max(0, Math.min(index, paper.questions.length - 1)));
    },
    [paper, accumulateTimeForCurrent],
  );

  const prev = useCallback(() => {
    accumulateTimeForCurrent();
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, [accumulateTimeForCurrent]);

  const next = useCallback(() => {
    if (!paper) return;
    accumulateTimeForCurrent();
    setCurrentIndex((i) => Math.min(paper.questions.length - 1, i + 1));
  }, [paper, accumulateTimeForCurrent]);

  const toggleFlag = useCallback(() => {
    if (!paper) return;
    const q = paper.questions[currentIndex];
    if (!q) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(q.id)) next.delete(q.id);
      else next.add(q.id);
      return next;
    });
  }, [paper, currentIndex]);

  const finish = useCallback(() => {
    finalise();
  }, [finalise]);

  const reset = useCallback(() => {
    setPhase("idle");
    setPaper(null);
    setMode("practice");
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds(new Set());
    setRecords([]);
    setTimeLeftMs(null);
    setShowFeedback(false);
    questionTimeAccum.current = {};
  }, []);

  const retryIncorrect = useCallback(() => {
    if (!paper) return;
    // Keep the same paper but reset only incorrect answers
    const newAnswers: AnswerMap = {};
    paper.questions.forEach((q) => {
      const wasCorrect = answers[q.id] === q.correctIndex;
      newAnswers[q.id] = wasCorrect ? answers[q.id] : null;
    });
    setAnswers(newAnswers);
    setRecords([]);
    setFlaggedIds(new Set());
    setShowFeedback(false);
    questionTimeAccum.current = {};
    questionEnteredAt.current = Date.now();

    // Jump to first incorrect question
    const firstIncorrect = paper.questions.findIndex(
      (q) => answers[q.id] !== q.correctIndex,
    );
    setCurrentIndex(firstIncorrect >= 0 ? firstIncorrect : 0);

    if (mode === "exam") {
      setTimeLeftMs(paper.durationMinutes * 60 * 1000);
    }
    setPhase("active");
  }, [paper, answers, mode]);

  return {
    phase,
    mode,
    paper,
    currentIndex,
    answers,
    flaggedIds,
    records,
    timeLeftMs,
    showFeedback,
    answeredCount,
    progressPercent,
    score,
    accuracy,
    weakTopics,
    start,
    setAnswer,
    jumpTo,
    prev,
    next,
    toggleFlag,
    finish,
    reset,
    retryIncorrect,
  };
};
