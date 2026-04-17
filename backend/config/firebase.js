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

  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const decodedJSON = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
    serviceAccount = JSON.parse(decodedJSON);
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      console.log('Firebase Private Key Length:', serviceAccount.private_key.length);
      console.log('Firebase Private Key starts with:', serviceAccount.private_key.substring(0, 30));
      console.log('Firebase Private Key ends with:', serviceAccount.private_key.substring(serviceAccount.private_key.length - 30));
    } else {
      console.log('Firebase Private Key is MISSING in JSON');
    }
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
