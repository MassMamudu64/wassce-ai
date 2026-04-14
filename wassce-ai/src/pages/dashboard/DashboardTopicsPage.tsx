import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLearningStore } from "../../stores/learningStore";
import {
  useTopicMastery,
  useSubjectSummaries,
  useDueTopicsCount,
  type TopicMastery,
} from "../../stores/learningSelectors";
import { subjectLabel } from "../../utils/subjects";
import { BookOpen, ChevronDown, ChevronUp, Clock, Target } from "lucide-react";

type FilterStatus = TopicMastery["status"] | "due" | "all";

const STATUS_COLORS: Record<TopicMastery["status"], { bg: string; text: string; border: string }> = {
  weak: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-900" },
  medium: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-900" },
  strong: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-900" },
  untested: { bg: "bg-slate-50 dark:bg-slate-800", text: "text-slate-500 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700" },
};

const STATUS_LABELS: Record<TopicMastery["status"], string> = {
  weak: "Weak",
  medium: "Medium",
  strong: "Strong",
  untested: "Untested",
};

export default function DashboardTopicsPage() {
  const { studentProfile } = useLearningStore();
  const topicMastery = useTopicMastery();
  const subjectSummaries = useSubjectSummaries();
  const dueTopicsCount = useDueTopicsCount();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    subjectSummaries.length > 0 ? subjectSummaries[0].subject : null,
  );
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const topicsBySubject = useMemo(() => {
    const map = new Map<string, TopicMastery[]>();
    for (const t of topicMastery) {
      const list = map.get(t.subject) ?? [];
      list.push(t);
      map.set(t.subject, list);
    }
    return map;
  }, [topicMastery]);

  const filteredTopicsBySubject = useMemo(() => {
    const map = new Map<string, TopicMastery[]>();
    for (const [subject, topics] of topicsBySubject) {
      const filtered =
        filterStatus === "all"
          ? topics
          : filterStatus === "due"
            ? topics.filter((t) => t.isDue)
            : topics.filter((t) => t.status === filterStatus);
      if (filtered.length > 0) map.set(subject, filtered);
    }
    return map;
  }, [topicsBySubject, filterStatus]);

  // Overall stats
  const totalTopics = topicMastery.length;
  const weakCount = topicMastery.filter((t) => t.status === "weak").length;
  const mediumCount = topicMastery.filter((t) => t.status === "medium").length;
  const strongCount = topicMastery.filter((t) => t.status === "strong").length;
  const untestedCount = topicMastery.filter((t) => t.status === "untested").length;
  const dueCount = topicMastery.filter((t) => t.isDue).length;

  if (!studentProfile) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Topics</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Knowledge map</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Set up your profile first to see your topic mastery breakdown.</p>
        <Link to="/dashboard/overview" className="mt-4 inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300">
          Go to setup
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Knowledge map</p>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">Topic mastery</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Click any topic to practice it. Mastery decays over time — review topics regularly to keep them strong.
        </p>
      </header>

      {/* Mastery Overview Heatmap */}
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Overview</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{totalTopics} topics across {subjectSummaries.length} subjects</h2>
          </div>
        </div>

        {/* Status distribution bar */}
        {totalTopics > 0 && (
          <div className="mt-4">
            <div className="flex h-4 overflow-hidden rounded-full">
              {strongCount > 0 && (
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(strongCount / totalTopics) * 100}%` }}
                  title={`${strongCount} strong`}
                />
              )}
              {mediumCount > 0 && (
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${(mediumCount / totalTopics) * 100}%` }}
                  title={`${mediumCount} medium`}
                />
              )}
              {weakCount > 0 && (
                <div
                  className="bg-rose-500 transition-all"
                  style={{ width: `${(weakCount / totalTopics) * 100}%` }}
                  title={`${weakCount} weak`}
                />
              )}
              {untestedCount > 0 && (
                <div
                  className="bg-slate-300 dark:bg-slate-600 transition-all"
                  style={{ width: `${(untestedCount / totalTopics) * 100}%` }}
                  title={`${untestedCount} untested`}
                />
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {strongCount} strong</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> {mediumCount} medium</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> {weakCount} weak</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> {untestedCount} untested</span>
            </div>
          </div>
        )}
      </section>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        {(["all", "due", "weak", "medium", "strong", "untested"] as const).map((status) => {
          const count =
            status === "all" ? totalTopics
            : status === "due" ? dueCount
            : topicMastery.filter((t) => t.status === status).length;
          const isActive = filterStatus === status;
          const isDueFilter = status === "due";
          return (
            <button
              key={status}
              type="button"
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                isActive
                  ? isDueFilter
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : isDueFilter && count > 0
                    ? "border-rose-200 text-rose-600 hover:border-rose-300 dark:border-rose-800 dark:text-rose-400"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {status === "all" ? `All (${count})`
                : status === "due" ? `Due (${count})`
                : `${STATUS_LABELS[status]} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Subject Accordion */}
      {subjectSummaries.map((summary) => {
        const topics = filteredTopicsBySubject.get(summary.subject);
        if (!topics || topics.length === 0) return null;
        const isExpanded = expandedSubject === summary.subject;

        return (
          <section key={summary.subject} className="rounded-3xl border border-slate-200 bg-white/80 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
            {/* Subject Header */}
            <button
              type="button"
              onClick={() => setExpandedSubject(isExpanded ? null : summary.subject)}
              className="flex w-full items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12">
                  <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                      strokeDasharray={`${(summary.accuracy / 100) * 125.6} 125.6`}
                      strokeLinecap="round"
                      className={summary.accuracy >= 75 ? "text-emerald-500" : summary.accuracy >= 50 ? "text-amber-500" : "text-rose-500"}
                      stroke="currentColor"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-900 dark:text-white">
                    {summary.accuracy > 0 ? `${summary.accuracy}%` : "--"}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{summary.label}</h3>
                  <p className="text-xs text-slate-500">
                    {summary.topicCount} topics | {summary.masteredCount} mastered | {summary.weakCount} weak
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {/* Topic List */}
            {isExpanded && (
              <div className="border-t border-slate-200 px-6 pb-6 dark:border-slate-700">
                <div className="mt-4 space-y-2">
                  {topics.map((topic) => {
                    const colors = STATUS_COLORS[topic.status];
                    return (
                      <div
                        key={`${topic.subject}-${topic.topic}`}
                        className={`rounded-2xl border p-4 ${colors.border} ${colors.bg}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{topic.topic}</p>
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${colors.text} ${colors.bg}`}>
                                {STATUS_LABELS[topic.status]}
                              </span>
                              {topic.isDue && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-700 dark:bg-rose-900/60 dark:text-rose-400">
                                  <Clock className="h-2.5 w-2.5" />
                                  Due
                                </span>
                              )}
                              {topic.isDecaying && !topic.isDue && (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:bg-amber-900/60 dark:text-amber-400">
                                  Decaying
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                              <span>Mastery: {topic.attempts > 0 ? `${topic.accuracy}%` : "--"}</span>
                              <span>Attempts: {topic.attempts}</span>
                              {topic.lastPracticed && (
                                <span>Last: {topic.lastPracticed}</span>
                              )}
                              {topic.daysUntilReview != null && topic.attempts > 0 && (
                                <span className={topic.daysUntilReview <= 0 ? "text-rose-600 dark:text-rose-400" : ""}>
                                  {topic.daysUntilReview <= 0
                                    ? `Overdue by ${Math.abs(topic.daysUntilReview)}d`
                                    : `Review in ${topic.daysUntilReview}d`}
                                </span>
                              )}
                            </div>
                            {/* Mastery bar */}
                            {topic.attempts > 0 && (
                              <div className="mt-2 h-1.5 w-full max-w-xs rounded-full bg-slate-200 dark:bg-slate-700">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    topic.accuracy >= 70 ? "bg-emerald-500" : topic.accuracy >= 40 ? "bg-amber-500" : "bg-rose-500"
                                  }`}
                                  style={{ width: `${topic.accuracy}%` }}
                                />
                              </div>
                            )}
                          </div>
                          <Link
                            to="/dashboard/planner"
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${
                              topic.isDue
                                ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-400"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            }`}
                          >
                            <Target className="h-3.5 w-3.5" />
                            {topic.isDue ? "Review" : "Practice"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}

      {/* Empty state */}
      {filteredTopicsBySubject.size === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
          <p className="text-sm text-slate-500">No topics match the selected filter.</p>
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Show all topics
          </button>
        </div>
      )}
    </div>
  );
}
