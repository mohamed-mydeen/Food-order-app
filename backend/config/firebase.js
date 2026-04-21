const admin = require('firebase-admin');
const fs    = require('fs');
const path  = require('path');

const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');

let messaging = null;

try {
  let serviceAccount = null;

  // ── Strategy 1: FIREBASE_SERVICE_ACCOUNT_BASE64 env var (Render/production) ──
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const raw = Buffer.from(
      process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.trim(),
      'base64'
    ).toString('utf8');

    serviceAccount = JSON.parse(raw);

    // Normalize the private_key — handles every encoding scenario:
    //   • JSON.parse already converts \\n → \n (real newline) in most cases
    //   • But if the base64 source had literal \n strings, fix them too
    //   • Also strip any stray \r (Windows line endings)
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key
        .replace(/\\n/g, '\n')   // literal backslash-n → real newline
        .replace(/\r/g, '');     // strip carriage returns
    }

    console.log('🔑 Firebase key loaded from env var, length:', serviceAccount.private_key?.length);
  }

  // ── Strategy 2: local JSON file (development fallback) ────────────────────
  else if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
    console.log('🔑 Firebase key loaded from local service-account.json');
  }

  if (serviceAccount?.private_key) {
    serviceAccount.private_key = serviceAccount.private_key
      .replace(/\\n/g, '\n')   // literal backslash-n → real newline
      .replace(/\r/g, '');     // strip carriage returns
  }

  // ── Initialize ────────────────────────────────────────────────────────────
  if (serviceAccount) {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    messaging = admin.messaging();
    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('⚠️  Firebase Admin SDK not initialized — set FIREBASE_SERVICE_ACCOUNT_BASE64 in Render env vars.');
  }

} catch (err) {
  console.error('❌ Firebase Admin SDK init failed:', err.message);
}

module.exports = { messaging };
