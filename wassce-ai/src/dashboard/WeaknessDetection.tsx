import { useMemo } from "react";
import type { StudyStat } from "../types/domain";
import type { StudySession } from "../types/profile";

interface WeaknessDetectionProps {
  studyStats: StudyStat[];
  studySessions: StudySession[];
  subjects: string[];
}

type WeaknessInsight = {
  subject: string;
  topic?: string;
  reasons: string[];
  actions: string[];
};

const formatSubject = (subject: string) => subject.replace(/_/g, " ");

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
        reasons.push(`Low quiz score (${stat.accuracy}%)`);
      }
      const topicKey = stat.topic || stat.subject;
      const reviewCount = recentReviewCounts.get(topicKey) ?? 0;
      if (reviewCount < 1) {
        reasons.push("Few reviews logged this week");
      }

      if (reasons.length) {
        insights.push({
          subject: stat.subject,
          topic: stat.topic,
          reasons,
          actions: [
            "Add a 30-minute revision block",
            "Run a flashcard refresh",
            "Attempt a past paper question set",
          ],
        });
      }
    });

    return insights;
  }, [recentReviewCounts, studyStats]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Weakness detection</p>
          <h3 className="text-2xl font-semibold text-white">Confidence & gaps</h3>
          <p className="text-xs text-slate-400">Tracking {subjects.length} subjects</p>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-emerald-300">Live</span>
      </div>

      {weaknesses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
          Not enough quiz or review data yet. Log quiz scores and mark review sessions as completed to unlock targeted recommendations.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {weaknesses.map((weakness, index) => (
            <div key={`${weakness.subject}-${weakness.topic ?? index}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">{formatSubject(weakness.subject)}</p>
                  {weakness.topic && <p className="text-lg font-semibold text-white">{weakness.topic}</p>}
                  {!weakness.topic && <p className="text-lg font-semibold text-white">Topic focus pending</p>}
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase text-amber-200">
                  Action needed
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-slate-300">
                {weakness.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Recommended next steps</p>
                <div className="flex flex-wrap gap-2">
                  {weakness.actions.map((action) => (
                    <span
                      key={action}
                      className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WeaknessDetection;
