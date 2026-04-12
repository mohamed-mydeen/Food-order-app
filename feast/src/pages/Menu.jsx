import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { SkeletonCard } from '../components/SkeletonCard'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API_URL = 'http://localhost:5000/api'

/* ── Product Detail Bottom Sheet ─────────────────────────────────── */
function ProductSheet({ product, onClose }) {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { addToCart, cartItems } = useCart()
  const [qty, setQty]         = useState(1)
  const [adding, setAdding]   = useState(false)
  const [added, setAdded]     = useState(false)

  // Check if already in cart
  const inCart = cartItems?.find(it => it.product_id === product.id)
  const currentQty = inCart?.quantity || 0

  const handleAdd = async () => {
    if (!isLoggedIn) { onClose(); navigate('/login'); return }
    setAdding(true)
    const ok = await addToCart(product.id, qty)
    setAdding(false)
    if (ok) {
      setAdded(true)
      setTimeout(() => { setAdded(false); onClose() }, 1200)
    }
  }

  return (
    <>
      {/* Backdrop — absolute so it stays inside app-shell */}
      <motion.div
        className="absolute inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet — sits ABOVE BottomNav */}
      <motion.div
        className="absolute left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ bottom: '68px', maxHeight: 'calc(90% - 68px)' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Product Image */}
          <div className="relative h-60 bg-gray-100 mx-4 mt-2 rounded-2xl overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍽️</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700">
              {product.category}
            </div>
            {inCart && (
              <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                {currentQty} in cart
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-5 pt-4 pb-2">
            <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight">{product.name}</h2>
            <p className="text-3xl font-black text-primary mt-1">₹{parseFloat(product.price).toFixed(0)}</p>
            {product.description && (
              <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">{product.description}</p>
            )}

            {/* Divider */}
            <div className="h-px bg-surface-container my-4" />

            {/* Qty Selector */}
            <div className="flex items-center justify-between">
              <span className="font-headline font-bold text-on-surface">Quantity</span>
              <div className="flex items-center bg-surface-container-low rounded-full p-1 gap-1">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-secondary hover:bg-white active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
                <span className="px-5 font-bold text-lg text-on-surface">{qty}</span>
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-on-primary shadow active:scale-90 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>
            </div>

            {/* Total line */}
            <div className="flex items-center justify-between mt-3 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="text-secondary text-sm font-medium">Item Total</span>
              <span className="font-headline font-black text-primary text-lg">
                ₹{(parseFloat(product.price) * qty).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons — fixed at bottom */}
        <div className="flex-shrink-0 px-5 pt-3 pb-6 bg-white border-t border-surface-container space-y-3">
          {added ? (
            <div className="w-full py-4 bg-green-500 text-white rounded-full font-bold text-base flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">check_circle</span>
              Added to Cart!
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {adding ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Adding...</>
              ) : (
                <><span className="material-symbols-outlined">add_shopping_cart</span>{isLoggedIn ? 'Add to Cart' : 'Sign In to Add'}</>
              )}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 text-secondary font-medium text-sm hover:text-on-surface transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </motion.div>
    </>
  )
}

/* ── Menu Item Card ──────────────────────────────────────────────── */
function MenuItemCard({ item, index, onSelect }) {
  return (
    <motion.div
      className="group bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(item)}
    >
      <div className="relative h-52 overflow-hidden bg-gray-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300">
            <span className="text-5xl">🍽️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-700">
          {item.category}
        </div>
        {/* Tap hint */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            Tap to view
          </div>
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
            onClick={(e) => { e.stopPropagation(); onSelect(item) }}
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Menu Page ───────────────────────────────────────────────────── */
export default function Menu() {
  const [loading, setLoading]               = useState(true)
  const [products, setProducts]             = useState([])
  const [categories, setCategories]         = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [error, setError]                   = useState(false)
  const [selected, setSelected]             = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res  = await fetch(`${API_URL}/products`)
        const data = await res.json()
        if (data.success) {
          setProducts(data.data)
          setCategories(['All', ...new Set(data.data.map(p => p.category))])
        } else setError(true)
      } catch { setError(true) }
      finally { setTimeout(() => setLoading(false), 700) }
    }
    fetchProducts()
  }, [])

  const displayItems = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <div className="relative flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <main className="px-4 pt-4 max-w-5xl mx-auto">

          {/* Hero */}
          <motion.section
            className="mb-6 relative overflow-hidden rounded-xl h-48 flex flex-col justify-end p-6 bg-gradient-to-br from-primary to-orange-700"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDrntNqGechpYpSEUuhayBKhUwSqbs2Wa-G44zdVUECHCgoQShJ9lOLQrsKXDlOMb39z60BolaYKLoPKSj6aSgdjFdP5VKrcyc3XIVxNbA9gzqTqTC38ZWCmbAbGHiE2bH1wMYDXs3VESKWD66J-3unGoY1UCk9kF-pTOeR7-w1cr7xfAgB7-_NbWLRcQV27H2zZUaqZye9cPURcPKwWr8NpeMlVWhfKumSXKgSTxXj55vNIuh43g10MDcL6d-q4f4ZA_2bMpNep3Y')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
            <div className="relative z-10">
              <h2 className="text-white font-headline font-extrabold text-3xl tracking-tighter mb-1">The Midnight Curations</h2>
              <p className="text-white/80 text-sm italic">
                {loading ? 'Loading your menu...' : `${products.length} items available — tap to explore`}
              </p>
            </div>
          </motion.section>

          {/* Category Pills */}
          {!loading && categories.length > 1 && (
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 hide-scrollbar">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-headline font-bold text-sm whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-white text-on-surface-variant shadow-sm'
                  }`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.93 }}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          )}

          {/* Grid */}
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

            {loading && (
              <div className="grid grid-cols-1 gap-4">
                {[1,2,3].map(i => <SkeletonCard key={i} tall />)}
              </div>
            )}
            {!loading && error && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">⚠️</div>
                <p className="font-bold text-on-surface-variant">Could not connect to server</p>
                <p className="text-xs text-outline mt-1">Make sure the backend is running</p>
              </div>
            )}
            {!loading && !error && displayItems.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🍽️</div>
                <p className="font-bold text-on-surface-variant">No items yet</p>
                <p className="text-xs text-outline mt-1">Add products from the admin panel</p>
              </div>
            )}
            {!loading && !error && displayItems.length > 0 && (
              <div className="grid grid-cols-1 gap-5">
                {displayItems.map((item, i) => (
                  <MenuItemCard key={item.id} item={item} index={i} onSelect={setSelected} />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Product Sheet */}
      <AnimatePresence>
        {selected && (
          <ProductSheet product={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
