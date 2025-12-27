import { getOpenAiApiKey } from "./settings";
import type { Subject } from "../types/domain";

const buildPrompt = (subject: Subject, question: string, options: string[]) => {
  return (
    `Subject: ${subject}\n` +
    `Question: ${question}\n` +
    `Options: ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(" ")}\n\n` +
    "Give a subtle hint that helps the student eliminate options. Do NOT reveal the correct option letter or the final answer."
  );
};

export const generateQuizHint = async (subject: Subject, question: string, options: string[]): Promise<string> => {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) throw new Error("AI API key not found");

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a strict WASSCE tutor. Provide one concise hint (1-3 sentences). No final answer, no option letter.",
          },
          { role: "user", content: buildPrompt(subject, question, options) },
        ],
        temperature: 0.5,
        max_tokens: 140,
      }),
    });

    const raw = await response.text();
    if (!response.ok) throw new Error(`AI API error: ${response.statusText}`);

    const parsed = (() => {
      try {
        return JSON.parse(raw) as { choices?: { message?: { content?: string } }[] };
      } catch {
        return null;
      }
    })();

    const content = parsed?.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("No response from AI");
    return content;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI hint timed out.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

