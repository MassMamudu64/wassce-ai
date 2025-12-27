import { useCallback, useEffect, useMemo, useState } from "react";
import FunBreakMenu from "./FunBreakMenu";
import FunBreakGame from "./FunBreakGame";
import type { GameType } from "../../types/domain";
import { useLearningStore } from "../../stores/learningStore";

const FOCUS_LENGTH = 25 * 60;
const BREAK_LENGTH = 5 * 60;

const formatTime = (seconds: number) => {
  const mins = Math.max(0, Math.floor(seconds / 60));
  const secs = Math.max(0, seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function FunBreak() {
  const { studySessions } = useLearningStore();

  const [gameStarted, setGameStarted] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameType | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  const [pomodoroMode, setPomodoroMode] = useState<"focus" | "break">("focus");
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(FOCUS_LENGTH);
  const [reminder, setReminder] = useState<string | null>(null);

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return;

    const timer = setTimeout(() => setTimeLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameStarted, timeLeft]);

  useEffect(() => {
    if (!pomodoroRunning) return;
    const ticker = setInterval(() => setPomodoroTimeLeft((value) => value - 1), 1000);
    return () => clearInterval(ticker);
  }, [pomodoroRunning]);

  useEffect(() => {
    if (pomodoroTimeLeft > 0) return;
    if (pomodoroMode === "focus") {
      setReminder("Break time! Step away for 5 minutes.");
      setPomodoroMode("break");
      setPomodoroTimeLeft(BREAK_LENGTH);
      setPomodoroRunning(false);
    } else {
      setReminder("Focus block ready. Start a new 25-minute sprint.");
      setPomodoroMode("focus");
      setPomodoroTimeLeft(FOCUS_LENGTH);
      setPomodoroRunning(false);
    }
  }, [pomodoroMode, pomodoroTimeLeft]);

  const startGame = useCallback((game: GameType) => {
    setCurrentGame(game);
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
  }, []);

  const endGame = () => {
    setGameStarted(false);
    setCurrentGame(null);
  };

  const today = new Date().toDateString();
  const todaySessions = useMemo(
    () => studySessions.filter((session) => new Date(session.date).toDateString() === today),
    [studySessions, today],
  );

  const burnoutMinutes = todaySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const longBlocks = todaySessions.filter((session) => session.durationMinutes >= 120).length;
  const burnoutSignal = burnoutMinutes >= 240 || longBlocks > 0;

  const breakReminder =
    pomodoroMode === "focus" && pomodoroRunning && pomodoroTimeLeft <= 60
      ? "Wrap up, auto-break starts in under a minute."
      : reminder;

  const resetPomodoro = () => {
    setPomodoroMode("focus");
    setPomodoroTimeLeft(FOCUS_LENGTH);
    setPomodoroRunning(false);
    setReminder(null);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-rose-500/10 to-rose-500/30 p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Pomodoro</p>
          <p className="text-3xl font-semibold text-white">{formatTime(pomodoroTimeLeft)}</p>
          <p className="text-xs text-slate-300">Mode: {pomodoroMode === "focus" ? "Focus" : "Break"}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPomodoroRunning((running) => !running)}
              className="rounded bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              {pomodoroRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={resetPomodoro}
              className="rounded bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Break reminders</p>
          <p className="text-sm text-slate-100">
            {breakReminder || "Auto-reminders keep you pacing focus and rest."}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${burnoutSignal ? "border-amber-400/60 bg-amber-400/10" : "border-white/10 bg-slate-900/40"}`}>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Burnout check</p>
          <p className="text-sm text-slate-100">
            {burnoutSignal
              ? `High load today (${burnoutMinutes} min). Add a break now.`
              : "Pacing looks healthy. Keep taking short breaks."}
          </p>
        </div>
      </div>

      {!gameStarted || !currentGame ? (
        <FunBreakMenu score={score} onStart={startGame} />
      ) : (
        <FunBreakGame game={currentGame} score={score} setScore={setScore} timeLeft={timeLeft} onEnd={endGame} />
      )}
    </div>
  );
}
