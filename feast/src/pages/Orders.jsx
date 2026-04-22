import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import brandLogo from '../assets/brand_logo.png'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

const STATUS_CONFIG = {
  Pending:            { label: 'Pending',          color: 'text-amber-500',  bg: 'bg-amber-500/10',   dot: 'bg-amber-500',  icon: 'schedule',              step: 1 },
  Preparing:          { label: 'Preparing',         color: 'text-blue-400',   bg: 'bg-blue-500/10',    dot: 'bg-blue-400',   icon: 'local_fire_department', step: 2 },
  'Out for Delivery': { label: 'Out for Delivery',  color: 'text-violet-400', bg: 'bg-violet-500/10',  dot: 'bg-violet-400', icon: 'delivery_dining',       step: 3 },
  Delivered:          { label: 'Delivered',         color: 'text-green-400',  bg: 'bg-green-500/10',   dot: 'bg-green-400',  icon: 'check_circle',          step: 4 },
  Cancelled:          { label: 'Cancelled',         color: 'text-red-400',    bg: 'bg-red-500/10',     dot: 'bg-red-400',    icon: 'cancel',                step: 0 },
}

const FILTERS = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']
const STEPS   = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered']

/* ── Progress tracker (Swiggy-style) ─────────────────────────── */
function ProgressBar({ status }) {
  const stepIdx = STEPS.indexOf(status)
  if (stepIdx === -1) return null // Cancelled — don't show tracker
  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {STEPS.map((s, i) => {
        const done    = i <= stepIdx
        const current = i === stepIdx
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              done ? 'bg-[#a83100]' : 'bg-surface-container-high'
            }`}>
              {done && <span className="material-symbols-outlined text-white text-[11px]">
                {current ? STATUS_CONFIG[s]?.icon || 'radio_button_checked' : 'check'}
              </span>}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-0.5 rounded-full transition-all ${i < stepIdx ? 'bg-[#a83100]' : 'bg-surface-container-high'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Rate Order Items Bottom Sheet ───────────────────────────────── */
function RateSheet({ order, onClose }) {
  const { token } = useAuth()
  const [ratings, setRatings] = useState({})
  const [comments, setComments] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const promises = order.items.map(it => {
        const rating = ratings[it.product_id]
        if (!rating) return Promise.resolve()
        return fetch(`${API}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: it.product_id, rating, comment: comments[it.product_id] || '', order_id: order.id }),
        })
      })
      await Promise.all(promises)
      setDone(true)
      setTimeout(() => onClose(), 1500)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const hasRatings = Object.keys(ratings).length > 0

  return (
    <>
      <motion.div className="fixed inset-0 bg-black/60 z-[9998]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="fixed left-0 right-0 bottom-0 z-[9999] bg-surface rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '90vh' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 300 }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0"><div className="w-10 h-1 bg-gray-200 rounded-full" /></div>
        
        <div className="overflow-y-auto px-5 pt-3 pb-4 flex-1">
          <h2 className="font-headline font-black text-xl text-on-surface mb-1">Rate your items</h2>
          <p className="text-xs text-on-surface-variant mb-4">How was the food from order #{String(order.id).padStart(4, '0')}?</p>

          {done ? (
            <div className="py-12 flex flex-col items-center">
              <span className="material-symbols-outlined text-green-500 text-6xl mb-2">check_circle</span>
              <p className="font-bold text-on-surface">Thank you for your feedback!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {order.items.map(it => (
                <div key={it.product_id} className="bg-surface-container-low rounded-xl p-4 border border-surface-container">
                  <p className="font-bold text-sm text-on-surface mb-2">{it.product?.name || 'Item'}</p>
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5].map(s => {
                      const r = ratings[it.product_id] || 0
                      return (
                         <span key={s} onClick={() => setRatings(prev => ({ ...prev, [it.product_id]: s }))}
                           className="material-symbols-outlined text-[28px] cursor-pointer"
                           style={{ fontVariationSettings: `'FILL' ${r >= s ? 1 : 0}`, color: r >= s ? '#f59e0b' : '#d1d5db' }}>
                           star
                         </span>
                      )
                    })}
                  </div>
                  {ratings[it.product_id] > 0 && (
                    <textarea
                      value={comments[it.product_id] || ''}
                      onChange={e => setComments(prev => ({ ...prev, [it.product_id]: e.target.value}))}
                      placeholder="Was it tasty? Tell us more..."
                      className="w-full bg-white text-xs border border-surface-container rounded-lg px-3 py-2 resize-none outline-none focus:border-primary"
                      rows={2}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {!done && (
          <div className="p-4 pb-10 border-t border-surface-container bg-surface flex-shrink-0">
            <button
              onClick={handleSubmit} disabled={!hasRatings || submitting}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Ratings'}
            </button>
          </div>
        )}
      </motion.div>
    </>
  )
}

/* ── Order Card ───────────────────────────────────────────────── */
function OrderCard({ order, index, onReorder, onRate }) {
  const { created_at, items = [], total_amount, status, address } = order
  const cfg = STATUS_CONFIG[status] || { label: status, color: 'text-on-surface-variant', bg: 'bg-surface-container', dot: 'bg-outline', icon: 'info', step: -1 }

  const itemNames  = items.map(it => it.product?.name).filter(Boolean)
  const firstImage = items.find(it => it.product?.image)?.product?.image
  const date       = new Date(created_at)
  const dateStr    = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr    = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const totalItems = items.reduce((s, it) => s + (it.quantity || 1), 0)
  const isActive   = status !== 'Delivered' && status !== 'Cancelled'

  const handlePrint = (e) => {
    e.stopPropagation()
    const subtotal = items.reduce((s, it) => s + (it.quantity * parseFloat(it.price || 0)), 0)
    const deliveryFee = (address || '').toLowerCase().includes('melapalayam') ? 20 : 50;
    const total = parseFloat(total_amount).toFixed(2)
    const dateStrFull = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStrFull = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const printContent = `
      <div style="font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1f2937; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${brandLogo}" style="width: 120px; height: auto; margin-bottom: 15px; border-radius: 12px;" />
          <h2 style="font-size: 24px; font-weight: 800; margin: 0; color: #a83100;">FEAST AT NIGHT</h2>
          <p style="font-size: 13px; color: #6b7280; margin-top: 4px;">Premium Midnight Cravings</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 24px; padding: 16px; bg-color: #f9fafb; border-radius: 16px; border: 1px solid #f3f4f6;">
          <div style="line-height: 1.6;">
            <p style="color: #9ca3af; margin: 0;">Order Number</p>
            <p style="font-weight: 800; font-size: 14px; margin: 0;">#${String(order.id).padStart(4, '0')}</p>
          </div>
          <div style="text-align: right; line-height: 1.6;">
            <p style="color: #9ca3af; margin: 0;">Date & Time</p>
            <p style="font-weight: 600; margin: 0;">${dateStrFull}, ${timeStrFull}</p>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin-bottom: 12px;">Order Summary</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${items.map(it => `
              <tr>
                <td style="padding: 10px 0; font-weight: 500;">${it.product?.name || 'Item'} <span style="color: #9ca3af;">x ${it.quantity}</span></td>
                <td style="padding: 10px 0; text-align: right; font-weight: 600;">₹${(it.quantity * parseFloat(it.price||0)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </div>

        <div style="border-top: 1px dashed #e5e7eb; padding-top: 16px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #6b7280;"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #6b7280;"><span>Delivery Fee</span><span>₹${deliveryFee.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 18px; color: #111827; border-top: 2px solid #a83100; padding-top: 16px;">
            <span>Amount Paid</span><span style="color: #a83100;">₹${total}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
          <p style="font-weight: 700; color: #374151; font-size: 14px;">Thank you for ordering! 🙏</p>
          <p style="font-size: 11px; color: #9ca3af; margin-top: 6px;">Feel free to share your feast on social media!</p>
        </div>
      </div>
    `
    const win = window.open('', '_blank', 'width=600,height=800')
    if (win) {
      win.document.write(`<html><head><title>Invoice #${String(order.id).padStart(4, '0')}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"></head><body style="margin:20px; background: #f3f4f6;">${printContent}</body></html>`)
      win.document.close()
      win.focus()
      // Wait for font and logo to load, then print
      setTimeout(() => { win.print() }, 800)
    }
  }

  const downloadBillAsImage = async (e) => {
    e.stopPropagation();
    
    // Create a high-res canvas (2x for clarity)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 2;
    canvas.width = 400 * scale;
    canvas.height = 600 * scale;
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 600);

    // Border (optional)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 380, 580);

    // Draw Logo
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = brandLogo;
    
    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if logo fails
    });

    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, 160, 30, 80, 80);
    }

    // Title
    ctx.fillStyle = '#a83100';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FEAST AT NIGHT', 200, 130);
    
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Premium Midnight Cravings', 200, 150);

    // Order Info
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(`Order #${String(order.id).padStart(4, '0')}`, 30, 190);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`${dateStr} ${timeStr}`, 370, 190);

    // Items Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9ca3af';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText('ITEM', 30, 230);
    ctx.textAlign = 'right';
    ctx.fillText('PRICE', 370, 230);
    
    ctx.beginPath();
    ctx.moveTo(30, 240);
    ctx.lineTo(370, 240);
    ctx.strokeStyle = '#f3f4f6';
    ctx.stroke();

    // Items
    let y = 260;
    ctx.fillStyle = '#1f2937';
    ctx.font = '13px Inter, sans-serif';
    items.forEach(it => {
      ctx.textAlign = 'left';
      ctx.fillText(`${it.product?.name || 'Item'} x${it.quantity}`, 30, y);
      ctx.textAlign = 'right';
      ctx.fillText(`₹${(it.quantity * parseFloat(it.price||0)).toFixed(2)}`, 370, y);
      y += 25;
    });

    // Totals
    y += 20;
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(370, y);
    ctx.strokeStyle = '#e5e7eb';
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    y += 30;
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'left';
    ctx.fillText('Subtotal', 30, y);
    ctx.textAlign = 'right';
    const subtotal = items.reduce((s, it) => s + (it.quantity * parseFloat(it.price || 0)), 0);
    ctx.fillText(`₹${subtotal.toFixed(2)}`, 370, y);

    y += 20;
    ctx.textAlign = 'left';
    ctx.fillText('Delivery Fee', 30, y);
    ctx.textAlign = 'right';
    const deliveryFee = (address || '').toLowerCase().includes('melapalayam') ? 20 : 50;
    ctx.fillText(`₹${deliveryFee.toFixed(2)}`, 370, y);

    y += 35;
    ctx.fillStyle = '#a83100';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL PAID', 30, y);
    ctx.textAlign = 'right';
    ctx.fillText(`₹${total_amount}`, 370, y);

    // Footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Thank you for ordering! 🙏', 200, 560);

    // Download
    const link = document.createElement('a');
    link.download = `FeastAtNight-Order-${order.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <motion.div
      className="bg-surface rounded-2xl overflow-hidden border border-surface-container shadow-sm"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
    >
      {/* ── Status header ─────────────────────────────────────── */}
      <div className={`flex items-center gap-2 px-4 py-2.5 ${cfg.bg}`}>
        <span className={`material-symbols-outlined text-[16px] ${cfg.color}`}>{cfg.icon}</span>
        <span className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>{cfg.label}</span>
        <div className="flex-1" />
        <span className="text-[10px] text-on-surface-variant font-medium">#{String(order.id).padStart(4, '0')} · {dateStr} · {timeStr}</span>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="w-[68px] h-[68px] rounded-xl overflow-hidden bg-surface-container flex-shrink-0 border border-surface-container-high">
            {firstImage
              ? <img src={firstImage} alt="order" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-3xl bg-orange-500/10">🍽️</div>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface text-sm leading-snug line-clamp-2">
              {itemNames.length > 0 ? itemNames.join(', ') : 'Order items'}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {totalItems} item{totalItems !== 1 ? 's' : ''} &nbsp;·&nbsp; Feast At Night
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="font-black text-[#a83100] text-base">₹{parseFloat(total_amount).toFixed(0)}</span>
              <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                {order.payment_method || 'COD'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar — only for active orders */}
        {isActive && (
          <div className="mt-3">
            <ProgressBar status={status} />
            <div className="flex justify-between mt-1">
              {STEPS.map(s => (
                <p key={s} className={`text-[9px] font-bold flex-1 text-center ${
                  STEPS.indexOf(s) <= STEPS.indexOf(status) ? 'text-[#a83100]' : 'text-on-surface-variant'
                }`}>
                  {s === 'Out for Delivery' ? 'On Way' : s}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Delivery address — compact */}
        {address && (
          <div className="flex items-center gap-1.5 mt-3 bg-surface-container rounded-xl px-3 py-2">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant flex-shrink-0">location_on</span>
            <p className="text-[11px] text-on-surface-variant truncate">{address}</p>
          </div>
        )}
      </div>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="mx-4 border-t border-dashed border-surface-container-high mt-3" />

      {/* ── Footer ────────────────────────────────────────────── */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-on-surface-variant font-medium">
            {status === 'Delivered' ? 'Order completed' :
             status === 'Cancelled' ? 'Order cancelled' :
             'Tracking order'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Bill button — downloads as image (renamed from Save) */}
          <motion.button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            onClick={downloadBillAsImage}
          >
            <span className="material-symbols-outlined text-[13px]">receipt_long</span>
            Bill
          </motion.button>

          {status === 'Delivered' && (
            <motion.button
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-50 text-primary border border-orange-200 text-xs font-bold transition-colors"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => onRate(order)}
            >
              <span className="material-symbols-outlined text-[13px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              Rate
            </motion.button>
          )}

          <motion.button
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#a83100] text-white text-xs font-bold shadow-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onReorder(items)}
          >
            <span className="material-symbols-outlined text-[13px]">refresh</span>
            Reorder
          </motion.button>
        </div>
      </div>
      
    </motion.div>
  )
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-surface-container animate-pulse">
      <div className="h-9 bg-surface-container" />
      <div className="p-4 flex gap-3">
        <div className="w-[68px] h-[68px] rounded-xl bg-surface-container" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-surface-container rounded-lg w-3/4" />
          <div className="h-2.5 bg-surface-container rounded-lg w-1/2" />
          <div className="h-4 bg-surface-container rounded-lg w-1/4" />
        </div>
      </div>
    </div>
  )
}

/* ── Main page ────────────────────────────────────────────────── */
export default function Orders() {
  const navigate = useNavigate()
  const { token, isLoggedIn } = useAuth()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')
  const [showToast, setShowToast] = useState(false)
  const [ratingOrder, setRatingOrder] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('status') === 'success') {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const fetchOrders = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const res  = await fetch(`${API}/orders/user`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setOrders(data.data)
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!isLoggedIn) return // Allow guest browsing
    fetchOrders(true)
    const interval = setInterval(() => fetchOrders(false), 15000)
    return () => clearInterval(interval)
  }, [token, isLoggedIn])

  if (!isLoggedIn) {
     return (
      <div className="flex flex-col h-full w-full bg-surface-container text-on-surface">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
             style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
          
          <motion.div 
            className="w-32 h-32 rounded-[24px] bg-[#a83100]/10 flex items-center justify-center mb-6 shadow-xl"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          >
            <span className="material-symbols-outlined text-[#a83100] text-6xl icon-filled">shopping_bag</span>
          </motion.div>

          <h2 className="font-headline font-black text-3xl text-on-surface mb-2 leading-tight">Your Orders</h2>
          <p className="text-secondary text-sm mb-10 max-w-xs leading-relaxed font-medium">
            Sign in to track your active orders and see what you've feasted on before!
          </p>

          <div className="w-full max-w-xs space-y-4">
            <motion.button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-[#a83100] text-white rounded-2xl font-headline font-black tracking-wide shadow-lg shadow-[#a83100]/20 active:scale-[0.98] transition-all"
              whileTap={{ scale: 0.98 }}
            >
              SIGN IN
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/signup')}
              className="w-full py-4 bg-white border-2 border-slate-200 text-slate-800 rounded-2xl font-headline font-black tracking-wide active:scale-[0.98] transition-all"
              whileTap={{ scale: 0.98 }}
            >
              CREATE ACCOUNT
            </motion.button>
          </div>
        </div>
      </div>
    )
  }


  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)
  const onReorder = () => navigate('/menu')

  const activeCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length

  return (
    <div className="flex flex-col h-full w-full bg-surface-container text-on-surface">

      {/* ── Sticky header ───────────────────────────────────── */}
      <div className="flex-shrink-0 bg-surface px-4 pt-4 pb-0 border-b border-surface-container z-10">
        <div className="flex items-center gap-3 mb-3">
          <motion.button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container"
            whileTap={{ scale: 0.88 }}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
          </motion.button>
          <div className="flex-1">
            <h1 className="font-headline font-black text-xl text-on-surface leading-tight">My Orders</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {activeCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
              <p className="text-xs text-on-surface-variant font-medium">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
                {activeCount > 0 && ` · ${activeCount} active`}
              </p>
            </div>
          </div>
          {/* Refresh button */}
          <motion.button
            onClick={() => fetchOrders(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container"
            whileTap={{ scale: 0.88, rotate: 180 }}
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">refresh</span>
          </motion.button>
        </div>

        {/* ── Filter chips ──────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4">
          {FILTERS.map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-none px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                filter === f
                  ? 'bg-[#a83100] text-white border-[#a83100] shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border-surface-container-high'
              }`}
              whileTap={{ scale: 0.93 }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3"
           style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>

        {/* Loading skeletons */}
        {loading && [1, 2, 3].map(i => <SkeletonCard key={i} />)}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 text-5xl">🛍️</div>
            <h3 className="font-headline font-bold text-on-surface text-lg mb-1">
              {filter === 'All' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-on-surface-variant text-sm mb-6">
              {filter === 'All'
                ? "Looks like you haven't ordered anything yet."
                : `You don't have any ${filter.toLowerCase()} orders.`}
            </p>
            {filter === 'All' && (
              <motion.button
                className="px-8 py-3 bg-[#a83100] text-white rounded-full font-bold text-sm shadow-md shadow-[#a83100]/25"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/menu')}
              >
                Explore Menu
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Order cards */}
        <AnimatePresence>
          {!loading && filtered.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} onReorder={onReorder} onRate={setRatingOrder} />
          ))}
        </AnimatePresence>

        <div className="h-4" />
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none flex justify-center"
          >
            <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <span className="material-symbols-outlined">check_circle</span>
              <p className="font-bold text-sm">Payment Successful! Order is being processed.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ratingOrder && <RateSheet order={ratingOrder} onClose={() => setRatingOrder(null)} />}
      </AnimatePresence>

    </div>
  )
}
