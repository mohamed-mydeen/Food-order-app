import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API          = 'http://localhost:5000/api'
const DELIVERY_FEE = 45
const TAX_RATE     = 0.05

// ── Change to your real UPI ID ──
const MERCHANT_UPI  = 'feastatnight@upi'
const MERCHANT_NAME = 'Feast At Night'

const makeUpiLink  = (amount) =>
  `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Feast At Night Order')}`
const makeGPayLink = (amount) =>
  `tez://upi/pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR`
const makePhonePeLink = (amount) =>
  `phonepe://pay?pa=${encodeURIComponent(MERCHANT_UPI)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR`

/* ─── Inline brand SVG icons ─────────────────────────────────── */
const GPayLogo = () => (
  <svg viewBox="0 0 48 20" className="w-10 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="16" fontFamily="'Product Sans', sans-serif" fontWeight="700" fontSize="16" fill="#4285F4">G</text>
    <text x="11" y="16" fontFamily="'Product Sans', sans-serif" fontWeight="500" fontSize="16">
      <tspan fill="#4285F4">o</tspan><tspan fill="#EA4335">o</tspan><tspan fill="#FBBC05">g</tspan><tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
    </text>
  </svg>
)

/* ─── Payment option config (2 options only) ─────────────────── */
const getPaymentOptions = (amount) => [
  {
    id:       'GPAY',
    method:   'UPI',
    label:    'Google Pay',
    sub:      'Pay securely via GPay',
    deepLink: makeGPayLink(amount),
    logo: (
      <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-gray-100 shadow-sm">
        <img
          src="https://cdn.simpleicons.org/googlepay/5F6368"
          alt="GPay"
          className="w-6 h-6 object-contain"
          onError={e => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'; e.target.style.display='none' }}
        />
      </div>
    ),
    badge: 'Recommended',
    badgeCls: 'bg-blue-50 text-blue-600',
  },
  {
    id:       'PHONEPE',
    method:   'UPI',
    label:    'PhonePe',
    sub:      'Pay securely via PhonePe',
    deepLink: makePhonePeLink(amount),
    logo: (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#5f259f] shadow-sm">
        <img
          src="https://cdn.simpleicons.org/phonepe/ffffff"
          alt="PhonePe"
          className="w-6 h-6 object-contain"
          onError={e => { e.target.style.display='none' }}
        />
      </div>
    ),
    badge: null,
    badgeCls: '',
  },
  {
    id:       'COD',
    method:   'COD',
    label:    'Cash on Delivery',
    sub:      'Pay when your order arrives',
    deepLink: null,
    logo: (
      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
    ),
    badge: null,
    badgeCls: '',
  },
]

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

  const subtotal = cartItems.reduce((s, it) => s + parseFloat(it.product?.price || 0) * it.quantity, 0)
  const taxes    = subtotal * TAX_RATE
  const total    = subtotal + DELIVERY_FEE + taxes

  const PAYMENT_OPTIONS = getPaymentOptions(total)
  const chosen = PAYMENT_OPTIONS.find(p => p.id === selectedPayment)

  const openCheckout  = () => { setError(''); setShowCheckout(true) }
  const closeCheckout = () => { setShowCheckout(false); setError('') }

  const handlePay = async () => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return }
    setPlacing(true); setError('')
    try {
      const res  = await fetch(`${API}/orders`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address,
          payment_method:    chosen.method,
          payment_reference: chosen.id !== 'COD' ? chosen.id : null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      // Save address silently
      if (address.trim() !== (user?.address || '').trim()) {
        fetch(`${API}/users/profile`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ address }),
        }).then(r => r.json()).then(d => { if (d.success) updateUser({ address }) }).catch(() => {})
      }

      await fetchCart()

      // Open UPI app after order is saved
      if (chosen.deepLink) {
        window.location.href = chosen.deepLink
        // fallback: show success after brief delay if app doesn't open
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

  /* ── Not logged in ────────────────────────────────────────────── */
  if (!isLoggedIn) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-container">
        <div className="flex items-center px-5 py-4 gap-3">
          <span className="material-symbols-outlined text-[22px] text-orange-800">menu</span>
          <span className="font-headline font-black text-orange-900 tracking-tighter text-lg">Feast At Night</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-4xl">lock</span>
        </div>
        <h2 className="font-headline font-bold text-xl text-on-surface">Sign in to view your cart</h2>
        <p className="text-secondary text-sm max-w-xs">Your cart is saved — log in to continue your midnight feast.</p>
        <button onClick={() => navigate('/login')} className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20">Sign In</button>
        <button onClick={() => navigate('/signup')} className="text-primary font-bold text-sm hover:underline">New here? Create account</button>
      </div>
      <BottomNav />
    </div>
  )

  /* ── Order success ─────────────────────────────────────────────── */
  if (orderSuccess) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-green-500 icon-filled" style={{ fontSize: 56 }}>check_circle</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-headline font-bold text-2xl text-on-surface">Order Placed! 🎉</h2>
          <p className="text-secondary text-sm mt-2 max-w-xs">
            {chosen?.id === 'COD'
              ? `Pay ₹${total.toFixed(2)} cash when your order arrives`
              : `Complete the payment in ${chosen?.label} if it opened`}
          </p>
          <div className={`mt-4 rounded-2xl px-5 py-3 flex items-center gap-3 ${chosen?.id === 'COD' ? 'bg-emerald-50' : 'bg-[#5f259f]/5 border border-[#5f259f]/20'}`}>
            {chosen?.logo}
            <div className="text-left">
              <p className="font-bold text-sm text-gray-800">{chosen?.label}</p>
              <p className="text-xs text-gray-400">{chosen?.id === 'COD' ? 'Pay at door' : 'Payment in progress'}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col gap-3 w-full max-w-xs">
          <button onClick={() => navigate('/home')} className="w-full px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20">Back to Home</button>
          <button onClick={() => navigate('/orders')} className="w-full px-8 py-3 border border-primary text-primary rounded-full font-bold">View My Orders</button>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )

  /* ── Main Cart ─────────────────────────────────────────────────── */
  return (
    <div className="relative flex flex-col h-full w-full bg-[#f5f5f5] text-on-surface font-body">

      {/* Topbar */}
      <div className="flex-shrink-0 z-10 bg-white shadow-sm">
        <div className="flex justify-between items-center px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-orange-800">menu</span>
            <span className="font-headline font-black text-orange-900 tracking-tighter text-lg">Your Cart</span>
          </div>
          {cartItems.length > 0 && (
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {cartItems.reduce((s, it) => s + it.quantity, 0)} items
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="px-4 pt-4 pb-36 space-y-3 max-w-2xl mx-auto">

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm"
              >{error}</motion.div>
            )}
          </AnimatePresence>

          {/* Empty */}
          {cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl">🛒</div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Your cart is empty</h3>
              <p className="text-secondary text-sm">Add items from our menu</p>
              <button onClick={() => navigate('/menu')} className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold shadow-md">Browse Menu</button>
            </div>
          )}

          {/* Cart Items */}
          {cartItems.length > 0 && (
            <>
              <div className="space-y-2.5">
                <AnimatePresence>
                  {cartItems.map((item) => {
                    const product   = item.product || {}
                    const lineTotal = parseFloat(product.price || 0) * item.quantity
                    return (
                      <motion.div key={item.id} layout
                        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 60, height: 0 }} transition={{ duration: 0.22 }}
                        className="bg-white rounded-2xl overflow-hidden shadow-sm"
                      >
                        <div className="flex gap-3 p-3">
                          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {product.image
                              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                          </div>
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 pr-2">
                                <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                                <p className="text-gray-400 text-xs mt-0.5">{product.category}</p>
                              </div>
                              <button onClick={() => removeFromCart(item.product_id)}
                                className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[14px]">close</span>
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full p-0.5">
                                <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-white active:scale-90 transition-all"
                                ><span className="material-symbols-outlined text-[14px]">remove</span></button>
                                <span className="px-2.5 font-bold text-sm text-gray-800">{item.quantity}</span>
                                <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-on-primary active:scale-90 transition-all"
                                ><span className="material-symbols-outlined text-[14px]">add</span></button>
                              </div>
                              <span className="font-black text-primary text-sm">₹{lineTotal.toFixed(0)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              {/* Bill Summary */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl px-5 py-4 shadow-sm"
              >
                <h2 className="font-bold text-sm text-gray-800 mb-3">Bill Details</h2>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between"><span>Item Total</span><span className="text-gray-800">₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Delivery Fee</span><span className="text-gray-800">₹{DELIVERY_FEE.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>GST (5%)</span><span className="text-gray-800">₹{taxes.toFixed(2)}</span></div>
                  <div className="flex justify-between font-bold text-gray-900 border-t border-dashed border-gray-100 pt-2.5 mt-1">
                    <span>To Pay</span>
                    <span className="text-primary text-base">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Proceed button */}
              <motion.button
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                onClick={openCheckout}
                className="w-full bg-primary text-on-primary py-4 rounded-full font-headline font-bold text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            </>
          )}
        </main>
      </div>

      {/* ── Zomato-style Checkout Sheet ─────────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div
              className="absolute inset-0 z-40 bg-black/40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeCheckout}
            />
            <motion.div
              className="absolute left-0 right-0 z-50 bg-[#f5f5f5] rounded-t-3xl shadow-2xl flex flex-col"
              style={{ bottom: '68px', maxHeight: 'calc(94% - 68px)' }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-3 pb-2 flex-shrink-0">
                <h3 className="font-headline font-black text-lg text-gray-900">Checkout</h3>
                <button onClick={closeCheckout} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200">
                  <span className="material-symbols-outlined text-[18px] text-gray-600">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">

                {/* ── Delivery Address ─────────────────────────────── */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                    <h4 className="font-bold text-sm text-gray-800">Delivery Address</h4>
                  </div>
                  {user?.address && (
                    <button
                      onClick={() => setAddress(user.address)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 mb-2 rounded-xl border text-left text-sm transition-all ${
                        address === user.address ? 'border-primary bg-primary/5' : 'border-gray-100 bg-gray-50 hover:border-primary/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] text-gray-400 flex-shrink-0">home</span>
                      <span className="text-gray-700 text-xs truncate flex-1">{user.address}</span>
                      {address === user.address && <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0">check_circle</span>}
                    </button>
                  )}
                  <textarea
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Enter delivery address..."
                    rows={2}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* ── Order items recap ────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {cartItems.map((it, idx) => (
                    <div key={it.id} className={`flex justify-between items-center px-4 py-3 text-sm ${idx < cartItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border border-green-500 rounded-sm flex items-center justify-center flex-shrink-0">
                          <span className="w-2 h-2 bg-green-500 rounded-sm" />
                        </span>
                        <span className="text-gray-700 font-medium truncate max-w-[150px]">{it.product?.name}</span>
                        <span className="text-gray-400 text-xs">× {it.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-800">₹{(parseFloat(it.product?.price || 0) * it.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between px-4 py-3 bg-gray-50 font-bold text-sm border-t border-gray-100">
                    <span className="text-gray-600">To Pay</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* ── Payment Method ───────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-4 pt-3 pb-2">
                    <h4 className="font-bold text-sm text-gray-800">Payment</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Choose your payment method</p>
                  </div>

                  {PAYMENT_OPTIONS.map((opt, idx) => (
                    <button
                      key={opt.id}
                      onClick={() => setPayment(opt.id)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 transition-colors text-left ${
                        idx < PAYMENT_OPTIONS.length - 1 ? 'border-b border-gray-50' : ''
                      } ${selectedPayment === opt.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                    >
                      {/* Brand logo */}
                      <div className="flex-shrink-0">{opt.logo}</div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800">{opt.label}</span>
                          {opt.badge && (
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${opt.badgeCls}`}>{opt.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{opt.sub}</p>
                      </div>

                      {/* Radio */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedPayment === opt.id ? 'border-primary' : 'border-gray-300'
                      }`}>
                        {selectedPayment === opt.id && (
                          <motion.div
                            layoutId="payment-dot"
                            className="w-2.5 h-2.5 rounded-full bg-primary"
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-sm">{error}</div>
                )}
              </div>

              {/* ── CTA ─────────────────────────────────────────────── */}
              <div className="flex-shrink-0 px-4 pt-3 pb-5 bg-white border-t border-gray-100">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs text-gray-400">Paying via <strong className="text-gray-700">{chosen?.label}</strong></span>
                  <span className="font-black text-primary">₹{total.toFixed(2)}</span>
                </div>
                <button
                  onClick={handlePay}
                  disabled={placing}
                  className={`w-full py-4 rounded-full font-headline font-bold text-base active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2.5 shadow-lg ${
                    selectedPayment === 'COD'
                      ? 'bg-primary text-on-primary shadow-primary/20'
                      : selectedPayment === 'GPAY'
                        ? 'bg-white text-gray-800 border-2 border-gray-200 shadow-gray-200'
                        : 'bg-[#5f259f] text-white shadow-purple-500/25'
                  }`}
                >
                  {placing ? (
                    <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Placing Order...</>
                  ) : selectedPayment === 'COD' ? (
                    <><span className="material-symbols-outlined text-[20px]">restaurant</span>Place Order — ₹{total.toFixed(2)}</>
                  ) : selectedPayment === 'GPAY' ? (
                    <><img src="https://cdn.simpleicons.org/googlepay/5F6368" alt="" className="w-5 h-5 object-contain" />Pay ₹{total.toFixed(2)} with GPay</>
                  ) : (
                    <><img src="https://cdn.simpleicons.org/phonepe/ffffff" alt="" className="w-5 h-5 object-contain" />Pay ₹{total.toFixed(2)} with PhonePe</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
