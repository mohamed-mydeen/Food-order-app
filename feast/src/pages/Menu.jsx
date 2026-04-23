import React, { useState, useEffect, useCallback, memo, forwardRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import { SkeletonCard } from '../components/SkeletonCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProducts } from '../hooks/useProducts'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'

/* ── Star Rating Display ─────────────────────────────────────────── */
function StarRow({ rating = 0, size = 16, interactive = false, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => {
        const filled = (hover || rating) >= s
        return (
          <span
            key={s}
            onMouseEnter={() => interactive && setHover(s)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate?.(s)}
            className={`material-symbols-outlined select-none ${interactive ? 'cursor-pointer' : ''}`}
            style={{
              fontSize: size,
              fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
              color: filled ? '#f59e0b' : '#d1d5db',
              transition: 'color 0.1s',
            }}
          >
            star
          </span>
        )
      })}
    </div>
  )
}

/* ── Rating Badge (compact, Swiggy-style) ────────────────────────── */
function RatingBadge({ avg, count }) {
  if (!avg || count === 0) return null
  const color = avg >= 4 ? '#16a34a' : avg >= 3 ? '#ca8a04' : '#dc2626'
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: color }}>
      <span className="material-symbols-outlined text-white" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>star</span>
      <span className="text-white text-[11px] font-black">{avg}</span>
      <span className="text-white/80 text-[9px] font-medium">({count})</span>
    </div>
  )
}

/* ── Single Review Card ──────────────────────────────────────────── */
function ReviewCard({ review }) {
  const initials = (review.user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const date = new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <div className="py-3 border-b border-surface-container last:border-0">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-primary font-black text-[10px]">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-on-surface truncate">{review.user?.name || 'Customer'}</p>
          <p className="text-[10px] text-on-surface-variant">{date}</p>
        </div>
        <StarRow rating={review.rating} size={12} />
      </div>
      {review.comment && (
        <p className="text-on-surface-variant text-xs leading-relaxed ml-9">{review.comment}</p>
      )}
    </div>
  )
}

/* ── Rating Distribution Bar ─────────────────────────────────────── */
function RatingDistBar({ distribution, total }) {
  return (
    <div className="space-y-1 mt-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution?.[star] || 0
        const pct = total > 0 ? (count / total) * 100 : 0
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[10px] text-on-surface-variant w-2">{star}</span>
            <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>star</span>
            <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] text-on-surface-variant w-4 text-right">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Review Submit Form ──────────────────────────────────────────── */
function ReviewForm({ productId, existingReview, token, onDone }) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!rating) { setError('Please select a star rating.'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, rating, comment }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      onDone(data.data)
    } catch (err) {
      setError(err.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-surface-container-low rounded-2xl p-4 mb-4">
      <p className="font-bold text-sm text-on-surface mb-2">
        {existingReview ? 'Update your review' : 'Rate this item'}
      </p>
      <div className="flex justify-center mb-3">
        <StarRow rating={rating} size={32} interactive onRate={setRating} />
      </div>
      {rating > 0 && (
        <p className="text-center text-xs text-primary font-bold mb-3">
          {['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Great 😍', 'Excellent! 🤩'][rating]}
        </p>
      )}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        rows={2}
        className="w-full bg-white/60 border border-outline-variant/30 rounded-xl px-3 py-2 text-sm text-on-surface placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full mt-3 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {submitting
          ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Submitting...</>
          : <><span className="material-symbols-outlined text-[16px]">rate_review</span>{existingReview ? 'Update Review' : 'Submit Review'}</>
        }
      </button>
    </div>
  )
}

