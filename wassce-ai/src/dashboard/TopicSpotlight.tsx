import { useMemo, useState } from "react";
import type { StudyTopic } from "../utils/api";

interface TopicSpotlightProps {
  topics: StudyTopic[];
}

const TopicSpotlight = ({ topics }: TopicSpotlightProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusBoost, setFocusBoost] = useState(2);

  const hasTopics = topics.length > 0;
  const activeTopic = hasTopics ? topics[activeIndex] ?? topics[0] : undefined;
  const nextTopic = hasTopics ? topics[(activeIndex + 1) % topics.length] : undefined;

  const predictedMastery = useMemo(() => {
    if (!activeTopic) {
      return Math.round(focusBoost * 3);
    }
    return Math.min(100, Math.round(activeTopic.mastery + focusBoost * 3));
  }, [activeTopic, focusBoost]);

  const radialStyle = useMemo(() => {
    const mastery = activeTopic?.mastery ?? 0;
    const angle = (mastery / 100) * 360;
    return {
      backgroundImage: `conic-gradient(from -90deg, rgba(16,165,231,0.9) ${angle}deg, rgba(15,23,42,0.9) ${angle}deg)`,
    };
  }, [activeTopic]);

  const boostTone = predictedMastery > (activeTopic?.mastery ?? 0) ? "text-emerald-300" : "text-slate-400";

  if (!hasTopics || !activeTopic) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-950/70 to-slate-900/80 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Topic spotlight</p>
          <h3 className="text-2xl font-bold text-white">Interactive mastery view</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <button
              key={topic.name}
              type="button"
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${
                index === activeIndex
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                  : "border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1fr]">
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full border border-slate-800 bg-slate-950/70" />
            <div className="absolute inset-0 rounded-full" style={radialStyle} />
            <div className="absolute inset-[12%] rounded-full bg-slate-950/90" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-semibold text-white">{activeTopic.mastery}%</p>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">mastery</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Focus boost</p>
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{focusBoost.toFixed(1)}x</span>
          </div>
          <input
            aria-label="Adjust focus boost"
            className="h-1 w-full rounded-full bg-slate-800 accent-indigo-500"
            max={5}
            min={0}
            step={0.5}
            type="range"
            value={focusBoost}
            onChange={(event) => setFocusBoost(Number(event.target.value))}
          />
          <p className={`text-sm ${boostTone}`}>
            Predicted mastery: <strong className="text-white">{predictedMastery}%</strong>
          </p>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Focus</p>
            <p className="text-lg font-semibold text-white">{activeTopic.focus}</p>
            <p className="text-sm text-slate-400">{activeTopic.nextStep}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % topics.length)}
            className="w-full rounded-2xl border border-indigo-500/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300 transition hover:border-indigo-400 hover:text-white"
          >
            Shift focus to {nextTopic?.name ?? activeTopic.name}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopicSpotlight;
