const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Determine path to the service account key
// The user needs to download this from Firebase Console (Project Settings -> Service Accounts -> Generate New Private Key)
// and save it as "firebase-service-account.json" in the backend directory.
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

let messaging = null;

try {
  let serviceAccount = null;

  // 1. Try reading individual environment variables (Robust for Render/Vercel)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // Render/Vercel escape newlines as \\n string, so we must unescape them to \n
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } 
  // 2. Try falling back to local file
  else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    messaging = admin.messaging();
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } else {
    console.warn("⚠️ Firebase Admin SDK not initialized.");
    console.warn("⚠️ Missing 'firebase-service-account.json' file OR missing individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY Env vars.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error);
}

module.exports = { messaging };
