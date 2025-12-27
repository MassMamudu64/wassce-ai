export type GameType = "memory" | "math" | "word";

export type Subject = "math" | "english" | "integrated_science" | "biology" | "chemistry" | "physics" | "economics" | "government";

export interface Topic {
  id: string;
  name: string;
  subject: Subject;
}

export interface StudyStat {
  subject: Subject;
  topic: string;
  accuracy: number;
  attempts: number;
}

export interface UserProgress {
  level: "weak" | "average" | "strong";
  predictedGrade: string;
  readinessScore: number; // 0-100
  subjectStrengths: Record<Subject, number>; // 0-100
}

export interface DiagnosticResult {
  strengths: string[];
  weaknesses: string[];
  predictedScore: string;
}

export interface StudyPlan {
  todayGoal: string;
  sessions: {
    duration: number; // mins
    activity: string;
  }[];
}

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  year: number;
  difficulty: "easy" | "medium" | "hard";
  text: string;
  options?: string[];
  answer: string;
}