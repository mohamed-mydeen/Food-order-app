import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import { SkeletonCard, SkeletonCircle, SkeletonBanner } from '../components/SkeletonCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import OfferPopup, { shouldShowOffer, markOfferSeen } from '../components/OfferPopup'
import { useProducts } from '../hooks/useProducts'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'

/* ── Inline Product Sheet (same as Menu.jsx) ────────────────────── */
function ProductSheet({ product, onClose }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart, cartItems } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const inCart = cartItems?.find(it => it.product_id === product.id)
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
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white"
            >
              <span className={`material-symbols-outlined ${wishlist.includes(product.id) ? 'text-red-500 font-variation-fill' : ''}`}>favorite</span>
            </button>
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
                ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Adding...</>
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
  const { isLoggedIn } = useAuth()
  const { wishlist, toggleWishlist } = useWishlist()
  const { products, loading } = useProducts()
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fan_recent_searches')) || [] } catch { return [] }
  })

  const [categories, setCategories] = useState([])
  const [selected, setSelected] = useState(null)

  // Recommendations state
  const [recs, setRecs] = useState([])
  const [recsLoading, setRecsLoading] = useState(true)
  const [recsMsg, setRecsMsg] = useState('')

  // Offer popup state
  const [offerOpen, setOfferOpen] = useState(false)

  const saveRecentSearch = (term) => {
    if (!term) return
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 7)
    setRecentSearches(updated)
    localStorage.setItem('fan_recent_searches', JSON.stringify(updated))
  }

  const removeRecentSearch = (e, term) => {
    e.stopPropagation()
    const updated = recentSearches.filter(s => s !== term)
    setRecentSearches(updated)
    localStorage.setItem('fan_recent_searches', JSON.stringify(updated))
  }

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation()
    if (!isLoggedIn) {
      alert("Please login to add to wishlist")
      return
    }
    toggleWishlist(productId)
  }

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

