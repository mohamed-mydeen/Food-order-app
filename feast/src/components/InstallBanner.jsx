import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'

/**
 * InstallBanner
 *
 * A bottom-anchored "Add to Home Screen" prompt that appears when the browser
 * fires `beforeinstallprompt`. Automatically hides once the app is installed
 * or the user dismisses it. Features a 5-second auto-dismiss countdown.
 */
export default function InstallBanner() {
  const { canInstall, promptInstall, dismissInstall } = usePWAInstall()
  const [timeLeft, setTimeLeft] = useState(5)

  useEffect(() => {
    if (!canInstall) return
    if (timeLeft <= 0) {
      dismissInstall()
      return
    }
    const timer = setInterval(() => {
      setTimeLeft(t => t - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [canInstall, timeLeft, dismissInstall])

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          key="install-banner"
          className="fixed bottom-24 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-[340px]"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 48, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 48, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <div
            className="relative flex items-center gap-3 rounded-2xl px-3 py-3 shadow-2xl overflow-hidden"
            style={{
              background: '#1c1c1e', // Sleek Apple-like dark gray
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Progress Bar for Countdown */}
            <motion.div
              className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#e34105] to-[#ff7138]"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />

            {/* Icon */}
            <div
              className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #e34105, #ff7138)' }}
            >
              <span className="material-symbols-outlined text-white text-[20px] icon-filled">
                install_mobile
              </span>
            </div>

            {/* Text */}
            <div className="relative flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-white text-[13px] font-bold leading-tight font-headline">
                  Feast At Night App
                </p>
                <button
                  onClick={dismissInstall}
                  className="text-white/40 hover:text-white/80 transition-colors text-[10px] font-medium"
                >
                  Not now ({timeLeft}s)
                </button>
              </div>
              <p className="text-white/60 text-[11px] leading-snug">
                Install for faster ordering & tracking
              </p>
            </div>

            {/* CTA */}
            <motion.button
              onClick={promptInstall}
              whileTap={{ scale: 0.93 }}
              className="px-4 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-md flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #e34105, #ff7138)' }}
            >
              Install
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
