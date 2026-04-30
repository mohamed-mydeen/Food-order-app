import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const AUTO_CLOSE_MS = 5000
const SESSION_KEY   = 'fan_offer_seen'

// offer is now passed as a prop from Home.jsx (which fetches it)
export default function OfferPopup({ isOpen, onClose, offer }) {
  const timerRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [downloading, setDownloading] = useState(false)

  /* ── Download poster as image file ───────────────────────────── */
  const handleDownload = async () => {
    if (!offer?.image_url || downloading) return
    setDownloading(true)
    try {
      const res  = await fetch(offer.image_url)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `feast-at-night-offer.${blob.type.split('/')[1] || 'jpg'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      // fallback: open in new tab so user can long-press save
      window.open(offer.image_url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  /* ── Auto-close after 5s when opened ─────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      timerRef.current = setTimeout(onClose, AUTO_CLOSE_MS)
    }
    return () => clearTimeout(timerRef.current)
  }, [isOpen, onClose])

  // Reset imgLoaded when offer changes (new image)
  useEffect(() => {
    setImgLoaded(false)
  }, [offer?.image_url])

  // Don't mount if no active offer passed from parent
  if (!offer?.image_url) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Dim overlay ──────────────────────────────────────── */}
          <motion.div
            className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* ── Popup card ───────────────────────────────────────── */}
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-5 pointer-events-none">
            <motion.div
              className="pointer-events-auto relative rounded-2xl overflow-hidden shadow-2xl bg-black"
              style={{ width: '100%', maxWidth: '400px', maxHeight: '80vh' }}
              initial={{ opacity: 0, scale: 0.82, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            >
              {/* Progress bar (auto-close countdown) */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/25 z-10 overflow-hidden rounded-t-2xl">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: AUTO_CLOSE_MS / 1000, ease: 'linear' }}
                />
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close offer"
                className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 active:scale-90 transition-all shadow-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={downloading || !imgLoaded}
                aria-label="Download offer poster"
                className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 h-9 rounded-full bg-black/50 text-white hover:bg-black/70 disabled:opacity-50 active:scale-90 transition-all shadow-lg text-xs font-bold"
              >
                {downloading
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  : <span className="material-symbols-outlined text-[18px]">download</span>
                }
                {downloading ? 'Saving…' : 'Save'}
              </button>

              {/* Poster image — fits fully inside popup */}
              <div className="relative flex items-center justify-center" style={{ maxHeight: '80vh', minHeight: '200px' }}>
                {!imgLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 min-h-[240px]">
                    <svg className="animate-spin w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  </div>
                )}
                <img
                  src={offer.image_url}
                  alt={offer.title || "Today's Special Offer"}
                  className={`w-full h-auto object-contain transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{ maxHeight: '80vh', display: 'block' }}
                  onLoad={() => setImgLoaded(true)}
                  loading="eager"
                  draggable="false"
                />
              </div>

              {/* Bottom label overlay */}
              <div className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <span className="inline-block bg-[#a83100] text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full mb-1.5 shadow">
                  LIMITED OFFER
                </span>
                <p className="text-white font-headline font-extrabold text-lg leading-snug drop-shadow">
                  {offer.title || 'View Today Offer For You 🔥'}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-white/60 text-xs font-medium">
                    Feast At Night Special
                  </p>
                  <button
                    onClick={handleDownload}
                    disabled={downloading || !imgLoaded}
                    className="flex items-center gap-1 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
                  >
                    {downloading
                      ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <span className="material-symbols-outlined text-[14px]">download</span>
                    }
                    {downloading ? 'Saving…' : 'Download Poster'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ── Session helpers ─────────────────────────────────────────────── */
export function shouldShowOffer() {
  return !sessionStorage.getItem(SESSION_KEY)
}

export function markOfferSeen() {
  sessionStorage.setItem(SESSION_KEY, '1')
}
