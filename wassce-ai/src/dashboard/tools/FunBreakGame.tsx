import { useState, useEffect } from "react"
import type { GameType } from "../../types/domain"

interface Props {
  game: GameType
  score: number
  setScore: React.Dispatch<React.SetStateAction<number>>
  timeLeft: number
  onEnd: () => void
}

export default function FunBreakGame({
  game,
  score,
  setScore,
  timeLeft,
  onEnd,
}: Props) {
  /* MEMORY */
  const [cards, setCards] = useState<number[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])

  /* MATH */
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [solution, setSolution] = useState(0)

  /* WORD */
  const [prompt, setPrompt] = useState("")
  const [input, setInput] = useState("")

  const generateMath = () => {
    const a = Math.floor(Math.random() * 20) + 1
    const b = Math.floor(Math.random() * 20) + 1
    const ops = ["+", "-", "*"]
    const op = ops[Math.floor(Math.random() * ops.length)]

    const sol =
      op === "+" ? a + b : op === "-" ? a - b : a * b

    setQuestion(`${a} ${op} ${b}`)
    setSolution(sol)
    setAnswer("")
    setCorrect(null)
  }

  useEffect(() => {
    if (game === "memory") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCards([1,1,2,2,3,3,4,4].sort(() => Math.random() - 0.5))
      setFlipped([])
      setMatched([])
    }

    if (game === "math") generateMath()

    if (game === "word") {
      const prompts = [
        "Name 5 animals that live in water",
        "List 3 African countries",
        "Name 4 programming languages",
      ]
      setPrompt(prompts[Math.floor(Math.random() * prompts.length)])
    }
  }, [game])

  /* UI */
  return (
    <>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white capitalize">{game}</h3>
        <div className="text-rose-300">{timeLeft}s • Score {score}</div>
      </div>

      {game === "memory" && (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((c, i) => (
            <button
              key={i}
              onClick={() => {
                if (flipped.length === 2 || flipped.includes(i)) return
                const nf = [...flipped, i]
                setFlipped(nf)

                if (nf.length === 2 && cards[nf[0]] === cards[nf[1]]) {
                  setMatched([...matched, c])
                  setScore(s => s + 10)
                }
                setTimeout(() => setFlipped([]), 800)
              }}
              className="aspect-square rounded bg-slate-700 text-white"
            >
              {flipped.includes(i) || matched.includes(c) ? c : "?"}
            </button>
          ))}
        </div>
      )}

      {game === "math" && (
        <>
          <div className="text-center text-xl">{question}</div>
          <input
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full rounded bg-slate-700 p-2 text-center"
          />
          <button
            onClick={() => {
              const ok = parseInt(answer) === solution
              setCorrect(ok)
              if (ok) {
                setScore(s => s + 10)
                setTimeout(generateMath, 1000)
              }
            }}
            className="btn"
          >
            Submit
          </button>
          {correct !== null && (
            <p className={correct ? "text-green-400" : "text-red-400"}>
              {correct ? "Correct!" : "Wrong!"}
            </p>
          )}
        </>
      )}

      {game === "word" && (
        <>
          <p>{prompt}</p>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full rounded bg-slate-700 p-2"
          />
          <button
            onClick={() => {
              if (!input.trim()) return
              setScore(s => s + 5)
              setInput("")
            }}
            className="btn"
          >
            Submit
          </button>
        </>
      )}

      <button onClick={onEnd} className="w-full border border-slate-600 py-2">
        End Break
      </button>
    </>
  )
}
