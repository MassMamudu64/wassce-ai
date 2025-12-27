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
              ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
              : "border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tool.hint}</p>
          <p className="text-base text-white">{tool.label}</p>
        </button>
      ))}
    </div>
  );
};

export default ToolTabs;
