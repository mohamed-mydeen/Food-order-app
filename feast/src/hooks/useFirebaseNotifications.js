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
          // Get Firebase token
          const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
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
      // Optional: You could show an in-app toast here if desired,
      // though the OS might not show a native notification if the app is focused.
    });

    return () => unsubscribe();
  }, [isLoggedIn, authToken]);
}
