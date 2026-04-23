import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function OrderSuccess() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // If accessed directly without state, go to home
    if (!state?.total && state?.total !== 0) {
      navigate('/home', { replace: true })
      return
    }

    if (countdown <= 0) {
      navigate('/orders', { replace: true })
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    
    return () => clearInterval(timer)
  }, [navigate, state, countdown])

  if (!state?.total && state?.total !== 0) return null

  const confetti = Array.from({ length: 32 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.8,
    color: ['#a83100', '#ff784c', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'][i % 6],
    size: 6 + Math.random() * 8, rotation: Math.random() * 360,
  }))

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#0A0A0B] text-white overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map(c => (
          <motion.div key={c.id} className="absolute rounded-sm"
            style={{ left: `${c.x}%`, top: '-20px', width: c.size, height: c.size, backgroundColor: c.color }}
            initial={{ y: -20, rotate: c.rotation, opacity: 1 }}
            animate={{ y: '110vh', rotate: c.rotation + 1080, opacity: [1, 1, 0] }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: c.delay, ease: 'easeIn' }} />
        ))}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center relative z-10 w-full max-w-sm mx-auto">
        <div className="relative mb-4">
          <motion.div className="absolute inset-0 rounded-full bg-emerald-500/20"
            initial={{ scale: 0.8, opacity: 0.8 }} animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.2 }} />
          <motion.div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
            <span className="material-symbols-outlined text-white text-[56px]" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
          </motion.div>
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-3">
          <h2 className="font-headline font-black text-[32px] text-white tracking-tight leading-tight">Order Confirmed!</h2>
          <div className="inline-block bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
            <p className="text-slate-300 text-sm font-medium">
              {state?.method === 'UPI' ? 'Payment received successfully' : `Pay ₹${state.total.toFixed(0)} upon delivery`}
            </p>
          </div>
        </motion.div>
        
        <motion.div className="flex flex-col gap-3 w-full mt-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          
          <button onClick={() => navigate('/orders', { replace: true })} className="w-full py-4 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white rounded-[20px] font-headline font-black text-[15px] shadow-[0_8px_25px_rgba(255,113,56,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            Track Order
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          
          <button onClick={() => navigate('/home', { replace: true })} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[20px] font-headline font-bold text-sm active:scale-[0.98] transition-all">
            Back to Home
          </button>
          
          <p className="text-[11px] text-slate-500 font-medium mt-2">Redirecting automatically in {countdown}s...</p>
        </motion.div>
      </div>
    </div>
  )
}
