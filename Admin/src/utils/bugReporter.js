// ─── Bug Reporter — auto-captures uncaught errors and reports them to backend ─
const API_URL = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api/bugs`

async function sendReport(payload) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        // Attach userId if logged in
        userId: (() => {
          try {
            const u = localStorage.getItem('feast_admin_user')
            return u ? JSON.parse(u)?.id : null
          } catch { return null }
        })(),
      }),
    })
  } catch {
    // Silently fail — never interrupt the app for the reporter
  }
}

export function installBugReporter() {
  // Uncaught JS errors
  window.onerror = (message, source, lineno, colno, error) => {
    sendReport({
      message: String(message),
      stack: error?.stack || `${source}:${lineno}:${colno}`,
    })
    return false // don't suppress the error in console
  }

  // Unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const reason = event.reason
    sendReport({
      message: reason?.message || String(reason) || 'Unhandled promise rejection',
      stack: reason?.stack || '',
    })
  }
}

// Manual bug report function (can be called from catch blocks)
export function reportBug(message, error) {
  sendReport({
    message: String(message),
    stack: error?.stack || '',
  })
}
