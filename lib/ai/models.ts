import "server-only";

import { google } from "@ai-sdk/google";
import type { LanguageModelV1 } from "ai";

/**
 * Tried in order. Google retires Gemini model ids (gemini-2.0-flash-001 broke production) and
 * answers slowly or with 503 "high demand" when a free-tier key is deprioritised, so each model
 * gets a time limit and the lite models are fallbacks.
 */
const PRIMARY = { id: "gemini-3.8-flash", timeoutMs: 15_000 } as const;
const FALLBACKS = [
  { id: "gemini-flash-lite-latest", timeoutMs: 40_000 },
  { id: "gemini-3.5-flash-lite", timeoutMs: 40_000 },
  { id: "gemini-3.1-flash-lite", timeoutMs: 40_000 },
] as const;
// Free-tier 503s come and go within seconds, so the fallbacks get a second pass after a short pause.
const ATTEMPTS = [PRIMARY, ...FALLBACKS, "pause", ...FALLBACKS] as const;
const PAUSE_MS = 2_000;

/** Errors worth trying the next model for: overloaded, rate limited, timed out, or the model id is gone. */
function isModelUnavailable(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const name = "name" in error && typeof error.name === "string" ? error.name : "";
  if (name === "AbortError" || name === "TimeoutError") return true;
  // A model that returns malformed output is as useless as an unavailable one; try the next.
  if (/AI_NoObjectGeneratedError|AI_TypeValidationError|AI_JSONParseError/.test(name)) return true;
  const status = "statusCode" in error ? error.statusCode : undefined;
  if (status === 404 || status === 429 || status === 500 || status === 503) return true;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  return /high demand|overloaded|no longer available|quota|rate limit|unavailable|aborted|timed? ?out/i.test(message);
}

/** Pass these straight into generateText / generateObject so the time limit and retry policy apply. */
export type GeminiCallOptions = { abortSignal: AbortSignal; maxRetries: number };

/**
 * SOURCE OF TRUTH KEYWORDS: withGemini, gemini model, model fallback, ai model, timeout, generateText, generateObject
 * WHAT:  Runs an AI SDK call against the first Gemini model that answers in time, falling back on
 *        overload, timeout or retirement.
 * WHY:   One place owns which Gemini models Hireon uses, so a model retirement or a demand spike
 *        is fixed here instead of in every caller. SDK retries are off; the fallback chain replaces them.
 * WHERE: lib/ai/questions.ts, lib/actions/general.action.ts (feedback), lib/actions/interview.action.ts (follow-ups).
 */
export async function withGemini<T>(
  run: (model: LanguageModelV1, options: GeminiCallOptions) => Promise<T>,
  {
    structuredOutputs = true,
    budgetMs,
  }: {
    structuredOutputs?: boolean;
    /** Total time allowed across every model; the caller handles the failure when it runs out. */
    budgetMs: number;
  }
): Promise<T> {
  const deadline = Date.now() + budgetMs;
  let lastError: unknown = new Error("Gemini time budget exhausted");
  for (const attempt of ATTEMPTS) {
    const remaining = deadline - Date.now();
    if (remaining <= 500) break;
    if (attempt === "pause") {
      await new Promise((resolve) => setTimeout(resolve, Math.min(PAUSE_MS, remaining)));
      continue;
    }
    const { id, timeoutMs } = attempt;
    try {
      return await run(google(id, { structuredOutputs }), {
        abortSignal: AbortSignal.timeout(Math.min(timeoutMs, remaining)),
        maxRetries: 0,
      });
    } catch (error) {
      lastError = error;
      if (!isModelUnavailable(error)) throw error;
      const reason = error instanceof Error ? `${error.name}: ${error.message.slice(0, 80)}` : "unknown";
      console.warn(`Gemini ${id} unavailable (${reason}), trying the next model`);
    }
  }
  throw lastError;
}
