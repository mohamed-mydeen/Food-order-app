import { useContext } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

// ─── Role meta for badge display ─────────────────────────────────────────────
const roleMeta = {
  developer: { label: 'Developer', emoji: '🔴', bg: 'bg-red-500/20 border-red-500/40 text-red-300' },
  admin:     { label: 'Admin',     emoji: '🟠', bg: 'bg-orange-500/20 border-orange-500/40 text-orange-300' },
  delivery:  { label: 'Delivery',  emoji: '🚚', bg: 'bg-blue-500/20 border-blue-500/40 text-blue-300' },
}

// ─── Nav item definitions with role access ───────────────────────────────────
const allNavItems = [
  {
    section: 'Main Menu',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        roles: ['admin', 'developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        to: '/products',
        label: 'Products',
        roles: ['admin', 'developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
      {
        to: '/orders',
        label: 'Orders',
        roles: ['admin', 'developer', 'delivery'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        to: '/billing',
        label: 'Billing',
        roles: ['admin', 'developer', 'delivery'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        ),
      },
      {
        to: '/users',
        label: 'Users',
        roles: ['admin', 'developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        to: '/offers',
        label: 'Offers',
        roles: ['admin', 'developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
    ],
  },
  {
    section: 'Developer Zone',
    requiredRole: 'developer',
    items: [
      {
        to: '/analytics',
        label: 'Analytics',
        roles: ['developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        to: '/bugs',
        label: 'Bug Reports',
        roles: ['developer'],
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ],
  },
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const userRole = user?.role || 'admin'
  const meta = roleMeta[userRole] || roleMeta.admin

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30
          bg-gradient-to-b from-slate-900 to-slate-800
          flex flex-col shadow-2xl
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
            <span className="text-xl">🍽️</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Feast At Night</h1>
            <p className="text-slate-400 text-xs">Control Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto sidebar-scroll">
          {allNavItems.map((group) => {
            // Filter items by role
            const visibleItems = group.items.filter(item => item.roles.includes(userRole))
            if (visibleItems.length === 0) return null

            return (
              <div key={group.section} className="mb-4">
                {/* Section label */}
                {group.requiredRole === 'developer' ? (
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest">🔴 {group.section}</span>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">{group.section}</p>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                        ${isActive
                          ? group.requiredRole === 'developer'
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                            : 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`
                      }
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="px-4 py-5 border-t border-white/10">
          {/* Role badge */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${meta.bg}`}>
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </div>

          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-orange-400 text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
              <p className="text-slate-400 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
