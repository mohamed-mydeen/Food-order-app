import { useState, useEffect } from 'react'
import api from '../api/axios'

const statusColors = {
  Pending:           'bg-amber-50 text-amber-700 border-amber-200',
  Preparing:         'bg-blue-50 text-blue-700 border-blue-200',
  'Out for Delivery':'bg-purple-50 text-purple-700 border-purple-200',
  Delivered:         'bg-green-50 text-green-700 border-green-200',
  Cancelled:         'bg-red-50 text-red-700 border-red-200',
}

function StatCard({ icon, label, value, sub, gradient }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg ${gradient}`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
      <div className="relative">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center text-xl mb-4 backdrop-blur-sm">
          {icon}
        </div>
        <p className="text-white/75 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const loadDashboard = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/dashboard')
      setData(res.data.data)
    } catch {
      if (!silent) setError('Failed to load dashboard data.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard(false)
    const interval = setInterval(() => loadDashboard(true), 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">{error}</div>
  )

  const { stats, recentOrders = [], ordersByStatus = [] } = data || {}

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Good day! 👋</h2>
          <p className="text-slate-500 text-sm mt-0.5">Here's what's happening with your restaurant today.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-green-600">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon="📦"
          label="Today's Orders"
          value={stats?.todayOrdersCount ?? 0}
          sub="Orders placed today"
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
        />
        <StatCard
          icon="💰"
          label="Today's Revenue"
          value={`₹${parseFloat(stats?.todayRevenue || 0).toFixed(2)}`}
          sub="Revenue earned today"
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
        <StatCard
          icon="🏆"
          label="Total Revenue"
          value={`₹${parseFloat(stats?.totalRevenue || 0).toFixed(2)}`}
          sub="All-time delivered orders"
          gradient="bg-gradient-to-br from-blue-400 to-blue-600"
        />
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats?.totalUsers ?? 0}
          sub={`${stats?.totalProducts ?? 0} products listed`}
          gradient="bg-gradient-to-br from-purple-400 to-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent Orders</h3>
            <span className="text-xs text-slate-400">{recentOrders.length} orders</span>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No orders yet</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-3 font-semibold">Order</th>
                    <th className="text-left px-6 py-3 font-semibold">Customer</th>
                    <th className="text-left px-6 py-3 font-semibold">Total</th>
                    <th className="text-left px-6 py-3 font-semibold">Status</th>
                    <th className="text-left px-6 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="table-row-hover transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">#{order.id}</td>
                      <td className="px-6 py-4 text-slate-600">{order.user?.name || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`badge border ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Orders by Status</h3>
          </div>
          <div className="p-6 space-y-4">
            {ordersByStatus.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-6">No data</p>
            ) : (
              ordersByStatus.map((s) => {
                const total = ordersByStatus.reduce((sum, x) => sum + parseInt(x.count), 0)
                const pct = total ? Math.round((parseInt(s.count) / total) * 100) : 0
                return (
                  <div key={s.status}>
                    <div className="flex justify-between mb-1.5">
                      <span className={`badge border text-xs ${statusColors[s.status] || 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
                      <span className="text-slate-700 text-sm font-semibold">{s.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
