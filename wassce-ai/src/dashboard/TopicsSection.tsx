import { type StudyTopic } from "../utils/api";

interface TopicsSectionProps {
  topics: StudyTopic[];
}

const TopicsSection = ({ topics }: TopicsSectionProps) => {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6" id="topics">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Focus topics</h3>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Mastery</span>
      </div>
      <div className="space-y-4">
        {topics.map((topic) => (
          <div key={topic.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{topic.name}</span>
              <span>{topic.mastery}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500"
                style={{ width: `${topic.mastery}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{topic.focus} | Next: {topic.nextStep}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopicsSection;
