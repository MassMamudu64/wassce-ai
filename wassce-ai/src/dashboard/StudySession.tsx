import { useMemo, useState } from "react";
import type { StudySession as PlannedSession } from "../types/profile";

interface StudySessionProps {
  sessions: PlannedSession[];
  subjects: string[];
  examDate?: string;
}

type SessionStatus = "completed" | "upcoming" | "missed";

const StudySession = ({ sessions, subjects, examDate }: StudySessionProps) => {
  const [activeSubject, setActiveSubject] = useState(subjects[0] ?? "");

  const effectiveSubject = subjects.includes(activeSubject) ? activeSubject : subjects[0] ?? "";

  const startOfToday = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const subjectSessions = useMemo(() => {
    return sessions
      .filter((session) => !effectiveSubject || session.subject === effectiveSubject)
      .map((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        const status: SessionStatus = session.completed ? "completed" : sessionDate < startOfToday ? "missed" : "upcoming";
        return { ...session, status };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [effectiveSubject, sessions, startOfToday]);

  const missedCount = subjectSessions.filter((session) => session.status === "missed").length;
  const upcomingCount = subjectSessions.filter((session) => session.status === "upcoming").length;
  const completedMinutes = subjectSessions
    .filter((session) => session.completed)
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  const examCountdown = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(examDate);
    const diff = target.getTime() - startOfToday.getTime();
    return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [examDate, startOfToday]);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" id="study">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Study sessions</h3>
          <p className="text-xs text-slate-500">Subject-based plan with catch-up tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setActiveSubject(subject)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${
                effectiveSubject === subject
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Upcoming</p>
          <p className="text-2xl font-semibold text-slate-900">{upcomingCount}</p>
          <p className="text-xs text-slate-500">Scheduled blocks</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Missed</p>
          <p className="text-2xl font-semibold text-amber-700">{missedCount}</p>
          <p className="text-xs text-slate-500">Reschedule to stay on track</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Completed</p>
          <p className="text-2xl font-semibold text-emerald-700">{completedMinutes} min</p>
          <p className="text-xs text-slate-500">For {effectiveSubject || "all subjects"}</p>
        </div>
      </div>

      {examCountdown !== null && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          {examCountdown} days left until exam. Prioritize weak topics now.
        </div>
      )}

      <div className="space-y-3">
        {subjectSessions.length === 0 ? (
          <p className="text-sm text-slate-500">No sessions logged for this subject yet.</p>
        ) : (
          subjectSessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {session.subject}
                    {session.topic ? ` | ${session.topic}` : ""}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600">{session.notes || "No notes added"}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-600">
                      {session.kind || "practice"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                        session.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : session.status === "missed"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Duration</p>
                  <p className="text-lg font-semibold text-slate-900">{session.durationMinutes} min</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default StudySession;
