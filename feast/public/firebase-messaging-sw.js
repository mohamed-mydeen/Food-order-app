importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyB6iFUSevmqKA9RB_H53R5c2RQ5Dypi9Vs",
  authDomain: "feast-790b4.firebaseapp.com",
  projectId: "feast-790b4",
  storageBucket: "feast-790b4.firebasestorage.app",
  messagingSenderId: "238045088917",
  appId: "1:238045088917:web:e48057aac007d92e271f9c"
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
