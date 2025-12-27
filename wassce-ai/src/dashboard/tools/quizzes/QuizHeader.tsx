import { GraduationCap, Timer } from "lucide-react";
import type { ReactNode } from "react";
import { formatHms, formatSubjectLabel } from "./quizTypes";
import type { Subject } from "../../../types/domain";

interface QuizHeaderProps {
  subject: Subject;
  timerMs: number | null;
  studentId: string;
  rightAction: ReactNode;
  centerNode?: ReactNode;
  isFinished: boolean;
}

export default function QuizHeader({ subject, timerMs, studentId, rightAction, centerNode, isFinished }: QuizHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">WASSCE Prep {new Date().getFullYear()}</p>
          <p className="text-xs text-slate-500">{formatSubjectLabel(subject)}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {centerNode ??
          (!isFinished ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-mono text-sm text-slate-900">
              <Timer className="h-4 w-4 text-indigo-600" />
              {formatHms(timerMs ?? 0)}
            </div>
          ) : null)}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-slate-500">Student ID</p>
          <p className="text-sm font-semibold text-slate-900">{studentId}</p>
        </div>
        {rightAction}
      </div>
    </header>
  );
}

