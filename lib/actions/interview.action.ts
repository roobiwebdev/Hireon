"use server";

import { db } from "@/db";
import { interview } from "@/db/schema";
import { withGemini } from "@/lib/ai/models";
import { generateInterviewQuestions } from "@/lib/ai/questions";
import { requireUser } from "@/lib/auth/session";
import { getRandomInterviewCover } from "@/lib/utils";
import { interviewSetupSchema, splitTechstack } from "@/lib/validation/interview";
import { generateObject } from "ai";
import { z } from "zod";

/**
 * SOURCE OF TRUTH KEYWORDS: createInterview, interview setup form, generate questions, new interview, free interview
 * WHAT:  Creates an interview for the signed-in user from the setup form, with Gemini-written questions.
 * WHY:   Replaces the paid Vapi voice workflow for setting an interview up. Same prompt and
 *        validation as the webhook (shared generateInterviewQuestions + interviewSetupSchema).
 * WHERE: components/InterviewSetupForm.tsx.
 */
export async function createInterview(input: z.input<typeof interviewSetupSchema>) {
  const user = await requireUser();
  const parsed = interviewSetupSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Check the form and try again." };
  const setup = parsed.data;

  try {
    const questions = await generateInterviewQuestions(setup);
    const [row] = await db
      .insert(interview)
      .values({
        userId: user.id,
        role: setup.role,
        type: setup.type,
        level: setup.level,
        techstack: splitTechstack(setup.techstack),
        questions,
        finalized: true,
        coverImage: getRandomInterviewCover(),
      })
      .returning({ id: interview.id });

    if (!row) return { success: false as const, error: "Couldn't save the interview." };
    return { success: true as const, id: row.id };
  } catch (error) {
    console.error("createInterview failed:", error instanceof Error ? error.message : "unknown");
    return {
      success: false as const,
      error: "Couldn't write your questions right now. Please try again in a moment.",
    };
  }
}

const followUpInput = z.object({
  role: z.string().max(80),
  question: z.string().min(1).max(500),
  answer: z.string().max(4000),
  // After one follow-up per question we always move on, without calling Gemini.
  followUpsAsked: z.number().int().min(0).max(5),
});

const followUpOutput = z.object({
  action: z.enum(["follow_up", "next"]),
  say: z.string().min(1).max(240),
});

export type InterviewerTurn = z.infer<typeof followUpOutput>;

const MOVE_ON_LINES = ["Thanks for that.", "Got it, thank you.", "Okay, thanks.", "Thank you, that helps."];
const moveOn = (): InterviewerTurn => ({
  action: "next",
  say: MOVE_ON_LINES[Math.floor(Math.random() * MOVE_ON_LINES.length)] ?? "Thanks.",
});

/**
 * SOURCE OF TRUTH KEYWORDS: getInterviewerTurn, follow up question, interviewer reply, acknowledgement, gemini interviewer
 * WHAT:  Decides what the interviewer says after an answer: one short follow-up, or a brief acknowledgement and move on.
 * WHY:   Makes the free browser interview feel like a real conversation. Capped at one follow-up per
 *        question and falls back to a plain acknowledgement on any error, so the interview never stalls.
 * WHERE: hooks/useBrowserInterview.ts.
 */
export async function getInterviewerTurn(input: z.input<typeof followUpInput>): Promise<InterviewerTurn> {
  await requireUser();
  const parsed = followUpInput.safeParse(input);
  if (!parsed.success) return moveOn();
  const { role, question, answer, followUpsAsked } = parsed.data;
  if (followUpsAsked >= 1 || answer.trim().length === 0) return moveOn();

  try {
    const { object } = await withGemini((model, options) =>
      generateObject({
        model,
        ...options,
        schema: followUpOutput,
        system:
          "You are a professional, warm job interviewer in a live voice interview. Keep every reply to one or two short spoken sentences. Never use special characters like / or * because your words are read aloud.",
        prompt: `Role being interviewed for: ${role || "not specified"}
Question you asked: ${question}
Candidate's answer: ${answer}

Decide what to say next.
- If the answer is vague, very short, or misses an obvious part of the question, set action to "follow_up" and ask ONE short, specific follow-up question.
- Otherwise set action to "next" and give a brief, natural acknowledgement (do not ask a question, do not give feedback or a score).`,
      }),
      // Mid-interview silence is worse than a plain "thanks", so give up quickly.
      { budgetMs: 8_000 }
    );
    return object;
  } catch (error) {
    console.warn("getInterviewerTurn fell back:", error instanceof Error ? error.message : "unknown");
    return moveOn();
  }
}
