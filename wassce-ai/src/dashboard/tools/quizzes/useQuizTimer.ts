import { useEffect, useRef, useState } from "react";

export const useQuizTimer = (running: boolean, endsAtMs: number | null) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }

    if (!running || !endsAtMs) return;

    const update = () => setTimeLeftMs(Math.max(0, endsAtMs - Date.now()));
    update();
    tickRef.current = window.setInterval(update, 1000);

    return () => {
      if (tickRef.current) {
        window.clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [endsAtMs, running]);

  return timeLeftMs;
};

