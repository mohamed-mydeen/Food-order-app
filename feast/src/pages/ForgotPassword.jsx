import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Email+Phone, 2: New Password
  
  // Step 1 state
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  // Step 2 state
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleVerifyIdentity = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim() || !phone.trim()) {
      setError('Please provide both email and registered phone number.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      
      if (!data.success) throw new Error(data.message)
      
      setResetToken(data.data.resetToken)
      setStep(2)
      setSuccessMsg('Identity verified! Please set a new password.')
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      })
      const data = await res.json()
      
      if (!data.success) throw new Error(data.message)
      
      setSuccessMsg('Password updated successfully! Redirecting...')
      setTimeout(() => navigate('/login', { replace: true }), 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = `w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[14px] font-medium shadow-sm placeholder:text-slate-400`

  return (
    <main className="relative min-h-full w-full flex flex-col items-center justify-center p-6 bg-[#0A0A0B]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover scale-110 opacity-40"
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt="Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col">
        {/* Back Button */}
        <div className="mb-6 flex justify-start">
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate('/login')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/30 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        {/* Branding */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-headline font-black text-3xl text-white tracking-tighter mb-2">
            Reset <span className="text-primary italic">Password</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {step === 1 ? 'Verify your identity to continue.' : 'Create a strong new password.'}
          </p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" className="mb-6 bg-red-50 text-red-600 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-sm font-bold"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <span className="material-symbols-outlined">error</span>
              <p className="flex-1">{error}</p>
            </motion.div>
          )}
          {successMsg && !error && (
            <motion.div key="success" className="mb-6 bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 font-bold"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <span className="material-symbols-outlined icon-filled">verified</span>
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card */}
        <motion.div className="bg-white rounded-[32px] p-8 shadow-2xl" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          {step === 1 ? (
            <form onSubmit={handleVerifyIdentity} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">mail</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Registered Email" className={inputClass} required />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">call</span>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Registered Phone Number" className={inputClass} required />
              </div>
              
              <button
                type="submit" disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white font-headline font-black rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 shadow-lg"
              >
                {loading ? 'VERIFYING...' : 'VERIFY IDENTITY'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">lock</span>
                <input type={showPass ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" className={`${inputClass} pr-12`} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">verified_user</span>
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" className={inputClass} required />
              </div>

              <button
                type="submit" disabled={loading || successMsg.includes('Redirecting')}
                className="w-full mt-2 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white font-headline font-black rounded-2xl py-4 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 shadow-lg"
              >
                {loading ? 'SAVING...' : 'SAVE NEW PASSWORD'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  )
}
