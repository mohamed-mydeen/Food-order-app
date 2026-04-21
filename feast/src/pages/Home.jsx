import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import { SkeletonCard, SkeletonCircle, SkeletonBanner } from '../components/SkeletonCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import OfferPopup, { shouldShowOffer, markOfferSeen } from '../components/OfferPopup'
import { useProducts } from '../hooks/useProducts'

/* ── Inline Product Sheet (same as Menu.jsx) ────────────────────── */
function ProductSheet({ product, onClose }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart, cartItems } = useCart()
  const [qty, setQty]       = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded]   = useState(false)
  const inCart    = cartItems?.find(it => it.product_id === product.id)
  const currentQty = inCart?.quantity || 0

  const handleAdd = async () => {
    if (!isLoggedIn) { onClose(); navigate('/login'); return }
    setAdding(true)
    const ok = await addToCart(product.id, qty)
    setAdding(false)
    if (ok) { setAdded(true); setTimeout(() => { setAdded(false); onClose() }, 1200) }
  }

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/50 z-40"
        style={{ willChange: 'opacity' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="fixed left-0 right-0 bottom-0 z-50 bg-surface rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '88vh', willChange: 'transform' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.8 }}
      >
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain' }}>
          <div className="relative h-56 bg-gray-100 mx-4 mt-2 rounded-2xl overflow-hidden">
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍽️</div>}
            {inCart && <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">{currentQty} in cart</div>}
          </div>
          <div className="px-5 pt-4 pb-2">
            <h2 className="font-headline font-black text-2xl text-on-surface">{product.name}</h2>
            <p className="text-3xl font-black text-primary mt-1">₹{parseFloat(product.price).toFixed(0)}</p>
            {product.description && <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">{product.description}</p>}
            <div className="h-px bg-surface-container my-4" />
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-on-surface">Quantity</span>
              <div className="flex items-center bg-surface-container-low rounded-full p-1 gap-1">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:bg-white active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="px-5 font-bold text-lg">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary shadow active:scale-90 transition-all">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="text-secondary text-sm">Total</span>
              <span className="font-headline font-black text-primary text-lg">₹{(parseFloat(product.price) * qty).toFixed(0)}</span>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 px-5 pt-3 pb-8 bg-surface border-t border-surface-container space-y-3">
          {added
            ? <div className="w-full py-4 bg-green-500 text-white rounded-full font-bold text-base flex items-center justify-center gap-2"><span className="material-symbols-outlined">check_circle</span>Added to Cart!</div>
            : <button onClick={handleAdd} disabled={adding} className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                {adding
                  ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Adding...</>
                  : <><span className="material-symbols-outlined">add_shopping_cart</span>{isLoggedIn ? 'Add to Cart' : 'Sign In to Add'}</>}
              </button>}
          <button onClick={onClose} className="w-full py-3 text-secondary font-medium text-sm">Continue Browsing</button>
        </div>
      </motion.div>
    </>
  )
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: 'easeOut' } },
}

