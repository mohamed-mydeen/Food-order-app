import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { registerSW } from 'virtual:pwa-register'

// Register service worker — required for PWA install prompt to fire
registerSW({ immediate: true })

// ── Apply saved theme before first render (no flash) ─────────────────────────
;(function initTheme() {
  const t = localStorage.getItem('fan_theme') || 'Dark'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (t === 'Dark' || (t === 'System' && prefersDark)) {
    // app-shell doesn't exist yet — apply to html temporarily then move after mount
    document.documentElement.classList.add('fan-dark-pending')
  }
})()

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
)
