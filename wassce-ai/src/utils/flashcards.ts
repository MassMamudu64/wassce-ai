import { getOpenAiApiKey } from "./settings";

export type PassPaperFlashcard = {
  subject: string;
  question: string;
  answer: string;
  tip: string;
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
  if (fenceMatch?.[1]) {
    candidates.push(fenceMatch[1].trim());
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  const firstBracket = trimmed.indexOf("[");
  const lastBracket = trimmed.lastIndexOf("]");
  if (firstBracket >= 0 && lastBracket > firstBracket) {
    candidates.push(trimmed.slice(firstBracket, lastBracket + 1));
  }

  return Array.from(new Set(candidates.filter(Boolean)));
};

const coerceFlashcardsPayload = (parsed: unknown): PassPaperFlashcard[] | null => {
  if (Array.isArray(parsed)) return parsed as unknown as PassPaperFlashcard[];
  if (parsed && typeof parsed === "object") {
    const record = parsed as Record<string, unknown>;
    if (Array.isArray(record.flashcards)) return record.flashcards as unknown as PassPaperFlashcard[];
  }
  return null;
};

const parseFlashcardsFromModel = (content: string): PassPaperFlashcard[] => {
  for (const candidate of extractJsonCandidates(content)) {
    const parsed = tryParseJson(candidate);
    if (!parsed) continue;
    const payload = coerceFlashcardsPayload(parsed);
    if (!payload) continue;

    const cards = payload
      .map((entry) => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const question = typeof record.question === "string" ? record.question.trim() : null;
        const answer = typeof record.answer === "string" ? record.answer.trim() : null;
        const tip = typeof record.tip === "string" ? record.tip.trim() : null;
        if (!question || !answer || !tip) return null;
        return {
          subject: typeof record.subject === "string" && record.subject.trim() ? record.subject.trim() : "General",
          question,
          answer,
          tip,
        } satisfies PassPaperFlashcard;
      })
      .filter((card): card is PassPaperFlashcard => Boolean(card));

    if (cards.length > 0) return cards.slice(0, 4);
  }

  throw new Error("AI returned an invalid flashcards payload.");
};

export const samplePassPaperFlashcards: PassPaperFlashcard[] = [
  {
    subject: "Biology",
    question: "WASSCE-style biology prompt: Outline the steps of transcription in gene expression.",
    answer:
      "RNA polymerase binds the promoter, the double helix unwinds, and the enzyme reads the template strand to build an mRNA copy in the 5'→3' direction before releasing the strand at a terminator sequence.",
    tip: "Sketch the DNA-RNA complex to show the direction of synthesis and label the promoter."
  },
  {
    subject: "Chemistry",
    question: "WASSCE-style chemistry prompt: Calculate the volume of 2.0 M hydrochloric acid needed to prepare 250 cm³ of 0.1 M solution.",
    answer:
      "Use M₁V₁ = M₂V₂. Rearranged gives V₁ = (0.1 × 250)/2.0, so 12.5 cm³ of the concentrated acid is measured and diluted with distilled water to 250 cm³.",
    tip: "Always show units and explain how you applied the dilution formula."
  },
  {
    subject: "Mathematics",
    question: "WASSCE-style mathematics prompt: Solve the system x + y = 14 and 2x - y = 4.",
    answer:
      "Add the equations to eliminate y: 3x = 18, so x = 6. Substitute back into x + y = 14 to find y = 8.",
    tip: "Mention whether you used elimination or substitution to reach the solution."
  },
  {
    subject: "English",
    question: "WASSCE-style English prompt: Summarize the theme of resilience in a provided passage.",
    answer:
      "Identify the main idea, cite two supporting points, and restate the theme in one concise sentence while keeping the summary under 120 words.",
    tip: "Highlight signal phrases from the passage to show how you identified the theme."
  },
];

const generateFlashcardsFromAI = async (prompt: string): Promise<PassPaperFlashcard[]> => {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("AI API key not found");
  }

  const url = "https://api.openai.com/v1/chat/completions";

  const doRequest = async (payload: unknown) =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

  const payloadWithSchema = {
      model: "gpt-4o-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "flashcards_response",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["flashcards"],
            properties: {
              flashcards: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["subject", "question", "answer", "tip"],
                  properties: {
                    subject: { type: "string" },
                    question: { type: "string" },
                    answer: { type: "string" },
                    tip: { type: "string" },
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
            "You are an expert WASSCE tutor. Generate exactly 4 flashcards based on the user's prompt. Keep questions exam-style and challenging; answers clear and concise; tips practical for scoring marks.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 900,
    };

  const payloadLoose = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are an expert WASSCE tutor. Generate exactly 4 flashcards based on the user's prompt. Return ONLY valid JSON: " +
          'either {"flashcards":[...]} or an array. Each flashcard has subject, question, answer, tip. No extra text.',
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 900,
  };

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

  let response = await doRequest(payloadWithSchema);
  if (!response.ok && (await isResponseFormatUnsupported(response))) {
    response = await doRequest(payloadLoose);
  }

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const raw = await response.text();
  const data = tryParseJson(raw) as { choices?: { message?: { content?: string } }[] } | null;
  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No response from AI");
  }

  return parseFlashcardsFromModel(content);
};

export const generatePassPaperFlashcards = async (prompt?: string): Promise<PassPaperFlashcard[]> => {
  const trimmedPrompt = prompt?.trim();
  if (!trimmedPrompt) return samplePassPaperFlashcards;
  return await generateFlashcardsFromAI(trimmedPrompt);
};
