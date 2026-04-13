import { useState, useEffect } from 'react'

/**
 * usePWAInstall
 *
 * Captures the browser's `beforeinstallprompt` event and exposes:
 *   - canInstall   → boolean, true when the install banner is available
 *   - isInstalled  → boolean, true after the user accepted the prompt (or app is already standalone)
 *   - promptInstall → function, triggers the native browser install dialog
 *   - dismissInstall → function, hides the button without installing
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall]         = useState(false)
  const [isInstalled, setIsInstalled]       = useState(false)
  const [dismissed, setDismissed]           = useState(false)

  useEffect(() => {
    // Already running as a standalone PWA?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Already dismissed in this session?
    if (sessionStorage.getItem('pwa-install-dismissed')) {
      setDismissed(true)
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()           // block the mini-infobar
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setCanInstall(false)
    }
    setDeferredPrompt(null)
  }

  const dismissInstall = () => {
    sessionStorage.setItem('pwa-install-dismissed', '1')
    setDismissed(true)
  }

  return {
    canInstall: canInstall && !dismissed && !isInstalled,
    isInstalled,
    promptInstall,
    dismissInstall,
  }
}
