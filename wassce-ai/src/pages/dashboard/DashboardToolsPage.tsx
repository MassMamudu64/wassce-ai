import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ToolTabs from "../../dashboard/ToolTabs";
import ToolPanel from "../../dashboard/ToolPanel";
import { useLearning } from "../../contexts/LearningContext";

export default function DashboardToolsPage() {
  const { tools, activeTool, selectTool } = useLearning();
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!toolId) return;
    if (tools.some((tool) => tool.id === toolId)) {
      selectTool(toolId);
    }
  }, [selectTool, toolId, tools]);

  const activeToolItem = useMemo(() => tools.find((tool) => tool.id === activeTool) ?? tools[0], [activeTool, tools]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Tools</p>
        <h1 className="text-2xl font-semibold text-slate-900">Study workspace</h1>
        <p className="mt-2 text-sm text-slate-600">Everything here either updates state or produces output you can reuse.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/dashboard/progress" className="text-slate-700 hover:text-slate-900">
            View progress
          </Link>
          <Link to="/dashboard/planner" className="text-slate-700 hover:text-slate-900">
            Plan sessions
          </Link>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Pick a tool</h2>
            <p className="text-sm text-slate-600">{activeToolItem?.hint}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{activeToolItem?.status}</p>
        </div>

        <div className="mt-4">
          <ToolTabs
            tools={tools}
            activeTool={activeTool}
            onSelect={(id) => {
              selectTool(id);
              navigate(`/dashboard/tools/${id}`, { replace: false });
            }}
          />
        </div>

        {activeToolItem && (
          <div className="mt-5">
            <ToolPanel tool={activeToolItem} />
          </div>
        )}
      </section>
    </div>
  );
}
