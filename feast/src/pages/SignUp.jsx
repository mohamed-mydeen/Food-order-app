import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

function validate(form) {
  const errs = {}
  if (!form.name.trim())        errs.name     = 'Name is required'
  else if (form.name.trim().length < 3) errs.name = 'At least 3 characters'
  if (!form.email.trim())       errs.email    = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
  if (!form.password)           errs.password = 'Password is required'
  else if (form.password.length < 6) errs.password = 'Min. 6 characters'
  return errs
}

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ name: '', email: '', password: '' })
  const [touched, setT]     = useState({})
  const [loading, setLoad]  = useState(false)
  const [apiError, setApiE] = useState('')
  const [success, setSucc]  = useState(false)
  const [showPass, setShow] = useState(false)

  const setSlice = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setT(t => ({ ...t, [key]: true }))
    setApiE('')
  }

  const errors  = validate(form)
  const isValid = Object.keys(errors).length === 0

  const handleSubmit = async (e) => {
    e.preventDefault()
    setT({ name: true, email: true, password: true })
    if (!isValid) return
    setLoad(true); setApiE('')
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      setSucc(true)
      setTimeout(() => navigate('/home', { replace: true }), 1500)
    } catch (err) {
      setApiE(err.message || 'Registration failed. Please try again.')
    } finally { setLoad(false) }
  }

  const inputClass = (key) => `
    w-full bg-white border rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none transition-all text-[14px] font-medium shadow-sm
    ${touched[key] && errors[key]
      ? 'border-red-400 focus:ring-2 focus:ring-red-100 placeholder:text-red-300'
      : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400'
    }
  `

  return (
    <main className="relative h-full w-full flex flex-col items-center justify-center px-5 py-8 overflow-y-auto bg-[#0A0A0B]">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          className="w-full h-full object-cover scale-110 opacity-30"
          src="https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2070&auto=format&fit=crop"
          alt="Feast Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[340px] flex flex-col">

        {/* Back button */}
        <button
          onClick={() => navigate('/login')}
          className="self-start mb-5 w-9 h-9 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/25 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        {/* Heading */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-headline font-black text-3xl text-white tracking-tighter leading-none mb-1">
            Create <span className="text-primary italic">Account</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium">Quick setup — you can add more details later.</p>
        </motion.div>

        {/* Banners */}
        <AnimatePresence>
          {success && (
            <motion.div
              className="mb-4 bg-green-500 text-white rounded-2xl px-4 py-3 flex items-center gap-2 text-sm font-bold"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              Welcome! Redirecting…
            </motion.div>
          )}
          {apiError && (
            <motion.div
              className="mb-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs font-bold"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            >
              <span className="material-symbols-outlined text-[16px]">error</span>
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div
          className="bg-white rounded-[26px] px-6 py-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)]"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22 }}
        >
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

            {/* Full Name */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">person</span>
              <input type="text" value={form.name} onChange={setSlice('name')}
                placeholder="Full Name" className={inputClass('name')} autoComplete="name" />
              {touched.name && errors.name && (
                <p className="text-red-500 text-[10px] mt-0.5 ml-1 font-bold">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">mail</span>
              <input type="email" value={form.email} onChange={setSlice('email')}
                placeholder="Email Address" className={inputClass('email')} autoComplete="email" />
              {touched.email && errors.email && (
                <p className="text-red-500 text-[10px] mt-0.5 ml-1 font-bold">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">lock</span>
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={setSlice('password')}
                placeholder="Password (min. 6 chars)" className={`${inputClass('password')} pr-11`} autoComplete="new-password" />
              <button type="button" onClick={() => setShow(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
              {touched.password && errors.password && (
                <p className="text-red-500 text-[10px] mt-0.5 ml-1 font-bold">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-[#e34105] to-[#ff7138] shadow-[0_8px_20px_rgba(227,65,5,0.28)] text-white font-headline font-black rounded-2xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 text-sm mt-1"
              whileTap={{ scale: 0.97 }}
            >
              {loading
                ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creating…</>
                : <>CREATE ACCOUNT <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              }
            </motion.button>

            {/* Skip */}
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full bg-slate-50 border border-slate-100 text-slate-500 font-semibold rounded-2xl py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all text-sm"
            >
              Skip for now
              <span className="material-symbols-outlined text-[16px]">fast_forward</span>
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-xs font-medium mt-5">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-white font-black hover:text-primary transition-colors underline underline-offset-2 decoration-primary/50"
          >
            Sign In
          </button>
        </p>

      </div>
    </main>
  )
}
