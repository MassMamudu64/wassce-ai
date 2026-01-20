import { useCallback, useEffect, useRef, useState } from "react";
import type { PassPaper } from "../../core/types/passPaper";

interface Props {
  paper: PassPaper;
  onComplete: (answers: Record<string, string>, timeSpent: number) => void;
}

export default function PassPaperExam({ paper, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(paper.durationMinutes * 60);
  const startTime = useRef(0);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(() => {
    const timeSpent = Math.round((performance.now() - startTime.current) / 60000);
    onComplete(answers, timeSpent);
  }, [answers, onComplete]);

  useEffect(() => {
    startTime.current = performance.now();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, handleSubmit]);

  const question = paper.questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          {paper.subject.toUpperCase()} {paper.year} - {paper.paperType.toUpperCase()}
        </h2>
        <div className="text-lg text-rose-600">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      <div className="text-sm text-slate-600">
        Question {currentQuestion + 1} of {paper.questions.length}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="mb-4 text-slate-900">{question.text}</p>
        {question.options && (
          <div className="space-y-2">
            {question.options.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(event) => handleAnswer(question.id, event.target.value)}
                  className="h-4 w-4 accent-emerald-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}
        {!question.options && (
          <textarea
            value={answers[question.id] || ""}
            onChange={(event) => handleAnswer(question.id, event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
            rows={6}
            placeholder="Write your answer here..."
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestion < paper.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}
