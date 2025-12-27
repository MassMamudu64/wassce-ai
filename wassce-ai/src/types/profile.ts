export interface StudentProfile {
  id: string;
  name: string;
  subjects: string[];
  examYear: number;
  examDate: string;
  dailyStudyGoalMinutes: number;
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  topic?: string;
  notes?: string;
  kind?: "practice" | "review" | "flashcards" | "past_paper" | "quiz";
  missed?: boolean;
}

export interface StudyPlan {
  sessions: StudySession[];
  lastUpdated: string;
}
