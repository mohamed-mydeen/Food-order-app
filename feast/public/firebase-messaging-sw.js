importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  // You will need to hardcode test config here or use URL params if bundled
  // For production, the user MUST put their config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID" // Placeholder
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon-192.png',
      badge: '/badge.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (e) {
  console.warn("Firebase SW could not be initialized. Please replace placeholders with real keys.");
}
