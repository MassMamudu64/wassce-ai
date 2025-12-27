export type PaperType = "objective" | "theory" | "practical";

export type SourceType = "examry" | "studyforwassce" | "passcohub" | "waec";

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

export interface Question {
  id: string;
  text: string;
  options?: string[];        // objective only
  correctAnswer?: string;    // objective
  markingGuide?: string;     // theory
  topic: string;
  marks: number;
}

export interface PassPaper {
  id: string;
  subject: string;
  year: number;
  paperType: PaperType;
  durationMinutes: number;
  questions: Question[];
}

export interface PassPaperAttempt {
  id: string;
  paperId: string;
  answers: Record<string, string>; // questionId -> answer
  score: number;
  totalMarks: number;
  timeSpent: number; // minutes
  completedAt: Date;
}

export interface PassPaperStats {
  subject: string;
  totalAttempts: number;
  averageScore: number;
  topicAccuracy: Record<string, number>; // topic -> accuracy %
  yearTrends: Record<number, number>; // year -> average score
}