// ---------------------------------------------------------------------------
// Past Paper Domain Types
// ---------------------------------------------------------------------------

/** Paper format */
export type PaperType = "objective" | "theory" | "practical";

/** Known data sources */
export type SourceType = "examry" | "studyforwassce" | "passcohub" | "waec" | "custom";

/** Exam interaction mode */
export type PaperMode = "practice" | "exam";

/** Difficulty tier */
export type Difficulty = "easy" | "medium" | "hard";

// ---------------------------------------------------------------------------
// Catalog entry  (for PDF link management  – existing feature)
// ---------------------------------------------------------------------------

export interface PastPaper {
  id: string;
  subject: string;
  year: number;
  paperType: PaperType;
  title: string;
  hasAnswers: boolean;
  pdfUrl: string;
  source: SourceType;
}

// ---------------------------------------------------------------------------
// Interactive question model
// ---------------------------------------------------------------------------

export interface PastQuestion {
  id: string;
  subject: string;
  year: number;
  paper: number;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface InteractivePaper {
  id: string;
  subject: string;
  year: number;
  paper: number;
  title: string;
  durationMinutes: number;
  questions: PastQuestion[];
}

// ---------------------------------------------------------------------------
// Per-question attempt tracking
// ---------------------------------------------------------------------------

export interface AttemptRecord {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
  timeSpent: number; // seconds spent on this question
  topic: string;
}

// ---------------------------------------------------------------------------
// Full paper attempt (persisted in learningStore)
// ---------------------------------------------------------------------------

export interface PassPaperAttempt {
  id: string;
  paperId: string;
  answers: Record<string, string>;
  score: number;
  totalMarks: number;
  timeSpent: number; // minutes
  completedAt: Date;
  mode?: PaperMode;
  records?: AttemptRecord[];
}

// ---------------------------------------------------------------------------
// Aggregate stats per subject (persisted in learningStore)
// ---------------------------------------------------------------------------

export interface PassPaperStats {
  subject: string;
  totalAttempts: number;
  averageScore: number;
  topicAccuracy: Record<string, number>; // topic -> accuracy %
  yearTrends: Record<number, number>;    // year  -> average score %
}

// ---------------------------------------------------------------------------
// Weak topic derived from attempt records
// ---------------------------------------------------------------------------

export interface WeakTopic {
  topic: string;
  subject: string;
  accuracy: number;  // 0-100
  attempts: number;
  questionIds: string[];
}

// ---------------------------------------------------------------------------
// Legacy question shape kept for PassPaperExam / PassPaperReview compat
// ---------------------------------------------------------------------------

export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  markingGuide?: string;
  topic: string;
  marks: number;
}

export interface PassPaper_Legacy {
  id: string;
  subject: string;
  year: number;
  paperType: PaperType;
  durationMinutes: number;
  questions: Question[];
}

/** Alias so existing PassPaperExam / PassPaperReview imports keep working */
export type PassPaper = PassPaper_Legacy;

// ---------------------------------------------------------------------------
// Planner session (study planner ↔ past paper integration)
// ---------------------------------------------------------------------------

export interface PlannerSession {
  id: string;
  subject: string;
  topic: string;
  type: "past_paper";
  reason: "due" | "weak" | "new" | "revision";
  year: number;
  paper: number;
  questionIds: string[];
  durationMinutes: number;
  scheduledAt: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  score?: number;
  accuracy?: number;
  priorityScore?: number;
}
