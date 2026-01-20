import { useState } from "react";
import type { GameType } from "../../types/domain";
import { createMathState, type MathState } from "./funBreakUtils";

interface Props {
  game: GameType;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  timeLeft: number;
  memoryCards: number[];
  wordPrompt: string;
  mathSeed: MathState;
  onEnd: () => void;
}

export default function FunBreakGame({ game, score, setScore, timeLeft, onEnd, memoryCards, wordPrompt, mathSeed }: Props) {
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  const [question, setQuestion] = useState(mathSeed.question);
  const [answer, setAnswer] = useState("");
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [solution, setSolution] = useState(mathSeed.solution);
  const [input, setInput] = useState("");

  const generateMath = () => {
    const next = createMathState();
    setQuestion(next.question);
    setSolution(next.solution);
    setAnswer("");
    setCorrect(null);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 capitalize">{game}</h3>
        <div className="text-sm text-emerald-700">
          {timeLeft}s | Score {score}
        </div>
      </div>

      {game === "memory" && (
        <div className="grid grid-cols-4 gap-2">
          {memoryCards.map((card, index) => (
            <button
              key={`${card}-${index}`}
              onClick={() => {
                if (flipped.length === 2 || flipped.includes(index)) return;
                const nextFlipped = [...flipped, index];
                setFlipped(nextFlipped);

                if (nextFlipped.length === 2 && memoryCards[nextFlipped[0]] === memoryCards[nextFlipped[1]]) {
                  setMatched([...matched, card]);
                  setScore((value) => value + 10);
                }
                setTimeout(() => setFlipped([]), 800);
              }}
              className="aspect-square rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700"
            >
              {flipped.includes(index) || matched.includes(card) ? card : "?"}
            </button>
          ))}
        </div>
      )}

      {game === "math" && (
        <>
          <div className="text-center text-xl text-slate-900">{question}</div>
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-center text-slate-700"
          />
          <button
            onClick={() => {
              const ok = parseInt(answer, 10) === solution;
              setCorrect(ok);
              if (ok) {
                setScore((value) => value + 10);
                setTimeout(generateMath, 1000);
              }
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Submit
          </button>
          {correct !== null && (
            <p className={correct ? "text-emerald-700" : "text-rose-600"}>{correct ? "Correct!" : "Wrong!"}</p>
          )}
        </>
      )}

      {game === "word" && (
        <>
          <p className="text-slate-700">{wordPrompt}</p>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
          />
          <button
            onClick={() => {
              if (!input.trim()) return;
              setScore((value) => value + 5);
              setInput("");
            }}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Submit
          </button>
        </>
      )}

      <button onClick={onEnd} className="w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-600 hover:border-slate-300">
        End break
      </button>
    </>
  );
}
