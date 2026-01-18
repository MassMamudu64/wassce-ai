import { useState } from "react";
import type { PastPaper, PaperType } from "../../core/types/passPaper";
import { pastPapers } from "./mockData";

interface Props {
  onSelectPaper: (paper: PastPaper) => void;
}

export default function PassPaperList({ onSelectPaper }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string | "all">("all");
  const [selectedType, setSelectedType] = useState<PaperType | "all">("all");

  const subjects = Array.from(new Set(pastPapers.map((paper) => paper.subject)));
  const paperTypes: PaperType[] = ["objective", "theory", "practical"];

  const filteredPapers = pastPapers.filter((paper) => {
    if (selectedSubject !== "all" && paper.subject !== selectedSubject) return false;
    if (selectedType !== "all" && paper.paperType !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
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
              <button
                onClick={() => onSelectPaper(paper)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