export default function Home() {
  const navigate = useNavigate()
  const { products, loading }       = useProducts()
  const [query, setQuery]           = useState('')
  const [categories, setCategories] = useState([])
  const [selected, setSelected]     = useState(null)
  const [offerOpen, setOfferOpen]   = useState(false)

  const closeOffer = useCallback(() => {
    setOfferOpen(false)
    markOfferSeen()
  }, [])

  const openOffer = useCallback(() => {
    setOfferOpen(true)
  }, [])

  // Derive categories from cached products
  useEffect(() => {
    if (products.length > 0) {
      setCategories([...new Set(products.map(p => p.category))]);
    }
  }, [products]);

  // Handle Offer Popup Auto-Show
  useEffect(() => {
    if (!loading && shouldShowOffer()) {
      const timer = setTimeout(() => setOfferOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Search filter
  const q = query.toLowerCase().trim()
  const filteredItems = q
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    : []
  const isSearching = q.length > 0

  // Recommendations fetch
  const { token } = useAuth()
  const [recs, setRecs]       = useState([])
  const [recsMsg, setRecsMsg] = useState('')
  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/orders/recommendations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.success) { setRecs(d.data || []); setRecsMsg(d.message || '') } })
      .catch(() => {})
  }, [token])

  // Show top 6 as "best options" scroll row
  const topProducts = products.slice(0, 6)

  // Group products by category for featured section (first 2 categories)
  const featuredCategories = categories.slice(0, 2)

  return (
    <div className="relative flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar"
           style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
        <main className="px-4 pt-4 pb-4 space-y-6">

          {/* Search */}
          <motion.div
            className="flex items-center bg-white rounded-full px-5 py-3.5 shadow-sm focus-within:ring-2 ring-primary/20 transition-all"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="material-symbols-outlined text-outline mr-3 text-[20px]">search</span>
            <input
              className="bg-transparent border-none outline-none w-full text-on-surface placeholder:text-outline-variant font-medium text-sm"
              placeholder="Search for food or items"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <span className="material-symbols-outlined text-outline text-[20px]">close</span>
              </button>
            )}
          </motion.div>

          {/* ── SEARCH RESULTS ── */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                key="search-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-xs font-bold text-secondary uppercase tracking-widest">
                  {filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''} for "{query}"
                </p>

                {filteredItems.length === 0 && (
                  <div className="text-center py-10">
                    <span className="material-symbols-outlined text-4xl text-outline-variant">search_off</span>
                    <p className="text-secondary font-medium mt-2">No items found</p>
                    <p className="text-xs text-outline mt-1">Try a different keyword</p>
                  </div>
                )}

                {filteredItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="bg-white rounded-xl overflow-hidden flex gap-4 shadow-sm p-3 cursor-pointer"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelected(item)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0">
                      <h4 className="font-headline font-bold text-sm text-on-surface truncate">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant line-clamp-1 mb-1">{item.description || item.category}</p>
                      <span className="font-headline font-black text-primary text-base">₹{parseFloat(item.price).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── NORMAL HOME CONTENT ── */}
          {!isSearching && (
            <>
              {/* Category chips */}
              {!loading && categories.length > 0 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {categories.map((cat, i) => (
                    <motion.button
                      key={cat}
                      onClick={() => navigate('/menu')}
                      className="flex-none px-4 py-2.5 rounded-full flex items-center gap-1.5 font-semibold text-sm shadow-sm cursor-pointer bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.93 }}
                    >
                      <span className="material-symbols-outlined text-[18px]">restaurant</span>
                      <span className="whitespace-nowrap">{cat}</span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Hero Banner */}
              {loading ? (
                <SkeletonBanner />
              ) : (
                <motion.div
                  className="relative overflow-hidden rounded-xl h-40 flex items-center bg-primary cursor-pointer select-none"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openOffer}
                  role="button"
                  aria-label="View today's offer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent z-10" />
                  <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDv_61kKf4sSB2_h414yOye8GDqaJZWZOKLGUg3U3CWcU00JOGhw1tVjefdIUHhk96UjVscotstLRm1xkRxibcCJ_BhyxQo_mvTmSPY0NIqYTfAS0GD2ZktyPOrDzCYw61Mg4aEoWsEDsCTVotmamfrEt1d91AG03EHHTcS3MZpxiyWLZyav1eiJ0otoct8_d4YKyAXG0RxCYZZQw-HurGdoJXH6r-cKk4tqr3z8fmy58mJcT9jdH2YWf4Np_Brc1qK9rDbIztpLpU')", backgroundSize: 'cover' }}
                  />
                  <div className="relative z-20 px-6 space-y-1">
                    <div className="bg-white text-primary px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-widest inline-block mb-1">
                      LIMITED OFFER
                    </div>
                    <h2 className="text-white font-headline font-extrabold text-2xl leading-tight">
                      View Today Offer For You<br />
                      <span className="text-primary-container text-xl">Feast At Night Special</span>
                    </h2>
                  </div>
                  {/* Tap hint arrow */}
                  <div className="absolute right-5 z-20 bg-white/20 rounded-full p-2">
                    <span className="material-symbols-outlined text-white text-[22px]">local_offer</span>
                  </div>
                </motion.div>
              )}

              {/* Best Food Options — circular scroll */}
              {products.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline font-bold text-lg text-on-surface">Best Food Options</h3>
                    <motion.button
                      onClick={() => navigate('/menu')}
                      className="text-primary font-bold text-xs flex items-center gap-1"
                      whileTap={{ scale: 0.92 }}
                    >
                      View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </motion.button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
                    {loading
                      ? Array.from({ length: 4 }).map((_, i) => <SkeletonCircle key={i} />)
                      : topProducts.map((p, i) => (
                          <motion.button
                            key={p.id}
                            onClick={() => setSelected(p)}
                            className="flex-none w-20 text-center group cursor-pointer"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.07 }}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                          >
                            <div className="w-20 h-20 rounded-full overflow-hidden mb-2 ring-2 ring-transparent group-hover:ring-primary-container transition-all shadow-md bg-gray-100">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                              )}
                            </div>
                            <span className="text-xs font-bold text-on-secondary-fixed-variant line-clamp-2">{p.name}</span>
                          </motion.button>
                        ))
                    }
                  </div>
                </div>
              )}

              {/* Featured by category */}
              {!loading && featuredCategories.length > 0 && (
                <div className="space-y-4 pb-4">
                  <h3 className="font-headline font-bold text-lg text-on-surface">Featured Flavors</h3>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {featuredCategories.map(cat => {
                      const catProducts = products.filter(p => p.category === cat)
                      const first = catProducts[0]
                      if (!first) return null
                      return (
                        <motion.div
                          key={cat}
                          variants={itemVariants}
                          className="group bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
                          onClick={() => navigate('/menu')}
                          whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="relative h-44 overflow-hidden bg-gray-100">
                            {first.image ? (
                              <img src={first.image} alt={cat} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent z-10" />
                            <div className="absolute bottom-3 left-3 z-20">
                              <span className="bg-primary px-2 py-0.5 rounded text-[9px] font-black text-white uppercase tracking-widest">
                                {catProducts.length} items
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-headline font-extrabold text-lg group-hover:text-primary transition-colors">{cat}</h4>
                              <span className="text-xs font-medium text-secondary">
                                from ₹{Math.min(...catProducts.map(p => parseFloat(p.price))).toFixed(0)}
                              </span>
                            </div>
                            <p className="text-on-surface-variant text-xs font-medium">
                              {catProducts.map(p => p.name).slice(0, 3).join(' · ')}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </div>
              )}

              {/* ── Personalised Recommendations ── */}
              {recs.length > 0 && (
                <div className="space-y-3 pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">For You 💡</h3>
                      {recsMsg && <p className="text-[11px] text-on-surface-variant mt-0.5">{recsMsg}</p>}
                    </div>
                    <motion.button
                      onClick={() => navigate('/menu')}
                      className="text-primary font-bold text-xs flex items-center gap-1"
                      whileTap={{ scale: 0.92 }}
                    >
                      See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </motion.button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
                    {recs.map((p, i) => (
                      <motion.button
                        key={`rec-${p.id}`}
                        onClick={() => setSelected(p)}
                        className="flex-none w-36 bg-white rounded-2xl overflow-hidden shadow-sm border border-surface-container text-left"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <div className="relative h-24 bg-gray-100 overflow-hidden">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                          }
                          {p.tag && (
                            <span className="absolute top-1.5 left-1.5 bg-primary/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                              {p.tag}
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="font-bold text-xs text-on-surface line-clamp-1">{p.name}</p>
                          <p className="font-black text-primary text-sm mt-0.5">₹{parseFloat(p.price).toFixed(0)}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-400 text-3xl">wifi_off</span>
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface text-lg">No connection</p>
                    <p className="text-on-surface-variant text-sm mt-1">Turn on your data or Wi‑Fi to load the menu</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Product Sheet */}
      <AnimatePresence>
        {selected && (
          <ProductSheet product={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* Offer Popup */}
      <OfferPopup isOpen={offerOpen} onClose={closeOffer} />

    </div>
  )
}
