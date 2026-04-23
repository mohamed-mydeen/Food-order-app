import React from 'react'

/**
 * ErrorBoundary — Catches unhandled React render errors.
 * Shows a professional recovery UI instead of a white screen.
 * Silently reports the error to the /api/bugs backend.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' }
  }

  componentDidCatch(error, info) {
    // Silently report to backend
    try {
      const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api/bugs`
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[Auto] React Error: ${error?.message?.slice(0, 100)}`,
          description: `Component Stack:\n${info?.componentStack}\n\nError:\n${error?.stack}`,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {})
    } catch (_) {}
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          width: '100%',
          background: '#0A0A0B',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: 56 }}>😕</span>
        <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, maxWidth: 300, lineHeight: 1.6 }}>
          The app ran into an unexpected problem. We've been notified and will fix it soon.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #e34105, #ff7138)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Reload App
          </button>
          <button
            onClick={() => { window.location.href = '/' }}
            style={{
              padding: '12px 24px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }
}
