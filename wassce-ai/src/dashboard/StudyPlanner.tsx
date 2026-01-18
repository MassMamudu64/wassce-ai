import { useState } from "react";
import { useLearningStore } from "../stores/learningStore";
import type { StudySession } from "../types/profile";

export default function StudyPlanner() {
  const { studentProfile, studySessions, addStudySession, updateStudySession } = useLearningStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [newSession, setNewSession] = useState({
    subject: studentProfile?.subjects[0] || "",
    durationMinutes: 30,
    topic: "",
    notes: "",
    kind: "practice" as StudySession["kind"],
  });

  if (!studentProfile) return null;

  const sessionsForDate = studySessions.filter((session) => session.date === selectedDate);

  const handleAddSession = () => {
    if (!newSession.subject) return;
    const session: StudySession = {
      id: `session-${Date.now()}`,
      subject: newSession.subject,
      durationMinutes: newSession.durationMinutes,
      completed: false,
      date: selectedDate,
      notes: newSession.notes,
      topic: newSession.topic,
      kind: newSession.kind,
    };
    addStudySession(session);
    setNewSession({
      subject: studentProfile.subjects[0],
      durationMinutes: 30,
      topic: "",
      notes: "",
      kind: "practice",
    });
  };

  const toggleComplete = (id: string, completed: boolean) => {
    updateStudySession(id, { completed });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Study planner</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Add session</h3>
          <select
            value={newSession.subject}
            onChange={(event) => setNewSession({ ...newSession, subject: event.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700"
          >
            {studentProfile.subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newSession.topic}
            onChange={(event) => setNewSession({ ...newSession, topic: event.target.value })}
            placeholder="Topic or chapter (optional)"
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700"
          />
          <input
            type="number"
            value={newSession.durationMinutes}
            onChange={(event) => setNewSession({ ...newSession, durationMinutes: Number(event.target.value) })}
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700"
            min="15"
            max="180"
          />
          <select
            value={newSession.kind}
            onChange={(event) =>
              setNewSession({ ...newSession, kind: event.target.value as StudySession["kind"] })
            }
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700"
          >
            <option value="practice">Practice</option>
            <option value="review">Review</option>
            <option value="flashcards">Flashcards</option>
            <option value="past_paper">Past paper</option>
            <option value="quiz">Quiz</option>
          </select>
          <textarea
            value={newSession.notes}
            onChange={(event) => setNewSession({ ...newSession, notes: event.target.value })}
            placeholder="Session notes..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700"
            rows={3}
          />
          <button onClick={handleAddSession} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm text-white">
            Add session
          </button>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Sessions for this date</h3>
          {sessionsForDate.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions planned</p>
          ) : (
            sessionsForDate.map((session) => (
              <div key={session.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{session.subject}</p>
                    <p className="text-sm text-slate-600">{session.durationMinutes} minutes</p>
                    {session.topic && <p className="text-sm text-slate-600">{session.topic}</p>}
                    {session.notes && <p className="text-sm text-slate-500">{session.notes}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {session.kind && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-600">
                          {session.kind}
                        </span>
                      )}
                      {session.missed && (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-700">
                          Missed
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={session.completed}
                      onChange={(event) => toggleComplete(session.id, event.target.checked)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    Done
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
