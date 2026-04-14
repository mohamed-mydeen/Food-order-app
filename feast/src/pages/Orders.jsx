import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

const STATUS_CONFIG = {
  Pending:            { color: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-200', dot: 'bg-amber-500',  icon: 'schedule'         },
  Preparing:          { color: 'text-blue-700',   bg: 'bg-blue-50',    border: 'border-blue-200',  dot: 'bg-blue-500',   icon: 'local_fire_department' },
  'Out for Delivery': { color: 'text-purple-700', bg: 'bg-purple-50',  border: 'border-purple-200',dot: 'bg-purple-500', icon: 'delivery_dining'  },
  Delivered:          { color: 'text-green-700',  bg: 'bg-green-50',   border: 'border-green-200', dot: 'bg-green-500',  icon: 'check_circle'     },
  Cancelled:          { color: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-200',   dot: 'bg-red-500',    icon: 'cancel'           },
}

const FILTERS = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

function OrderCard({ order, index, onReorder }) {
  const { created_at, items = [], total_amount, status } = order
  const cfg = STATUS_CONFIG[status] || { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', icon: 'info' }

  const itemNames  = items.map(it => it.product?.name).filter(Boolean)
  const firstImage = items.find(it => it.product?.image)?.product?.image
  const date       = new Date(created_at)
  const dateStr    = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  const timeStr    = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  const totalItems = items.reduce((s, it) => s + (it.quantity || 1), 0)

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: 'easeOut' }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Top strip — status bar */}
      <div className={`px-4 py-2 flex items-center gap-2 ${cfg.bg} border-b ${cfg.border}`}>
        <span className={`material-symbols-outlined text-[15px] ${cfg.color}`}>{cfg.icon}</span>
        <span className={`text-xs font-black uppercase tracking-widest ${cfg.color}`}>{status}</span>
        <div className="flex-1" />
        <span className="text-[10px] text-gray-400 font-medium">{dateStr} · {timeStr}</span>
      </div>

      {/* Body */}
      <div className="flex gap-3 px-4 pt-4 pb-3">
        {/* Food thumbnail */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 border border-orange-100">
          {firstImage
            ? <img src={firstImage} alt="order" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
            {itemNames.length > 0 ? itemNames.join(', ') : 'Order items'}
          </p>
          <p className="text-xs text-gray-400 mt-1 font-medium">
            {totalItems} item{totalItems !== 1 ? 's' : ''} &nbsp;·&nbsp; Feast At Night
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-black text-[#a83100] text-base">₹{parseFloat(total_amount).toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-dashed border-gray-100" />

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          <span className="text-xs text-gray-500 font-medium">
            {status === 'Delivered' ? 'Order completed' :
             status === 'Cancelled' ? 'Order cancelled' :
             'Tracking your order'}
          </span>
        </div>
        <motion.button
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#a83100] text-white text-xs font-bold shadow-sm shadow-[#a83100]/20"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => onReorder(items)}
        >
          <span className="material-symbols-outlined text-[13px]">refresh</span>
          Reorder
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function Orders() {
  const navigate  = useNavigate()
  const { token, isLoggedIn } = useAuth()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('All')
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchOrders = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const res  = await fetch(`${API}/orders/user`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) { setOrders(data.data); setLastUpdated(new Date()) }
    } catch { /* silently fail */ }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchOrders(true)                          // initial load with spinner
    const interval = setInterval(() => fetchOrders(false), 15000)  // poll every 15s silently
    return () => clearInterval(interval)       // cleanup on unmount
  }, [token, isLoggedIn])

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter)

  const onReorder = () => navigate('/menu')

  return (
    <div className="flex flex-col h-full w-full bg-[#f5f5f5] text-on-surface">

      {/* Sticky Header — Zomato style */}
      <div className="flex-shrink-0 bg-white shadow-sm px-4 pt-4 pb-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            onClick={() => navigate('/profile')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100"
            whileTap={{ scale: 0.88 }}
          >
            <span className="material-symbols-outlined text-[20px] text-gray-600">arrow_back</span>
          </motion.button>
          <div className="flex-1">
            <h1 className="font-headline font-black text-xl text-gray-900 leading-tight">My Orders</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-gray-400 font-medium">
                {orders.length} order{orders.length !== 1 ? 's' : ''} · live
              </p>
            </div>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4">
          {FILTERS.map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-none px-4 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap ${
                filter === f
                  ? 'bg-[#a83100] text-white border-[#a83100] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200'
              }`}
              whileTap={{ scale: 0.92 }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 space-y-3">

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-8 bg-orange-50" />
                <div className="p-4 flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-gray-100" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <span className="text-5xl">🛍️</span>
            </div>
            <h3 className="font-headline font-bold text-gray-800 text-lg mb-1">
              {filter === 'All' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {filter === 'All'
                ? 'Looks like you haven\'t ordered anything yet.'
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

        <div className="h-2" />
      </div>

      <BottomNav />
    </div>
  )
}
