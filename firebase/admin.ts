import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";

const initFirebaseAdmin = () => {
  const apps = getApps();

  if (!apps.length) {
    // Use the service account JSON file directly
    const serviceAccountPath = path.join(
      process.cwd(),
      "firebase",
      "hireon-3467e-firebase-adminsdk-fbsvc-c33aa2c5c3.json"
    );

    initializeApp({
      credential: cert(serviceAccountPath),
    });
  }

  return {
    auth: getAuth(),
    db: getFirestore(),
  };
};

const adminServices = initFirebaseAdmin();
export const auth = adminServices.auth;
export const db = adminServices.db;
