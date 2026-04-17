const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Determine path to the service account key
// The user needs to download this from Firebase Console (Project Settings -> Service Accounts -> Generate New Private Key)
// and save it as "firebase-service-account.json" in the backend directory.
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

let messaging = null;

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    messaging = admin.messaging();
    console.log("🔥 Firebase Admin SDK initialized successfully.");
  } else {
    console.warn("⚠️ Firebase Admin SDK not initialized: 'firebase-service-account.json' missing.");
    console.warn("⚠️ Push notifications will not work until you add your service account key.");
  }
} catch (error) {
  console.error("❌ Failed to initialize Firebase Admin SDK:", error);
}

module.exports = { messaging };
