import { type LearningTool } from "../utils/api";

interface ToolTabsProps {
  tools: LearningTool[];
  activeTool: string;
  onSelect: (id: string) => void;
}

const ToolTabs = ({ tools, activeTool, onSelect }: ToolTabsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelect(tool.id)}
          type="button"
          aria-label={tool.label}
          className={`rounded-2xl border px-4 py-2 text-left text-sm font-semibold transition ${
            tool.id === activeTool
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tool.hint}</p>
          <p className="text-base text-slate-900">{tool.label}</p>
        </button>
      ))}
    </div>
  );
};

export default ToolTabs;
