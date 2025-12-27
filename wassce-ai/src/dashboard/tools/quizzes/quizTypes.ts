import type { Subject } from "../../../types/domain";

export type QuizSource = "sample" | "ai";
export type QuizPhase = "setup" | "loading" | "active" | "finished";

export type QuizQuestion = {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type AnswerMap = Record<string, number | null>;

const pad2 = (value: number) => value.toString().padStart(2, "0");

export const formatSubjectLabel = (subject: Subject) =>
  subject
    .replace(/_/g, " ")
    .split(" ")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");

export const formatHms = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad2(hours)} : ${pad2(minutes)} : ${pad2(seconds)}`;
};

export const hashToStudentId = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const digits = Math.abs(hash % 1_000_000).toString().padStart(6, "0");
  return `GH-${digits}`;
};

