import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLearningStore } from "../../stores/learningStore";
import type { Subject } from "../../types/domain";
import { getOpenAiApiKey } from "../../utils/settings";
import { generateSubjectQuiz } from "../../utils/quizzes";

interface QuizQuestion {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

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
    explanation: "Carbon dioxide reacts with limewater (calcium hydroxide) to form insoluble calcium carbonate, making it milky.",
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
];

const formatSubjectLabel = (subject: Subject) => subject.replace(/_/g, " ");

const Quizzes = () => {
  const { updateStudyStat, addStudySession } = useLearningStore();

  const apiKey = getOpenAiApiKey();
  const hasApiKey = Boolean(apiKey);

  const availableSubjects = useMemo(() => Array.from(new Set(sampleQuestions.map((q) => q.subject))), []);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(availableSubjects[0] ?? "math" );
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => sampleQuestions.filter((q) => q.subject === (availableSubjects[0] ?? "math")));
  const [quizSource, setQuizSource] = useState<"sample" | "ai">("sample");

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(sampleQuestions.filter((q) => q.subject === selectedSubject));
    setQuizSource("sample");
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSavedResult(false);
    setGenerationError(null);
  }, [selectedSubject]);

  const question = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null || !question) return;

    const isCorrect = selectedAnswer === question.correctIndex;
    if (isCorrect) setScore((prev) => prev + 1);

    setShowResult(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizStarted(false);
    setSavedResult(false);
  };

  useEffect(() => {
    if (!quizStarted) return;
    if (savedResult) return;
    if (!showResult) return;
    if (questions.length === 0) return;
    if (currentQuestion !== questions.length - 1) return;

    const accuracy = Math.round((score / questions.length) * 100);
    const today = new Date().toISOString().split("T")[0];

    updateStudyStat({ subject: selectedSubject, topic: quizSource === "ai" ? "ai-quiz" : "sample-quiz", accuracy, attempts: questions.length });
    addStudySession({
      id: `quiz-${Date.now()}`,
      subject: formatSubjectLabel(selectedSubject),
      durationMinutes: Math.max(10, questions.length * 4),
      completed: true,
      date: today,
      kind: "quiz",
      notes: `Quiz completed: ${accuracy}%`,
      topic: quizSource === "ai" ? "AI quiz" : "Sample quiz",
    });

    setSavedResult(true);
  }, [addStudySession, currentQuestion, questions.length, quizSource, quizStarted, savedResult, score, selectedSubject, showResult, updateStudyStat]);

  const handleLaunchQuiz = async () => {
    if (generating) return;

    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setSavedResult(false);
    setGenerationError(null);

    if (!hasApiKey) {
      setQuestions(sampleQuestions.filter((q) => q.subject === selectedSubject));
      setQuizSource("sample");
      return;
    }

    setQuestions([]);
    setQuizSource("ai");
    setGenerating(true);
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
      setQuestions(aiQuestions);
    } catch {
      setGenerationError("Couldn’t generate an AI quiz right now. Falling back to sample questions.");
      setQuestions(sampleQuestions.filter((q) => q.subject === selectedSubject));
      setQuizSource("sample");
    } finally {
      setGenerating(false);
    }
  };

  if (!quizStarted) {
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
            {availableSubjects.map((subject) => (
              <option key={subject} value={subject}>
                {formatSubjectLabel(subject)}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleLaunchQuiz}
          disabled={generating}
          className="rounded-full border border-indigo-400 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200 transition hover:bg-indigo-400/20"
        >
          Launch quiz
        </button>

        {!hasApiKey && (
          <Link to="/dashboard/settings" className="inline-flex text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 hover:text-white">
            Add OpenAI key to enable AI quizzes →
          </Link>
        )}

        {generationError && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-100">
            {generationError}
          </div>
        )}
      </div>
    );
  }

  if (generating && quizSource === "ai" && questions.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
        <h3 className="text-lg font-semibold text-white">Generating AI quiz…</h3>
        <p className="text-sm text-slate-200">Building 8 WASSCE-style questions for {formatSubjectLabel(selectedSubject)}.</p>
        <button
          type="button"
          onClick={() => {
            setQuizStarted(false);
            setGenerating(false);
            setQuestions(sampleQuestions.filter((q) => q.subject === selectedSubject));
            setQuizSource("sample");
          }}
          className="rounded-full border border-slate-600 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-200 hover:bg-slate-800/40"
        >
          Back
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-sm text-slate-200">
        No questions available for this subject yet.
      </div>
    );
  }

  if (showResult && currentQuestion === questions.length - 1) {
    const accuracy = Math.round((score / questions.length) * 100);
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
        <h3 className="text-lg font-semibold text-white">Quiz Complete!</h3>
        <p className="text-sm text-slate-200">
          Your score: {score} / {questions.length} ({accuracy}%)
        </p>
        <p className="text-xs text-slate-300">{savedResult ? "Saved to Progress." : "Saving to Progress..."}</p>
        <Link to="/dashboard/progress" className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200 hover:text-white">
          View progress →
        </Link>
        <button
          onClick={handleRestart}
          className="rounded-full border border-indigo-400 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200 transition hover:bg-indigo-400/20"
        >
          Take Another Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Question {currentQuestion + 1}</h3>
        <span className="text-sm text-slate-400">Score: {score}</span>
      </div>

      <p className="text-sm text-slate-200">{question.question}</p>

      <div className="space-y-2" data-testid="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleAnswerSelect(index)}
            type="button"
            data-testid={`quiz-option-${index}`}
            className={`w-full rounded-lg border p-3 text-left text-sm transition ${
              selectedAnswer === index
                ? "border-indigo-400 bg-indigo-400/20 text-indigo-100"
                : "border-slate-600 text-slate-200 hover:border-slate-500"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {showResult ? (
        <div className="space-y-2">
          <p className={`text-sm ${selectedAnswer === question.correctIndex ? "text-green-400" : "text-red-400"}`}>
            {selectedAnswer === question.correctIndex ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-xs text-slate-300">{question.explanation}</p>
          <button
            onClick={handleNext}
            className="rounded-full border border-indigo-400 px-4 py-2 text-xs uppercase tracking-[0.4em] text-indigo-200 transition hover:bg-indigo-400/20"
          >
            Next Question
          </button>
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={selectedAnswer === null}
          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.4em] transition ${
            selectedAnswer !== null
              ? "border-indigo-400 bg-indigo-400/20 text-indigo-200 hover:bg-indigo-400/30"
              : "cursor-not-allowed border-slate-600 bg-slate-700/50 text-slate-400"
          }`}
        >
          Submit Answer
        </button>
      )}
    </div>
  );
};

export default Quizzes;