/* ── Product Detail Bottom Sheet ─────────────────────────────────── */
function ProductSheet({ product, onClose }) {
  const navigate = useNavigate()
  const { isLoggedIn, token } = useAuth()
  const { addToCart, cartItems } = useCart()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [myReview, setMyReview] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [revLoading, setRevLoading] = useState(true)
  const [showAllRev, setShowAllRev] = useState(false)

  const inCart = cartItems?.find(it => it.product_id === product.id)
  const currentQty = inCart?.quantity || 0

  // Fetch reviews + my review status
  const loadReviews = useCallback(async () => {
    setRevLoading(true)
    try {
      const [revRes, myRes] = await Promise.all([
        fetch(`${API}/api/reviews/product/${product.id}?limit=50`),
        isLoggedIn && token
          ? fetch(`${API}/api/reviews/check/${product.id}`, { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve(null),
      ])
      const revData = await revRes.json()
      if (revData.success) { setReviews(revData.data); setStats(revData.stats) }
      if (myRes) {
        const myData = await myRes.json()
        if (myData.success && myData.reviewed) setMyReview(myData.data)
      }
    } catch { } finally { setRevLoading(false) }
  }, [product.id, isLoggedIn, token])

  useEffect(() => { loadReviews() }, [loadReviews])

  const handleAdd = async () => {
    if (!isLoggedIn) { onClose(); navigate('/login'); return }
    setAdding(true)
    const ok = await addToCart(product.id, qty)
    setAdding(false)
    if (ok) { setAdded(true); setTimeout(() => { setAdded(false); onClose() }, 1200) }
  }

  const handleReviewDone = (newReview) => {
    setMyReview(newReview)
    setShowForm(false)
    loadReviews()
  }

  const displayedReviews = showAllRev ? reviews : reviews.slice(0, 3)

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed left-0 right-0 bottom-0 z-50 bg-surface rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92vh', willChange: 'transform' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.8 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Scrollable */}
        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
          {/* Image */}
          <div className="relative h-72 bg-gray-100 mx-4 mt-2 rounded-2xl overflow-hidden">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍽️</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
              {product.category}
            </div>
            {inCart && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {currentQty} in cart
              </div>
            )}
            {/* Rating badge on image */}
            {stats?.avg_rating && (
              <div className="absolute bottom-3 left-3">
                <RatingBadge avg={stats.avg_rating} count={stats.total_reviews} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-5 pt-4 pb-2">
            <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight">{product.name}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-3xl font-black text-primary">₹{parseFloat(product.price).toFixed(0)}</p>
              {stats?.avg_rating && (
                <div className="flex items-center gap-1.5">
                  <StarRow rating={Math.round(parseFloat(stats.avg_rating))} size={14} />
                  <span className="text-xs text-on-surface-variant font-medium">
                    {stats.avg_rating} · {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            {product.description && (
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">{product.description}</p>
            )}

            <div className="h-px bg-surface-container my-4" />

            {/* Qty Selector */}
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-on-surface">Quantity</span>
              <div className="flex items-center bg-surface-container-low rounded-full p-1 gap-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-secondary">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="px-5 font-bold text-lg text-on-surface">{qty}</span>
                <button onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary shadow">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="text-secondary text-sm font-medium">Item Total</span>
              <span className="font-headline font-black text-primary text-lg">
                ₹{(parseFloat(product.price) * qty).toFixed(0)}
              </span>
            </div>

            {/* ── Reviews Section ── */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Ratings & Reviews
                </h3>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowForm(f => !f)}
                    className="flex items-center gap-1 text-primary text-xs font-bold"
                  >
                    <span className="material-symbols-outlined text-[14px]">rate_review</span>
                    {myReview ? 'Edit' : 'Rate'}
                  </button>
                )}
              </div>

              {/* Summary Row */}
              {stats && stats.total_reviews > 0 && (
                <div className="bg-surface-container-low rounded-2xl p-3 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-black text-on-surface">{stats.avg_rating}</p>
                      <StarRow rating={Math.round(parseFloat(stats.avg_rating))} size={14} />
                      <p className="text-[10px] text-on-surface-variant mt-1">{stats.total_reviews} reviews</p>
                    </div>
                    <div className="flex-1">
                      <RatingDistBar distribution={stats.distribution} total={stats.total_reviews} />
                    </div>
                  </div>
                </div>
              )}

              {/* Write / Edit Review */}
              <AnimatePresence>
                {showForm && isLoggedIn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <ReviewForm
                      productId={product.id}
                      existingReview={myReview}
                      token={token}
                      onDone={handleReviewDone}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Not logged in prompt */}
              {!isLoggedIn && (
                <button
                  onClick={() => { onClose(); navigate('/login') }}
                  className="w-full py-2.5 mb-4 border border-primary text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">login</span>
                  Sign in to write a review
                </button>
              )}

              {/* Review List */}
              {revLoading ? (
                <div className="space-y-3 py-2">
                  {[1, 2].map(i => (
                    <div key={i} className="animate-pulse flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-container flex-shrink-0" />
                      <div className="flex-1 space-y-1.5 py-1">
                        <div className="h-2.5 bg-surface-container rounded w-1/3" />
                        <div className="h-2 bg-surface-container rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-3xl">⭐</span>
                  <p className="text-on-surface-variant text-sm mt-2">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div>
                  {displayedReviews.map(r => <ReviewCard key={r.id} review={r} />)}
                  {reviews.length > 3 && (
                    <button
                      onClick={() => setShowAllRev(v => !v)}
                      className="w-full pt-2 text-primary text-xs font-bold flex items-center justify-center gap-1"
                    >
                      {showAllRev
                        ? <><span className="material-symbols-outlined text-[14px]">expand_less</span>Show less</>
                        : <><span className="material-symbols-outlined text-[14px]">expand_more</span>View all {reviews.length} reviews</>
                      }
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom padding */}
            <div className="h-4" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 px-5 pt-3 pb-8 bg-surface border-t border-surface-container space-y-3">
          {product?.in_stock === false ? (
            <div className="w-full py-4 bg-surface-container-highest text-on-surface-variant rounded-full font-headline font-bold text-base shadow-sm flex items-center justify-center gap-2 cursor-not-allowed">
              <span className="material-symbols-outlined">block</span>Currently Out of Stock
            </div>
          ) : added ? (
            <div className="w-full py-4 bg-green-500 text-white rounded-full font-bold text-base flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>Added to Cart!
            </div>
          ) : (
            <button
              onClick={handleAdd} disabled={adding}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {adding
                ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Adding...</>
                : <><span className="material-symbols-outlined">add_shopping_cart</span>{isLoggedIn ? 'Add to Cart' : 'Sign In to Add'}</>
              }
            </button>
          )}
          <button onClick={onClose} className="w-full py-3 text-secondary font-medium text-sm">
            Continue Browsing
          </button>
        </div>
      </motion.div>
    </>
  )
}

/* ── Menu Item Card (with rating & wishlist) ────────────────────────────────── */
const MenuItemCard = memo(forwardRef(function MenuItemCard({ item, index, onSelect, ...rest }, ref) {
  const { wishlist, toggleWishlist } = useWishlist()
  const { isLoggedIn } = useAuth()

  const isWishlisted = wishlist.includes(item.id)

  const handleWishlistClick = (e) => {
    e.stopPropagation() // Prevent opening product sheet
    if (!isLoggedIn) {
      alert("Please login to add to wishlist") // Ideally a toast, but this serves MVP
      return
    }
    toggleWishlist(item.id)
  }



  return (
    <motion.div
      ref={ref}
      {...rest}
      layout
      className={`group bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer relative ${item.in_stock === false ? 'opacity-75 grayscale-[0.6]' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: item.in_stock === false ? 0.75 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image?.includes('cloudinary')
              ? item.image.replace('/upload/', '/upload/w_600,q_auto,f_auto/')
              : item.image}
            alt={item.name} loading="lazy" width="400" height="208"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <span className="text-5xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Out of Stock Overlay */}
        {item.in_stock === false && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-surface-container-highest text-on-surface-variant font-headline font-black uppercase tracking-widest text-[11px] px-3 py-1.5 rounded-sm shadow-sm ring-1 ring-black/5">
              Sold Out
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 left-3 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/25 backdrop-blur-md hover:bg-black/45 transition-colors shadow-sm"
        >
          <span className={`material-symbols-outlined text-[22px] transition-colors ${isWishlisted ? 'text-red-500 font-variation-fill' : 'text-white'}`}>
            favorite
          </span>
        </button>

        {/* Category pill */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-700">
          {item.category}
        </div>



        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Tap to view</div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-headline font-bold text-base text-on-surface truncate">{item.name}</h4>
        {item.description && (
          <p className="text-on-surface-variant text-xs mt-0.5 line-clamp-1">{item.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="font-headline font-black text-xl text-primary">
            ₹{parseFloat(item.price).toFixed(0)}
          </span>
          <motion.button
            className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, backgroundColor: '#c43800' }}
            whileTap={{ scale: 0.88 }}
            onClick={e => { e.stopPropagation(); onSelect(item) }}
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}))

/* ── Menu Page ───────────────────────────────────────────────────── */
export default function Menu() {
  const { products, loading, error, stale } = useProducts()
  const [categories, setCategories] = useState(() => {
    const raw = localStorage.getItem('fan_products_v1')
    if (raw) { try { const { data } = JSON.parse(raw); return ['All', ...new Set(data.map(p => p.category))] } catch { return ['All'] } }
    return ['All']
  })
  const [activeCategory, setActiveCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (products.length) setCategories(['All', ...new Set(products.map(p => p.category))])
  }, [products])

  const displayItems = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory)

  return (
    <div className="relative flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar"
        style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
        <main className="px-[15px] pt-4 max-w-5xl mx-auto">



          {/* Video Banner */}
          <div className="relative w-full aspect-video rounded-xl shadow-sm mb-6 overflow-hidden bg-slate-900 flex items-center justify-center">
            {/* Loading Spinner underneath the video */}
            <div className="absolute flex flex-col items-center gap-2 text-white/50">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="relative z-10 w-full h-full object-cover transition-opacity duration-700"
              onCanPlay={(e) => { e.target.style.opacity = 1; }}
              style={{ opacity: 0 }}
            >
              <source src="/VID_2.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Category Pills */}
          {!loading && categories.length > 1 && (
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
              {categories.map((cat, i) => (
                <motion.button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-headline font-bold text-sm whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-container text-on-primary-container shadow-md' : 'bg-white text-on-surface-variant shadow-sm'
                    }`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                >{cat}</motion.button>
              ))}
            </div>
          )}

          <section className="mb-28">
            {!loading && displayItems.length > 0 && (
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline font-black text-xl text-on-surface tracking-tight">
                  {activeCategory === 'All' ? 'All Items' : activeCategory}
                </h3>
                <div className="h-px flex-grow mx-4 bg-surface-container-highest" />
                <span className="text-xs text-on-surface-variant font-medium">{displayItems.length} items</span>
              </div>
            )}

            {loading && <div className="grid grid-cols-1 gap-4">{[1, 2, 3].map(i => <SkeletonCard key={i} tall />)}</div>}

            {!loading && error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                <span className="material-symbols-outlined text-red-400 text-4xl">wifi_off</span>
                <p className="font-bold text-on-surface">No Connection</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm">Try Again</button>
              </div>
            )}

            {!loading && !error && displayItems.length === 0 && products.length > 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="font-bold text-on-surface-variant">No items in this category</p>
              </div>
            )}

            {displayItems.length > 0 && (
              <motion.div className="grid grid-cols-1 gap-5" layout>
                <AnimatePresence mode='popLayout'>
                  {displayItems.map((item, i) => (
                    <MenuItemCard key={item.id} item={item} index={i} onSelect={setSelected} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </section>
        </main>
      </div>

      <AnimatePresence>
        {selected && <ProductSheet product={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}
