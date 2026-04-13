import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      login(data.data.token, data.data.user)
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative h-full w-full flex flex-col items-center justify-center p-6 overflow-hidden bg-background font-body text-on-background antialiased">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSGlQFmkqPMwEF5CUr1vnUXRKSrbTSo4gbReOhsiBB9NtFWgD7KkUsL4YoFjqCekzUl1NG7cPryK-8rQ0hYM373RZlpsz5ntO2VrPCzuPtIJeaNk4RYPUekRILkqykJ3OJudT8Ig6afgLylLp_lD6VDb0P0kzG9K7gekxqR-9D0x3jjMu3oSj7peZXggoYHDeoemogf-w1q4PHOFNpyBPpqHD8Tfy8F8qqHBiAccFIKUyGWj0W31BcIptZIkNsTLJQmPVoEtGLub0"
          alt="mpm hub Background"
        />
        <div className="absolute inset-0 backdrop-blur-[2px]"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.72) 100%)' }}
        />
      </div>

      {/* Brand */}
      <header className="relative z-10 mb-10 text-center">
        <h1 className="font-headline font-black text-5xl md:text-6xl tracking-tighter text-white drop-shadow-2xl">
          MPM HUB
        </h1>
        <p className="text-white/60 text-sm mt-2">Sign in to your account</p>
      </header>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">

        {error && (
          <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full h-13 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline text-sm"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full h-13 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-on-primary font-bold rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60 mt-2"
          >
            {loading ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant font-medium text-sm">
            New to mpm hub?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-bold hover:underline ml-1">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </main>
  )
}
