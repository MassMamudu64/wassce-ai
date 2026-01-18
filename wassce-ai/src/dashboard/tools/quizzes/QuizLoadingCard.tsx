interface QuizLoadingCardProps {
  subjectLabel: string;
  onBack: () => void;
}

export default function QuizLoadingCard({ subjectLabel, onBack }: QuizLoadingCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="text-lg font-semibold text-slate-900">Generating AI quiz...</h3>
      <p className="text-sm text-slate-600">Building WASSCE-style questions for {subjectLabel}.</p>
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-slate-200 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-600 hover:border-slate-300"
      >
        Back
      </button>
    </div>
  );
}
