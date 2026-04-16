import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

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

/* ── Order Card ───────────────────────────────────────────────── */
function OrderCard({ order, index, onReorder }) {
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
    const total = parseFloat(total_amount).toFixed(2)
    const dateStrFull = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStrFull = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    const printContent = `
      <div style="font-family: 'Courier New', monospace; font-size: 13px; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px dashed #cbd5e1;">
          <h2 style="font-size: 18px;">FEAST AT NIGHT</h2>
          <p style="font-size: 11px; color: #64748b; margin-top:2px;">Delicious food, delivered fast</p>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 16px;">
          <div>
            <p>Bill No: <strong>INV-${String(order.id).padStart(5, '0')}</strong></p>
            <p>Date: ${dateStrFull}</p>
            <p>Time: ${timeStrFull}</p>
          </div>
          <div style="text-align: right;">
            <p>Status: <strong>${status}</strong></p>
            <p>Payment: <strong>${order.payment_method || 'COD'}</strong></p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
            <th style="padding: 4px 0;">Item</th>
            <th style="padding: 4px 0; text-align: center;">Qty</th>
            <th style="padding: 4px 0; text-align: right;">Amt</th>
          </tr>
          ${items.map(it => `
            <tr style="border-bottom: 1px dashed #f1f5f9;">
              <td style="padding: 6px 0;">${it.product?.name || 'Item'}</td>
              <td style="padding: 6px 0; text-align: center;">${it.quantity}</td>
              <td style="padding: 6px 0; text-align: right;">₹${(it.quantity * parseFloat(it.price||0)).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><span>Delivery Fee</span><span>₹45.00</span></div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: 4px;">
            <span>TOTAL</span><span>₹${total}</span>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px dashed #cbd5e1; font-size: 11px; color: #64748b;">
          <p>Thank you for your order! 🙏</p>
          <p style="margin-top: 4px; font-size: 9px;">This is a computer-generated invoice.</p>
        </div>
      </div>
    `
    const win = window.open('', '_blank', 'width=400,height=600')
    if (win) {
      win.document.write(`<html><head><title>Invoice INV-${String(order.id).padStart(5, '0')}</title></head><body style="padding:20px; margin:0;">${printContent}</body></html>`)
      win.document.close()
      win.focus()
      setTimeout(() => { win.print(); win.close() }, 400)
    }
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
        <span className="text-[10px] text-on-surface-variant font-medium">{dateStr} · {timeStr}</span>
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
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
          <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
            {status === 'Delivered' ? 'Order completed' :
             status === 'Cancelled' ? 'Order cancelled' :
             'Tracking order'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.93 }}
            onClick={handlePrint}
          >
            <span className="material-symbols-outlined text-[13px]">receipt_long</span>
            Bill
          </motion.button>
          <motion.button
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#a83100] text-white text-xs font-bold shadow-sm"
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
    if (!isLoggedIn) { navigate('/login'); return }
    fetchOrders(true)
    const interval = setInterval(() => fetchOrders(false), 15000)
    return () => clearInterval(interval)
  }, [token, isLoggedIn])

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
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3 pb-28">

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
            <OrderCard key={order.id} order={order} index={i} onReorder={onReorder} />
          ))}
        </AnimatePresence>

        <div className="h-4" />
      </div>

      <BottomNav />
    </div>
  )
}
