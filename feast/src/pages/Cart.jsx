import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API          = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`
const DELIVERY_FEE = 45
const TAX_RATE     = 0.05
const MERCHANT_UPI  = 'mpmhub@upi'
const MERCHANT_NAME = 'Feast At Night'

const makeGPayLink    = (amt) => `tez://upi/pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amt.toFixed(2)}&cu=INR`
const makePhonePeLink = (amt) => `phonepe://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amt.toFixed(2)}&cu=INR`

/* ── Web Audio success chime (no file needed) ───────────────────── */
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type      = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t); osc.stop(t + 0.35)
    })
  } catch { /* audio blocked — silently ignore */ }
}

/* ── Payment options ────────────────────────────────────────────── */
const getPaymentOptions = (amount) => [
  {
    id: 'GPAY', method: 'UPI', label: 'Google Pay',
    sub: 'Pay via Google Pay UPI', deepLink: makeGPayLink(amount),
    badge: 'Recommended', badgeCls: 'bg-blue-50 text-blue-600',
    logo: (
      <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100 shadow-sm">
        <img src="https://cdn.simpleicons.org/googlepay/5F6368" alt="GPay" className="w-6 h-6 object-contain"
          onError={e => { e.target.style.display='none' }} />
      </div>
    ),
  },
  {
    id: 'PHONEPE', method: 'UPI', label: 'PhonePe',
    sub: 'Pay via PhonePe UPI', deepLink: makePhonePeLink(amount),
    badge: null, badgeCls: '',
    logo: (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5f259f] shadow-sm">
        <img src="https://cdn.simpleicons.org/phonepe/ffffff" alt="PhonePe" className="w-6 h-6 object-contain"
          onError={e => { e.target.style.display='none' }} />
      </div>
    ),
  },
  {
    id: 'COD', method: 'COD', label: 'Cash on Delivery',
    sub: 'Pay when order arrives', deepLink: null,
    badge: null, badgeCls: '',
    logo: (
      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
        <span className="material-symbols-outlined text-emerald-600 text-[22px]">payments</span>
      </div>
    ),
  },
]

/* ── Divider ────────────────────────────────────────────────────── */
const Divider = () => <div className="h-2 bg-surface-container -mx-0" />

