import { useEffect, useMemo, useState } from "react";
import { pastPapers } from "./mockData";
import type { PastPaper, PaperType, SourceType } from "../../core/types/passPaper";
import { useAuth } from "../../contexts/AuthContext";
import { deleteUserPastPaper, fetchUserPastPapers, insertUserPastPaper } from "../../utils/supabaseData";

interface Props {
  onSelectPaper: (paper: PastPaper) => void;
}

const paperTypes: PaperType[] = ["objective", "theory", "practical"];
const sourceTypes: SourceType[] = ["examry", "studyforwassce", "passcohub", "waec", "custom"];

export default function PassPaperDataLinks({ onSelectPaper }: Props) {
  const { user } = useAuth();
  const userRef = user?.id ?? user?.email ?? null;
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const [selectedType, setSelectedType] = useState<PaperType | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [customPapers, setCustomPapers] = useState<PastPaper[]>([]);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    year: new Date().getFullYear(),
    paperType: "objective" as PaperType,
    pdfUrl: "",
    source: "custom" as SourceType,
    hasAnswers: false,
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!userRef) {
      Promise.resolve().then(() => setCustomPapers([]));
      return;
    }
    let mounted = true;
    fetchUserPastPapers(userRef)
      .then((papers) => {
        if (!mounted) return;
        setCustomPapers(papers);
      })
      .catch(() => {
        if (!mounted) return;
        setCustomPapers([]);
      });
    return () => {
      mounted = false;
    };
  }, [userRef]);

  const allPapers = useMemo(() => [...customPapers, ...pastPapers], [customPapers]);

  const subjects = useMemo(
    () => Array.from(new Set(allPapers.map((paper) => paper.subject))).sort(),
    [allPapers],
  );
  const years = useMemo(
    () => Array.from(new Set(allPapers.map((paper) => paper.year))).sort((a, b) => b - a),
    [allPapers],
  );
  const customIds = useMemo(() => new Set(customPapers.map((paper) => paper.id)), [customPapers]);

  const filteredPapers = allPapers.filter((paper) => {
    if (selectedSubject !== "all" && paper.subject !== selectedSubject) return false;
    if (selectedType !== "all" && paper.paperType !== selectedType) return false;
    if (selectedYear !== "all" && paper.year !== selectedYear) return false;
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${paper.title} ${paper.subject} ${paper.year} ${paper.paperType} ${paper.source}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const resetForm = () =>
    setForm({
      title: "",
      subject: "",
      year: new Date().getFullYear(),
      paperType: "objective",
      pdfUrl: "",
      source: "custom",
      hasAnswers: false,
    });

  const handleAddPaper = async () => {
    setFormError(null);
    if (!userRef) {
      setFormError("Sign in to add your own PDFs.");
      return;
    }
    const trimmedTitle = form.title.trim();
    const trimmedSubject = form.subject.trim();
    const trimmedUrl = form.pdfUrl.trim();
    const yearValue = Number(form.year);

    if (!trimmedTitle) return setFormError("Title is required.");
    if (!trimmedSubject) return setFormError("Subject is required.");
    if (!trimmedUrl) return setFormError("PDF link is required.");
    if (!Number.isFinite(yearValue) || yearValue < 1990) return setFormError("Enter a valid year.");

    try {
      new URL(trimmedUrl);
    } catch {
      return setFormError("https://lifemagnanimous.com/wp-content/uploads/2013/06/physics-2010-waec.pdf.");
    }

    const newPaper = {
      subject: trimmedSubject,
      year: yearValue,
      paperType: form.paperType,
      title: trimmedTitle,
      hasAnswers: form.hasAnswers,
      pdfUrl: trimmedUrl,
      source: form.source,
    };
    try {
      const inserted = await insertUserPastPaper(userRef, newPaper);
      setCustomPapers((current) => [inserted, ...current]);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save PDF link.");
    }
  };

  const handleRemovePaper = async (paperId: string) => {
    if (!userRef) return;
    try {
      await deleteUserPastPaper(userRef, paperId);
      setCustomPapers((current) => current.filter((paper) => paper.id !== paperId));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to remove PDF link.");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, subject, year, or source"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:w-72"
          />
          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value === "all" ? "all" : Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value as PaperType | "all")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All types</option>
            {paperTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Add a PDF link</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Paper title"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <input
            value={form.subject}
            onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
            placeholder="Subject"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <input
            type="number"
            value={form.year}
            onChange={(event) => setForm((prev) => ({ ...prev, year: Number(event.target.value) }))}
            placeholder="Year"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          />
          <select
            value={form.paperType}
            onChange={(event) => setForm((prev) => ({ ...prev, paperType: event.target.value as PaperType }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {paperTypes.map((type) => (
              <option key={type} value={type}>
                {type.toUpperCase()}
              </option>
            ))}
          </select>
          <input
            value={form.pdfUrl}
            onChange={(event) => setForm((prev) => ({ ...prev, pdfUrl: event.target.value }))}
            placeholder="PDF URL (https://lifemagnanimous.com/wp-content/uploads/2013/06/physics-2010-waec.pdf)"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 md:col-span-2"
          />
          <select
            value={form.source}
            onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value as SourceType }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {sourceTypes.map((source) => (
              <option key={source} value={source}>
                {source.toUpperCase()}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.hasAnswers}
              onChange={(event) => setForm((prev) => ({ ...prev, hasAnswers: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Includes answers
          </label>
        </div>
        {formError && <p className="mt-3 text-sm text-rose-600">{formError}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleAddPaper}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Add PDF link
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </section>

      <div className="grid gap-4">
        {filteredPapers.map((paper) => (
          <div key={paper.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{paper.title}</h3>
                <p className="text-sm text-slate-600">
                  {paper.subject} | {paper.year} | {paper.paperType.toUpperCase()} | Source: {paper.source}
                  {paper.hasAnswers && " | With Answers"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {customIds.has(paper.id) && (
                  <button
                    type="button"
                    onClick={() => handleRemovePaper(paper.id)}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSelectPaper(paper)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  View PDF
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredPapers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            No papers match the current filters. Try adjusting the search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