let cachedRecs = undefined
let recsFetchTime = 0

  // Recommendations fetch
  const { token } = useAuth()

  useEffect(() => {
    if (!token) {
      setRecsLoading(false)
      return
    }
    if (cachedRecs !== undefined && Date.now() - recsFetchTime < 300000) {
      setRecs(cachedRecs)
      setRecsLoading(false)
      return
    }
    setRecsLoading(true)
    fetch(`${API}/api/orders/recommendations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { 
        if (d.success) { 
          cachedRecs = d.data || []
          setRecs(cachedRecs)
          setRecsMsg(d.message || '') 
        }
        recsFetchTime = Date.now()
      })
      .catch(() => { })
      .finally(() => setRecsLoading(false))
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
        <main className="px-[15px] pt-4 pb-4 space-y-6">

          {/* Timing Banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[18px] p-3.5 flex items-center gap-3 shadow-lg shadow-indigo-900/20 relative overflow-hidden"
          >
            {/* Background design */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10 blur-[1px]">
              <span className="material-symbols-outlined text-[80px] font-variation-fill text-white">clear_night</span>
            </div>

            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 relative z-10 text-indigo-200">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
            </div>
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="material-symbols-outlined text-yellow-400 text-[14px] font-variation-fill">stars</span>
                <span className="font-headline font-black text-white text-[12px] tracking-wide uppercase bg-black/30 px-2 py-0.5 rounded-full border border-white/10 outline outline-1 outline-offset-1 outline-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                  Book Order Before 8 PM
                </span>
              </div>
              <p className="text-indigo-200 text-[12px] font-medium leading-snug">
                Exclusive night service from <span className="font-bold text-white">10:30 PM</span> to <span className="font-bold text-white">1:00 AM</span>
              </p>


            </div>
          </motion.div>

          {/* Separated Instamart/Zomato Search */}
          <div className="relative z-30 flex items-center gap-2.5">
            <motion.div
              className={`flex-1 flex items-center bg-surface-container rounded-[18px] px-4 py-[14px] transition-all ${searchFocused ? 'shadow-lg ring-1 ring-primary/40' : 'shadow-sm border border-outline-variant/30'}`}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="material-symbols-outlined text-primary mr-3 text-[24px]">search</span>
              <input
                className="!bg-transparent border-0 outline-none shadow-none ring-0 w-full p-0 m-0 text-on-surface font-semibold text-base placeholder:text-outline-variant placeholder:font-medium focus:ring-0 appearance-none"
                style={{ backgroundColor: 'transparent' }}
                placeholder="Restaurant, item or more"
                type="text"
                value={query}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) saveRecentSearch(query.trim())
                }}
              />
              <AnimatePresence>
                {query && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuery('')} className="p-1.5 -mr-1.5 ml-2 flex items-center justify-center bg-surface-container-high rounded-full hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[16px] stroke-2">close</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Separated Voice Search Button */}
            <div className="relative flex-shrink-0">
              {/* Pulsing ripple rings when listening */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-[18px] bg-red-500/30 animate-ping" style={{ animationDuration: '0.9s' }} />
                  <span className="absolute inset-[-6px] rounded-[22px] bg-red-400/15 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.15s' }} />
                </>
              )}
              <motion.button
                onClick={() => {
                  if (isListening) return; // prevent double-tap
                  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                  if (!SpeechRecognition) return alert("Voice search is not supported in your browser.");
                  const recognition = new SpeechRecognition();
                  recognition.lang = 'en-IN';
                  recognition.interimResults = false;
                  recognition.onstart = () => setIsListening(true);
                  recognition.onresult = (e) => {
                    const transcript = e.results[0][0].transcript;
                    setQuery(transcript);
                    saveRecentSearch(transcript);
                  };
                  recognition.onerror = () => setIsListening(false);
                  recognition.onend = () => setIsListening(false);
                  recognition.start();
                }}
                className={`relative z-10 w-[52px] h-[52px] rounded-[18px] flex items-center justify-center transition-all duration-300 ${isListening
                  ? 'bg-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.25),0_4px_16px_rgba(239,68,68,0.35)] border-0'
                  : 'bg-white border border-outline-variant/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                  }`}
                whileTap={{ scale: 0.88 }}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                aria-label={isListening ? 'Listening…' : 'Voice search'}
              >
                <motion.span
                  className={`material-symbols-outlined text-[24px] font-variation-fill ${isListening ? 'text-white' : 'text-primary'
                    }`}
                  animate={isListening ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={isListening ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : {}}
                >
                  {isListening ? 'mic' : 'mic'}
                </motion.span>
              </motion.button>
            </div>

            {/* Recent Searches Dropdown */}
            <AnimatePresence>
              {searchFocused && !isSearching && recentSearches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-16 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-40"
                >
                  <h4 className="text-xs font-bold text-outline-variant uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">history</span> Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => { setQuery(term); saveRecentSearch(term); }}
                        className="flex items-center gap-1.5 bg-surface-container py-1.5 pl-3 pr-1.5 rounded-full cursor-pointer hover:bg-surface-container-high transition-colors text-sm font-medium text-on-surface-variant"
                      >
                        {term}
                        <button onClick={(e) => removeRecentSearch(e, term)} className="ml-0.5 flex items-center justify-center p-0.5 rounded-full hover:bg-black/10 text-outline">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


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
                    onClick={() => { saveRecentSearch(item.name); setSelected(item); }}
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
              {/* Video Banner */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-video rounded-xl shadow-sm mb-6 object-cover"
              >
                <source src="/V1.mp4" type="video/mp4" />
              </video>



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
              {(recsLoading || recs.length > 0) && (
                <div className="space-y-3 pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-headline font-bold text-lg text-on-surface">Recommendations</h3>
                      {recsMsg && <p className="text-[11px] text-on-surface-variant mt-0.5">{recsMsg}</p>}
                    </div>
                    {!recsLoading && (
                      <motion.button
                        onClick={() => navigate('/menu')}
                        className="text-primary font-bold text-xs flex items-center gap-1"
                        whileTap={{ scale: 0.92 }}
                      >
                        See All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </motion.button>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4">
                    {recsLoading ? (
                      [1, 2, 3].map(i => (
                        <div key={`skel-rec-${i}`} className="flex-none w-36 bg-surface-container rounded-2xl overflow-hidden animate-pulse">
                          <div className="h-24 bg-surface-container-high" />
                          <div className="p-2.5 space-y-2">
                            <div className="h-3 bg-surface-container-highest rounded w-3/4" />
                            <div className="h-3 bg-surface-container-highest rounded w-1/2" />
                          </div>
                        </div>
                      ))
                    ) : (
                      recs.map((p, i) => (
                        <motion.div
                          role="button"
                          tabIndex={0}
                          key={`rec-${p.id}`}
                          onClick={() => setSelected(p)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelected(p)}
                          className={`flex-none w-36 bg-white rounded-2xl overflow-hidden shadow-sm border border-surface-container text-left cursor-pointer relative ${p.in_stock === false ? 'opacity-80 grayscale-[0.5]' : ''}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: p.in_stock === false ? 0.8 : 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          whileTap={{ scale: 0.96 }}
                        >
                          <div className="relative h-24 bg-gray-100 overflow-hidden text-center">
                            {p.image
                              ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                            }

                            {/* Sold Out badge */}
                            {p.in_stock === false && (
                              <div className="absolute inset-x-0 bottom-0 top-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-20">
                                <span className="bg-surface-container-highest text-on-surface-variant font-headline font-black uppercase tracking-widest text-[9px] px-2 py-1 rounded-sm shadow-sm ring-1 ring-black/5 block">
                                  Sold Out
                                </span>
                              </div>
                            )}

                            {p.tag && (
                              <span className="absolute top-1.5 left-1.5 bg-primary/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">
                                {p.tag}
                              </span>
                            )}
                            {/* Wishlist Button */}
                            <button
                              onClick={(e) => handleWishlistClick(e, p.id)}
                              className="absolute top-1.5 right-1.5 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white"
                            >
                              <span className={`material-symbols-outlined text-[13px] ${wishlist.includes(p.id) ? 'text-red-500 font-variation-fill' : ''}`}>favorite</span>
                            </button>
                          </div>
                          <div className="p-2.5 relative z-30">
                            <p className={`font-bold text-xs line-clamp-1 ${p.in_stock === false ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>{p.name}</p>
                            <p className={`font-black text-sm mt-0.5 ${p.in_stock === false ? 'text-on-surface-variant' : 'text-primary'}`}>₹{parseFloat(p.price).toFixed(0)}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
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
