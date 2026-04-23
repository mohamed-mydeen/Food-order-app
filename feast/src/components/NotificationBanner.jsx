import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Only proceed if notifications are supported
    if (!('Notification' in window)) return;

    // Check if user already dismissed or made a choice
    const isDismissed = localStorage.getItem('fan_notif_dismissed');
    
    // We only prompt if permission is exactly 'default' (meaning hasn't been asked yet)
    // Delay slightly so it doesn't clash with initial load animations
    const timer = setTimeout(() => {
      if (Notification.permission === 'default' && !isDismissed) {
        setShowBanner(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleEnable = async () => {
    try {
      const permission = await Notification.requestPermission();
      setShowBanner(false);
      if (permission !== 'granted') {
        localStorage.setItem('fan_notif_dismissed', 'true');
      }
    } catch (err) {
      console.error('Failed to request notification permission', err);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('fan_notif_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          key="notif-banner"
          className="fixed top-4 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: -48, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -48, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <div
            className="relative flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl overflow-hidden bg-surface"
            style={{
              border: '1px solid var(--color-primary, #ff784c)',
            }}
          >
            {/* Icon */}
            <div
              className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-md bg-primary/10"
            >
              <span className="material-symbols-outlined text-primary text-[22px]">
                notifications_active
              </span>
            </div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <p className="text-on-surface text-sm font-bold leading-tight font-headline">
                Enable Notifications
              </p>
              <p className="text-on-surface-variant text-[11px] mt-0.5 leading-snug">
                Stay updated on your orders and special offers.
              </p>
            </div>

            {/* CTA */}
            <div className="relative flex flex-col items-end gap-1.5 flex-shrink-0">
              <motion.button
                onClick={handleEnable}
                whileTap={{ scale: 0.93 }}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black text-white shadow-md bg-primary hover:bg-primary/90"
              >
                Allow
              </motion.button>
              <button
                onClick={handleDismiss}
                className="text-on-surface-variant text-[10px] hover:text-on-surface transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
