import { useState } from 'react';
import type { PastPaper, PaperType } from '../../core/types/passPaper';
import { pastPapers } from './mockData';

interface Props {
  onSelectPaper: (paper: PastPaper) => void;
}

export default function PassPaperList({ onSelectPaper }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PaperType | 'all'>('all');

  const subjects = Array.from(new Set(pastPapers.map(p => p.subject)));
  const paperTypes: PaperType[] = ['objective', 'theory', 'practical'];

  const filteredPapers = pastPapers.filter(paper => {
    if (selectedSubject !== 'all' && paper.subject !== selectedSubject) return false;
    if (selectedType !== 'all' && paper.paperType !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded bg-slate-700 p-2 text-white"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as PaperType | 'all')}
          className="rounded bg-slate-700 p-2 text-white"
        >
          <option value="all">All Types</option>
          {paperTypes.map(type => (
            <option key={type} value={type}>{type.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredPapers.map(paper => (
          <div key={paper.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-blue-500/30 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {paper.title}
                </h3>
                <p className="text-sm text-slate-300">
                  {paper.subject} • {paper.year} • {paper.paperType.toUpperCase()} • Source: {paper.source}
                  {paper.hasAnswers && " • With Answers"}
                </p>
              </div>
              <button
                onClick={() => onSelectPaper(paper)}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
