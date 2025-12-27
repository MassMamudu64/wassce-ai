import TopicSpotlight from "../../dashboard/TopicSpotlight";
import TopicsSection from "../../dashboard/TopicsSection";
import SuggestedTopics from "../../dashboard/SuggestedTopics";
import { useLearning } from "../../contexts/LearningContext";

export default function DashboardTopicsPage() {
  const { topics, suggestedTopics } = useLearning();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Topics</p>
        <h1 className="text-2xl font-semibold text-white">Mastery & focus</h1>
        <p className="mt-2 text-sm text-slate-400">Use this view to pick what to study next and why.</p>
      </header>

      <TopicSpotlight topics={topics} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <TopicsSection topics={topics} />
        <SuggestedTopics suggestions={suggestedTopics} />
      </div>
    </div>
  );
}

