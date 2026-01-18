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
      backgroundImage: `conic-gradient(from -90deg, rgba(16,185,129,0.9) ${angle}deg, rgba(226,232,240,0.95) ${angle}deg)`,
    };
  }, [activeTopic]);

  const boostTone = predictedMastery > (activeTopic?.mastery ?? 0) ? "text-emerald-700" : "text-slate-500";

  if (!hasTopics || !activeTopic) {
    return null;
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Topic spotlight</p>
          <h3 className="text-2xl font-semibold text-slate-900">Interactive mastery view</h3>
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
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
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
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-slate-50" />
            <div className="absolute inset-0 rounded-full" style={radialStyle} />
            <div className="absolute inset-[12%] rounded-full bg-white" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className="text-4xl font-semibold text-slate-900">{activeTopic.mastery}%</p>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-500">mastery</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Focus boost</p>
            <span className="text-xs uppercase tracking-[0.4em] text-slate-500">{focusBoost.toFixed(1)}x</span>
          </div>
          <input
            aria-label="Adjust focus boost"
            className="h-1 w-full rounded-full bg-slate-200 accent-emerald-600"
            max={5}
            min={0}
            step={0.5}
            type="range"
            value={focusBoost}
            onChange={(event) => setFocusBoost(Number(event.target.value))}
          />
          <p className={`text-sm ${boostTone}`}>
            Predicted mastery: <strong className="text-slate-900">{predictedMastery}%</strong>
          </p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Focus</p>
            <p className="text-lg font-semibold text-slate-900">{activeTopic.focus}</p>
            <p className="text-sm text-slate-600">{activeTopic.nextStep}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % topics.length)}
            className="w-full rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Shift focus to {nextTopic?.name ?? activeTopic.name}
          </button>
        </div>
      </div>
    </section>
  );
};

export default TopicSpotlight;
