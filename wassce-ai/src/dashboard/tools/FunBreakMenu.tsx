import type { GameType } from "../../types/domain"

interface Props {
  score: number
  onStart: (game: GameType) => void
}

export default function FunBreakMenu({ score, onStart }: Props) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Brain Recharge</p>
          <h3 className="text-lg font-semibold text-white">Fun Break Games</h3>
        </div>
        <div className="text-sm text-rose-300">Score: {score}</div>
      </div>

      <p className="text-sm text-slate-200">
        Take a quick 30-second break with fun games to reset your focus!
      </p>

      <div className="grid gap-3">
        <button onClick={() => onStart("memory")} className="fun-btn">
          <strong>Memory Match</strong>
          <span>Flip cards to find pairs</span>
        </button>

        <button onClick={() => onStart("math")} className="fun-btn">
          <strong>Quick Math</strong>
          <span>Solve fast math problems</span>
        </button>

        <button onClick={() => onStart("word")} className="fun-btn">
          <strong>Word Challenge</strong>
          <span>Brainstorm words quickly</span>
        </button>
      </div>
    </>
  )
}
