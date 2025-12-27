import { type ComponentType } from "react";
import { type LearningTool } from "../utils/api";
import Flashcards from "./tools/Flashcards";
import Quizzes from "./tools/Quizzes";
import Notes from "./tools/Notes";
import Whiteboard from "./tools/Whiteboard";
import Calculator from "./tools/Calculator";
import AIChat from "./tools/AIChat";
import FunBreak from "./tools/FunBreak";

interface ToolPanelProps {
  tool: LearningTool;
}

const toolComponents: Record<string, ComponentType> = {
  flashcards: Flashcards,
  quizzes: Quizzes,
  notes: Notes,
  whiteboard: Whiteboard,
  calculator: Calculator,
  aichat: AIChat,
  funbreak: FunBreak,
};

const ToolPanel = ({ tool }: ToolPanelProps) => {
  const ToolComponent = toolComponents[tool.id];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{tool.label}</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-400">{tool.status}</span>
      </div>
      <p className="text-sm text-slate-400">{tool.detail}</p>
      <div className="mt-5">
        {ToolComponent ? <ToolComponent /> : null}
      </div>
    </div>
  );
};

export default ToolPanel;
