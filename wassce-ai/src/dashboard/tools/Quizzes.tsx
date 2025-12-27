import { Flag, FlagOff, GraduationCap, PanelLeftClose, PanelLeftOpen, Timer } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLearningStore } from "../../stores/learningStore";
import type { Subject } from "../../types/domain";
import { generateSubjectQuiz } from "../../utils/quizzes";
import { getOpenAiApiKey } from "../../utils/settings";

interface QuizQuestion {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type QuizSource = "sample" | "ai";
type QuizPhase = "setup" | "loading" | "active" | "finished";
type AnswerMap = Record<string, number | null>;

const subjects: Subject[] = [
  "integrated_science",
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "economics",
  "government",
];

const sampleQuestions: QuizQuestion[] = [
  {
    id: "chem-1",
    subject: "chemistry",
    topic: "Fundamentals",
    question: "What is the chemical formula for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctIndex: 0,
    explanation: "Water consists of two hydrogen atoms and one oxygen atom.",
  },
  {
    id: "chem-2",
    subject: "chemistry",
    topic: "Gases",
    question: "Which gas turns limewater milky?",
    options: ["Oxygen", "Carbon dioxide", "Hydrogen", "Nitrogen"],
    correctIndex: 1,
    explanation:
      "Carbon dioxide reacts with limewater (calcium hydroxide) to form insoluble calcium carbonate, making it milky.",
  },
  {
    id: "math-1",
    subject: "math",
    topic: "Constants",
    question: "In mathematics, what is the value of π (pi) approximately?",
    options: ["3.14", "2.71", "1.41", "1.73"],
    correctIndex: 0,
    explanation: "π is approximately 3.14159, commonly rounded to 3.14.",
  },
  {
    id: "math-2",
    subject: "math",
    topic: "Linear equations",
    question: "Solve: 2x + 3 = 11",
    options: ["2", "4", "6", "7"],
    correctIndex: 1,
    explanation: "2x = 8 so x = 4.",
  },
  {
    id: "integrated-1",
    subject: "integrated_science",
    topic: "Measurement",
    question: "Which instrument is best for measuring the diameter of a small wire accurately?",
    options: ["Metre rule", "Micrometer screw gauge", "Thermometer", "Stopwatch"],
    correctIndex: 1,
    explanation: "A micrometer screw gauge is designed for precise measurement of small diameters.",
  },
  {
    id: "integrated-2",
    subject: "integrated_science",
    topic: "Energy",
    question: "Which of the following is a renewable source of energy?",
    options: ["Coal", "Natural gas", "Solar", "Diesel"],
    correctIndex: 2,
    explanation: "Solar energy is renewable because it is replenished naturally.",
  },
  {
    id: "english-1",
    subject: "english",
    topic: "Grammar",
    question: "Choose the correct sentence.",
    options: [
      "She don't like mangoes.",
      "She doesn't likes mangoes.",
      "She doesn't like mangoes.",
      "She not like mangoes.",
    ],
    correctIndex: 2,
    explanation: "With 'she', use 'doesn't' + base verb: 'doesn't like'.",
  },
  {
    id: "biology-1",
    subject: "biology",
    topic: "Cells",
    question: "Which organelle is mainly responsible for producing energy (ATP) in cells?",
    options: ["Ribosome", "Mitochondrion", "Nucleus", "Golgi body"],
    correctIndex: 1,
    explanation: "Mitochondria are the sites of aerobic respiration and ATP production.",
  },
  {
    id: "physics-1",
    subject: "physics",
    topic: "Quantities",
    question: "Which of the following physical quantities is a scalar quantity?",
    options: ["Velocity", "Force", "Mass", "Acceleration"],
    correctIndex: 2,
    explanation: "Mass has magnitude only (scalar). Velocity, force, and acceleration have direction (vectors).",
  },
];

const formatSubjectLabel = (subject: Subject) =>
  subject
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");

const pad2 = (value: number) => value.toString().padStart(2, "0");

const formatHms = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)} : ${pad2(minutes)} : ${pad2(seconds)}`;
};

const hashToStudentId = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const digits = Math.abs(hash % 1_000_000).toString().padStart(6, "0");
  return `GH-${digits}`;
};

export default function Quizzes() {
  const { user } = useAuth();
  const { updateStudyStat, addStudySession } = useLearningStore();

  const apiKey = getOpenAiApiKey();
  const hasApiKey = Boolean(apiKey);

  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [quizSource, setQuizSource] = useState<QuizSource>("sample");
  const [selectedSubject, setSelectedSubject] = useState<Subject>("integrated_science");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(() => new Set());
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [showReviewAnswers, setShowReviewAnswers] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [savedResult, setSavedResult] = useState(false);

  const [endsAtMs, setEndsAtMs] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);

  const tickRef = useRef<number | null>(null);

  const studentId = useMemo(() => hashToStudentId(user?.email ?? "guest@wassce.ai"), [user?.email]);

  const activeQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const answeredCount = useMemo(() => {
    if (totalQuestions === 0) return 0;
    return questions.reduce((count, q) => (answers[q.id] === null || answers[q.id] === undefined ? count : count + 1), 0);
  }, [answers, questions, totalQuestions]);

  const progressPercent = totalQuestions === 0 ? 0 : Math.round((answeredCount / totalQuestions) * 100);

  const score = useMemo(() => {
    if (phase !== "finished") return 0;
    return questions.reduce((count, q) => (answers[q.id] === q.correctIndex ? count + 1 : count), 0);
  }, [answers, phase, questions]);

  const accuracy = useMemo(() => (totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100)), [score, totalQuestions]);

  useEffect(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }

    if (phase !== "active" || !endsAtMs) return;

    const update = () => {
      const remaining = Math.max(0, endsAtMs - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        setPhase("finished");
      }
    };

    update();
    tickRef.current = window.setInterval(update, 1000);
    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [endsAtMs, phase]);

  useEffect(() => {
    if (phase !== "finished") return;
    if (savedResult) return;
    if (questions.length === 0) return;

    const today = new Date().toISOString().split("T")[0];
    updateStudyStat({
      subject: selectedSubject,
      topic: quizSource === "ai" ? "ai-quiz" : "sample-quiz",
      accuracy,
      attempts: questions.length,
    });
    addStudySession({
      id: `quiz-${Date.now()}`,
      subject: formatSubjectLabel(selectedSubject),
      durationMinutes: Math.max(10, Math.round((questions.length * 90) / 60)),
      completed: true,
      date: today,
      kind: "quiz",
      notes: `Quiz completed: ${accuracy}%`,
      topic: quizSource === "ai" ? "AI quiz" : "Sample quiz",
    });
    setSavedResult(true);
  }, [accuracy, addStudySession, phase, questions.length, quizSource, savedResult, selectedSubject, updateStudyStat]);

  const resetAttempt = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds(new Set());
    setPaletteCollapsed(false);
    setShowReviewAnswers(true);
    setGenerationError(null);
    setSavedResult(false);
    setEndsAtMs(null);
    setTimeLeftMs(null);
    setQuizSource("sample");
    setPhase("setup");
  };

  const beginAttempt = (nextQuestions: QuizQuestion[], source: QuizSource) => {
    const initAnswers: AnswerMap = {};
    nextQuestions.forEach((q) => {
      initAnswers[q.id] = null;
    });
    setAnswers(initAnswers);
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setFlaggedIds(new Set());
    setQuizSource(source);
    setSavedResult(false);
    setGenerationError(null);

    const minMinutes = 20;
    const estimatedMinutes = Math.ceil((nextQuestions.length * 90) / 60);
    const minutes = Math.max(minMinutes, estimatedMinutes);
    const endsAt = Date.now() + minutes * 60 * 1000;
    setEndsAtMs(endsAt);
    setTimeLeftMs(endsAt - Date.now());
    setPhase("active");
  };

  const handleLaunch = async () => {
    if (phase === "loading") return;
    setGenerationError(null);
    setSavedResult(false);

    const sample = sampleQuestions.filter((q) => q.subject === selectedSubject);

    if (!hasApiKey) {
      if (sample.length === 0) {
        setGenerationError("Add your OpenAI API key in Settings to generate quizzes for this subject.");
        return;
      }
      beginAttempt(sample, "sample");
      return;
    }

    setPhase("loading");
    setQuizSource("ai");
    try {
      const prompt = `Generate a WASSCE multiple-choice quiz for ${formatSubjectLabel(selectedSubject)}.`;
      const generated = await generateSubjectQuiz(selectedSubject, prompt);
      const aiQuestions: QuizQuestion[] = generated.map((entry) => ({
        id: entry.id,
        subject: entry.subject,
        topic: entry.topic,
        question: entry.question,
        options: entry.options,
        correctIndex: entry.correctIndex,
        explanation: entry.explanation,
      }));
      beginAttempt(aiQuestions, "ai");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate AI quiz.";
      setGenerationError(`${message} Falling back to sample questions.`);
      if (sample.length > 0) {
        beginAttempt(sample, "sample");
      } else {
        setPhase("setup");
      }
    }
  };

  const setAnswerForCurrent = (optionIndex: number) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optionIndex }));
  };

  const toggleFlagForCurrent = () => {
    if (!activeQuestion) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(activeQuestion.id)) next.delete(activeQuestion.id);
      else next.add(activeQuestion.id);
      return next;
    });
  };

  const finishAttempt = () => {
    if (phase !== "active") return;
    const shouldFinish = window.confirm("Finish attempt now? You can review your answers after finishing.");
    if (!shouldFinish) return;
    setPhase("finished");
  };

  const goPrev = () => setCurrentIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));

  const paletteButtonClass = (q: QuizQuestion, index: number) => {
    const isCurrent = index === currentIndex;
    const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
    const isFlagged = flaggedIds.has(q.id);

    if (isCurrent) return "border-blue-500 bg-blue-50 text-blue-700";
    if (isFlagged) return "border-amber-300 bg-amber-50 text-amber-800";
    if (isAnswered) return "border-blue-600 bg-blue-600 text-white";
    return "border-slate-200 bg-white text-slate-700 hover:border-slate-300";
  };

  if (phase === "setup") {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
        <p className="text-sm text-slate-200">Launch subject-based quizzes and save the result to Progress automatically.</p>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Subject</p>
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value as Subject)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {formatSubjectLabel(subject)}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLaunch}
          className="rounded-full border border-indigo-400 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200 transition hover:bg-indigo-400/20"
        >
          Launch quiz
        </button>

        {!hasApiKey && (
          <Link
            to="/dashboard/settings"
            className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:text-white"
          >
            Add OpenAI key to enable AI quizzes →
          </Link>
        )}

        {generationError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">{generationError}</div>
        )}
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
        <h3 className="text-lg font-semibold text-white">Generating AI quiz…</h3>
        <p className="text-sm text-slate-200">Building 8 WASSCE-style questions for {formatSubjectLabel(selectedSubject)}.</p>
        <button
          type="button"
          onClick={() => setPhase("setup")}
          className="rounded-full border border-slate-600 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-200 hover:bg-slate-800/40"
        >
          Back
        </button>
      </div>
    );
  }

  if (!activeQuestion) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200">
        No questions available for this subject yet.
      </div>
    );
  }

  const isFinished = phase === "finished";
  const currentSelected = answers[activeQuestion.id];
  const currentFlagged = flaggedIds.has(activeQuestion.id);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">WASSCE Prep {new Date().getFullYear()}</p>
            <p className="text-xs text-slate-500">{formatSubjectLabel(selectedSubject)}</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          {!isFinished ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-900">
              <Timer className="h-4 w-4 text-indigo-600" />
              {formatHms(timeLeftMs ?? 0)}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              Score: <span className="font-semibold text-slate-900">{score}</span> / {totalQuestions} ({accuracy}%)
              <span className="ml-3 text-xs text-slate-500">{savedResult ? "Saved to Progress" : "Saving…"}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Student ID</p>
            <p className="text-sm font-semibold text-slate-900">{studentId}</p>
          </div>

          {isFinished ? (
            <button
              type="button"
              onClick={resetAttempt}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              New Attempt
            </button>
          ) : (
            <button
              type="button"
              onClick={finishAttempt}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
            >
              Finish Attempt
            </button>
          )}
        </div>
      </header>

      <div className={`grid min-h-[640px] ${paletteCollapsed ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[18rem_1fr]"}`}>
        {!paletteCollapsed ? (
          <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Question Palette</p>
                <p className="text-xs text-slate-500">{totalQuestions} Questions</p>
              </div>
              <button
                type="button"
                onClick={() => setPaletteCollapsed(true)}
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
                    onClick={() => setCurrentIndex(index)}
                    aria-current={index === currentIndex}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition ${paletteButtonClass(
                      q,
                      index,
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
                onClick={() => setPaletteCollapsed(true)}
                className="mt-6 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Collapse Sidebar
              </button>
            </div>
          </aside>
        ) : null}

        <main className="flex flex-col bg-slate-50">
          {paletteCollapsed ? (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
              <p className="text-sm font-semibold text-slate-900">Question Palette</p>
              <button
                type="button"
                onClick={() => setPaletteCollapsed(false)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <PanelLeftOpen className="h-4 w-4" />
                Open
              </button>
            </div>
          ) : null}

          <div className="flex-1 space-y-5 px-5 py-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-semibold text-slate-900">Question {currentIndex + 1}</h2>
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
              <p className="text-xl font-semibold text-slate-900">{activeQuestion.question}</p>

              <div className="mt-6 space-y-4" data-testid="quiz-options">
                {activeQuestion.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const selected = currentSelected === index;
                  const correct = activeQuestion.correctIndex === index;
                  const showCorrectness = isFinished && showReviewAnswers;

                  const borderClass = selected ? "border-blue-600" : "border-slate-200";
                  const bgClass = selected ? "bg-blue-50" : "bg-white";
                  const correctnessClass = showCorrectness
                    ? correct
                      ? "ring-2 ring-emerald-400"
                      : selected
                        ? "ring-2 ring-rose-300"
                        : ""
                    : "";

                  return (
                    <button
                      key={`${activeQuestion.id}-${option}`}
                      type="button"
                      disabled={isFinished}
                      onClick={() => setAnswerForCurrent(index)}
                      data-testid={`quiz-option-${index}`}
                      className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition ${borderClass} ${bgClass} ${correctnessClass} ${
                        isFinished ? "cursor-default" : "hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-600"
                          }`}
                          aria-hidden="true"
                        >
                          {letter}
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
            </section>

            <details className="rounded-2xl border border-slate-200 bg-blue-50/60 px-5 py-4">
              <summary className="cursor-pointer list-none">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Need a hint?</p>
                    <p className="text-sm text-slate-600">Ask the AI tutor for a subtle clue.</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Open</span>
                </div>
              </summary>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-700">
                  Best practice: eliminate two options first, then check keywords in the question stem.
                </p>
                <Link
                  to="/dashboard/tools/aichat"
                  state={{
                    prefill: `I’m answering a ${formatSubjectLabel(selectedSubject)} multiple-choice question. Give a subtle hint (no final answer).\n\nQuestion: ${activeQuestion.question}\nOptions: ${activeQuestion.options.join(
                      ", ",
                    )}`,
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ask AI tutor
                </Link>
              </div>
            </details>

            {isFinished ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm">
                <div className="text-slate-700">
                  <span className="font-semibold text-slate-900">
                    {answeredCount}/{totalQuestions}
                  </span>{" "}
                  answered •{" "}
                  <span className="font-semibold text-slate-900">{flaggedIds.size}</span> flagged •{" "}
                  <Link to="/dashboard/progress" className="font-semibold text-blue-700 hover:text-blue-800">
                    View progress
                  </Link>
                </div>
                <label className="flex items-center gap-2 text-slate-700">
                  <input
                    type="checkbox"
                    checked={showReviewAnswers}
                    onChange={(event) => setShowReviewAnswers(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Show answers
                </label>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-slate-200 bg-white px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-2">
                {isFinished ? null : (
                  <button
                    type="button"
                    onClick={toggleFlagForCurrent}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                      currentFlagged ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {currentFlagged ? <FlagOff className="h-4 w-4" /> : <Flag className="h-4 w-4" />}
                    {currentFlagged ? "Unflag" : "Flag"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={goNext}
                  disabled={currentIndex >= totalQuestions - 1}
                  className="rounded-xl border border-blue-600 bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next Question →
                </button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
