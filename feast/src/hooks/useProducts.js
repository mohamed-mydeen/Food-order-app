/**
 * useProducts — Stale-While-Revalidate product hook
 *
 * Strategy:
 * 1. Instantly hydrate from localStorage (zero latency)
 * 2. Silently fetch fresh API data in background
 * 3. Merge + update cache on success
 * 4. Show shimmer only on very first load (no cache yet)
 */

import { useState, useEffect, useRef } from 'react'

const CACHE_KEY    = 'fan_products_v1'
const CACHE_TTL_MS = 5 * 60 * 1000   // 5 minutes — re-fetch if stale
const API_URL      = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api/products`

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    return { data, age: Date.now() - ts }
  } catch { return null }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* storage full — ignore */ }
}

export function useProducts() {
  const cached = readCache()

  // Start with cache if available → instant render
  const [products,   setProducts]   = useState(cached?.data || [])
  const [loading,    setLoading]    = useState(!cached)      // shimmer only if no cache
  const [reloading,  setReloading]  = useState(false)        // silent bg refresh
  const [error,      setError]      = useState(false)
  const [stale,      setStale]      = useState(false)        // "offline / showing saved data" banner
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    // If cache is fresh (<5 min) skip early fetch; still revalidate if > 1 min old
    const cacheAge = cached?.age ?? Infinity
    // Only consider cache fresh if it actually has items
    const isFresh  = cacheAge < 60_000 && cached?.data?.length > 0

    if (isFresh) return   // cache is very fresh, no need to hit API yet

    const controller = new AbortController()

    async function fetchFresh() {
      if (cached) setReloading(true)   // silent refresh indicator

      try {
        console.log("Fetching fresh products from:", API_URL);
        const res  = await fetch(API_URL, { signal: controller.signal })
        const json = await res.json()
        console.log("API Response:", json);

        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data)
          writeCache(json.data)
          setError(false)
          setStale(false)
        } else {
          console.warn("API returned unsuccessful or malformed data:", json);
          if (!cached) setError(true)
          else setStale(true)
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error("Error fetching products:", err);
        if (!cached) setError(true)
        else setStale(true)   // show cached data + warning banner
      } finally {
        setLoading(false)
        setReloading(false)
      }
    }

    fetchFresh()
    return () => controller.abort()
  }, [])

  return { products, loading, reloading, error, stale }
}

/**
 * Warm up the Render backend as early as possible.
 * Call once on app start — fire-and-forget.
 */
export function warmupBackend() {
  const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'
  fetch(`${API}/api/products`, { method: 'GET', priority: 'low' }).catch(() => {})
}
