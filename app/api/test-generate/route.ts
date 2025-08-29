import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/firebase/admin";

export async function POST() {
  try {
    // Test data
    const testData = {
      type: "technical",
      role: "Frontend Developer",
      level: "Mid-level",
      techstack: "React,TypeScript,Tailwind CSS",
      amount: 5,
      userid: "d6ajYvXjHIXbzXGpnHzBFOLsXVm2" // Your user ID from the debug info
    };

    console.log("Testing interview generation with data:", testData);

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${testData.role}.
        The job experience level is ${testData.level}.
        The tech stack used in the job is: ${testData.techstack}.
        The focus between behavioural and technical questions should lean towards: ${testData.type}.
        The amount of questions required is: ${testData.amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3`,
    });

    console.log("Generated questions:", questions);

    const interview = {
      role: testData.role,
      type: testData.type,
      level: testData.level,
      techstack: testData.techstack.split(","),
      questions: JSON.parse(questions),
      userId: testData.userid,
      createdAt: new Date().toISOString(),
      coverImage: getRandomInterviewCover(),
      finalized: false,
    };

    console.log("Saving test interview to database:", interview);

    const docRef = await db.collection("interviews").add(interview);
    console.log("Test interview saved successfully with ID:", docRef.id);

    return Response.json({
      success: true,
      message: "Test interview generated successfully",
      data: { ...interview, id: docRef.id }
    });

  } catch (error) {
    console.error("Error in test interview generation:", error);

    return Response.json({
      success: false,
      error: "Test interview generation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
