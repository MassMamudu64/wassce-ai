import type { PastPaper } from '../../core/types/passPaper';

export const pastPapers: PastPaper[] = [
  {
    id: 'math-2021-objective',
    subject: 'Mathematics',
    year: 2021,
    paperType: 'objective',
    title: 'WASSCE Mathematics 2021 Objective Questions and Answers',
    hasAnswers: true,
    pdfUrl: 'https://cheetahwaec.com/chapters/algebra/2.3-domain-and-range.html',
    source: 'examry'
  },
  {
    id: 'english-2020-theory',
    subject: 'English Language',
    year: 2020,
    paperType: 'theory',
    title: 'WASSCE English Language 2020 Theory Paper',
    hasAnswers: false,
    pdfUrl: 'https://lifemagnanimous.com/wp-content/uploads/2013/06/2013-mock-waec-final.pdf',
    source: 'studyforwassce'
  },
  {
    id: 'biology-2019-objective',
    subject: 'Biology',
    year: 2019,
    paperType: 'objective',
    title: 'WASSCE Biology 2019 Objective Questions',
    hasAnswers: true,
    pdfUrl: 'https://passcohub.com/wassce-biology-2019-objective-questions/',
    source: 'passcohub'
  },
  {
    id: 'chemistry-2022-practical',
    subject: 'Chemistry',
    year: 2022,
    paperType: 'practical',
    title: 'WASSCE Chemistry 2022 Practical Paper',
    hasAnswers: true,
    pdfUrl: 'https://waec.org.ng/wassce-chemistry-2022-practical/',
    source: 'waec'
  },
  {
    id: 'physics-2021-theory',
    subject: 'Physics',
    year: 2021,
    paperType: 'theory',
    title: 'WASSCE Physics 2021 Theory Questions and Answers',
    hasAnswers: true,
    pdfUrl: 'https://examry.com/wassce-physics-2021-theory-questions-and-answers/',
    source: 'examry'
  }
];