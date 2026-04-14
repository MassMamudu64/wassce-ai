import { useMemo } from "react";
import { Link } from "react-router-dom";
import type { StudyStat } from "../types/domain";
import type { StudySession } from "../types/profile";
import { subjectLabel } from "../utils/subjects";
import { AlertTriangle, BookOpen, RefreshCcw, Zap } from "lucide-react";

interface WeaknessDetectionProps {
  studyStats: StudyStat[];
  studySessions: StudySession[];
  subjects: string[];
}

type WeaknessInsight = {
  subject: string;
  topic?: string;
  accuracy?: number;
  reasons: string[];
  actions: { label: string; to: string; icon: typeof RefreshCcw }[];
};

const WeaknessDetection = ({ studyStats, studySessions, subjects }: WeaknessDetectionProps) => {
  const recentReviewCounts = useMemo(() => {
    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - 7);
    const counts = new Map<string, number>();

    studySessions.forEach((session) => {
      const sessionDate = new Date(session.date);
      if (session.completed && session.kind === "review" && sessionDate >= windowStart) {
        const key = session.topic || session.subject;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    });

    return counts;
  }, [studySessions]);

  const weaknesses = useMemo<WeaknessInsight[]>(() => {
    const insights: WeaknessInsight[] = [];

    studyStats.forEach((stat) => {
      const reasons: string[] = [];
      if (stat.accuracy < 70) {
        reasons.push(`Low accuracy: ${stat.accuracy}% (${stat.attempts} attempts)`);
      }
      const topicKey = stat.topic || stat.subject;
      const reviewCount = recentReviewCounts.get(topicKey) ?? 0;
      if (reviewCount < 1) {
        reasons.push("No reviews logged this week");
      }

      if (reasons.length) {
        insights.push({
          subject: stat.subject,
          topic: stat.topic,
          accuracy: stat.accuracy,
          reasons,
          actions: [
            { label: "Practice in planner", to: "/dashboard/planner", icon: RefreshCcw },
            { label: "Flashcard refresh", to: "/dashboard/tools/flashcards", icon: Zap },
            { label: "Try past papers", to: "/dashboard/past-papers", icon: BookOpen },
          ],
        });
      }
    });

    // Sort by accuracy ascending (weakest first)
    insights.sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

    return insights;
  }, [recentReviewCounts, studyStats]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Weakness detection</p>
          </div>
          <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">Confidence gaps</h3>
          <p className="text-xs text-slate-500">Tracking {subjects.length} subjects</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      {weaknesses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          Not enough quiz or review data yet. Log quiz scores and complete sessions to unlock targeted recommendations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {weaknesses.map((weakness, index) => (
            <div
              key={`${weakness.subject}-${weakness.topic ?? index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {subjectLabel(weakness.subject)}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {weakness.topic || "General"}
                  </p>
                </div>
                {weakness.accuracy != null && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    weakness.accuracy < 40
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-400"
                  }`}>
                    {weakness.accuracy}%
                  </span>
                )}
              </div>

              <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {weakness.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {reason}
                  </li>
                ))}
              </ul>

              {/* Clickable action buttons */}
              <div className="mt-3 flex flex-wrap gap-2">
                {weakness.actions.map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                  >
                    <action.icon className="h-3 w-3" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WeaknessDetection;
