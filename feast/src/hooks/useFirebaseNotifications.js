import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY';

/**
 * Manually trigger the permission prompt and registration.
 * Call this from an onClick handler (e.g. after Login or Sign Up)
 */
export async function registerForPushNotifications(authToken) {
  if (!messaging || !authToken) return false;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Use specific scope to prevent fighting with vite-plugin-pwa
      let swRegistration = null;
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/firebase-cloud-messaging-push-scope'
        });
      } catch (swErr) {
        console.error('Failed to register service worker manually:', swErr);
      }

      const currentToken = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      });

      if (currentToken) {
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
        return true;
      }
    }
  } catch (error) {
    console.error('Error during notification registration:', error);
  }
  return false;
}

export function useFirebaseNotifications() {
  const { token: authToken, isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || !messaging || !authToken) return;

    // Only run automatically if permission is ALREADY granted. 
    // Otherwise, we wait for a manual button click to prevent browsers from blocking the prompt.
    if (Notification.permission === 'granted') {
      registerForPushNotifications(authToken);
    }

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      
      if (payload.notification && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/pwa-192x192.png',
            vibrate: [200, 100, 200]
          });
        }).catch(err => {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/pwa-192x192.png'
          });
        });
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, authToken]);

  return { registerForPushNotifications };
}
