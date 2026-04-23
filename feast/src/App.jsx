import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { warmupBackend } from './hooks/useProducts'

// ── Always eager-load the two most-visited pages ─────────────────────────────
import Splash  from './pages/Splash'
import Home    from './pages/Home'
import Menu    from './pages/Menu'

// ── Lazy-load less-critical pages (code splitting → smaller initial bundle) ──
const Login    = lazy(() => import('./pages/Login'))
const SignUp   = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Cart     = lazy(() => import('./pages/Cart'))
const Profile  = lazy(() => import('./pages/Profile'))
const Orders   = lazy(() => import('./pages/Orders'))
const Contact  = lazy(() => import('./pages/Contact'))
const About    = lazy(() => import('./pages/About'))
const Settings = lazy(() => import('./pages/Settings'))
const Wishlist = lazy(() => import('./pages/Wishlist'))

import InstallBanner from './components/InstallBanner'
import NotificationBanner from './components/NotificationBanner'
import BottomNav from './components/BottomNav'
import { useFirebaseNotifications } from './hooks/useFirebaseNotifications'

// Overlay loader — preserves app shell during lazy-chunk load
function PageLoader() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-xs text-on-surface-variant font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  useFirebaseNotifications()

  useEffect(() => {
    // ── 1. Move dark class from <html> to .app-shell post-mount ───────────────
    const shell = document.querySelector('.app-shell')
    if (shell) {
      const t = localStorage.getItem('fan_theme') || 'Dark'
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (t === 'Dark' || (t === 'System' && prefersDark)) shell.classList.add('dark')
      else shell.classList.remove('dark')
      document.documentElement.classList.remove('fan-dark-pending')
    }

    // ── 2. Wake up Render backend immediately (fire-and-forget) ──────────────
    warmupBackend()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="app-shell">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<Splash />} />
            <Route path="/home"     element={<Home />} />
            <Route path="/menu"     element={<Menu />} />
            <Route path="/login"    element={<Login />} />
            <Route path="/signup"   element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart"     element={<Cart />} />
            <Route path="/profile"  element={<Profile />} />
            <Route path="/orders"   element={<Orders />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="/about"    element={<About />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global floating Notification prompt */}
        <NotificationBanner />

        {/* Global floating PWA install prompt */}
        <InstallBanner />

        {/* Global Bottom Navigation (handles its own hiding per-route) */}
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
