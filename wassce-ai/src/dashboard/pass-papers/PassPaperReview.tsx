import type { PassPaper } from '../../core/types/passPaper';

interface Props {
  paper: PassPaper;
  answers: Record<string, string>;
  onRetry: (questionId: string) => void;
}

export default function PassPaperReview({ paper, answers, onRetry }: Props) {
  const getScore = () => {
    let correct = 0;
    paper.questions.forEach(q => {
      if (q.correctAnswer && answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-white mb-2">
          {paper.subject.toUpperCase()} {paper.year} Review
        </h2>
        <p className="text-slate-400">
          Score: {getScore()} / {paper.questions.length}
        </p>
      </div>

      <div className="space-y-4">
        {paper.questions.map((question, index) => (
          <div key={question.id} className="rounded-lg bg-slate-800 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">Question {index + 1}</h3>
              <span className="text-sm text-slate-400">{question.marks} marks</span>
            </div>
            <p className="text-white mb-2">{question.text}</p>

            {question.options && (
              <div className="mb-2">
                <p className="text-green-400">Correct: {question.correctAnswer}</p>
                <p className="text-blue-400">Your answer: {answers[question.id] || 'Not answered'}</p>
              </div>
            )}

            {question.markingGuide && (
              <div className="mb-2">
                <p className="text-yellow-400 font-medium">Marking Guide:</p>
                <p className="text-slate-300">{question.markingGuide}</p>
              </div>
            )}

            <div className="text-sm text-slate-400">
              Topic: {question.topic}
            </div>

            <button
              onClick={() => onRetry(question.id)}
              className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Retry This Question
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}