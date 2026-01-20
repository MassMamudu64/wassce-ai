import { useCallback, useMemo, useState } from "react";
import type { Subject } from "../../../types/domain";
import { generateSubjectQuiz } from "../../../utils/quizzes";
import { getSampleQuestions } from "./quizData";
import type { AnswerMap, QuizPhase, QuizQuestion, QuizSource } from "./quizTypes";
import { formatSubjectLabel } from "./quizTypes";

type UseQuizAttempt = {
  phase: QuizPhase;
  source: QuizSource;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: AnswerMap;
  flaggedIds: Set<string>;
  paletteCollapsed: boolean;
  showReviewAnswers: boolean;
  generationError: string | null;
  endsAtMs: number | null;
  activeQuestion: QuizQuestion | null;
  answeredCount: number;
  progressPercent: number;
  score: number;
  accuracy: number;
  setPaletteCollapsed: (next: boolean) => void;
  setShowReviewAnswers: (next: boolean) => void;
  launch: (subject: Subject, canUseAi: boolean) => Promise<void>;
  backToSetup: () => void;
  finish: () => boolean;
  reset: () => void;
  jumpTo: (index: number) => void;
  prev: () => void;
  next: () => void;
  setAnswer: (optionIndex: number) => void;
  toggleFlag: () => void;
};

export const useQuizAttempt = (): UseQuizAttempt => {
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [source, setSource] = useState<QuizSource>("sample");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [showReviewAnswers, setShowReviewAnswers] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [endsAtMs, setEndsAtMs] = useState<number | null>(null);

  const activeQuestion = questions[currentIndex] ?? null;
  const answeredCount = useMemo(
    () => questions.reduce((count, q) => (answers[q.id] === null || answers[q.id] === undefined ? count : count + 1), 0),
    [answers, questions],
  );
  const progressPercent = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100);
  const score = useMemo(() => (phase !== "finished" ? 0 : questions.reduce((c, q) => (answers[q.id] === q.correctIndex ? c + 1 : c), 0)), [answers, phase, questions]);
  const accuracy = questions.length === 0 ? 0 : Math.round((score / questions.length) * 100);

  const begin = useCallback((nextQuestions: QuizQuestion[], nextSource: QuizSource) => {
    const init: AnswerMap = {};
    nextQuestions.forEach((q) => (init[q.id] = null));
    setAnswers(init);
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setFlaggedIds(new Set());
    setPaletteCollapsed(false);
    setShowReviewAnswers(true);
    setSource(nextSource);
    setGenerationError(null);
    const minutes = Math.max(20, Math.ceil((nextQuestions.length * 90) / 60));
    setEndsAtMs(Date.now() + minutes * 60 * 1000);
    setPhase("active");
  }, []);

  const backToSetup = () => setPhase("setup");

  const reset = () => {
    setPhase("setup");
    setSource("sample");
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds(new Set());
    setPaletteCollapsed(false);
    setShowReviewAnswers(true);
    setGenerationError(null);
    setEndsAtMs(null);
  };

  const launch = useCallback(
    async (subject: Subject, canUseAi: boolean) => {
      if (phase === "loading") return;
      setGenerationError(null);

      const sample = getSampleQuestions(subject);
      if (!canUseAi) {
        if (sample.length > 0) return begin(sample, "sample");
        setGenerationError("No sample quiz available. Add an OpenAI key and unlock Premium to generate AI quizzes.");
        return;
      }

      setPhase("loading");
      setSource("ai");
      try {
        const prompt = `Generate a WASSCE multiple-choice quiz for ${formatSubjectLabel(subject)}.`;
        const generated = await generateSubjectQuiz(subject, prompt);
        begin(
          generated.map((entry) => ({
            id: entry.id,
            subject: entry.subject,
            topic: entry.topic,
            question: entry.question,
            options: entry.options,
            correctIndex: entry.correctIndex,
            explanation: entry.explanation,
          })),
          "ai",
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to generate AI quiz.";
        setGenerationError(`${message} Falling back to sample questions.`);
        if (sample.length > 0) begin(sample, "sample");
        else setPhase("setup");
      }
    },
    [begin, phase],
  );

  const jumpTo = (index: number) => setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
  const prev = () => setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  const next = () => setCurrentIndex((prevIndex) => Math.min(questions.length - 1, prevIndex + 1));
  const setAnswer = (optionIndex: number) => {
    if (!activeQuestion) return;
    setAnswers((prevMap) => ({ ...prevMap, [activeQuestion.id]: optionIndex }));
  };
  const toggleFlag = () => {
    if (!activeQuestion) return;
    setFlaggedIds((prevSet) => {
      const nextSet = new Set(prevSet);
      if (nextSet.has(activeQuestion.id)) nextSet.delete(activeQuestion.id);
      else nextSet.add(activeQuestion.id);
      return nextSet;
    });
  };
  const finish = () => {
    if (phase !== "active") return false;
    if (!window.confirm("Finish attempt now? You can review your answers after finishing.")) return false;
    setPhase("finished");
    return true;
  };

  return {
    phase,
    source,
    questions,
    currentIndex,
    answers,
    flaggedIds,
    paletteCollapsed,
    showReviewAnswers,
    generationError,
    endsAtMs,
    activeQuestion,
    answeredCount,
    progressPercent,
    score,
    accuracy,
    setPaletteCollapsed,
    setShowReviewAnswers,
    launch,
    backToSetup,
    finish,
    reset,
    jumpTo,
    prev,
    next,
    setAnswer,
    toggleFlag,
  };
};
