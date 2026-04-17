import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

// Web app's Firebase configuration
// REPLACE with actual config from Firebase Console once created
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase not properly configured:", error);
}

export { app, messaging };
