import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// Strip accidental surrounding quotes that can appear when env vars are
// defined as VITE_X="value" (Vite passes them including the quotes).
const clean = (v) => (v ? v.replace(/^"|"$/g, '') : v);

const firebaseConfig = {
  apiKey:            clean(import.meta.env.VITE_FIREBASE_API_KEY)            || "AIzaSyB6iFUSevmgKA9RB_H53R5c2RQ5Dypi9Vs",
  authDomain:        clean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN)        || "feast-790b4.firebaseapp.com",
  projectId:         clean(import.meta.env.VITE_FIREBASE_PROJECT_ID)         || "feast-790b4",
  storageBucket:     clean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET)     || "feast-790b4.firebasestorage.app",
  messagingSenderId: clean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || "238045088917",
  appId:             clean(import.meta.env.VITE_FIREBASE_APP_ID)             || "1:238045088917:web:e48057aac007d92e271f9c",
};

let app;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
  // isSupported() is async and guards against non-supporting environments (e.g. iOS < 16.4)
  isSupported().then((supported) => {
    if (supported) {
      messaging = getMessaging(app);
    } else {
      console.warn("Firebase Messaging not supported in this browser.");
    }
  });
} catch (error) {
  console.warn("Firebase init failed:", error);
}

export { app, messaging };
