import type { PassPaper } from "../../core/types/passPaper";

interface Props {
  paper: PassPaper;
  answers: Record<string, string>;
  onRetry: (questionId: string) => void;
}

export default function PassPaperReview({ paper, answers, onRetry }: Props) {
  const getScore = () => {
    let correct = 0;
    paper.questions.forEach((question) => {
      if (question.correctAnswer && answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold text-slate-900">
          {paper.subject.toUpperCase()} {paper.year} Review
        </h2>
        <p className="text-slate-600">
          Score: {getScore()} / {paper.questions.length}
        </p>
      </div>

      <div className="space-y-4">
        {paper.questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 flex items-start justify-between">
              <h3 className="font-medium text-slate-900">Question {index + 1}</h3>
              <span className="text-sm text-slate-500">{question.marks} marks</span>
            </div>
            <p className="mb-2 text-slate-700">{question.text}</p>

            {question.options && (
              <div className="mb-2 text-sm">
                <p className="text-emerald-700">Correct: {question.correctAnswer}</p>
                <p className="text-slate-600">Your answer: {answers[question.id] || "Not answered"}</p>
              </div>
            )}

            {question.markingGuide && (
              <div className="mb-2 text-sm">
                <p className="font-medium text-amber-700">Marking guide:</p>
                <p className="text-slate-600">{question.markingGuide}</p>
              </div>
            )}

            <div className="text-sm text-slate-500">Topic: {question.topic}</div>

            <button
              onClick={() => onRetry(question.id)}
              className="mt-2 rounded-xl bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-800"
            >
              Retry this question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
