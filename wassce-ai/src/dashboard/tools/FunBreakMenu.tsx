import type { GameType } from "../../types/domain";

interface Props {
  score: number;
  onStart: (game: GameType) => void;
}

const menuButtonClass =
  "flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-slate-300";

export default function FunBreakMenu({ score, onStart }: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Brain recharge</p>
          <h3 className="text-lg font-semibold text-slate-900">Fun break games</h3>
        </div>
        <div className="text-sm text-emerald-700">Score: {score}</div>
      </div>

      <p className="text-sm text-slate-600">Take a quick 30-second break with fun games to reset your focus.</p>

      <div className="grid gap-3">
        <button onClick={() => onStart("memory")} className={menuButtonClass}>
          <span>Memory Match</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Pairs</span>
        </button>

        <button onClick={() => onStart("math")} className={menuButtonClass}>
          <span>Quick Math</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Solve fast</span>
        </button>

        <button onClick={() => onStart("word")} className={menuButtonClass}>
          <span>Word Challenge</span>
          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Brainstorm</span>
        </button>
      </div>
    </>
  );
}
