import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY';

export function useFirebaseNotifications() {
  const { token: authToken, isLoggedIn } = useAuth();

  useEffect(() => {
    // Only request permission and register token if user is signed in
    if (!isLoggedIn || !messaging || !authToken) return;

    const requestPermissionAndRegister = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          // Manually register the service worker to avoid Vite dev server 10000ms timeouts
          let swRegistration = null;
          try {
            swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          } catch (swErr) {
            console.error('Failed to register service worker manually:', swErr);
          }

          // Get Firebase token
          const currentToken = await getToken(messaging, { 
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration
          });
          if (currentToken) {
            // Send to backend
            await fetch(`${API}/api/notifications/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`
              },
              body: JSON.stringify({
                token: currentToken,
                device_info: navigator.userAgent
              })
            });
            console.log('FCM token registered successfully.');
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        } else {
          console.warn('Notification permission not granted.');
        }
      } catch (error) {
        console.error('Error during notification registration:', error);
      }
    };

    requestPermissionAndRegister();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      
      const notification = payload.notification || {};
      const data = payload.data || {};
      const title = notification.title || data.title;
      const body = notification.body || data.body;

      // Force the browser to spawn a native OS notification even if the tab is focused!
      if (title && Notification.permission === 'granted') {
        // Mobile devices (Android) do NOT support `new Notification()`. They require Service Worker.
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body: body,
            icon: '/pwa-192x192.png',
            vibrate: [200, 100, 200]
          });
        }).catch(err => {
          // Fallback for desktop if SW lacks scope
          new Notification(title, {
            body: body,
            icon: '/pwa-192x192.png'
          });
        });
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, authToken]);
}
