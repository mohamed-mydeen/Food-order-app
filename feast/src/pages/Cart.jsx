import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getDeliveryFee } from '../constants/neighborhoods'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

/* ── Web Audio success chime ──────────────────────────── */
function playSuccessChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
      osc.start(t); osc.stop(t + 0.35)
    })
  } catch { /* silently ignore */ }
}

/* ── UPI Config ───────────────────────────────────────── */
const MERCHANT_UPI  = 'mkaubathulla@oksbi'
const MERCHANT_NAME = 'Mohamed Kaubathulla'
const PENDING_KEY   = 'feast_pending_upi'

const makeGPayLink = (amt, ref) => {
  const callbackUrl = encodeURIComponent(`${window.location.origin}/cart?payment=success`)
  return (
    `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI)}` +
    `&pn=${encodeURIComponent(MERCHANT_NAME)}` +
    `&am=${parseFloat(amt).toFixed(2)}` +
    `&cu=INR` +
    `&tr=${ref}` +
    `&tn=${encodeURIComponent('FeastAtNight Order')}` +
    `&url=${callbackUrl}`
  )
}

/* ── Payment Options ──────────────────────────────────── */
const PAYMENT_OPTIONS = [
  {
    id: 'GPAY', method: 'UPI', label: 'Google Pay / PhonePe / UPI',
    sub: 'Pay instantly via any UPI app',
    badge: null, badgeCls: '',
    logo: (
      <div className="w-9 h-9 rounded-md border border-gray-200 bg-white flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="w-full h-full object-contain"
          onError={e => { e.target.style.display = 'none' }} />
      </div>
    ),
  },
  {
    id: 'COD', method: 'COD', label: 'Cash on Delivery',
    sub: 'Pay in cash or UPI at your doorstep', badge: null, badgeCls: '',
    logo: (
      <div className="w-9 h-9 rounded-md border border-gray-200 bg-white flex items-center justify-center shadow-sm text-emerald-600 flex-shrink-0">
        <span className="material-symbols-outlined text-[20px] font-light">payments</span>
      </div>
    ),
  }
]

const Divider = () => <div className="h-2 bg-surface-container" />

