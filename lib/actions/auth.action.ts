"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

export async function signUp(parms: SignUpParams) {
  const { uid, name, email } = parms;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instaid..",
      };
    }

    await db.collection("users").doc(uid).set({ name, email });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (err: unknown) {
    console.error("Error creating a user", err);

    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: string }).code === "auth/email-already-exists"
    ) {
      return {
        success: false,
        message: "This email is already in use.",
      };
    }

    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function signIn(parms: SignInParams) {
  const { email, idToken } = parms;

  try {
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User not found. Please sign up first.",
      };
    }

    await setSession(idToken);
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "Failed to log into an account.",
    };
  }
}

export async function setSession(idToken: string) {
  const cookieStore = await cookies();
  const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days

  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  cookieStore.set("__session", sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: expiresIn,
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("__session")?.value;

  if (!sessionCookie) return null;
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    if (!userRecord.exists) return null;

    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.log(error);

    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();

  return !!user;
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getAvailableInterviews(
  userId: string,
  limit: number = 20
): Promise<Interview[] | null> {
  try {
    // Get all interviews that haven't been finalized yet
    const availableInterviews = await db
      .collection("interviews")
      .where("finalized", "==", false)
      .limit(limit * 2) // Get more to account for filtering
      .get();

    // Filter and process the results
    const interviews = availableInterviews.docs
      .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Interview)
      )
      .filter((interview) => {
        // Include interviews from other users
        if (interview.userId !== userId) {
          return true;
        }
        // Include user's own interviews that haven't been taken
        return interview.finalized === false;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);

    console.log(
      `Found ${interviews.length} available interviews for user ${userId}`
    );
    return interviews;
  } catch (error) {
    console.error("Error fetching available interviews:", error);
    return null;
  }
}
