import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function GET() {
  return Response.json({ success: true, data: "Thank You!" }, { status: 200 });
}

export async function POST(req: Request) {
  const { type, role, level, techstack, amount, userid } = await req.json();

  // Validate required fields
  if (!type || !role || !level || !techstack || !amount || !userid) {
    console.error("Missing required fields:", {
      type,
      role,
      level,
      techstack,
      amount,
      userid,
    });
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    console.log("Starting interview generation for user:", userid);

    const { text: questions } = await generateText({
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

    console.log("Generated questions:", questions);

    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      createdAt: new Date().toISOString(),
      coverImage: getRandomInterviewCover(),
      finalized: false, // Add this field so interviews appear in "Your Interviews" section
    };

    console.log("Saving interview to database:", interview);

    // Test database connection first
    try {
      const testQuery = await db.collection("interviews").limit(1).get();
      console.log(
        "Database connection test successful, existing interviews count:",
        testQuery.size
      );
    } catch (dbTestError) {
      console.error("Database connection test failed:", dbTestError);
      throw new Error(`Database connection failed: ${dbTestError}`);
    }

    const docRef = await db.collection("interviews").add(interview);
    console.log("Interview saved successfully with ID:", docRef.id);

    return Response.json(
      { success: true, data: { ...interview, id: docRef.id } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating or saving interview:", error);

    return Response.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
