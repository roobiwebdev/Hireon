import Vapi from "@vapi-ai/web";

export const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN ?? "");

/** Collects every string inside an unknown error (Error messages, nested API bodies) so we can match on it. */
function collectText(value: unknown, depth = 0): string {
  if (depth > 4 || value == null) return "";
  if (typeof value === "string") return value;
  if (value instanceof Error) return `${value.name} ${value.message} ${collectText(value.cause, depth + 1)}`;
  if (typeof value === "object") {
    return Object.values(value)
      .map((v) => collectText(v, depth + 1))
      .join(" ");
  }
  return String(value);
}

/**
 * SOURCE OF TRUTH KEYWORDS: describeCallError, vapi error, call failed, out of credits, microphone blocked, call error message
 * WHAT:  Turns any Vapi error (SDK event, API response, browser permission error) into one sentence for the user.
 * WHY:   Vapi reports failures as varied nested objects and only to the console, which left the
 *        call button spinning with no explanation. This keeps the wording in one place.
 * WHERE: components/Agent.tsx (error listener and failed start).
 */
export function describeCallError(error: unknown): string {
  const text = collectText(error).toLowerCase();

  if (/wallet balance|purchase more credits|upgrade your plan|insufficient credits/.test(text)) {
    return "Voice interviews are paused right now. Please try again later.";
  }
  if (/notallowederror|permission denied|permission dismissed|microphone|getusermedia/.test(text)) {
    return "Microphone access was blocked. Allow it in your browser settings and try again.";
  }
  if (/failed to fetch|network|timeout|offline/.test(text)) {
    return "Couldn't reach the call service. Check your connection and try again.";
  }
  return "The call couldn't start. Please try again in a moment.";
}
