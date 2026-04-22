import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import NeighborhoodPicker from '../components/NeighborhoodPicker'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

// ── Validation rules ──────────────────────────────────────────────────────────
function validate(form) {
  const errs = {}
  if (!form.name.trim())                         errs.name    = 'Name is required'
  else if (form.name.trim().length < 3)          errs.name    = 'Name must be at least 3 characters'
  if (!form.email.trim())                        errs.email   = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format'
  if (!form.phone.trim())                        errs.phone   = 'Phone number is required'
  else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, '')))  errs.phone = 'Phone must be exactly 10 digits'
  if (!form.neighborhood)                        errs.neighborhood = 'Please select your area'
  if (!form.pincode.trim())                      errs.pincode = 'Pincode is required'
  else if (!/^\d{6}$/.test(form.pincode.trim())) errs.pincode = 'Pincode must be exactly 6 digits'
  if (!form.password)                            errs.password = 'Password is required'
  else if (form.password.length < 6)            errs.password = 'Password must be at least 6 characters'
  if (!form.confirm)                             errs.confirm  = 'Please confirm your password'
  else if (form.confirm !== form.password)       errs.confirm  = 'Passwords do not match'
  return errs
}

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '', address: '', neighborhood: '', pincode: '' })
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
    setT({ name: true, email: true, phone: true, password: true, confirm: true, neighborhood: true, pincode: true })
    if (!isValid) return
    setLoad(true); setApiE('')
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\s/g, ''),
          password: form.password,
          address: form.address,
          neighborhood: form.neighborhood,
          pincode: form.pincode.trim(),
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      setSucc(true)
      setTimeout(() => navigate('/home', { replace: true }), 1800)
    } catch (err) {
      setApiE(err.message || 'Registration failed. Please try again.')
    } finally { setLoad(false) }
  }

  const inputClass = (key) => `
    w-full bg-white border rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none transition-all text-[14px] font-medium shadow-sm
    ${touched[key] && errors[key] 
      ? 'border-red-400 focus:ring-4 focus:ring-red-100 placeholder:text-red-300' 
      : 'border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-slate-400'
    }
  `

  return (
    <main className="relative min-h-full w-full flex flex-col items-center p-6 overflow-x-hidden bg-[#0A0A0B]">
      {/* Immersive Background */}
      <div className="fixed inset-0 z-0">
        <img 
          className="w-full h-full object-cover scale-110 opacity-40"
          src="https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=2070&auto=format&fit=crop"
          alt="Feast Background" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/90 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col pt-4">
        
        {/* Back Button */}
        <div className="mb-6 flex justify-start">
          <button 
            onClick={() => navigate('/login')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/30 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>

        {/* Branding Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="font-headline font-black text-4xl text-white tracking-tighter leading-none mb-2">
            Create <br />
            <span className="text-primary italic font-black">Account</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-tight">Begin your flavor journey tonight.</p>
        </motion.div>

        {/* Success / Error Banners */}
        <AnimatePresence>
          {success && (
            <motion.div className="mb-6 bg-green-500 text-white rounded-2xl p-4 flex items-center gap-3 overflow-hidden font-bold"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <span className="material-symbols-outlined icon-filled">verified</span>
              Welcome! Redirecting...
            </motion.div>
          )}
          {apiError && (
            <motion.div className="mb-6 bg-red-50 text-red-600 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-sm font-bold"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
              <span className="material-symbols-outlined">error</span>
              {apiError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Card */}
        <motion.div 
          className="bg-white rounded-[32px] p-8 shadow-2xl mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            
            {/* Full Name */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">person</span>
              <input type="text" value={form.name} onChange={setSlice('name')}
                placeholder="Full Name" className={inputClass('name')} />
              {touched.name && errors.name && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="relative pt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">mail</span>
              <input type="email" value={form.email} onChange={setSlice('email')}
                placeholder="Email Address" className={inputClass('email')} />
              {touched.email && errors.email && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="relative pt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">call</span>
              <input type="tel" value={form.phone} onChange={setSlice('phone')}
                placeholder="Phone Number" className={inputClass('phone')} />
              {touched.phone && errors.phone && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.phone}</p>}
            </div>

            {/* Neighborhood */}
            <div className="relative pt-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Your Area</label>
               <NeighborhoodPicker 
                 value={form.neighborhood}
                 onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))}
                 touched={touched.neighborhood}
                 error={errors.neighborhood}
               />
            </div>

            {/* Pincode */}
            <div className="relative pt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">pin_drop</span>
              <input type="text" maxLength={6} value={form.pincode} onChange={setSlice('pincode')}
                placeholder="6-digit Pincode" className={inputClass('pincode')} />
              {touched.pincode && errors.pincode && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.pincode}</p>}
            </div>

            {/* Password */}
            <div className="relative pt-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">lock</span>
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={setSlice('password')}
                placeholder="Password (Min. 6)" className={`${inputClass('password')} pr-12`} />
              <button type="button" onClick={() => setShow(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
              {touched.password && errors.password && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div className="relative pt-1 pb-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">verified_user</span>
              <input type="password" value={form.confirm} onChange={setSlice('confirm')}
                onPaste={(e) => e.preventDefault()}
                placeholder="Confirm Password" className={inputClass('confirm')} />
              {touched.confirm && errors.confirm && <p className="text-red-500 text-[10px] absolute -bottom-4 left-4 font-bold uppercase">{errors.confirm}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-[#e34105] to-[#ff7138] shadow-[0_10px_25px_rgba(227,65,5,0.3)] text-white font-headline font-black tracking-wide rounded-2xl py-4 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-60 text-base"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
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

        {/* Footer */}
        <div className="text-center pb-12">
          <p className="text-slate-400 text-sm font-medium">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')} 
              className="text-white font-black hover:text-primary transition-colors underline underline-offset-4 decoration-primary/50 decoration-2"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </main>
  )
}

