import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
              {/* Logo badge */}
              <motion.div
                className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-[#ff784c] to-[#a83100] flex items-center justify-center shadow-2xl"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
              >
                <span className="material-symbols-outlined text-white text-3xl icon-filled">restaurant_menu</span>
              </motion.div>

              <motion.h1
                className="font-headline font-black text-white text-[2.6rem] tracking-tighter mb-2 leading-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                mpm hub
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

            {/* Bottom icons */}
            <motion.div
              className="flex flex-col items-center gap-3 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="w-px h-8 bg-gradient-to-b from-[#ff784c] to-transparent opacity-50" />
              <div className="flex gap-3">
                {['restaurant_menu', 'local_bar', 'delivery_dining'].map((icon) => (
                  <div key={icon} className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                    <span className="material-symbols-outlined text-white text-[20px]">{icon}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Floating Chef Card */}
          <motion.div
            className="absolute bottom-28 left-4 z-20"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/10 max-w-[170px]">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ff784c] animate-pulse" />
                <span className="text-[9px] uppercase tracking-widest text-white/60 font-bold">Chef's Choice</span>
              </div>
              <p className="text-white text-xs font-headline font-semibold">Special Mandi Platter</p>
              <p className="text-white/40 text-[10px] mt-0.5">Slow-cooked for 8 hours.</p>
            </div>
          </motion.div>

          {/* Floating Rating Card */}
          <motion.div
            className="absolute top-16 right-4 z-20"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75, duration: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAYO9ZH2JYES_XOgsY4YXn8MxJyTCZYzQlhDcAWycvVyhdzpytxhsLjfrjOOVSYgs883HWxSyZzIVp1EQG91dFco-nd132z07tlfbwjSgR1NaruVQpCK51GVLzCi68j8-SaHh2eEinaHtFhu0FlXGoj8ZfeHVYFkrXx57kwP4vKm5kKBYly0CF-_Y3zUGCP_rvoIvfL2TrK2mMZldFpUUn3Q-gwTtJ5PeVsDumbqTCurWFf_U-bbTYL--aujCpiasMqUg3GEnLyaUc',
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuAqhaDHpPWUasHt5gTXbZo6hElMii46NS3_UZdqcFAxVrbx7rkQvP0AcnORodMh5F9TxK8425ee3GEQp7n6tUrvwrBStMeah3kmBrrDEM61UUY8Sidz_l5bpts2Vu_bhVhpiEsNxNB9-kNw63lhadvDLBqrdA8TEfcQAKGPcQSTXBpLKkJywrZd_qi_KhlPmJwOxo_q6l3RnlNpVaFR8s92SVN9vPFOwSBDYMnlwJePH1pWoUoEhKFgu0y6dbNOCduw8PLQu1wEPwY',
                ].map((src, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-white/30 overflow-hidden">
                    <img src={src} alt={`User ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-[10px] font-bold">12+ Orders</p>
                <div className="flex text-[#ff784c]" style={{ fontSize: 10 }}>{'★★★★½'}</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
