import { getOpenAiApiKey } from "./settings";
import type { Subject } from "../types/domain";

export type GeneratedQuizQuestion = {
  id: string;
  subject: Subject;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
const tryParseJson = (value: string): unknown | null => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const extractJsonCandidates = (raw: string): string[] => {
  const trimmed = raw.trim();
  const candidates: string[] = [trimmed];

  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim());

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(trimmed.slice(firstBrace, lastBrace + 1));

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) candidates.push(trimmed.slice(firstBracket, lastBracket + 1));

  return Array.from(new Set(candidates.filter(Boolean)));
};

const parseQuizFromModel = (content: string, subject: Subject): GeneratedQuizQuestion[] => {
  for (const candidate of extractJsonCandidates(content)) {
    const parsed = tryParseJson(candidate);
    if (!parsed) continue;
    if (!parsed || typeof parsed !== "object") continue;

    const record = parsed as Record<string, unknown>;
    const maybeWire = record.questions;
    if (!Array.isArray(maybeWire)) continue;

    const questions = maybeWire
      .map((entry, index) => {
        if (!entry || typeof entry !== "object") return null;
        const q = entry as Record<string, unknown>;

        const question = typeof q.question === "string" ? q.question.trim() : null;
        const options = Array.isArray(q.options) ? q.options.filter((o): o is string => typeof o === "string").map((o) => o.trim()) : null;
        const explanation = typeof q.explanation === "string" ? q.explanation.trim() : null;
        const topic = typeof q.topic === "string" ? q.topic.trim() : "General";
        const correctIndex = typeof q.correctIndex === "number" ? q.correctIndex : null;

        if (!question || !options || options.length !== 4 || explanation === null || correctIndex === null) return null;
        if (correctIndex < 0 || correctIndex > 3) return null;

        return {
          id: `ai-${subject}-${Date.now()}-${index}`,
          subject,
          topic: topic || "General",
          question,
          options,
          correctIndex,
          explanation,
        } satisfies GeneratedQuizQuestion;
      })
      .filter((q): q is GeneratedQuizQuestion => Boolean(q));

    if (questions.length > 0) return questions.slice(0, 8);
  }

  throw new Error("AI returned an invalid quiz payload.");
};

const buildSchemaPayload = (subject: Subject, prompt: string) => ({
  model: "gpt-4o-mini",
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "quiz_response",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["questions"],
        properties: {
          questions: {
            type: "array",
            minItems: 8,
            maxItems: 8,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["topic", "question", "options", "correctIndex", "explanation"],
              properties: {
                topic: { type: "string" },
                question: { type: "string" },
                options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
                correctIndex: { type: "number" },
                explanation: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  messages: [
    {
      role: "system",
      content:
        `You are an expert WASSCE tutor. Generate exactly 8 multiple-choice questions for the subject "${subject}". ` +
        "Each question must have exactly 4 answer options. Keep the difficulty mixed and exam-style. " +
        "Provide a brief explanation for the correct answer.",
    },
    { role: "user", content: prompt },
  ],
  temperature: 0.6,
  max_tokens: 1200,
});

const buildLoosePayload = (subject: Subject, prompt: string) => ({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content:
        `You are an expert WASSCE tutor. Generate exactly 8 multiple-choice questions for the subject "${subject}". ` +
        'Return ONLY valid JSON in the shape {"questions":[...]} with fields: topic, question, options (4 strings), correctIndex (0-3), explanation.',
    },
    { role: "user", content: prompt },
  ],
  temperature: 0.6,
  max_tokens: 1200,
});

const isResponseFormatUnsupported = async (response: Response) => {
  if (response.status !== 400) return false;
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    const message = body.error?.message ?? "";
    return /response_format|json_schema/i.test(message);
  } catch {
    return false;
  }
};

export const generateSubjectQuiz = async (subject: Subject, prompt: string): Promise<GeneratedQuizQuestion[]> => {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) throw new Error("AI API key not found");

  const url = "https://api.openai.com/v1/chat/completions";

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);

  const doRequest = async (payload: unknown) => {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
  };

  try {
    let response = await doRequest(buildSchemaPayload(subject, prompt));
    if (!response.ok && (await isResponseFormatUnsupported(response))) {
      response = await doRequest(buildLoosePayload(subject, prompt));
    }

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

     const raw = await response.text();
     const data = tryParseJson(raw) as { choices?: { message?: { content?: string } }[] } | null;
     const content = data?.choices?.[0]?.message?.content;
     if (!content) throw new Error("No response from AI");

     return parseQuizFromModel(content, subject);
   } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI quiz generation timed out.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};
