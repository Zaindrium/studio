
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import { getAnalytics } from "firebase/analytics"; // Optional: if you plan to use Firebase Analytics

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Validate that essential Firebase config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase configuration error: API Key or Project ID is missing.\n" +
    "Please ensure your .env file is correctly set up with all NEXT_PUBLIC_FIREBASE_ variables.\n" +
    "You need to replace placeholder values with your actual Firebase project credentials.\n" +
    "After updating .env, restart your Next.js development server."
  );
  // Optionally, throw an error to stop initialization if critical config is missing,
  // though Firebase SDK will likely throw its own error first.
  // throw new Error("Critical Firebase configuration (API Key or Project ID) is missing. Check .env file and restart server.");
}

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
// const analytics = getAnalytics(app); // Optional

export { app, auth, db };
