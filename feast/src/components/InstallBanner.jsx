import { motion, AnimatePresence } from 'framer-motion'
import { usePWAInstall } from '../hooks/usePWAInstall'

/**
 * InstallBanner
 *
 * A bottom-anchored "Add to Home Screen" prompt that appears when the browser
 * fires `beforeinstallprompt`. Automatically hides once the app is installed
 * or the user dismisses it.
 *
 * Usage: drop <InstallBanner /> anywhere inside the app-shell (it is absolutely
 * positioned, so placement in the tree doesn't matter visually).
 */
export default function InstallBanner() {
  const { canInstall, promptInstall, dismissInstall } = usePWAInstall()

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          key="install-banner"
          className="fixed bottom-20 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, y: 48, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 48, scale: 0.95 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        >
          <div
            className="relative flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a0a00 0%, #2d1200 60%, #3d1900 100%)',
              border: '1px solid rgba(255,120,60,0.3)',
            }}
          >
            {/* Glow accent */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 20% 50%, rgba(255,120,60,0.12) 0%, transparent 70%)',
              }}
            />

            {/* Icon */}
            <div
              className="relative flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c23a00, #ff784c)' }}
            >
              <span className="material-symbols-outlined text-white text-[22px]">
                download_for_offline
              </span>
            </div>

            {/* Text */}
            <div className="relative flex-1 min-w-0">
              <p className="text-white text-sm font-bold leading-tight font-headline">
                Install mpm hub
              </p>
              <p className="text-white/60 text-[11px] mt-0.5 leading-snug">
                Add to Home Screen for the best experience
              </p>
            </div>

            {/* CTA */}
            <div className="relative flex flex-col items-end gap-1.5 flex-shrink-0">
              <motion.button
                onClick={promptInstall}
                whileTap={{ scale: 0.93 }}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black text-white shadow-md"
                style={{ background: 'linear-gradient(135deg, #c23a00, #ff784c)' }}
              >
                Install
              </motion.button>
              <button
                onClick={dismissInstall}
                className="text-white/40 text-[10px] hover:text-white/70 transition-colors"
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
