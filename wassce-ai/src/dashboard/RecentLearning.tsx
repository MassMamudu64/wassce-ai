import { type RecentLearning as LearningEntry } from "../utils/api";

interface RecentLearningProps {
  items: LearningEntry[];
  maxItems?: number;
  variant?: "full" | "compact";
}

const RecentLearning = ({ items, maxItems, variant = "full" }: RecentLearningProps) => {
  const visible = typeof maxItems === "number" ? items.slice(0, maxItems) : items;
  const wrapperClass =
    variant === "compact" ? "rounded-2xl border border-slate-800 bg-slate-950/40 p-4" : "rounded-3xl border border-slate-800 bg-slate-900/60 p-6";
  const titleClass = variant === "compact" ? "text-base font-semibold text-white" : "text-lg font-semibold text-white";
  return (
    <section className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={titleClass}>Recent learning</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Timeline</span>
      </div>
      <div className="space-y-4">
        {visible.map((entry) => (
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
