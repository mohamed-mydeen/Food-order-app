import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { registerSW } from 'virtual:pwa-register'
import { WishlistProvider } from './context/WishlistContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

// Register service worker — required for PWA install prompt to fire
registerSW({ immediate: true })

// ── Apply saved theme before first render (no flash) ─────────────────────────
;(function initTheme() {
  const t = localStorage.getItem('fan_theme') || 'Dark'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (t === 'Dark' || (t === 'System' && prefersDark)) {
    document.documentElement.classList.add('fan-dark-pending')
  }
})()

// ── Global uncaught error reporting ──────────────────────────────────────────
const BUG_API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api/bugs`

function reportError(title, detail) {
  try {
    fetch(BUG_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `[Auto] ${title?.slice(0, 120)}`,
        description: detail || 'No details',
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {})
  } catch (_) {}
}

window.onerror = (msg, src, line, col, err) => {
  reportError(`JS Error: ${msg}`, `Source: ${src}:${line}:${col}\n${err?.stack || ''}`)
}

window.onunhandledrejection = (e) => {
  reportError(`Unhandled Promise: ${e.reason}`, e.reason?.stack || String(e.reason))
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
)

