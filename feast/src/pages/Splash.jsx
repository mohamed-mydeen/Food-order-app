import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import brandLogo from '../assets/brand_logo.png'

// Mandi Biryani image — Google AIDA public (reliable)
const MANDI_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDv_61kKf4sSB2_h414yOye8GDqaJZWZOKLGUg3U3CWcU00JOGhw1tVjefdIUHhk96UjVscotstLRm1xkRxibcCJ_BhyxQo_mvTmSPY0NIqYTfAS0GD2ZktyPOrDzCYw61Mg4aEoWsEDsCTVotmamfrEt1d91AG03EHHTcS3MZpxiyWLZyav1eiJ0otoct8_d4YKyAXG0RxCYZZQw-HurGdoJXH6r-cKk4tqr3z8fmy58mJcT9jdH2YWf4Np_Brc1qK9rDbIztpLpU'

export default function Splash() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => navigate('/home'), 600)
    }, 5600)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="relative h-full w-full overflow-hidden bg-[#0c0f10] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Hero Background — Mandi Biryani */}
          <div className="absolute inset-0">
            <img
              src={MANDI_IMG}
              alt="Mandi Biryani"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-between flex-1 px-6 py-10 text-center">

            {/* Top label */}
            <motion.span
              className="font-headline text-white/70 text-xs tracking-[0.22em] uppercase font-medium mt-2"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              In the name of Allah
            </motion.span>

            {/* Center */}
            <div className="flex flex-col items-center">
              {/* Brand Logo */}
              <motion.div
                className="w-20 h-20 mb-5 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <img src={brandLogo} alt="Feast At Night" className="w-full h-full object-cover" />
              </motion.div>

              <motion.h1
                className="font-headline font-black text-white text-[2.6rem] tracking-tighter mb-2 leading-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Feast At Night
              </motion.h1>

              <motion.p
                className="font-headline font-semibold text-[#ff784c] text-base mb-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
              >
                Delicious Chicken Mandi &amp; Fresh Juices
              </motion.p>

              <motion.p
                className="font-body text-white/55 text-sm mb-10 max-w-xs leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Fast &amp; tasty food at your doorstep. Experience the warmth of traditional recipes delivered fresh.
              </motion.p>

              {/* Animated loading dots */}
              <motion.div
                className="flex gap-2 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#ff784c]"
                    style={{ animation: `pulse-dot 1.3s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </motion.div>

              <motion.button
                onClick={() => navigate('/home')}
                className="relative inline-flex items-center justify-center px-10 py-4 font-headline font-bold text-[#ffefeb] rounded-full overflow-hidden shadow-2xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="absolute inset-0 bg-gradient-to-tr from-[#a83100] to-[#ff784c]" />
                <span className="relative flex items-center gap-2 text-base">
                  Order Now
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </span>
              </motion.button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
