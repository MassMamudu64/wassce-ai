import { type RecentLearning as LearningEntry } from "../utils/api";

interface RecentLearningProps {
  items: LearningEntry[];
}

const RecentLearning = ({ items }: RecentLearningProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent learning</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Timeline</span>
      </div>
      <div className="space-y-4">
        {items.map((entry) => (
          <div key={entry.title} className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{entry.title}</p>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{entry.status}</span>
            </div>
            <p className="text-sm text-slate-400">{entry.description}</p>
            <p className="text-xs text-slate-500">{entry.when}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentLearning;
