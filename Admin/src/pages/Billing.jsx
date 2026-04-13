import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

/* ── Status colours ─────────────────────────────────────────── */
const STATUS_CFG = {
  Pending:            { pill: 'bg-amber-50 text-amber-700 border-amber-200'  },
  Preparing:          { pill: 'bg-blue-50 text-blue-700 border-blue-200'     },
  'Out for Delivery': { pill: 'bg-purple-50 text-purple-700 border-purple-200'},
  Delivered:          { pill: 'bg-green-50 text-green-700 border-green-200'  },
  Cancelled:          { pill: 'bg-red-50 text-red-700 border-red-200'        },
}

/* ── Printable Bill component (rendered inside the modal) ──── */
function Bill({ order }) {
  const items     = order.items || []
  const subtotal  = items.reduce((s, it) => s + it.quantity * parseFloat(it.price), 0)
  const gst       = subtotal * 0.05           // 5 % GST
  const total     = parseFloat(order.total_amount)
  const date      = new Date(order.created_at)

  return (
    <div id="bill-printable" className="font-mono text-sm text-slate-800 select-text">
      {/* Restaurant header */}
      <div className="text-center mb-4 pb-4 border-b-2 border-dashed border-slate-300">
        <div className="text-2xl mb-1">🍽️</div>
        <h2 className="font-bold text-lg tracking-wide">MPM HUB</h2>
        <p className="text-xs text-slate-500">Delicious food, delivered fast</p>
        <p className="text-xs text-slate-400 mt-0.5">GSTIN: 29XXXXXX1234Z5</p>
      </div>

      {/* Bill meta */}
      <div className="flex justify-between text-xs mb-3">
        <div>
          <p><span className="text-slate-500">Bill No:</span> <strong>INV-{String(order.id).padStart(5, '0')}</strong></p>
          <p><span className="text-slate-500">Date:</span> {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          <p><span className="text-slate-500">Time:</span> {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        </div>
        <div className="text-right">
          <p><span className="text-slate-500">Status:</span> <strong>{order.status}</strong></p>
          <p><span className="text-slate-500">Payment:</span> <strong>{order.payment_method || 'COD'}</strong></p>
          <p><span className="text-slate-500">Paid:</span> <strong>{order.payment_status || 'Pending'}</strong></p>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-slate-50 rounded-lg px-3 py-2 mb-4 text-xs border border-slate-100">
        <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px] mb-1">Customer</p>
        <p className="font-bold">{order.user?.name || '—'}</p>
        <p className="text-slate-400">{order.user?.email || ''}</p>
        {order.user?.phone && <p className="text-slate-400">{order.user.phone}</p>}
        {order.address && <p className="text-slate-400 mt-0.5">📍 {order.address}</p>}
      </div>

      {/* Items table */}
      <table className="w-full text-xs mb-2">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-1 text-slate-500 font-semibold">Item</th>
            <th className="text-center py-1 text-slate-500 font-semibold">Qty</th>
            <th className="text-right py-1 text-slate-500 font-semibold">Rate</th>
            <th className="text-right py-1 text-slate-500 font-semibold">Amt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-b border-dashed border-slate-100">
              <td className="py-1.5 pr-2 font-medium">{it.product?.name || 'Item'}</td>
              <td className="py-1.5 text-center">{it.quantity}</td>
              <td className="py-1.5 text-right">₹{parseFloat(it.price).toFixed(2)}</td>
              <td className="py-1.5 text-right font-semibold">₹{(it.quantity * parseFloat(it.price)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t border-slate-200 pt-2 space-y-1 text-xs">
        <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">GST (5%)</span><span>₹{gst.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-sm border-t border-slate-300 pt-2 mt-1">
          <span>TOTAL</span>
          <span className="text-orange-600">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment info */}
      {order.payment_method === 'UPI' && (
        <div className="mt-3 border border-dashed border-slate-200 rounded p-2 text-xs">
          <p className="font-semibold text-slate-600 mb-0.5">Payment Details</p>
          <p><span className="text-slate-500">Method:</span> UPI</p>
          <p><span className="text-slate-500">Status:</span> {order.payment_status || 'Paid'}</p>
          {order.payment_reference && <p><span className="text-slate-500">UTR/Ref:</span> <span className="font-mono">{order.payment_reference}</span></p>}
        </div>
      )}
      {order.payment_method === 'COD' || !order.payment_method ? (
        <div className="mt-3 border border-dashed border-slate-200 rounded p-2 text-xs">
          <p><span className="text-slate-500">Payment:</span> <strong>Cash on Delivery</strong></p>
        </div>
      ) : null}

      {/* Footer */}
      <div className="text-center mt-5 pt-4 border-t-2 border-dashed border-slate-300 text-xs text-slate-400">
        <p className="font-medium text-slate-500">Thank you for your order! 🙏</p>
        <p className="mt-0.5">Visit us again at <strong>mpmhub.com</strong></p>
        <p className="mt-0.5 text-[10px]">This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  )
}

/* ── Bill Modal with Print ───────────────────────────────────── */
function BillModal({ order, onClose }) {
  const handlePrint = () => {
    const printContent = document.getElementById('bill-printable').innerHTML
    const win = window.open('', '_blank', 'width=480,height=700')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice INV-${String(order.id).padStart(5, '0')} – mpm hub</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Courier New', monospace; font-size: 13px; padding: 24px; color: #1e293b; background: #fff; }
            h2 { font-size: 18px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 2px; }
            .text-center { text-align: center; }
            .text-right  { text-align: right; }
            @media print {
              @page { size: A5; margin: 10mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Bill Preview</h3>
            <p className="text-slate-400 text-xs mt-0.5">INV-{String(order.id).padStart(5, '0')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-orange-500/25"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Bill body */}
        <div className="overflow-y-auto flex-1 p-6 bg-slate-50">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <Bill order={order} />
          </div>
        </div>

      </div>
    </div>
  )
}

/* ── Main Billing Page ───────────────────────────────────────── */
export default function Billing() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('All')
  const [selected, setSelected] = useState(null)
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const LIMIT = 20

  const STATUSES = ['All', 'Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']

  const fetchOrders = async (pg = 1, silent = false) => {
    if (!silent) setLoading(true)
    try {
      const params = { page: pg, limit: LIMIT }
      if (filter !== 'All') params.status = filter
      const res = await api.get('/orders', { params })
      setOrders(res.data.data || [])
      setTotal(res.data.pagination?.total || 0)
    } catch {
      setOrders([])
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(1, false)
    setPage(1)
  }, [filter])

  // ── Auto-poll every 15 seconds ──
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(page, true), 15000)
    return () => clearInterval(interval)
  }, [filter, page])

  const filtered = search
    ? orders.filter(o =>
        String(o.id).includes(search) ||
        o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing Generator</h1>
          <p className="text-slate-400 text-sm mt-0.5">Generate and print invoices for any order</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-700 text-xs font-medium px-3 py-2 rounded-xl">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click any order to preview &amp; print its invoice
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID or customer name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all bg-white"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                filter === s
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-slate-500">
        {total} order{total !== 1 ? 's' : ''} · {totalPages > 1 && `Page ${page} / ${totalPages}`}
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🧾</div>
            <p className="text-slate-400 font-medium">No orders found</p>
            <p className="text-slate-300 text-sm mt-1">Try a different search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 font-semibold">Invoice</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden md:table-cell">Items</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Amount</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Payment</th>
                  <th className="text-left px-5 py-3.5 font-semibold hidden lg:table-cell">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold">Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => {
                  const cfg = STATUS_CFG[order.status] || { pill: 'bg-slate-100 text-slate-600 border-slate-200' }
                  const itemNames = (order.items || []).map(it => it.product?.name).filter(Boolean)
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-orange-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(order)}
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded-lg">
                          INV-{String(order.id).padStart(5, '0')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{order.user?.name || '—'}</p>
                        <p className="text-slate-400 text-xs hidden sm:block">{order.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-slate-600 text-xs line-clamp-1 max-w-[180px]">
                          {itemNames.length > 0 ? itemNames.slice(0, 3).join(', ') + (itemNames.length > 3 ? ` +${itemNames.length - 3}` : '') : '—'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${cfg.pill}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-xs font-bold ${ order.payment_method === 'UPI' ? 'text-purple-600' : 'text-blue-600' }`}>
                            {order.payment_method === 'UPI' ? '📱 UPI' : '💵 COD'}
                          </span>
                          {order.payment_method === 'UPI' && order.payment_reference && (
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[80px]" title={order.payment_reference}>
                              {order.payment_reference}
                            </span>
                          )}
                          <span className={`text-[9px] font-bold uppercase ${ order.payment_status === 'Paid' ? 'text-green-600' : 'text-amber-600' }`}>
                            {order.payment_status || 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs hidden lg:table-cell">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={e => { e.stopPropagation(); setSelected(order) }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 border border-orange-200 hover:border-orange-500 rounded-lg text-xs font-medium transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          Print
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { const p = page - 1; setPage(p); fetchOrders(p) }}
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
            onClick={() => { const p = page + 1; setPage(p); fetchOrders(p) }}
            disabled={page === totalPages}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Bill Preview Modal */}
      {selected && <BillModal order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
