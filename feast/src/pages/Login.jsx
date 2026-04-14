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

const inputBase = (hasErr, touched) =>
  `w-full h-13 bg-surface-container-low border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 transition-all text-on-surface placeholder:text-outline text-sm
  ${hasErr && touched
    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
    : 'border-outline-variant/30 focus:ring-primary/20 focus:border-primary'
  }`

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [touched, setT]     = useState({})
  const [loading, setLoad]  = useState(false)
  const [apiError, setApiE] = useState('')
  const [showPass, setShow] = useState(false)

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setT(t => ({ ...t, [key]: true }))
    setApiE('')
  }
  const blur = (key) => () => setT(t => ({ ...t, [key]: true }))

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
      navigate('/home', { replace: true })
    } catch (err) {
      setApiE(err.message || 'Login failed. Please try again.')
    } finally { setLoad(false) }
  }

  return (
    <main className="relative h-full w-full flex flex-col items-center justify-center p-6 overflow-hidden bg-background font-body text-on-background antialiased">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSGlQFmkqPMwEF5CUr1vnUXRKSrbTSo4gbReOhsiBB9NtFWgD7KkUsL4YoFjqCekzUl1NG7cPryK-8rQ0hYM373RZlpsz5ntO2VrPCzuPtIJeaNk4RYPUekRILkqykJ3OJudT8Ig6afgLylLp_lD6VDb0P0kzG9K7gekxqR-9D0x3jjMu3oSj7peZXggoYHDeoemogf-w1q4PHOFNpyBPpqHD8Tfy8F8qqHBiAccFIKUyGWj0W31BcIptZIkNsTLJQmPVoEtGLub0"
          alt="Feast At Night" />
        <div className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.72) 100%)' }} />
      </div>

      {/* Brand */}
      <header className="relative z-10 mb-10 text-center">
        <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter text-white drop-shadow-2xl">
          FEAST AT NIGHT
        </h1>
        <p className="text-white/60 text-sm mt-2">Sign in to your account</p>
      </header>

      {/* Card */}
      <motion.div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* API Error */}
        <AnimatePresence>
          {apiError && (
            <motion.div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span className="material-symbols-outlined text-[16px]">error</span>{apiError}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input type="email" value={form.email}
              onChange={set('email')} onBlur={blur('email')}
              placeholder="you@example.com"
              className={inputBase(errors.email, touched.email)} />
            <AnimatePresence>
              {touched.email && errors.email && (
                <motion.p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span className="material-symbols-outlined text-[12px]">error</span>{errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={set('password')} onBlur={blur('password')}
                placeholder="••••••••"
                className={`${inputBase(errors.password, touched.password)} pr-12`} />
              <button type="button" onClick={() => setShow(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            <AnimatePresence>
              {touched.password && errors.password && (
                <motion.p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <span className="material-symbols-outlined text-[12px]">error</span>{errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button type="submit" disabled={loading}
            className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 mt-2"
            whileHover={{ scale: !loading ? 1.01 : 1 }}
            whileTap={{ scale: 0.97 }}>
            {loading
              ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
              : 'Sign In'
            }
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-medium text-sm">
            New to Feast At Night?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline ml-1">
              Create an account
            </button>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
