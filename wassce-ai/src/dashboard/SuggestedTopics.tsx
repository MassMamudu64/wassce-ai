import StatusChip from "../components/UI/StatusChip";
import { type SuggestedTopic } from "../utils/api";

interface SuggestedTopicsProps {
  suggestions: SuggestedTopic[];
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

const SuggestedTopics = ({ suggestions }: SuggestedTopicsProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Suggested topics</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Priority</span>
      </div>
      <div className="space-y-4">
        {suggestions.map((topic) => (
          <div key={topic.title} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{topic.title}</p>
              <StatusChip label={topic.priority} variant={priorityMap[topic.priority]} />
            </div>
            <p className="text-sm text-slate-400">{topic.rationale}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SuggestedTopics;
