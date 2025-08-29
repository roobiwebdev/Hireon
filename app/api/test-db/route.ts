import { db } from "@/firebase/admin";

export async function GET() {
  try {
    // Test reading from database
    const interviewsSnapshot = await db.collection("interviews").limit(5).get();
    const interviews = interviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return Response.json({
      success: true,
      message: "Database connection successful",
      interviewCount: interviews.length,
      sampleInterviews: interviews,
    });
  } catch (error) {
    console.error("Database test error:", error);
    return Response.json(
      {
        success: false,
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Test writing to database
    const testDoc = await db.collection("test").add({
      message: "Test document",
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message: "Database write test successful",
      docId: testDoc.id,
    });
  } catch (error) {
    console.error("Database write test error:", error);
    return Response.json(
      {
        success: false,
        error: "Database write test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
