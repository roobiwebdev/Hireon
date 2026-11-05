import "server-only";

import type { InterviewSetup } from "@/lib/validation/interview";
import { generateObject } from "ai";
import { z } from "zod";
import { withGemini } from "./models";

/**
 * SOURCE OF TRUTH KEYWORDS: generateInterviewQuestions, question generation, gemini questions, interview questions prompt
 * WHAT:  Asks Gemini for `amount` interview questions for a role, level, type and stack.
 * WHY:   Shared by the setup form (free browser interviews) and the Vapi webhook so both get
 *        the same prompt. Questions are read aloud, so the prompt bans characters like / and *.
 * WHERE: lib/actions/interview.action.ts (createInterview), app/api/vapi/generate/route.ts.
 */
export async function generateInterviewQuestions(setup: InterviewSetup): Promise<string[]> {
  const { object } = await withGemini((model, options) =>
    generateObject({
      model,
      ...options,
      schema: z.object({ questions: z.array(z.string().min(1)).min(1) }),
      prompt: `Prepare questions for a job interview.
        The job role is ${setup.role}.
        The job experience level is ${setup.level}.
        The tech stack used in the job is: ${setup.techstack}.
        The focus between behavioural and technical questions should lean towards: ${setup.type}.
        The amount of questions required is: ${setup.amount}.
        The questions are going to be read aloud by a voice assistant, so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return only the questions.`,
    }),
    { budgetMs: 60_000 }
  );
  return object.questions.slice(0, setup.amount);
}
