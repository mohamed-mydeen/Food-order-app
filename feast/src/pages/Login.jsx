import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

function validate(form) {
  const errs = {}
  if (!form.email.trim())    errs.email    = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
  if (!form.password)        errs.password = 'Password is required'
  else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
  return errs
}

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [touched, setT]       = useState({})
  const [loading, setLoad]    = useState(false)
  const [apiError, setApiE]   = useState('')
  const [showPass, setShow]   = useState(false)
  const [showNotifPrompt, setShowNotifPrompt] = useState(false)

  const setSlice = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setT(t => ({ ...t, [key]: true }))
    setApiE('')
  }

  const errors  = validate(form)
  const isValid = Object.keys(errors).length === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setT({ email: true, password: true })
    if (!isValid) return
    setLoad(true); setApiE('')
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      // Show notification prompt if not already decided
      if (Notification.permission === 'default') {
        setShowNotifPrompt(true)
      } else {
        navigate('/home', { replace: true })
      }
    } catch (err) {
      setApiE(err.message || 'Login failed. Please try again.')
    } finally { setLoad(false) }
  }

  const inputClass = (key) => `
    w-full bg-white border rounded-2xl pl-12 pr-4 py-4 focus:outline-none transition-all text-[15px] font-medium shadow-sm
    ${touched[key] && errors[key] 
      ? 'border-red-400 focus:ring-4 focus:ring-red-100 placeholder:text-red-300' 
      : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-slate-400'
    }
  `

  return (
    <>
    <main className="relative h-full w-full flex flex-col items-center justify-center px-4 py-6 sm:p-6 overflow-y-auto bg-[#0A0A0B]">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover scale-110 opacity-60"
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt="Feast Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/80 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col">
        
        {/* Branding Section */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-1.5 rounded-full mb-4 border border-primary/30">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Tirunelveli's Night Kitchen</span>
          </div>
          <h1 className="font-headline font-black text-4xl sm:text-5xl text-white tracking-tighter leading-none mb-3">
            FEAST AT <br />
            <span className="text-primary italic">NIGHT</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium">Delivering happiness, one bite at a time.</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <h2 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Please sign in to continue your feast.</p>

          <AnimatePresence>
            {apiError && (
              <motion.div 
                className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3.5 text-xs font-bold"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0 }}
              >
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div className="relative Group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                alternate_email
              </span>
              <input 
                type="email" 
                value={form.email}
                onChange={setSlice('email')}
                placeholder="Email Address"
                className={inputClass('email')} 
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">
                lock_open
              </span>
              <input 
                type={showPass ? 'text' : 'password'} 
                value={form.password}
                onChange={setSlice('password')}
                placeholder="Password"
                className={`${inputClass('password')} pr-12`} 
              />
              <button 
                type="button" 
                onClick={() => setShow(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button type="button" className="text-xs font-bold text-primary hover:underline">
                Forgot Password?
              </button>
            </div>

            <motion.button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#e34105] to-[#ff7138] shadow-[0_10px_25px_rgba(227,65,5,0.3)] text-white font-headline font-black tracking-wide rounded-2xl py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Authenticating...
                </div>
              ) : (
                <>SIGN IN <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>
              )}
            </motion.button>

            {/* Skip for now button */}
            <motion.button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full bg-slate-50 border border-slate-100 text-slate-600 font-bold rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm"
              whileHover={{ bg: '#f8fafc' }}
            >
              Skip for now
              <span className="material-symbols-outlined text-[18px]">fast_forward</span>
            </motion.button>
          </form>

        </motion.div>

        {/* Footer Link */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-slate-400 text-sm font-medium">
            New to Feast At Night?{' '}
            <button 
              onClick={() => navigate('/signup')} 
              className="text-white font-black hover:text-primary transition-colors underline underline-offset-4 decoration-primary/50 decoration-2"
            >
              Create Account
            </button>
          </p>
        </motion.div>

      </div>
    </main>

    {/* Notification Permission Prompt */}
    {showNotifPrompt && (
      <div className="fixed inset-0 z-[999] bg-black/50 flex items-end">
        <motion.div
          className="bg-white w-full rounded-t-3xl px-6 pt-5 pb-10 shadow-2xl"
          initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 28 }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-[#a83100] text-3xl icon-filled">notifications</span>
            </div>
          </div>
          <h3 className="font-headline font-black text-xl text-gray-900 text-center mb-1">Stay Updated!</h3>
          <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
            Allow notifications to get real-time order updates, exclusive offers, and delivery alerts. 🔔
          </p>
          <motion.button
            className="w-full py-4 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white font-headline font-black rounded-2xl text-base mb-3"
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              setShowNotifPrompt(false)
              await Notification.requestPermission()
              navigate('/home', { replace: true })
            }}
          >
            Allow Notifications
          </motion.button>
          <button
            className="w-full py-3 text-sm text-gray-400 font-medium"
            onClick={() => { setShowNotifPrompt(false); navigate('/home', { replace: true }) }}
          >
            Maybe later
          </button>
        </motion.div>
      </div>
    )}
  </>
}

