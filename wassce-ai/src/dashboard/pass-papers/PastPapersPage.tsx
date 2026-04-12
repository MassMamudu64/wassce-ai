import { useMemo, useState } from "react";
import { BookOpen, Clock, FlaskConical, GraduationCap, Timer } from "lucide-react";
import type { InteractivePaper, PaperMode } from "../../core/types/passPaper";
import { getAvailableSubjects, getAvailableYears, getAvailablePapers } from "./seedData";
import { useUI } from "../../contexts/UIContext";

interface Props {
  onStart: (paper: InteractivePaper, mode: PaperMode) => void;
}

const subjectLabels: Record<string, string> = {
  math: "Mathematics",
  physics: "Physics",
  chemistry: "Chemistry",
  biology: "Biology",
  english: "English Language",
  integrated_science: "Integrated Science",
  economics: "Economics",
  government: "Government",
};

const subjectIcons: Record<string, typeof BookOpen> = {
  math: GraduationCap,
  physics: Timer,
  chemistry: FlaskConical,
  biology: BookOpen,
};

export default function PastPapersPage({ onStart }: Props) {
  const { theme } = useUI();
  const isDark = theme === "dark";

  const subjects = useMemo(() => getAvailableSubjects(), []);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<PaperMode>("practice");

  const years = useMemo(
    () => (selectedSubject ? getAvailableYears(selectedSubject) : []),
    [selectedSubject],
  );
  const papers = useMemo(
    () =>
      selectedSubject && selectedYear
        ? getAvailablePapers(selectedSubject, selectedYear)
        : [],
    [selectedSubject, selectedYear],
  );

  const handleSubject = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedYear(null);
  };

  const handleYear = (year: number) => {
    setSelectedYear(year);
  };

  return (
    <div className="space-y-6">
      {/* ---- Subject selection ---- */}
      <section>
        <h2 className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Select a subject
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {subjects.map((subject) => {
            const active = selectedSubject === subject;
            const Icon = subjectIcons[subject] ?? BookOpen;
            return (
              <button
                key={subject}
                type="button"
                onClick={() => handleSubject(subject)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-sm font-semibold transition ${
                  active
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : isDark
                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="h-6 w-6" />
                {subjectLabels[subject] ?? subject}
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Year selection ---- */}
      {selectedSubject && years.length > 0 && (
        <section>
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Select year
          </h2>
          <div className="flex flex-wrap gap-3">
            {years.map((year) => {
              const active = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleYear(year)}
                  className={`rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                    active
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : isDark
                        ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ---- Mode selection ---- */}
      {selectedSubject && selectedYear && papers.length > 0 && (
        <section>
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Choose mode
          </h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSelectedMode("practice")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                selectedMode === "practice"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : isDark
                    ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Practice
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode("exam")}
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                selectedMode === "exam"
                  ? "border-rose-600 bg-rose-50 text-rose-700"
                  : isDark
                    ? "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <Clock className="h-4 w-4" />
              Exam
            </button>
          </div>
          <p className={`mt-2 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            {selectedMode === "practice"
              ? "Immediate feedback after each answer. No time limit."
              : "Timed. No feedback until you submit the full paper."}
          </p>
        </section>
      )}

      {/* ---- Paper cards ---- */}
      {selectedSubject && selectedYear && papers.length > 0 && (
        <section>
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-[0.3em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Available papers
          </h2>
          <div className="grid gap-4">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className={`rounded-2xl border p-5 ${isDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {paper.title}
                    </h3>
                    <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {paper.questions.length} questions
                      {" \u00b7 "}
                      {paper.durationMinutes} min
                      {selectedMode === "exam" ? " (timed)" : " (untimed)"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStart(paper, selectedMode)}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Start {selectedMode === "exam" ? "exam" : "practice"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- Empty state ---- */}
      {selectedSubject && selectedYear && papers.length === 0 && (
        <div className={`rounded-2xl border border-dashed p-8 text-center text-sm ${isDark ? "border-slate-700 text-slate-500" : "border-slate-200 text-slate-500"}`}>
          No interactive papers available for this combination yet.
        </div>
      )}
    </div>
  );
}
