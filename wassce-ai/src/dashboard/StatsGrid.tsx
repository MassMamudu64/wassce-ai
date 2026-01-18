import { type LearningStat } from "../utils/api";

interface StatsGridProps {
  stats: LearningStat[];
  layout?: "inline" | "stacked";
}

const StatsGrid = ({ stats, layout = "inline" }: StatsGridProps) => {
  const gridClass = layout === "stacked" ? "grid-cols-1" : "md:grid-cols-3";
  return (
    <section className={`grid gap-4 ${gridClass}`} aria-label="learning metrics">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]"
        >
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">{stat.label}</p>
          <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
          <p className="text-sm text-slate-600">{stat.trend}</p>
          {stat.helper && <p className="text-xs text-emerald-700">{stat.helper}</p>}
        </div>
      ))}
    </section>
  );
};

export default StatsGrid;
