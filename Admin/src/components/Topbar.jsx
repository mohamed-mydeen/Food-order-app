import { useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

const pageTitles = {
  '/dashboard': { title: 'Dashboard',    subtitle: 'Overview of your business' },
  '/products':  { title: 'Products',     subtitle: 'Manage your food menu' },
  '/orders':    { title: 'Orders',       subtitle: 'Track and update customer orders' },
  '/billing':   { title: 'Billing',      subtitle: 'Payment and invoice records' },
  '/users':     { title: 'Users',        subtitle: 'Manage registered customers' },
  '/offers':    { title: 'Offers',       subtitle: 'Promotions and discounts' },
  '/analytics': { title: 'Analytics',    subtitle: 'Platform metrics and insights' },
  '/bugs':      { title: 'Bug Reports',  subtitle: 'Frontend error tracking' },
}

const roleBadge = {
  developer: { label: 'Developer', emoji: '🔴', classes: 'bg-red-50 border-red-200 text-red-700' },
  admin:     { label: 'Admin',     emoji: '🟠', classes: 'bg-orange-50 border-orange-200 text-orange-700' },
  delivery:  { label: 'Delivery',  emoji: '🚚', classes: 'bg-blue-50 border-blue-200 text-blue-700' },
}

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user } = useContext(AuthContext)
  const { title, subtitle } = pageTitles[pathname] || { title: 'Admin', subtitle: '' }
  const badge = roleBadge[user?.role] || roleBadge.admin

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h2 className="text-slate-800 font-bold text-lg leading-tight">{title}</h2>
          <p className="text-slate-400 text-xs hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Role badge */}
        <div className={`hidden sm:flex items-center gap-1.5 border rounded-full px-3 py-1.5 ${badge.classes}`}>
          <span className="text-xs">{badge.emoji}</span>
          <span className="text-xs font-semibold">{badge.label}</span>
        </div>
        {/* API live */}
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-green-700 text-xs font-medium">API Live</span>
        </div>
      </div>
    </header>
  )
}
