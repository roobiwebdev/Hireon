import { db } from "@/db";
import { interview, user } from "@/db/schema";
import { getRandomInterviewCover } from "@/lib/utils";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";

const requestBody = z.object({
  type: z.string().min(1),
  role: z.string().min(1),
  level: z.string().min(1),
  techstack: z.string().min(1),
  amount: z.coerce.number().int().min(1).max(20),
  userid: z.string().min(1),
});

const questionsSchema = z.array(z.string().min(1)).min(1);

/** Gemini sometimes wraps its JSON in a ```json fence; strip it before parsing. */
function parseQuestions(text: string) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    const result = questionsSchema.safeParse(JSON.parse(cleaned));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

/**
 * SOURCE OF TRUTH KEYWORDS: vapi webhook, generate interview, question generation, gemini questions, create interview
 * WHAT:  Called by the Vapi workflow (not the browser): writes an interview with Gemini-generated questions.
 * WHY:   Vapi can't send our session cookie, so it is checked differently: an optional shared
 *        secret header (VAPI_WEBHOOK_SECRET, sent as x-vapi-secret), and the userid must be a real user.
 * WHERE: The Vapi workflow behind NEXT_PUBLIC_VAPI_WORKFLOW_ID (components/Agent.tsx, type="generate").
 */
export async function POST(request: Request) {
  const secret = process.env.VAPI_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-vapi-secret") !== secret) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const parsed = requestBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }
  const { type, role, level, techstack, amount, userid } = parsed.data;

  try {
    const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.id, userid)).limit(1);
    if (!owner) {
      return Response.json({ success: false, error: "Unknown user" }, { status: 404 });
    }

    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
                    The job role is ${role}.
                    The job experience level is ${level}.
                    The tech stack used in the job is: ${techstack}.
                    The focus between behavioural and technical questions should lean towards: ${type}.
                    The amount of questions required is: ${amount}.
                    Please return only the questions, without any additional text.
                    The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
                    Return the questions formatted like this:
                    ["Question 1", "Question 2", "Question 3"]

                    Thank you! <3`,
    });

    const questions = parseQuestions(text);
    if (!questions) {
      return Response.json({ success: false, error: "Could not generate questions" }, { status: 502 });
    }

    await db.insert(interview).values({
      userId: owner.id,
      role,
      type,
      level,
      techstack: techstack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      questions,
      finalized: true,
      coverImage: getRandomInterviewCover(),
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Interview generation failed:", error instanceof Error ? error.message : "unknown");
    return Response.json({ success: false, error: "Interview generation failed" }, { status: 500 });
  }
}
