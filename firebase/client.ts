// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
