import { db } from "@/db";
import { interview, user } from "@/db/schema";
import { generateInterviewQuestions } from "@/lib/ai/questions";
import { getRandomInterviewCover } from "@/lib/utils";
import { interviewSetupSchema, splitTechstack } from "@/lib/validation/interview";
import { eq } from "drizzle-orm";
import { z } from "zod";

const requestBody = interviewSetupSchema.extend({ userid: z.string().min(1) });

export async function GET() {
  return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

/**
 * SOURCE OF TRUTH KEYWORDS: vapi webhook, generate interview, question generation, create interview from vapi
 * WHAT:  Called by the Vapi workflow (not the browser): writes an interview with Gemini-generated questions.
 * WHY:   Vapi can't send our session cookie, so it is checked differently: an optional shared
 *        secret header (VAPI_WEBHOOK_SECRET, sent as x-vapi-secret), and the userid must be a real user.
 *        Only used when NEXT_PUBLIC_VOICE_PROVIDER=vapi; the browser flow uses createInterview instead.
 * WHERE: The Vapi workflow behind NEXT_PUBLIC_VAPI_WORKFLOW_ID.
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
  const { userid, ...setup } = parsed.data;

  try {
    const [owner] = await db.select({ id: user.id }).from(user).where(eq(user.id, userid)).limit(1);
    if (!owner) {
      return Response.json({ success: false, error: "Unknown user" }, { status: 404 });
    }

    const questions = await generateInterviewQuestions(setup);

    await db.insert(interview).values({
      userId: owner.id,
      role: setup.role,
      type: setup.type,
      level: setup.level,
      techstack: splitTechstack(setup.techstack),
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
