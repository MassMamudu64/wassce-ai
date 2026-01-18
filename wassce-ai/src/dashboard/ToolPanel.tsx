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
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_36px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">{tool.label}</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{tool.status}</span>
      </div>
      <p className="text-sm text-slate-600">{tool.detail}</p>
      <div className="mt-5">{ToolComponent ? <ToolComponent /> : null}</div>
    </div>
  );
};

export default ToolPanel;
