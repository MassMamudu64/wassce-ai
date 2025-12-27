interface QuizLoadingCardProps {
  subjectLabel: string;
  onBack: () => void;
}

export default function QuizLoadingCard({ subjectLabel, onBack }: QuizLoadingCardProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-indigo-500/30 p-5">
      <h3 className="text-lg font-semibold text-white">Generating AI quiz…</h3>
      <p className="text-sm text-slate-200">Building WASSCE-style questions for {subjectLabel}.</p>
      <button
        type="button"
        onClick={onBack}
        className="rounded-full border border-slate-600 px-4 py-2 text-xs uppercase tracking-[0.4em] text-slate-200 hover:bg-slate-800/40"
      >
        Back
      </button>
    </div>
  );
}

