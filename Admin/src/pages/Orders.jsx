import { useState, useEffect } from 'react'
import api from '../api/axios'

const STATUSES = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

const statusConfig = {
  Pending:            { color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  Preparing:          { color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  'Out for Delivery': { color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400' },
  Delivered:          { color: 'bg-green-50 text-green-700 border-green-200',    dot: 'bg-green-400' },
  Cancelled:          { color: 'bg-red-50 text-red-700 border-red-200',          dot: 'bg-red-400' },
}

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  )
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const [status, setStatus]   = useState(order.status)
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await api.put(`/orders/${order.id}`, { status })
      onStatusChange(order.id, status)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 800)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const items = order.items || []
  const total = parseFloat(order.total_amount).toFixed(2)

  const handleWhatsApp = () => {
    if (!order.user?.phone) return
    const txt = `*FEAST AT NIGHT - Order Receipt*\n\nOrder ID: *#${order.id}*\nStatus: *${order.status}*\nPayment: *${order.payment_method || 'COD'}*\n\n*Items:*\n${items.map(it => `- ${it.quantity}x ${it.product?.name} (₹${parseFloat(it.price).toFixed(0)})`).join('\n')}\n\n*Total Amount: ₹${total}*\n\nThank you for ordering!`
    window.open(`https://wa.me/91${order.user.phone.replace(/\D/g, '')}?text=${encodeURIComponent(txt)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-backdrop">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Order #{order.id}</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Customer Info */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</h4>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 font-bold text-sm">
                  {order.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-sm">{order.user?.name || '—'}</p>
                <p className="text-slate-400 text-xs">{order.user?.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-500 mt-1">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {order.address}
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Order Items</h4>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl">
                  <div className="w-10 h-10 rounded-lg overflow-hidden img-placeholder flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{item.product?.name || 'Unknown'}</p>
                    <p className="text-slate-400 text-xs">Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(0)}</p>
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">
                    ₹{(item.quantity * parseFloat(item.price)).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-3">
            <span className="font-semibold text-slate-700">Total Amount</span>
            <span className="font-bold text-orange-600 text-lg">₹{total}</span>
          </div>

          {/* Update Status */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
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
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          {order.user?.phone && (
            <button
              onClick={handleWhatsApp}
              className="flex-1 py-2.5 bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp Bill
            </button>
          )}
          <button
            onClick={handleUpdate}
            disabled={saving || status === order.status}
            className="flex-[2] py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            {success ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Updated!</>
            ) : saving ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Updating...</>
            ) : (
              'Update Status'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [filterStatus, setFilter]   = useState('All')
  const [search, setSearch]         = useState('')
  const [selectedOrder, setSelected]= useState(null)
  const [page, setPage]             = useState(1)
  const [total, setTotal]           = useState(0)
  const LIMIT = 15

  const fetchOrders = async (pg = 1, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = { page: pg, limit: LIMIT }
      if (filterStatus !== 'All') params.status = filterStatus
      const res = await api.get('/orders', { params })
      setOrders(res.data.data)
      setTotal(res.data.pagination?.total || 0)
    } catch {
      if (!silent) setError('Failed to load orders.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1, false)
    setPage(1)
  }, [filterStatus])

  // ── Auto-poll every 15 seconds ──
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(page, true), 15000)
    return () => clearInterval(interval)
  }, [filterStatus, page])

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o))
  }

  const filtered = search
    ? orders.filter(o =>
        o.id.toString().includes(search) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{total} total orders</span>
        {totalPages > 1 && <span>Page {page} / {totalPages}</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-slate-400 font-medium">No orders found</p>
            <p className="text-slate-300 text-sm mt-1">
              {filterStatus !== 'All' ? `No ${filterStatus} orders` : 'Orders will appear here'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold">Order</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden md:table-cell">Items</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Total</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden lg:table-cell">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => (
                  <tr key={order.id} className="table-row-hover transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-800">#{order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{order.user?.name || '—'}</p>
                        <p className="text-slate-400 text-xs hidden sm:block">{order.user?.email || ''}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        {(order.items || []).slice(0, 3).map((item, i) => (
                          <div key={i} className="w-7 h-7 rounded-lg overflow-hidden img-placeholder border border-white shadow-sm">
                            {item.product?.image ? (
                              <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">🍽</div>
                            )}
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <span className="text-xs text-slate-400 ml-1">+{order.items.length - 3}</span>
                        )}
                        {!order.items?.length && <span className="text-slate-300 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">₹{parseFloat(order.total_amount).toFixed(0)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-lg text-xs font-medium transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setPage(p => p - 1); fetchOrders(page - 1) }}
            disabled={page === 1}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { setPage(p); fetchOrders(p) }}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                p === page ? 'bg-orange-500 text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => { setPage(p => p + 1); fetchOrders(page + 1) }}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
