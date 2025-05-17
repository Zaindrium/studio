
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

// More detailed check for Firebase config values
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.projectId || firebaseConfig.projectId === "YOUR_PROJECT_ID") {
  const errorMessage = 
    "Firebase configuration error: Critical Firebase variables (API Key or Project ID) are missing or are still set to placeholder values.\n" +
    "Please ensure your .env file (at the root of your project) is correctly set up with all NEXT_PUBLIC_FIREBASE_ variables.\n" +
    "You need to replace placeholder values like 'YOUR_API_KEY' or 'YOUR_PROJECT_ID' with your actual Firebase project credentials.\n" +
    "After updating .env, you MUST restart your Next.js development server (e.g., 'npm run dev') for the changes to take effect.";
  
  console.error(errorMessage);
  
  // Optionally, throw an error to stop initialization if critical config is missing.
  // This can be helpful during development to ensure the config is correct.
  // For production, you might handle this more gracefully or rely on Firebase SDK's internal errors.
  if (typeof window !== "undefined") {
    // Display a more prominent error for client-side issues.
    // Note: This alert will only show if the app manages to load some JS.
    // The console error above is more reliable for catching this early.
    alert("Firebase Configuration Error: Please check console for details. Critical API Key or Project ID is missing or incorrect in .env file.");
  }
  // Throwing here can stop the app if you prefer strict config checks.
  // throw new Error("Critical Firebase configuration is missing or invalid. Check .env file and restart server.");
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
