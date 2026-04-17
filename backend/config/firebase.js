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

  // 1. Bulletproof Base64 parsing (Fixes all PaaS newline and formatting crashes)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('ascii'));
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
    console.warn("⚠️ Missing 'firebase-service-account.json' file OR 'FIREBASE_SERVICE_ACCOUNT_BASE64' env var.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error);
}

module.exports = { messaging };
