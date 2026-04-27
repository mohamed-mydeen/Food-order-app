/**
 * useTracker — Lightweight AI behaviour tracking hook
 *
 * Captures implicit user signals (view, click, cart_add, wishlist)
 * and sends them to POST /api/track for the recommendation engine.
 *
 * Features:
 *  - Debounced view tracking (100ms) to avoid render-spam
 *  - Per-session dedup: same product viewed once per session
 *  - Fire-and-forget: never blocks UI
 *  - Silently no-ops when user is not logged in
 */

import { useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'

// Session-level dedup set so we don't spam the API on re-renders
const viewedThisSession = new Set()
const clickedThisSession = new Set()

async function sendEvent(token, product_id, event_type, value = 1) {
  if (!token || !product_id) return
  try {
    await fetch(`${API}/api/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id, event_type, value }),
    })
  } catch {
    // Fire-and-forget — silently ignore network errors
  }
}

export function useTracker() {
  const { token, isLoggedIn } = useAuth()
  const viewTimers = useRef({}) // productId → debounce timer

  /**
   * trackView(productId)
   * Call when a product card enters the viewport.
   * Debounced by 150ms; deduped per session.
   */
  const trackView = useCallback((productId) => {
    if (!isLoggedIn || !productId) return
    const pid = String(productId)

    // Already tracked this session → skip
    if (viewedThisSession.has(pid)) return

    // Debounce: cancel previous timer for same product
    if (viewTimers.current[pid]) clearTimeout(viewTimers.current[pid])

    viewTimers.current[pid] = setTimeout(() => {
      viewedThisSession.add(pid)
      sendEvent(token, productId, 'view', 0.1)
    }, 150)
  }, [token, isLoggedIn])

  /**
   * trackClick(productId)
   * Call when user taps/clicks a product card.
   * Deduped per session.
   */
  const trackClick = useCallback((productId) => {
    if (!isLoggedIn || !productId) return
    const pid = String(productId)
    if (clickedThisSession.has(pid)) return
    clickedThisSession.add(pid)
    sendEvent(token, productId, 'click', 0.3)
  }, [token, isLoggedIn])

  /**
   * trackCartAdd(productId)
   * Call when user adds a product to cart.
   */
  const trackCartAdd = useCallback((productId) => {
    if (!isLoggedIn || !productId) return
    sendEvent(token, productId, 'cart_add', 1.5)
  }, [token, isLoggedIn])

  /**
   * trackWishlist(productId)
   * Call when user wishlists a product.
   */
  const trackWishlist = useCallback((productId) => {
    if (!isLoggedIn || !productId) return
    sendEvent(token, productId, 'wishlist', 2)
  }, [token, isLoggedIn])

  return { trackView, trackClick, trackCartAdd, trackWishlist }
}
