import { useEffect, useMemo, useState } from "react";
import type { StudySession as PlannedSession } from "../types/profile";

interface StudySessionProps {
  sessions: PlannedSession[];
  subjects: string[];
  examDate?: string;
}

type SessionStatus = "completed" | "upcoming" | "missed";

const StudySession = ({ sessions, subjects, examDate }: StudySessionProps) => {
  const [activeSubject, setActiveSubject] = useState(subjects[0] ?? "");

  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(activeSubject)) {
      setActiveSubject(subjects[0]);
    }
  }, [activeSubject, subjects]);

  const startOfToday = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const subjectSessions = useMemo(() => {
    return sessions
      .filter((session) => !activeSubject || session.subject === activeSubject)
      .map((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        const status: SessionStatus = session.completed ? "completed" : sessionDate < startOfToday ? "missed" : "upcoming";
        return { ...session, status };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeSubject, sessions, startOfToday]);

  const missedCount = subjectSessions.filter((session) => session.status === "missed").length;
  const upcomingCount = subjectSessions.filter((session) => session.status === "upcoming").length;
  const completedMinutes = subjectSessions
    .filter((session) => session.completed)
    .reduce((sum, session) => sum + session.durationMinutes, 0);

  const examCountdown = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(examDate);
    const diff = target.getTime() - Date.now();
    return diff >= 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
  }, [examDate]);

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6" id="study">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Study sessions</h3>
          <p className="text-xs text-slate-400">Subject-based plan with catch-up tracking</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              type="button"
              onClick={() => setActiveSubject(subject)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition ${
                activeSubject === subject
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                  : "border-slate-700 text-slate-400 hover:border-slate-500"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Upcoming</p>
          <p className="text-2xl font-semibold text-white">{upcomingCount}</p>
          <p className="text-xs text-slate-400">Scheduled blocks</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Missed</p>
          <p className="text-2xl font-semibold text-amber-200">{missedCount}</p>
          <p className="text-xs text-slate-400">Reschedule to stay on track</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Completed</p>
          <p className="text-2xl font-semibold text-emerald-200">{completedMinutes} min</p>
          <p className="text-xs text-slate-400">For {activeSubject || "all subjects"}</p>
        </div>
      </div>

      {examCountdown !== null && (
        <div className="mb-4 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 p-4 text-sm text-indigo-100">
          {examCountdown} days left until exam — prioritize weak topics now.
        </div>
      )}

      <div className="space-y-3">
        {subjectSessions.length === 0 ? (
          <p className="text-sm text-slate-400">No sessions logged for this subject yet.</p>
        ) : (
          subjectSessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    {session.subject}
                    {session.topic ? ` • ${session.topic}` : ""}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(session.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-300">{session.notes || "No notes added"}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-slate-200">
                      {session.kind || "practice"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] ${
                        session.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-100"
                          : session.status === "missed"
                            ? "bg-amber-500/20 text-amber-200"
                            : "bg-slate-700 text-slate-200"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Duration</p>
                  <p className="text-lg font-semibold text-white">{session.durationMinutes} min</p>
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
