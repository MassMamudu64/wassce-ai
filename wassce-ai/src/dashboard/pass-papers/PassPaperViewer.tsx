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
          className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-600"
        >
          ← Back to papers
        </button>
        <div className="rounded-lg bg-slate-800 p-4">
          <h2 className="text-xl font-semibold text-white mb-2">{selectedPaper.title}</h2>
          <p className="text-sm text-slate-400 mb-4">
            {selectedPaper.subject} • {selectedPaper.year} • {selectedPaper.paperType.toUpperCase()} • Source: {selectedPaper.source}
            {selectedPaper.hasAnswers && " • Includes Answers"}
          </p>
          <iframe
            src={selectedPaper.pdfUrl}
            className="h-[70vh] min-h-[520px] w-full rounded-xl border border-slate-700 bg-white"
            title={selectedPaper.title}
          />
          <div className="mt-4 flex gap-2">
            <a
              href={selectedPaper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
