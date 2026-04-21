import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

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
  if (!form.password)                            errs.password = 'Password is required'
  else if (form.password.length < 6)            errs.password = 'Password must be at least 6 characters'
  if (!form.confirm)                             errs.confirm  = 'Please confirm your password'
  else if (form.confirm !== form.password)       errs.confirm  = 'Passwords do not match'
  return errs
}

// ── Field wrapper with inline error ──────────────────────────────────────────
function Field({ label, error, touched, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1.5 ml-1">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {touched && error && (
          <motion.p className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span className="material-symbols-outlined text-[12px]">error</span>{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

const inputBase = (hasError, touched) =>
  `w-full bg-surface-container-low border rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 transition-all placeholder:text-outline text-on-surface text-sm
  ${hasError && touched
    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
    : 'border-outline-variant/30 focus:ring-primary/20 focus:border-primary'
  }`

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '', address: '' })
  const [touched, setT]     = useState({})
  const [loading, setLoad]  = useState(false)
  const [apiError, setApiE] = useState('')
  const [success, setSucc]  = useState(false)
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
    // Touch all fields to show errors
    setT({ name: true, email: true, phone: true, password: true, confirm: true })
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
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      
      // Request Notification Permission immediately after user signs up
      import('../hooks/useFirebaseNotifications').then(({ registerForPushNotifications }) => {
        registerForPushNotifications(data.data.token);
      }).catch(err => console.warn('Push registration error:', err));

      setSucc(true)
      setTimeout(() => navigate('/home', { replace: true }), 1800)
    } catch (err) {
      setApiE(err.message || 'Registration failed. Please try again.')
    } finally { setLoad(false) }
  }

  return (
    <div className="bg-white text-on-surface h-full w-full flex flex-col relative">
      {/* Background blobs */}
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-primary-container/10 blur-[100px] rounded-full" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-tertiary-container/10 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl flex-shrink-0 z-50 px-6 py-4 flex items-center justify-between border-b border-surface-container"
              style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <button onClick={() => navigate('/login')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <span className="text-xl font-black tracking-tighter text-zinc-900">FEAST AT NIGHT</span>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <main className="max-w-md mx-auto px-6 pt-8"
              style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>

          <div className="mb-7">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Create Account</h1>
            <p className="text-secondary text-sm leading-relaxed">Join Feast At Night and curate your culinary journey.</p>
          </div>

          {/* Success banner */}
          <AnimatePresence>
            {success && (
              <motion.div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium"
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}>
                <span className="material-symbols-outlined text-[20px] icon-filled">check_circle</span>
                Account created! Redirecting you in...
              </motion.div>
            )}
          </AnimatePresence>

          {/* API Error banner */}
          <AnimatePresence>
            {apiError && (
              <motion.div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <span className="material-symbols-outlined text-[16px]">error</span>{apiError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <Field label="Full Name *" error={errors.name} touched={touched.name}>
              <input type="text" value={form.name} onChange={set('name')} onBlur={blur('name')}
                placeholder="Muhammad Ali"
                className={inputBase(errors.name, touched.name)} />
            </Field>

            <Field label="Email Address *" error={errors.email} touched={touched.email}>
              <input type="email" value={form.email} onChange={set('email')} onBlur={blur('email')}
                placeholder="you@example.com"
                className={inputBase(errors.email, touched.email)} />
            </Field>

            <Field label="Phone Number *" error={errors.phone} touched={touched.phone}>
              <input type="tel" value={form.phone} onChange={set('phone')} onBlur={blur('phone')}
                placeholder="9876543210 (10 digits)"
                className={inputBase(errors.phone, touched.phone)} />
            </Field>

            <Field label="Delivery Address (optional)" error={null} touched={false}>
              <input type="text" value={form.address} onChange={set('address')}
                placeholder="Street, City, PIN"
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline text-on-surface text-sm" />
            </Field>

            {/* Password */}
            <Field label="Password *" error={errors.password} touched={touched.password}>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={set('password')} onBlur={blur('password')}
                  placeholder="Min. 6 characters"
                  className={`${inputBase(errors.password, touched.password)} pr-12`} />
                <button type="button" onClick={() => setShow(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {/* Password strength indicator */}
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => {
                    const score = form.password.length >= 10 ? 4 : form.password.length >= 8 ? 3 : form.password.length >= 6 ? 2 : 1
                    return <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < score ? (score >= 3 ? 'bg-green-400' : 'bg-amber-400') : 'bg-gray-200'}`} />
                  })}
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password *" error={errors.confirm} touched={touched.confirm}>
              <input type="password" value={form.confirm} onChange={set('confirm')} onBlur={blur('confirm')}
                placeholder="Re-enter password"
                className={inputBase(errors.confirm, touched.confirm)} />
            </Field>

            <motion.button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary py-4 rounded-full text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading
                ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating Account...</>
                : success ? '✓ Welcome!'
                : !isValid && Object.values(touched).some(Boolean) ? 'Fix errors above'
                : 'Create Account'
              }
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-secondary text-sm">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-primary font-bold ml-1 hover:underline">Sign in</button>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
