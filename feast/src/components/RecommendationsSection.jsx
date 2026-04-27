/**
 * RecommendationsSection
 *
 * Premium AI-powered recommendations UI component for Feast At Night.
 * Displays personalised product cards with smart AI tags and cluster labels.
 *
 * Features:
 *  - Fetches from /api/orders/recommendations with 5-minute client cache
 *  - Shows AI type badge (ai | trending | cold-start)
 *  - Animated skeleton loaders
 *  - Smart tag pills per card (🧠 AI Pick, ⭐ Your Favourite, 🔥 Trending, etc.)
 *  - Cluster personality label subtitle
 *  - Horizontal scroll with gradient fade edges
 *  - Wishlist heart + sold-out overlay
 *  - IntersectionObserver to fire trackView when cards scroll into view
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import { useTracker } from '../hooks/useTracker'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'
const CACHE_KEY = 'fan_recs_cache_v2'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// ── Tag colour map ────────────────────────────────────────────────────────────
const TAG_STYLES = {
  '⭐ Your Favourite':    'bg-amber-500 text-white',
  '⭐ You Love This':    'bg-amber-400 text-white',
  '🧠 AI Pick':          'bg-violet-600 text-white',
  '👥 Neighbours Like':  'bg-blue-500 text-white',
  '📦 Try Something New':'bg-teal-500 text-white',
  '🔥 Trending':         'bg-orange-500 text-white',
}

function getTagStyle(tag) {
  return TAG_STYLES[tag] || 'bg-primary text-white'
}

// ── AI type badge ─────────────────────────────────────────────────────────────
function AITypeBadge({ type }) {
  if (!type || type === 'trending') return null
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse inline-block" />
      AI Powered
    </span>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function RecSkeleton() {
  return (
    <div className="flex-none w-36 bg-surface-container rounded-2xl overflow-hidden animate-pulse">
      <div className="h-24 bg-surface-container-high" />
      <div className="p-2.5 space-y-2">
        <div className="h-2.5 bg-surface-container-highest rounded w-3/4" />
        <div className="h-2.5 bg-surface-container-highest rounded w-1/2" />
        <div className="h-2 bg-surface-container-highest rounded w-1/3 mt-1" />
      </div>
    </div>
  )
}

// ── Single rec card ───────────────────────────────────────────────────────────
function RecCard({ product, index, onSelect, wishlist, onWishlistClick, trackView }) {
  const cardRef = useRef(null)

  // IntersectionObserver: fire trackView when card enters viewport
  useEffect(() => {
    const el = cardRef.current
    if (!el || !trackView) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) trackView(product.id) },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [product.id, trackView])

  const isWishlisted = wishlist.includes(product.id)
  const soldOut = product.in_stock === false

  return (
    <motion.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={() => !soldOut && onSelect(product)}
      onKeyDown={e => e.key === 'Enter' && !soldOut && onSelect(product)}
      className={`flex-none w-36 bg-white rounded-2xl overflow-hidden shadow-sm border border-surface-container text-left cursor-pointer relative select-none ${soldOut ? 'opacity-75' : ''}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: soldOut ? 0.75 : 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Image */}
      <div className="relative h-24 bg-gray-100 overflow-hidden">
        {product.image
          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
        }

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-surface-container-highest text-on-surface-variant font-black uppercase tracking-widest text-[8px] px-2 py-1 rounded-sm shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* AI Tag pill */}
        {product.tag && (
          <span className={`absolute top-1.5 left-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 ${getTagStyle(product.tag)}`}>
            {product.tag}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={e => { e.stopPropagation(); onWishlistClick(e, product.id) }}
          className="absolute top-1.5 right-1.5 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-black/25 backdrop-blur-md"
        >
          <span className={`material-symbols-outlined text-[13px] ${isWishlisted ? 'text-red-500' : 'text-white'}`}
            style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>
      </div>

      {/* Details */}
      <div className="p-2.5">
        <p className={`font-bold text-xs line-clamp-1 ${soldOut ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
          {product.name}
        </p>
        <p className={`font-black text-sm mt-0.5 ${soldOut ? 'text-on-surface-variant' : 'text-primary'}`}>
          ₹{parseFloat(product.price).toFixed(0)}
        </p>
        <p className="text-[9px] text-on-surface-variant mt-0.5 truncate">{product.category}</p>
      </div>
    </motion.div>
  )
}

// ── Main Section Component ────────────────────────────────────────────────────
export default function RecommendationsSection({ onSelectProduct }) {
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuth()
  const { wishlist, toggleWishlist } = useWishlist()
  const { trackView, trackWishlist } = useTracker()

  const [recs, setRecs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ type: null, cluster_label: null, message: '' })

  // Load from session cache or fetch fresh
  useEffect(() => {
    if (!isLoggedIn || !token) {
      setLoading(false)
      return
    }

    // Check session/local cache
    try {
      const raw = sessionStorage.getItem(CACHE_KEY)
      if (raw) {
        const { data, ts, metaData } = JSON.parse(raw)
        if (Date.now() - ts < CACHE_TTL && data?.length > 0) {
          setRecs(data)
          setMeta(metaData || {})
          setLoading(false)
          return
        }
      }
    } catch { /* ignore */ }

    setLoading(true)
    fetch(`${API}/api/orders/recommendations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          const recsData = d.data
          const metaData = { type: d.type, cluster_label: d.cluster_label, message: d.message }
          setRecs(recsData)
          setMeta(metaData)
          // Cache in sessionStorage
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: recsData, ts: Date.now(), metaData }))
          } catch { /* ignore quota errors */ }
        }
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoading(false))
  }, [token, isLoggedIn])

  const handleWishlistClick = useCallback((e, productId) => {
    e.stopPropagation()
    if (!isLoggedIn) { navigate('/login'); return }
    toggleWishlist(productId)
    trackWishlist(productId)
  }, [isLoggedIn, navigate, toggleWishlist, trackWishlist])

  // Don't render section at all if logged out and not loading
  if (!isLoggedIn && !loading) return null
  // Don't render if finished loading and nothing to show
  if (!loading && recs.length === 0) return null

  return (
    <div className="space-y-3 pb-2">
      {/* Section Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-headline font-bold text-lg text-on-surface">
              {meta.type === 'ai' ? '✨ For You' : meta.type === 'trending' ? '🔥 Trending Now' : 'Recommendations'}
            </h3>
            <AITypeBadge type={meta.type} />
          </div>
          {meta.cluster_label && (
            <p className="text-[11px] text-on-surface-variant mt-0.5 font-medium">
              {meta.cluster_label}
            </p>
          )}
          {meta.message && !meta.cluster_label && (
            <p className="text-[11px] text-on-surface-variant mt-0.5">{meta.message}</p>
          )}
        </div>
        {!loading && recs.length > 0 && (
          <motion.button
            onClick={() => navigate('/menu')}
            className="text-primary font-bold text-xs flex items-center gap-1 flex-shrink-0 ml-2"
            whileTap={{ scale: 0.92 }}
          >
            See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </motion.button>
        )}
      </div>

      {/* Cards Row */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
          {loading ? (
            [1, 2, 3].map(i => <RecSkeleton key={`skel-${i}`} />)
          ) : (
            <AnimatePresence>
              {recs.map((p, i) => (
                <RecCard
                  key={`rec-${p.id}`}
                  product={p}
                  index={i}
                  onSelect={onSelectProduct}
                  wishlist={wishlist}
                  onWishlistClick={handleWishlistClick}
                  trackView={trackView}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        {/* Right gradient fade edge */}
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-surface to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

// Export cache invalidation utility (call after an order is placed)
export function invalidateRecsCache() {
  try { sessionStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
}
