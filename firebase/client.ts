// import {  cert, getApps } from "firebase-admin/app";

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGjM7gMuilr2K2bvSDy3JxZh4TMx6U9Hs",
  authDomain: "hireon-3467e.firebaseapp.com",
  projectId: "hireon-3467e",
  storageBucket: "hireon-3467e.firebasestorage.app",
  messagingSenderId: "607623539328",
  appId: "1:607623539328:web:881f94d525de5d361d1465",
  measurementId: "G-REXKQWW816",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);