export default function Cart() {
  const navigate = useNavigate()
  const { token, user, isLoggedIn, updateUser } = useAuth()
  const { cartItems, updateQty, fetchCart } = useCart()

  const [placing, setPlacing]             = useState(false)
  const [address, setAddress]             = useState(user?.address || '')
  const [selectedPayment, setPayment]     = useState(null)
  const [error, setError]                 = useState('')

  const [recentOrders, setRecentOrders]   = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [updatingItem, setUpdatingItem]   = useState(null)

  // UPI "pay-first" return state
  const [returnFromUpi, setReturnFromUpi] = useState(false)
  const [pendingData, setPendingData]     = useState(null)
  const [confirmingOrder, setConfirming]  = useState(false)

  /* Detect return from UPI app via ?payment=success */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/cart')
      const saved = localStorage.getItem(PENDING_KEY)
      if (saved) {
        try {
          setPendingData(JSON.parse(saved))
          setReturnFromUpi(true)
        } catch { /* ignore */ }
      }
    }
  }, [])

  /* Confirm order AFTER user returns from GPay */
  const handleConfirmAfterUPI = async () => {
    if (!pendingData || !token) return
    setConfirming(true); setError('')
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          address: pendingData.address,
          payment_method: 'UPI',
          payment_reference: 'GPAY',
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)

      localStorage.removeItem(PENDING_KEY)
      await fetchCart()
      playSuccessChime()
      setReturnFromUpi(false)
      navigate('/order-success', { state: { total: pendingData.total, method: 'UPI' } })
    } catch (err) {
      setError(err.message || 'Order confirmation failed. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  const handleCancelUPI = () => {
    localStorage.removeItem(PENDING_KEY)
    setReturnFromUpi(false)
    setPendingData(null)
  }



  /* Fetch recent orders for empty cart */
  useEffect(() => {
    if (!token || cartItems.length > 0) return
    setOrdersLoading(true)
    fetch(`${API}/orders/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.success) setRecentOrders(d.data.slice(0, 3)) })
      .catch(() => {}).finally(() => setOrdersLoading(false))
  }, [token, cartItems.length])

  const handleUpdateQty = async (productId, newQty, action) => {
    setUpdatingItem({ id: productId, action })
    await updateQty(productId, newQty)
    setUpdatingItem(null)
  }

  const subtotal     = cartItems.reduce((s, it) => s + parseFloat(it.product?.price || 0) * it.quantity, 0)
  const DELIVERY_FEE = getDeliveryFee(user?.neighborhood)
  const total        = subtotal + DELIVERY_FEE
  const totalItems   = cartItems.reduce((s, it) => s + it.quantity, 0)
  const chosen       = PAYMENT_OPTIONS.find(p => p.id === selectedPayment)

  /* Main Place Order handler */
  const handlePay = async () => {
    if (!address.trim()) { setError('Please enter a delivery address.'); return }
    if (!chosen)         { setError('Please select a payment method.');  return }
    setError('')

    if (chosen.method === 'UPI') {
      // Save pending order in localStorage, then launch GPay immediately
      const ref = `FEAST-${Date.now()}`
      localStorage.setItem(PENDING_KEY, JSON.stringify({ address, total, ref }))

      // Save address silently
      if (address.trim() !== (user?.address || '').trim()) {
        fetch(`${API}/users/profile`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ address }),
        }).then(r => r.json()).then(d => { if (d.success) updateUser({ address }) }).catch(() => {})
      }

      // 🚀 Open GPay FIRST — order not created yet
      window.location.href = makeGPayLink(total, ref)
      return
    }

    // COD: Create order right away
    setPlacing(true)
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address, payment_method: 'COD', payment_reference: null }),
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
      playSuccessChime()
      navigate('/order-success', { state: { total, method: selectedPayment } })
    } catch (err) {
      setError(err.message || 'Order failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  /* ── Not logged in ── */
  if (!isLoggedIn) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
           style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
        
        <motion.div 
          className="w-32 h-32 rounded-[24px] bg-[#a83100]/10 flex items-center justify-center mb-6 shadow-xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
        >
          <span className="material-symbols-outlined text-[#a83100] text-6xl icon-filled">shopping_cart</span>
        </motion.div>

        <h2 className="font-headline font-black text-3xl text-on-surface mb-2 leading-tight">Your Cart</h2>
        <p className="text-secondary text-sm mb-10 max-w-xs leading-relaxed font-medium">
          Sign in to add items to your cart and experience the best midnight delivery in town!
        </p>

        <div className="w-full max-w-xs space-y-4">
          <motion.button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white rounded-2xl font-headline font-black tracking-wide shadow-lg shadow-[#e34105]/20 active:scale-[0.98] transition-all"
            whileTap={{ scale: 0.98 }}
          >
            SIGN IN
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/signup')}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-headline font-black tracking-wide active:scale-[0.98] transition-all"
            whileTap={{ scale: 0.98 }}
          >
            CREATE ACCOUNT
          </motion.button>
        </div>
      </div>
    </div>
  )


  /* ── UPI Return: "Did you pay?" screen ── */
  if (returnFromUpi && pendingData) return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 18 }}
          className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-emerald-600 text-5xl">payments</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight">Payment Done?</h2>
          <p className="text-on-surface-variant text-sm mt-2 leading-relaxed">
            Did you complete the payment of{' '}
            <strong className="text-on-surface">₹{pendingData.total?.toFixed(0)}</strong> on GPay / UPI?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="w-full max-w-xs bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-blue-500 text-[16px]">info</span>
            <p className="text-xs font-bold text-blue-700">Payment to Feast At Night</p>
          </div>
          <p className="text-[11px] text-blue-600">Amount: ₹{pendingData.total?.toFixed(2)} · UPI: {MERCHANT_UPI}</p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-xs w-full max-w-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">error</span>{error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={handleConfirmAfterUPI}
            disabled={confirmingOrder}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-headline font-bold text-base shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98] transition-transform"
          >
            {confirmingOrder
              ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Confirming Order...</>
              : <><span className="material-symbols-outlined text-[20px]">check_circle</span>Yes, I Paid — Confirm Order</>
            }
          </button>

          <button
            onClick={() => window.location.href = makeGPayLink(pendingData.total, pendingData.ref)}
            className="w-full py-3.5 border-2 border-emerald-500 text-emerald-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Open UPI App Again
          </button>

          <button onClick={handleCancelUPI} className="w-full py-3 text-on-surface-variant text-sm font-medium">
            Cancel — Go Back to Cart
          </button>
        </motion.div>
      </div>
    </div>
  )



  /* ── Empty cart ── */
  if (cartItems.length === 0) return (
    <div className="flex flex-col h-full w-full bg-surface-container text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="flex flex-col items-center gap-4 pt-10 pb-6 px-8 text-center bg-surface">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-orange-500/10 rounded-full flex items-center justify-center text-5xl">🛒
          </motion.div>
          <div>
            <h2 className="font-headline font-black text-2xl text-on-surface mb-1">Your cart is empty</h2>
            <p className="text-on-surface-variant text-sm">Add delicious items from our menu</p>
          </div>
          <button onClick={() => navigate('/menu')}
            className="px-8 py-3.5 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>Browse Menu
          </button>
        </div>
        <div className="px-4 pt-5" style={{ paddingBottom: 'max(100px, calc(env(safe-area-inset-bottom) + 100px))' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="font-headline font-black text-base text-on-surface">Recent Orders</p>
            {recentOrders.length > 0 && <button onClick={() => navigate('/orders')} className="text-xs text-primary font-bold">View all</button>}
          </div>
          {ordersLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-surface rounded-2xl p-4 flex gap-3 animate-pulse border border-surface-container">
                  <div className="w-14 h-14 rounded-xl bg-surface-container flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-surface-container rounded w-3/4" /><div className="h-2.5 bg-surface-container rounded w-1/2" /><div className="h-3 bg-surface-container rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!ordersLoading && recentOrders.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <span className="text-4xl mb-3">🛍️</span>
              <p className="text-on-surface-variant text-sm">No orders placed yet</p>
            </div>
          )}
          {!ordersLoading && recentOrders.map((order, i) => {
            const itemNames = order.items?.map(it => it.product?.name).filter(Boolean) || []
            const firstImage = order.items?.find(it => it.product?.image)?.product?.image
            const totalQty = order.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0
            const STATUS_COLORS = { Pending: 'text-amber-500', Preparing: 'text-blue-400', 'Out for Delivery': 'text-violet-400', Delivered: 'text-green-400', Cancelled: 'text-red-400' }
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-surface rounded-2xl border border-surface-container mb-3 overflow-hidden shadow-sm">
                <div className="flex gap-3 p-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                    {firstImage ? <img src={firstImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm line-clamp-1">{itemNames.join(', ') || 'Order items'}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{totalQty} item{totalQty !== 1 ? 's' : ''} · ₹{parseFloat(order.total_amount).toFixed(0)}</p>
                    <span className={`text-[11px] font-black uppercase tracking-wide ${STATUS_COLORS[order.status] || 'text-on-surface-variant'}`}>{order.status}</span>
                  </div>
                  <motion.button whileTap={{ scale: 0.92 }} onClick={() => navigate('/menu')}
                    className="self-center flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                    <span className="material-symbols-outlined text-[13px]">refresh</span>Reorder
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )

  /* ── Main Cart ── */
  return (
    <div className="flex flex-col h-full w-full bg-surface-container text-on-surface font-body">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar">

        {/* Header */}
        <div className="bg-surface px-5 py-4 flex items-center justify-between border-b border-surface-container">
          <div>
            <h1 className="font-headline font-black text-xl text-on-surface tracking-tight">My Cart</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">{totalItems} item{totalItems !== 1 ? 's' : ''} · ₹{total.toFixed(0)} to pay</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">shopping_cart</span>
          </div>
        </div>

        <div className="space-y-2 pb-6">

          {/* Delivery bar */}
          <div className="bg-surface px-5 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500 text-[20px]">directions_bike</span>
            <div>
              <p className="text-xs font-bold text-on-surface">Delivery in <span className="text-green-600">30–40 mins</span></p>
              <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                {user?.neighborhood ? (
                  <>Delivery to <span className="font-bold text-on-surface">{user.neighborhood}</span> — ₹{DELIVERY_FEE}</>
                ) : (
                  <>Delivery fee ₹{DELIVERY_FEE}</>
                )}
              </p>
            </div>
          </div>
          <Divider />

          {/* Cart Items */}
          <div className="bg-surface px-5 pt-4 pb-2">
            <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant mb-3">Items</p>
            <AnimatePresence>
              {cartItems.map(item => {
                const product = item.product || {}
                const lineTotal = parseFloat(product.price || 0) * item.quantity
                return (
                  <motion.div key={item.id} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 60, height: 0 }} transition={{ duration: 0.22 }}
                    className="flex items-center gap-4 py-3.5 border-b border-surface-container last:border-0">
                    <div className="flex-shrink-0 w-4 h-4 border-2 border-green-500 rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-500 rounded-sm" />
                    </div>
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface truncate">{product.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{product.category}</p>
                      <p className="font-black text-primary text-sm mt-1">₹{lineTotal.toFixed(0)}</p>
                    </div>
                    <div className="flex items-center bg-surface-container-low border border-outline-variant/20 rounded-lg overflow-hidden flex-shrink-0">
                      <button onClick={() => handleUpdateQty(item.product_id, item.quantity - 1, 'dec')}
                        disabled={updatingItem?.id === item.product_id}
                        className="w-8 h-8 flex items-center justify-center text-primary active:bg-primary/10 disabled:opacity-50">
                        {updatingItem?.id === item.product_id && updatingItem?.action === 'dec'
                          ? <svg className="animate-spin w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          : <span className="material-symbols-outlined text-[16px]">remove</span>}
                      </button>
                      <span className="w-7 text-center font-black text-sm text-on-surface">{item.quantity}</span>
                      <button onClick={() => handleUpdateQty(item.product_id, item.quantity + 1, 'inc')}
                        disabled={updatingItem?.id === item.product_id}
                        className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary active:opacity-80 disabled:opacity-50">
                        {updatingItem?.id === item.product_id && updatingItem?.action === 'inc'
                          ? <svg className="animate-spin w-4 h-4 text-on-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          : <span className="material-symbols-outlined text-[16px]">add</span>}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
          <Divider />

          {/* Delivery Address */}
          <div className="bg-surface px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
              <p className="font-bold text-sm text-on-surface">Delivery Address</p>
            </div>
            {user?.address ? (
              <div className="w-full flex items-center gap-2 px-3 py-3 rounded-xl border border-primary bg-primary/5 text-left text-sm">
                <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">home</span>
                <span className="text-on-surface text-sm flex-1">{user.address}</span>
                <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0">check_circle</span>
              </div>
            ) : (
              <textarea value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Enter delivery address..." rows={2}
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-3 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            )}
          </div>
          <Divider />

          {/* Bill Summary */}
          <div className="bg-surface px-5 py-4">
            <p className="font-bold text-sm text-on-surface mb-3">Bill Summary</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Item Total</span><span className="text-on-surface font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Delivery Fee</span><span className="text-on-surface font-medium">₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-on-surface border-t border-dashed border-surface-container pt-2.5 mt-1 text-base">
                <span>To Pay</span><span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <Divider />

          {/* Payment Method */}
          <div className="bg-surface px-5 pt-5 pb-5">
            <h3 className="font-black text-[15px] text-on-surface mb-3 tracking-tight">Select Payment Method</h3>
            <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface shadow-sm">
              {PAYMENT_OPTIONS.map((opt, idx) => {
                const isSelected = selectedPayment === opt.id;
                return (
                  <button 
                    key={opt.id} 
                    onClick={() => setPayment(opt.id)}
                    className={`w-full flex items-start gap-4 p-4 transition-colors ${
                      idx !== PAYMENT_OPTIONS.length - 1 ? 'border-b border-outline-variant/20' : ''
                    } ${isSelected ? 'bg-primary/5' : 'bg-transparent hover:bg-surface-container-lowest'}`}
                  >
                    <div className="flex-shrink-0 pt-0.5">{opt.logo}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>{opt.label}</span>
                        {/* Swiggy-style Radio Checkmark */}
                        <div className={`w-[22px] h-[22px] rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected ? 'bg-primary border-primary' : 'border-[1.5px] border-outline-variant/50'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>}
                        </div>
                      </div>
                      <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed pr-6">{opt.sub}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA — sits above the fixed BottomNav */}
      <div
        className="flex-shrink-0 bg-surface border-t border-surface-container px-5 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] relative z-40"
        style={{ paddingBottom: 'max(96px, calc(env(safe-area-inset-bottom) + 96px))' }}
      >
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2.5 text-xs mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">error</span>{error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-5 mb-1 pt-1">
          {/* Left Side: Amount Summary */}
          <div className="flex flex-col flex-shrink-0 pl-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-1">To Pay</span>
            <span className="font-headline font-black text-on-surface text-[22px] leading-none tracking-tight">₹{total.toFixed(2)}</span>
          </div>

          {/* Right Side: Action Button */}
          <button onClick={handlePay} disabled={placing}
            className="flex-1 py-4 rounded-[18px] font-headline text-[15px] transition-all disabled:opacity-60 flex items-center justify-between px-5 shadow-[0_6px_20px_rgba(255,120,76,0.3)] bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white active:scale-[0.97]">
            {placing ? (
               <span className="flex items-center justify-center gap-2 w-full font-bold">
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Placing...
              </span>
            ) : (
                <>
                <span className="font-black tracking-wide uppercase">
                  {chosen ? `Pay via ${chosen.method === 'UPI' ? 'GPay' : 'Cash'}` : 'Select Payment'}
                </span>
                <motion.span 
                    animate={{ x: [0, 4, 0] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="material-symbols-outlined text-[16px] font-variation-fill stroke-2"
                  >
                    arrow_forward_ios
                  </motion.span>
                </>
            )}
          </button>
        </div>
      </div>

    </div>
  )
}
