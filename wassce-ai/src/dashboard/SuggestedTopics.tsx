import StatusChip from "../components/UI/StatusChip";
import { type SuggestedTopic } from "../utils/api";

interface SuggestedTopicsProps {
  suggestions: SuggestedTopic[];
  maxItems?: number;
  variant?: "full" | "compact";
}

interface StatusChipProps {
  label: string;
  variant?: "primary" | "accent" | "muted";
}

const priorityMap: Record<SuggestedTopic["priority"], StatusChipProps["variant"]> = {
  High: "primary",
  Medium: "accent",
  Low: "muted",
};

const SuggestedTopics = ({ suggestions, maxItems, variant = "full" }: SuggestedTopicsProps) => {
  const visible = typeof maxItems === "number" ? suggestions.slice(0, maxItems) : suggestions;
  const wrapperClass =
    variant === "compact"
      ? "rounded-2xl border border-slate-200 bg-white/80 p-4"
      : "rounded-3xl border border-slate-200 bg-white/80 p-6";
  const titleClass = variant === "compact" ? "text-base font-semibold text-slate-900" : "text-lg font-semibold text-slate-900";
  return (
    <section className={wrapperClass}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className={titleClass}>Suggested topics</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Priority</span>
      </div>
      <div className="space-y-4">
        {visible.map((topic) => (
          <div key={topic.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
              <StatusChip label={topic.priority} variant={priorityMap[topic.priority]} />
            </div>
            <p className="text-sm text-slate-600">{topic.rationale}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuggestedTopics;
