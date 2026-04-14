import type { Subject } from "../types/domain";

/** Canonical subject slug → display name mapping. */
const SUBJECT_MAP: Record<Subject, string> = {
  math: "Mathematics",
  english: "English Language",
  integrated_science: "Integrated Science",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  economics: "Economics",
  government: "Government",
};

const REVERSE_MAP = new Map<string, Subject>(
  (Object.entries(SUBJECT_MAP) as [Subject, string][]).map(([slug, name]) => [name, slug]),
);

/** All subject slugs that have seed-data questions. */
export const ALL_SUBJECT_SLUGS: Subject[] = Object.keys(SUBJECT_MAP) as Subject[];

/** Ordered list for UI pickers: { slug, label }. */
export const SUBJECT_OPTIONS = ALL_SUBJECT_SLUGS.map((slug) => ({
  slug,
  label: SUBJECT_MAP[slug],
}));

/** "math" → "Mathematics" */
export const subjectLabel = (slug: string): string =>
  SUBJECT_MAP[slug as Subject] ?? slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** "Mathematics" → "math" — returns undefined for unknown names */
export const subjectSlug = (displayName: string): Subject | undefined =>
  REVERSE_MAP.get(displayName);

/** Format a subject slug for display: replaces underscores and title-cases. */
export const formatSubject = (slug: string): string => subjectLabel(slug);
