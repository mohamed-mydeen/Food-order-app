import { useState, useEffect, useContext, useCallback } from 'react'
import api from '../api/axios'
import { AuthContext } from '../context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const DELIVERY_FLOW = ['Out for Delivery', 'Delivered']

const ALL_STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const STATUS_CFG = {
  Pending:            { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Pending' },
  Preparing:          { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400',   label: 'Preparing' },
  'Out for Delivery': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400', label: 'Out for Delivery' },
  Delivered:          { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  dot: 'bg-green-400',  label: 'Delivered' },
  Cancelled:          { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-400',    label: 'Cancelled' },
}

const NEXT_STATUS = {
  Pending:            'Preparing',
  Preparing:          'Out for Delivery',
  'Out for Delivery': 'Delivered',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CFG[status] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${cfg.bg} ${cfg.border} ${cfg.text} ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  )
}

function LivePulse() {
  return (
    <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      <span className="text-xs font-bold text-green-700">Live</span>
    </div>
  )
}

// ─── Quick Action Button (mark next status inline from card) ──────────────────
function QuickActionBtn({ order, onUpdate }) {
  const [loading, setLoading] = useState(false)
  const next = NEXT_STATUS[order.status]

  if (!next || order.status === 'Delivered' || order.status === 'Cancelled') return null

  const handleClick = async (e) => {
    e.stopPropagation()
    setLoading(true)
    try {
      await api.put(`/orders/${order.id}`, { status: next })
      onUpdate(order.id, next)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const actionConfig = {
    'Preparing':          { label: 'Pick Up',    icon: '📦', color: 'bg-blue-500 hover:bg-blue-600' },
    'Out for Delivery':   { label: 'Picked Up',  icon: '🚚', color: 'bg-purple-500 hover:bg-purple-600' },
    'Pending':            { label: 'Start Prep', icon: '👨‍🍳', color: 'bg-amber-500 hover:bg-amber-600' },
  }
  const act = actionConfig[order.status]

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 ${act.color} text-white rounded-xl text-xs font-bold transition-all disabled:opacity-60 shadow-sm`}
    >
      {loading
        ? <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        : <span>{act.icon}</span>
      }
      {act.label}
    </button>
  )
}

// ─── Order Card (mobile-first delivery view) ──────────────────────────────────
function DeliveryOrderCard({ order, onSelect, onUpdate }) {
  const cfg = STATUS_CFG[order.status] || STATUS_CFG.Pending
  const items = order.items || []
  const isActive = ['Pending', 'Preparing', 'Out for Delivery'].includes(order.status)

  const handleCall = (e) => {
    e.stopPropagation()
    if (order.user?.phone) window.open(`tel:+91${order.user.phone.replace(/\D/g, '')}`)
  }

  const handleMap = (e) => {
    e.stopPropagation()
    if (order.address) window.open(`https://maps.google.com/?q=${encodeURIComponent(order.address)}`)
  }

  const handleWhatsApp = (e) => {
    e.stopPropagation()
    if (!order.user?.phone) return
    const txt = `Hi ${order.user.name || 'Customer'}! 🍽️\n\nYour Feast At Night order *#${order.id}* is *${order.status}*.\n\n*Items:*\n${items.map(it => `• ${it.quantity}x ${it.product?.name}`).join('\n')}\n\n*Total: ₹${parseFloat(order.total_amount).toFixed(0)}*\n*Payment: ${order.payment_method || 'COD'}*\n\nThank you! 🙏`
    window.open(`https://wa.me/91${order.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`, '_blank')
  }

  return (
    <div
      onClick={() => onSelect(order)}
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${isActive ? 'border-orange-200 hover:border-orange-300' : 'border-slate-100 hover:border-slate-200'}`}
    >
      {/* Card Header */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-2xl ${cfg.bg} border-b ${cfg.border}`}>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <span className="text-slate-500 text-xs font-medium">#{order.id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
          {/* Payment indicator */}
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${order.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {order.payment_method === 'UPI' ? '📱 UPI' : '💵 COD'}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Customer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">{order.user?.name || '—'}</p>
              <p className="text-slate-400 text-xs">{items.length} item{items.length !== 1 ? 's' : ''} · ₹{parseFloat(order.total_amount).toFixed(0)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {order.user?.phone && (
              <button
                onClick={handleCall}
                className="w-9 h-9 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors"
                title="Call customer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}
            {order.user?.phone && (
              <button
                onClick={handleWhatsApp}
                className="w-9 h-9 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 transition-colors"
                title="WhatsApp customer"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <button
            onClick={handleMap}
            className="w-full flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2.5 text-left hover:bg-orange-50 border border-slate-100 hover:border-orange-200 transition-all group"
          >
            <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-slate-600 group-hover:text-orange-700 flex-1 leading-relaxed">{order.address}</span>
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}

        {/* Items preview */}
        <div className="flex flex-wrap gap-1.5">
          {items.slice(0, 3).map((it, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
              {it.quantity}× {it.product?.name || 'Item'}
            </span>
          ))}
          {items.length > 3 && (
            <span className="bg-slate-100 text-slate-400 px-2.5 py-1 rounded-lg text-xs">+{items.length - 3} more</span>
          )}
        </div>

        {/* Quick status action */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-50">
          <span className="text-xs text-slate-400">Tap card for details</span>
          <QuickActionBtn order={order} onUpdate={onUpdate} />
        </div>
      </div>
    </div>
  )
}

// ─── Order Detail Drawer ──────────────────────────────────────────────────────
function OrderDetailDrawer({ order, onClose, onStatusChange }) {
  const [status, setStatus] = useState(order.status)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const items = order.items || []

  // Only delivery-relevant statuses
  const allowedStatuses = ALL_STATUSES

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put(`/orders/${order.id}`, { status })
      onStatusChange(order.id, status)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); onClose() }, 800)
    } catch { /* silent */ }
    finally { setSaving(false) }
  }

  const handleCall = () => {
    if (order.user?.phone) window.open(`tel:+91${order.user.phone.replace(/\D/g, '')}`)
  }

  const handleMap = () => {
    if (order.address) window.open(`https://maps.google.com/?q=${encodeURIComponent(order.address)}`)
  }

  const handleWhatsApp = () => {
    if (!order.user?.phone) return
    const txt = `Hi ${order.user.name || 'Customer'}! 🍽️\n\nYour Feast At Night order *#${order.id}* is *${status}*.\n\n*Items:*\n${items.map(it => `• ${it.quantity}x ${it.product?.name}`).join('\n')}\n\nTotal: *₹${parseFloat(order.total_amount).toFixed(0)}*\nPayment: *${order.payment_method || 'COD'}*\n\nThank you! 🙏`
    window.open(`https://wa.me/91${order.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`, '_blank')
  }

  const progressSteps = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered']
  const currentStep = progressSteps.indexOf(order.status)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Order #{order.id}</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Progress tracker */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Order Progress</p>
            <div className="flex items-center">
              {progressSteps.map((step, i) => {
                const done = i <= currentStep && order.status !== 'Cancelled'
                const active = i === currentStep && order.status !== 'Cancelled'
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex flex-col items-center ${i === progressSteps.length - 1 ? '' : 'flex-1'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-110' :
                        done ? 'bg-green-500 text-white' :
                        'bg-slate-200 text-slate-400'
                      }`}>
                        {done && !active ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-[9px] font-semibold mt-1.5 text-center leading-tight ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                        {step === 'Out for Delivery' ? 'On Way' : step}
                      </span>
                    </div>
                    {i < progressSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${i < currentStep && order.status !== 'Cancelled' ? 'bg-green-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
            {order.status === 'Cancelled' && (
              <div className="mt-3 text-center text-red-500 text-xs font-semibold">❌ This order was cancelled</div>
            )}
          </div>

          {/* Customer card with quick actions */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800">{order.user?.name || '—'}</p>
                <p className="text-slate-400 text-xs truncate">{order.user?.email || ''}</p>
                {order.user?.phone && <p className="text-slate-500 text-xs font-mono">{order.user.phone}</p>}
              </div>
            </div>

            {/* Quick contact actions */}
            <div className="flex gap-2">
              {order.user?.phone && (
                <button
                  onClick={handleCall}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call
                </button>
              )}
              {order.user?.phone && (
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  WhatsApp
                </button>
              )}
              {order.address && (
                <button
                  onClick={handleMap}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Navigate
                </button>
              )}
            </div>

            {/* Address */}
            {order.address && (
              <div className="flex items-start gap-2 text-xs text-slate-500 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {order.address}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Items to Deliver</p>
            <div className="space-y-2.5">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {it.product?.image
                      ? <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{it.product?.name || 'Item'}</p>
                    <p className="text-slate-400 text-xs">Qty: {it.quantity} × ₹{parseFloat(it.price).toFixed(0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">₹{(it.quantity * parseFloat(it.price)).toFixed(0)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between mt-3 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
              <div>
                <span className="font-bold text-slate-700">Total</span>
                <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${order.payment_method === 'UPI' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {order.payment_method === 'UPI' ? '📱 Paid via UPI' : '💵 Collect Cash'}
                </span>
              </div>
              <span className="font-bold text-orange-600 text-xl">₹{parseFloat(order.total_amount).toFixed(0)}</span>
            </div>

            {/* COD collection reminder */}
            {(!order.payment_method || order.payment_method === 'COD') && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-amber-700 font-bold text-sm">Collect ₹{parseFloat(order.total_amount).toFixed(0)} in cash</p>
                  <p className="text-amber-600 text-xs">This is a Cash on Delivery order</p>
                </div>
              </div>
            )}
          </div>

          {/* Status update */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {allowedStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    status === s
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={saving || status === order.status}
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {success ? (
              <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>Status Updated!</>
            ) : saving ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Updating...</>
            ) : (
              `Mark as "${status}"`
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Delivery Orders Page ────────────────────────────────────────────────
export default function DeliveryOrders() {
  const { user } = useContext(AuthContext)
  const isDelivery = user?.role === 'delivery'

  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filterStatus, setFilter]   = useState(isDelivery ? 'Active' : 'All')
  const [search, setSearch]         = useState('')
  const [selectedOrder, setSelected]= useState(null)
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const LIMIT = 20

  const FILTER_TABS = isDelivery
    ? ['Active', 'Out for Delivery', 'Delivered', 'All']
    : ['All', ...ALL_STATUSES]

  const fetchOrders = useCallback(async (pg = 1, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = { page: pg, limit: LIMIT }
      // "Active" = pending + preparing + out for delivery
      if (filterStatus === 'Active') {
        params.status = 'Pending,Preparing,Out for Delivery'
      } else if (filterStatus !== 'All') {
        params.status = filterStatus
      }
      const res = await api.get('/orders', { params })
      setOrders(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
      setLastRefreshed(new Date())
      setError('')
    } catch {
      if (!silent) setError('Failed to load orders.')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchOrders(1, false); setPage(1) }, [filterStatus])

  // Auto-poll every 15s
  useEffect(() => {
    const iv = setInterval(() => fetchOrders(page, true), 15000)
    return () => clearInterval(iv)
  }, [filterStatus, page, fetchOrders])

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
    if (selectedOrder?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const filtered = search
    ? orders.filter(o =>
        o.id.toString().includes(search) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.phone?.includes(search)
      )
    : orders

  const totalPages = Math.ceil(total / LIMIT)

  // Summary counts
  const activeCount   = orders.filter(o => ['Pending','Preparing','Out for Delivery'].includes(o.status)).length
  const deliveredToday = orders.filter(o => o.status === 'Delivered' && new Date(o.created_at).toDateString() === new Date().toDateString()).length

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isDelivery ? '🚚 Delivery Orders' : 'Orders'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {isDelivery ? 'Your active deliveries' : 'All customer orders'}
          </p>
        </div>
        <LivePulse />
      </div>

      {/* Delivery-specific summary cards */}
      {isDelivery && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active',       value: activeCount,    color: 'from-orange-400 to-orange-600' },
            { label: 'Delivered Today', value: deliveredToday, color: 'from-green-400 to-green-600' },
            { label: 'Total Loaded', value: orders.length,  color: 'from-blue-400 to-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-lg`}>
              <p className="text-white/75 text-[10px] font-semibold uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by order ID, customer name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all bg-white shadow-sm"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              filterStatus === tab
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
            }`}
          >
            {tab}
            {tab === 'Active' && activeCount > 0 && (
              <span className="ml-1.5 bg-white/30 text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">{activeCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Last refreshed */}
      {lastRefreshed && (
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refreshed {lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })} · Auto-updates every 15s
        </p>
      )}

      {/* Error */}
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 py-20 text-center">
          <div className="text-5xl mb-3">📋</div>
          <p className="font-semibold text-slate-600">
            {filterStatus === 'Active' ? 'No active deliveries 🎉' : 'No orders found'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {filterStatus === 'Active' ? 'All caught up! New orders will appear here.' : 'Try a different filter'}
          </p>
        </div>
      )}

      {/* Order cards */}
      {!loading && (
        <div className="space-y-4">
          {filtered.map(order => (
            <DeliveryOrderCard
              key={order.id}
              order={order}
              onSelect={setSelected}
              onUpdate={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setPage(p => p - 1); fetchOrders(page - 1) }}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >← Prev</button>
          <span className="text-sm text-slate-500 px-2">Page {page} / {totalPages}</span>
          <button
            onClick={() => { setPage(p => p + 1); fetchOrders(page + 1) }}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >Next →</button>
        </div>
      )}

      {/* Order detail drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
