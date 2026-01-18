import { useState } from "react";
import type { PastPaper } from "../../core/types/passPaper";
import PassPaperList from "./PassPaperList";

export default function PassPaperViewer() {
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);

  const handleSelectPaper = (paper: PastPaper) => {
    setSelectedPaper(paper);
  };

  const handleBackToList = () => {
    setSelectedPaper(null);
  };

  if (selectedPaper) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleBackToList}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
        >
          Back to papers
        </button>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">{selectedPaper.title}</h2>
          <p className="mb-4 text-sm text-slate-600">
            {selectedPaper.subject} | {selectedPaper.year} | {selectedPaper.paperType.toUpperCase()} | Source:{" "}
            {selectedPaper.source}
            {selectedPaper.hasAnswers && " | Includes Answers"}
          </p>
          <iframe
            src={selectedPaper.pdfUrl}
            className="h-[70vh] min-h-[520px] w-full rounded-xl border border-slate-200 bg-white"
            title={selectedPaper.title}
          />
          <div className="mt-4 flex gap-2">
            <a
              href={selectedPaper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <PassPaperList onSelectPaper={handleSelectPaper} />;
}
