import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

export default function SignUp() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', address: '' })
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          address: form.address,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      setSuccess(true)
      setTimeout(() => navigate('/home', { replace: true }), 1200)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const fields = [
    { key: 'name',    label: 'Full Name *',          type: 'text',     placeholder: 'Muhammad Ali' },
    { key: 'email',   label: 'Email Address *',       type: 'email',    placeholder: 'you@example.com' },
    { key: 'phone',   label: 'Phone Number',          type: 'tel',      placeholder: '+91 98765 43210' },
    { key: 'address', label: 'Delivery Address',      type: 'text',     placeholder: 'Street, City, PIN (optional)' },
  ]

  return (
    <div className="bg-white text-on-surface h-full w-full flex flex-col relative">
      {/* Blobs */}
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-primary-container/10 blur-[100px] rounded-full" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-tertiary-container/10 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-xl flex-shrink-0 z-50 px-6 py-4 flex items-center justify-between border-b border-surface-container">
        <button onClick={() => navigate('/login')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <span className="text-xl font-black tracking-tighter text-zinc-900">FEAST AT NIGHT</span>
        <div className="w-10" />
      </header>

      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <main className="max-w-md mx-auto px-6 pt-8 pb-24">

          <div className="mb-7">
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">Create Account</h1>
            <p className="text-secondary text-sm leading-relaxed">
              Join Feast At Night and curate your culinary journey.
            </p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Account created! Redirecting...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1.5 ml-1">{label}</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  required={label.endsWith('*')}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline text-on-surface text-sm"
                />
              </div>
            ))}

            {/* Password */}
            <div>
              <label className="block text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1.5 ml-1">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline text-on-surface text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-semibold tracking-widest text-on-surface-variant uppercase mb-1.5 ml-1">Confirm Password *</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Re-enter password"
                required
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-outline text-on-surface text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary py-4 rounded-full text-on-primary font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading
                ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Creating Account...</>
                : success ? '✓ Welcome!' : 'Create Account'
              }
            </button>
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