export default function Cart() {
  const navigate = useNavigate()
  const { token, user, isLoggedIn, updateUser } = useAuth()
  const { cartItems, updateQty, removeFromCart, fetchCart } = useCart()

  const [placing, setPlacing]           = useState(false)
  const [address, setAddress]           = useState(user?.address || '')
  const [showCheckout, setShowCheckout] = useState(false)
  const [selectedPayment, setPayment]   = useState('GPAY')
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [error, setError]               = useState('')
  const [countdown, setCountdown]       = useState(5)

  /* auto-redirect countdown after success */
  useEffect(() => {
    if (!orderSuccess) return
    if (countdown <= 0) { navigate('/orders'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [orderSuccess, countdown])

  const subtotal       = cartItems.reduce((s, it) => s + parseFloat(it.product?.price || 0) * it.quantity, 0)
  const taxes          = subtotal * TAX_RATE
  const total          = subtotal + DELIVERY_FEE + taxes
  const totalItems     = cartItems.reduce((s, it) => s + it.quantity, 0)
  const PAYMENT_OPTIONS = getPaymentOptions(total)
  const chosen          = PAYMENT_OPTIONS.find(p => p.id === selectedPayment)

  const handlePay = async () => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return }
    setPlacing(true); setError('')
    try {
      const res  = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address,
          payment_method:    chosen.method,
          payment_reference: chosen.id !== 'COD' ? chosen.id : null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      if (address.trim() !== (user?.address || '').trim()) {
        fetch(`${API}/users/profile`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ address }),
        }).then(r => r.json()).then(d => { if (d.success) updateUser({ address }) }).catch(() => {})
      }

      await fetchCart()
      playSuccessChime()   // 🔔 Play chime!

      if (chosen.deepLink) {
        window.location.href = chosen.deepLink
        setTimeout(() => setOrderSuccess(true), 800)
      } else {
        setOrderSuccess(true)
      }
      setShowCheckout(false)
    } catch (err) {
      setError(err.message || 'Order failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  /* ── Not logged in ──────────────────────────────────────────── */
  if (!isLoggedIn) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">shopping_cart</span>
        </div>
        <div>
          <h2 className="font-headline font-black text-2xl text-on-surface mb-2">Sign in to view cart</h2>
          <p className="text-on-surface-variant text-sm">Your cart is saved — log in to continue your order.</p>
        </div>
        <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20">Sign In</button>
        <button onClick={() => navigate('/signup')} className="text-primary font-bold text-sm hover:underline">New here? Create account</button>
      </div>
      <BottomNav />
    </div>
  )

  /* ── Order success ──────────────────────────────────────────── */
  if (orderSuccess) {
    const confetti = Array.from({ length: 32 }, (_, i) => ({
      id: i, x: Math.random() * 100, delay: Math.random() * 0.8,
      color: ['#a83100','#ff784c','#22c55e','#3b82f6','#f59e0b','#8b5cf6'][i % 6],
      size: 6 + Math.random() * 8, rotation: Math.random() * 360,
    }))
    return (
      <div className="flex flex-col h-full w-full bg-surface text-on-surface overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map(c => (
            <motion.div key={c.id} className="absolute rounded-sm"
              style={{ left: `${c.x}%`, top: '-20px', width: c.size, height: c.size, backgroundColor: c.color }}
              initial={{ y: -20, rotate: c.rotation, opacity: 1 }}
              animate={{ y: '110vh', rotate: c.rotation + 1080, opacity: [1, 1, 0] }}
              transition={{ duration: 2.5 + Math.random() * 1.5, delay: c.delay, ease: 'easeIn' }}
            />
          ))}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center relative z-10">
          <div className="relative">
            <motion.div className="absolute inset-0 rounded-full bg-green-200"
              initial={{ scale: 0.8, opacity: 0.8 }} animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.4 }} />
            <motion.div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/40"
              initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
              <svg viewBox="0 0 52 52" className="w-14 h-14">
                <motion.path d="M14 27 L22 35 L38 17" fill="none" stroke="white" strokeWidth="5"
                  strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }} />
              </svg>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h2 className="font-headline font-black text-3xl text-on-surface tracking-tight">Order Placed!</h2>
            <p className="text-on-surface-variant text-sm mt-2">
              {chosen?.id === 'COD' ? `Pay ₹${total.toFixed(0)} when your order arrives` : `Complete payment in ${chosen?.label}`}
            </p>
          </motion.div>
          <motion.div className="w-full max-w-xs bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.65 }}>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-green-600 text-[22px] icon-filled">receipt_long</span>
            </div>
            <div className="text-left">
              <p className="text-xs text-on-surface-variant font-medium">Total Amount</p>
              <p className="font-headline font-black text-2xl text-green-600">₹{total.toFixed(0)}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">via {chosen?.label}</p>
            </div>
          </motion.div>
          <motion.div className="flex flex-col gap-3 w-full max-w-xs"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
            <p className="text-xs text-on-surface-variant">Redirecting in <strong className="text-on-surface">{countdown}s</strong></p>
            <button onClick={() => navigate('/orders')} className="w-full py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20">View My Orders</button>
            <button onClick={() => navigate('/home')} className="w-full py-3 border border-outline-variant text-on-surface-variant rounded-full font-medium text-sm">Back to Home</button>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    )
  }

  /* ── Empty cart ─────────────────────────────────────────────── */
  if (cartItems.length === 0) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-5xl">
          🛒
        </motion.div>
        <div>
          <h2 className="font-headline font-black text-2xl text-on-surface mb-2">Your cart is empty</h2>
          <p className="text-on-surface-variant text-sm">Add delicious items from our menu</p>
        </div>
        <button onClick={() => navigate('/menu')} className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>Browse Menu
        </button>
      </div>
      <BottomNav />
    </div>
  )

  /* ── Main Cart — Zomato Style ───────────────────────────────── */
  return (
    <div className="flex flex-col h-full w-full bg-surface-container text-on-surface font-body">
      <TopBar />

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">

        {/* ── Header strip ──────────────────────────────────────── */}
        <div className="bg-surface px-5 py-4 flex items-center justify-between border-b border-surface-container">
          <div>
            <h1 className="font-headline font-black text-xl text-on-surface tracking-tight">My Cart</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''} · ₹{total.toFixed(0)} to pay</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
          </div>
        </div>

        <div className="space-y-2 pb-36">

          {/* ── Delivery info bar ─────────────────────────────────── */}
          <div className="bg-surface px-5 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]">directions_bike</span>
            <div>
              <p className="text-xs font-bold text-on-surface">Delivery in <span className="text-green-600">30–40 mins</span></p>
              <p className="text-[11px] text-on-surface-variant">Delivery fee ₹{DELIVERY_FEE}</p>
            </div>
          </div>

          <Divider />

          {/* ── Cart Items ─────────────────────────────────────────── */}
          <div className="bg-surface px-5 pt-4 pb-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Items</p>
            <AnimatePresence>
              {cartItems.map((item) => {
                const product  = item.product || {}
                const lineTotal = parseFloat(product.price || 0) * item.quantity
                return (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60, height: 0 }} transition={{ duration: 0.22 }}
                    className="flex items-center gap-4 py-3.5 border-b border-surface-container last:border-0"
                  >
                    {/* Veg/Non-veg dot */}
                    <div className="flex-shrink-0 w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-sm" />
                    </div>

                    {/* Product image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      {product.image
                        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                    </div>

                    {/* Name + qty */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{product.category}</p>
                      <p className="font-black text-primary text-sm mt-1">₹{lineTotal.toFixed(0)}</p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden flex-shrink-0">
                      <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-primary active:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </button>
                      <span className="w-7 text-center font-black text-sm text-on-surface">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary active:opacity-80 transition-opacity">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          <Divider />

          {/* ── Delivery Address ───────────────────────────────────── */}
          <div className="bg-surface px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              <p className="font-bold text-sm text-on-surface">Delivery Address</p>
            </div>
            {user?.address && (
              <button onClick={() => setAddress(user.address)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 mb-2.5 rounded-xl border text-left text-sm transition-all ${
                  address === user.address ? 'border-primary bg-primary/5' : 'border-surface-container bg-surface-container hover:border-primary/30'
                }`}>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant flex-shrink-0">home</span>
                <span className="text-on-surface text-xs truncate flex-1">{user.address}</span>
                {address === user.address && <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0">check_circle</span>}
              </button>
            )}
            <textarea value={address} onChange={e => setAddress(e.target.value)}
              placeholder="Enter delivery address..." rows={2}
              className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>

          <Divider />

          {/* ── Bill Summary ────────────────────────────────────────── */}
          <div className="bg-surface px-5 py-4">
            <p className="font-bold text-sm text-on-surface mb-3">Bill Summary</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Item Total</span><span className="text-on-surface font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Fee</span><span className="text-on-surface font-medium">₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>GST (5%)</span><span className="text-on-surface font-medium">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-on-surface border-t border-dashed border-surface-container pt-2.5 mt-1 text-base">
                <span>To Pay</span><span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Divider />

          {/* ── Payment Method ──────────────────────────────────────── */}
          <div className="bg-surface px-5 pt-4 pb-2">
            <p className="font-bold text-sm text-on-surface mb-1">Payment</p>
            <p className="text-xs text-on-surface-variant mb-3">Choose how you'd like to pay</p>
            {PAYMENT_OPTIONS.map((opt, idx) => (
              <button key={opt.id} onClick={() => setPayment(opt.id)}
                className={`w-full flex items-center gap-3.5 py-3.5 transition-all rounded-xl px-3 mb-1 ${
                  selectedPayment === opt.id ? 'bg-primary/5 border border-primary/20' : 'bg-surface-container border border-transparent'
                }`}>
                <div className="flex-shrink-0">{opt.logo}</div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-on-surface">{opt.label}</span>
                    {opt.badge && <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${opt.badgeCls}`}>{opt.badge}</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">{opt.sub}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selectedPayment === opt.id ? 'border-primary' : 'border-outline-variant'
                }`}>
                  {selectedPayment === opt.id && (
                    <motion.div layoutId="pay-dot" className="w-2.5 h-2.5 rounded-full bg-primary"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sticky bottom CTA ─────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-surface border-t border-surface-container px-5 pt-3 pb-5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-xs mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">error</span>{error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <p className="text-xs text-on-surface-variant">Paying via <strong className="text-on-surface">{chosen?.label}</strong></p>
          </div>
          <p className="font-headline font-black text-primary text-lg">₹{total.toFixed(2)}</p>
        </div>

        <button onClick={handlePay} disabled={placing}
          className="w-full py-4 rounded-2xl font-headline font-bold text-base transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg bg-primary text-on-primary shadow-primary/25 active:scale-[0.98]">
          {placing
            ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Placing Order...</>
            : <><span className="material-symbols-outlined text-[20px]">restaurant</span>Place Order · ₹{total.toFixed(0)}</>
          }
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
