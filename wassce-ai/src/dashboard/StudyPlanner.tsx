import { useState } from 'react';
import { useLearningStore } from '../stores/learningStore';
import type { StudySession } from '../types/profile';

export default function StudyPlanner() {
  const { studentProfile, studySessions, addStudySession, updateStudySession } = useLearningStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSession, setNewSession] = useState({
    subject: studentProfile?.subjects[0] || '',
    durationMinutes: 30,
    topic: '',
    notes: '',
    kind: "practice" as StudySession["kind"]
  });

  if (!studentProfile) return null;

  const sessionsForDate = studySessions.filter(s => s.date === selectedDate);

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
      kind: newSession.kind
    };
    addStudySession(session);
    setNewSession({
      subject: studentProfile.subjects[0],
      durationMinutes: 30,
      topic: '',
      notes: '',
      kind: 'practice'
    });
  };

  const toggleComplete = (id: string, completed: boolean) => {
    updateStudySession(id, { completed });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Study Planner</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded bg-slate-700 p-2 text-white"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Add Session</h3>
          <select
            value={newSession.subject}
            onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
            className="w-full rounded bg-slate-700 p-2 text-white"
          >
            {studentProfile.subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <input
            type="text"
            value={newSession.topic}
            onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
            placeholder="Topic or chapter (optional)"
            className="w-full rounded bg-slate-700 p-2 text-white"
          />
          <input
            type="number"
            value={newSession.durationMinutes}
            onChange={(e) => setNewSession({ ...newSession, durationMinutes: Number(e.target.value) })}
            className="w-full rounded bg-slate-700 p-2 text-white"
            min="15"
            max="180"
          />
          <select
            value={newSession.kind}
            onChange={(e) => setNewSession({ ...newSession, kind: e.target.value as StudySession["kind"] })}
            className="w-full rounded bg-slate-700 p-2 text-white"
          >
            <option value="practice">Practice</option>
            <option value="review">Review</option>
            <option value="flashcards">Flashcards</option>
            <option value="past_paper">Past paper</option>
            <option value="quiz">Quiz</option>
          </select>
          <textarea
            value={newSession.notes}
            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
            placeholder="Session notes..."
            className="w-full rounded bg-slate-700 p-2 text-white"
            rows={3}
          />
          <button
            onClick={handleAddSession}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Session
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Today's Sessions</h3>
          {sessionsForDate.length === 0 ? (
            <p className="text-slate-400">No sessions planned</p>
          ) : (
            sessionsForDate.map(session => (
              <div key={session.id} className="rounded-lg bg-slate-800 p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{session.subject}</p>
                    <p className="text-sm text-slate-400">{session.durationMinutes} minutes</p>
                    {session.topic && <p className="text-sm text-slate-300">{session.topic}</p>}
                    {session.notes && <p className="text-sm text-slate-300">{session.notes}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {session.kind && (
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-200">
                          {session.kind}
                        </span>
                      )}
                      {session.missed && (
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-amber-200">
                          Missed
                        </span>
                      )}
                    </div>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={session.completed}
                      onChange={(e) => toggleComplete(session.id, e.target.checked)}
                      className="text-green-600"
                    />
                    <span className="text-sm text-slate-300">Done</span>
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
