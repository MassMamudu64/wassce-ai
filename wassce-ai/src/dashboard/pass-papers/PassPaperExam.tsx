import { useState, useEffect, useRef, useCallback } from 'react';
import type { PassPaper } from '../../core/types/passPaper';

interface Props {
  paper: PassPaper;
  onComplete: (answers: Record<string, string>, timeSpent: number) => void;
}

export default function PassPaperExam({ paper, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(paper.durationMinutes * 60);
  // eslint-disable-next-line react-hooks/purity
  const startTime = useRef(Date.now());

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = useCallback(() => {
    const timeSpent = Math.round((Date.now() - startTime.current) / 60000);
    onComplete(answers, timeSpent);
  }, [answers, onComplete]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, handleSubmit]);

  const question = paper.questions[currentQuestion];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          {paper.subject.toUpperCase()} {paper.year} - {paper.paperType.toUpperCase()}
        </h2>
        <div className="text-lg text-red-400">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="text-sm text-slate-400">
        Question {currentQuestion + 1} of {paper.questions.length}
      </div>

      <div className="rounded-lg bg-slate-800 p-6">
        <p className="text-white mb-4">{question.text}</p>
        {question.options && (
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        )}
        {!question.options && (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full rounded bg-slate-700 p-2 text-white"
            rows={6}
            placeholder="Write your answer here..."
          />
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="rounded bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Previous
        </button>
        {currentQuestion < paper.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}