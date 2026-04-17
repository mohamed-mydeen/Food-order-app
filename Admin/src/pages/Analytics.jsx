import { useState, useEffect } from 'react'
import api from '../api/axios'

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

function MiniBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between mb-1.5 text-sm">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-800 font-bold">{value.toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function Analytics() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await api.get('/analytics')
      setData(res.data.data)
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Failed to load analytics.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load(false)
    const iv = setInterval(() => load(true), 30000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading analytics...</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">{error}</div>
  )

  const { pageViews = 0, totalUsers = 0, totalOrders = 0, totalProducts = 0, totalRevenue = 0, todayOrders = 0 } = data || {}
  const maxMetric = Math.max(pageViews, totalUsers, totalOrders, 1)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
              🔴 Developer Only
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Real-time platform metrics and insights</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          <span className="text-xs font-bold text-green-600">Live</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <StatCard
          icon="👁️"
          label="Total Page Views"
          value={pageViews.toLocaleString('en-IN')}
          sub="API hits since last deploy"
          gradient="bg-gradient-to-br from-red-500 to-rose-600"
        />
        <StatCard
          icon="👥"
          label="Total Registered Users"
          value={totalUsers.toLocaleString('en-IN')}
          sub="Customer accounts"
          gradient="bg-gradient-to-br from-purple-500 to-purple-700"
        />
        <StatCard
          icon="📦"
          label="Total Orders"
          value={totalOrders.toLocaleString('en-IN')}
          sub={`${todayOrders} orders today`}
          gradient="bg-gradient-to-br from-orange-400 to-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue + Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
          <h3 className="font-semibold text-slate-800">Platform Overview</h3>
          <MiniBar label="Page Views" value={pageViews} max={maxMetric} color="bg-red-400" />
          <MiniBar label="Registered Users" value={totalUsers} max={maxMetric} color="bg-purple-400" />
          <MiniBar label="Total Orders" value={totalOrders} max={maxMetric} color="bg-orange-400" />
          <MiniBar label="Products Listed" value={totalProducts} max={maxMetric} color="bg-emerald-400" />
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -left-4 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mb-4">💰</div>
            <p className="text-white/75 text-sm font-medium mb-1">Total Revenue (Delivered)</p>
            <p className="text-4xl font-bold tracking-tight">₹{parseFloat(totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-white/60 text-xs mt-2">Across all delivered orders</p>

            <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-xs mb-0.5">Products</p>
                <p className="text-xl font-bold">{totalProducts}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-0.5">Orders Today</p>
                <p className="text-xl font-bold">{todayOrders}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
