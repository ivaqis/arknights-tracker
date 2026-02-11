// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBAb_-9hmyvEo8RWoGO1GfRkHeXXBNJROc",
  authDomain: "goyfield-73.firebaseapp.com",
  projectId: "goyfield-73",
  storageBucket: "goyfield-73.firebasestorage.app",
  messagingSenderId: "161639610368",
  appId: "1:161639610368:web:13e0170cdcb02e3b66c0e5",
  measurementId: "G-5VDE9YMJX5"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;