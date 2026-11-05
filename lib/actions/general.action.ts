"use server";

import { feedbackSchema } from "@/constants";
import { db } from "@/db";
import { feedback, interview } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { and, desc, eq, ne } from "drizzle-orm";
import { z } from "zod";

/**
 * SOURCE OF TRUTH KEYWORDS: getUserInterviews, my interviews, dashboard interviews, interview list
 * WHAT:  The signed-in user's interviews, newest first.
 * WHERE: app/(root)/dashboard/page.tsx.
 */
export async function getUserInterviews(): Promise<Interview[]> {
  const user = await requireUser();
  return db
    .select()
    .from(interview)
    .where(eq(interview.userId, user.id))
    .orderBy(desc(interview.createdAt));
}

/**
 * SOURCE OF TRUTH KEYWORDS: getLatestInterviews, other users interviews, take an interview, discover
 * WHAT:  Finalized interviews created by other users, newest first.
 * WHERE: The (currently commented out) "Take an Interview" list on the dashboard.
 */
export async function getLatestInterviews(limit = 20): Promise<Interview[]> {
  const user = await requireUser();
  return db
    .select()
    .from(interview)
    .where(and(eq(interview.finalized, true), ne(interview.userId, user.id)))
    .orderBy(desc(interview.createdAt))
    .limit(limit);
}

/**
 * SOURCE OF TRUTH KEYWORDS: getInterviewById, interview detail, interview lookup
 * WHAT:  One interview by id, or null. Any signed-in user may open any interview to take it.
 * WHERE: app/(root)/interview/[id]/page.tsx and its feedback page.
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  await requireUser();
  const [row] = await db.select().from(interview).where(eq(interview.id, id)).limit(1);
  return row ?? null;
}

const createFeedbackInput = z.object({
  interviewId: z.string().min(1),
  transcript: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .min(1, "The interview ended before anything was said."),
});

/**
 * SOURCE OF TRUTH KEYWORDS: createFeedback, generate feedback, score transcript, gemini, upsert feedback
 * WHAT:  Scores an interview transcript with Gemini and saves the report for the signed-in user.
 * WHY:   One report per (interview, user); a retake overwrites the old one. The user comes
 *        from the session, so nobody can write feedback into someone else's account.
 * WHERE: components/Agent.tsx when an interview call ends.
 */
export async function createFeedback(input: z.input<typeof createFeedbackInput>) {
  const user = await requireUser();
  const parsed = createFeedbackInput.safeParse(input);
  if (!parsed.success) return { success: false as const };
  const { interviewId, transcript } = parsed.data;

  try {
    const [target] = await db
      .select({ id: interview.id })
      .from(interview)
      .where(eq(interview.id, interviewId))
      .limit(1);
    if (!target) return { success: false as const };

    const formattedTranscript = transcript
      .map((sentence) => `- ${sentence.role}: ${sentence.content}\n`)
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", { structuredOutputs: false }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem Solving**: Ability to analyze problems and propose solutions.
        - **Cultural Fit**: Alignment with company values and job role.
        - **Confidence and Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const values = {
      interviewId,
      userId: user.id,
      totalScore: Math.round(object.totalScore),
      categoryScores: [...object.categoryScores],
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date(),
    };

    const [saved] = await db
      .insert(feedback)
      .values(values)
      .onConflictDoUpdate({ target: [feedback.interviewId, feedback.userId], set: values })
      .returning({ id: feedback.id });

    return { success: true as const, feedbackId: saved?.id };
  } catch (error) {
    console.error("Error saving feedback:", error instanceof Error ? error.message : "unknown");
    return { success: false as const };
  }
}

/**
 * SOURCE OF TRUTH KEYWORDS: getFeedbackByInterviewId, feedback report, interview score, my feedback
 * WHAT:  The signed-in user's report for one interview, or null.
 * WHERE: components/InterviewCard.tsx, app/(root)/interview/[id]/feedback/page.tsx.
 */
export async function getFeedbackByInterviewId(interviewId: string): Promise<Feedback | null> {
  const user = await requireUser();
  const [row] = await db
    .select()
    .from(feedback)
    .where(and(eq(feedback.interviewId, interviewId), eq(feedback.userId, user.id)))
    .limit(1);
  return row ?? null;
}
