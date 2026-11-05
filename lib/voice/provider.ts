/**
 * SOURCE OF TRUTH KEYWORDS: voiceProvider, NEXT_PUBLIC_VOICE_PROVIDER, vapi or browser, voice engine switch
 * WHAT:  Which voice engine runs interviews: "browser" (free, default) or "vapi" (paid, needs credits).
 * WHY:   One switch read by both the server pages (which setup flow to show) and the call component.
 * WHERE: components/Agent.tsx, app/(root)/interview/page.tsx.
 */
export const voiceProvider: "vapi" | "browser" =
  process.env.NEXT_PUBLIC_VOICE_PROVIDER === "vapi" ? "vapi" : "browser";
