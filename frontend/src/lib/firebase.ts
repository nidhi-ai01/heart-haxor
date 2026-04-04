"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

/** Web app config from Firebase Console (Google sign-in only; email/password uses the API). */
const firebaseConfig = {
  apiKey: "AIzaSyAm_lK4X6aZUFjMIamY5zBHJ7dxnvYQVhM",
  authDomain: "heart-haxor.firebaseapp.com",
  projectId: "heart-haxor",
  storageBucket: "heart-haxor.firebasestorage.app",
  messagingSenderId: "32696631922",
  appId: "1:32696631922:web:cce60df18f129d0d38f8eb",
};

const app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

/** Human-readable messages for Firebase Auth errors (e.g. after signInWithPopup). */
export function getFirebaseAuthErrorMessage(err: unknown): string {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";

  switch (code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is not enabled for this Firebase project. In Firebase Console: Authentication → Sign-in method → enable Google.";
    case "auth/popup-closed-by-user":
      return "Sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the popup. Allow popups for this site and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not allowed for Firebase Auth. Add it under Authentication → Settings → Authorized domains.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      if (err instanceof Error && err.message) return err.message;
      return "Sign-in failed. Please try again.";
  }
}
