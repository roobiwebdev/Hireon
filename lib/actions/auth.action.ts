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