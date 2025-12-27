import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLearningStore } from "../stores/learningStore";

const availableSubjects = [
  "Mathematics",
  "English Language",
  "Integrated Science",
  "Biology",
  "Chemistry",
  "Physics",
  "Economics",
  "Government",
];

export default function StudentProfileSetup() {
  const { user } = useAuth();
  const { setStudentProfile } = useLearningStore();

  const todayString = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [subjects, setSubjects] = useState<string[]>([]);
  const [examDate, setExamDate] = useState<string>("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(60);
  const [error, setError] = useState<string>("");

  const examYear = useMemo(() => {
    if (!examDate) return new Date().getFullYear() + 1;
    const year = new Date(examDate).getFullYear();
    return Number.isFinite(year) ? year : new Date().getFullYear() + 1;
  }, [examDate]);

  const toggleSubject = (subject: string, checked: boolean) => {
    setSubjects((current) => {
      if (checked) return Array.from(new Set([...current, subject]));
      return current.filter((value) => value !== subject);
    });
  };

  const saveProfile = () => {
    setError("");
    if (!examDate) {
      setError("Select your exam date to enable the countdown and study pacing.");
      return;
    }
    if (subjects.length === 0) {
      setError("Select at least one subject to build your daily workspace.");
      return;
    }

    setStudentProfile({
      id: user?.email ?? "default",
      name: user?.name ?? "Student",
      subjects,
      examYear,
      examDate,
      dailyStudyGoalMinutes: dailyGoalMinutes,
    });
  };

  return (
    <section className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">First time setup</p>
        <h1 className="text-2xl font-semibold text-white">Set up your study profile</h1>
        <p className="text-sm text-slate-400">This creates your exam countdown and daily plan. You can edit it later.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Subjects</p>
          <div className="grid grid-cols-2 gap-2">
            {availableSubjects.map((subject) => (
              <label key={subject} className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={subjects.includes(subject)}
                  onChange={(event) => toggleSubject(subject, event.target.checked)}
                  className="h-4 w-4 accent-emerald-500"
                />
                <span>{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Exam date</label>
            <input
              type="date"
              value={examDate}
              min={todayString}
              onChange={(event) => setExamDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Exam year</label>
              <input
                type="number"
                value={examYear}
                readOnly
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-slate-500">Daily goal (minutes)</label>
              <input
                type="number"
                value={dailyGoalMinutes}
                min={15}
                max={360}
                onChange={(event) => setDailyGoalMinutes(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="button"
            onClick={saveProfile}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white hover:from-indigo-400 hover:to-emerald-400 active:scale-[0.99]"
          >
            Save profile
          </button>
        </div>
      </div>
    </section>
  );
}

