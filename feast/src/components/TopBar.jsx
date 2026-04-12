import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const navLinks = [
  { icon: 'home',           label: 'Home',    path: '/home' },
  { icon: 'restaurant_menu',label: 'Menu',    path: '/menu' },
  { icon: 'shopping_cart',  label: 'Cart',    path: '/cart' },
  { icon: 'contact_page',   label: 'Contact', path: '/contact' },
  { icon: 'person',         label: 'Profile', path: '/profile' },
]

function SideDrawer({ open, onClose }) {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const { user, isLoggedIn, logout } = useAuth()
  const { cartCount } = useCart()

  const go = (path) => { onClose(); setTimeout(() => navigate(path), 180) }
  const handleLogout = () => { onClose(); logout(); setTimeout(() => navigate('/login'), 200) }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="absolute top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-[#a83100] via-[#c23a00] to-[#ff784c] px-6 pt-10 pb-8 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
              />
              <div className="relative z-10">
                {isLoggedIn ? (
                  <>
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3 shadow-lg">
                      <span className="font-headline font-black text-white text-2xl">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <p className="text-white font-headline font-black text-lg leading-tight">{user?.name}</p>
                    <p className="text-white/70 text-xs mt-0.5">{user?.email}</p>
                    {user?.phone && <p className="text-white/60 text-xs">{user.phone}</p>}
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-white text-3xl">person</span>
                    </div>
                    <p className="text-white font-headline font-black text-lg">Welcome!</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => go('/login')}
                        className="px-4 py-1.5 bg-white text-primary rounded-full text-xs font-bold">
                        Sign In
                      </button>
                      <button onClick={() => go('/signup')}
                        className="px-4 py-1.5 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
                        Sign Up
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Close button */}
              <button onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-3">
              {navLinks.map(({ icon, label, path }, i) => {
                const isActive = pathname === path
                const isCart   = label === 'Cart'
                return (
                  <motion.button
                    key={label}
                    onClick={() => go(path)}
                    className={`w-full flex items-center gap-4 px-6 py-3.5 text-left transition-colors ${
                      isActive ? 'bg-primary/8 text-primary' : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-primary/10' : 'bg-surface-container'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-filled text-primary' : 'text-on-surface-variant'}`}>
                        {icon}
                      </span>
                    </div>
                    <span className={`font-headline font-bold text-sm flex-1 ${isActive ? 'text-primary' : ''}`}>{label}</span>
                    {isCart && cartCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </motion.button>
                )
              })}

              {/* Divider */}
              <div className="mx-6 my-3 h-px bg-surface-container" />

              {/* Extra links */}
              {[
                { icon: 'help_outline', label: 'Help & Support', path: '/contact' },
              ].map(({ icon, label, path }) => (
                <button key={label} onClick={() => go(path)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-left text-on-surface hover:bg-surface-container-low transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
                  </div>
                  <span className="font-headline font-bold text-sm">{label}</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-surface-container px-4 py-4 space-y-2">
              {isLoggedIn ? (
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Log Out
                </button>
              ) : null}
              <p className="text-center text-[10px] text-outline">© 2026 Feast At Night</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function TopBar({ showSubtitle = true }) {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isLoggedIn, user } = useAuth()

  return (
    <>
      <div className="flex-shrink-0 z-30 bg-white/90 backdrop-blur-xl shadow-sm border-b border-surface-container">
        <div className="flex justify-between items-center px-5 py-3.5 w-full">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              whileTap={{ scale: 0.88 }}
            >
              <span className="material-symbols-outlined text-[22px] text-orange-800">menu</span>
            </motion.button>
            <span
              className="font-headline font-black text-orange-900 tracking-tighter text-lg cursor-pointer"
              onClick={() => navigate('/home')}
            >
              Feast At Night
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showSubtitle && (
              <div className="text-orange-800 font-headline font-bold tracking-tight text-[10px] opacity-60 hidden xs:block">
                In the name of Allah
              </div>
            )}
            <motion.button
              onClick={() => navigate(isLoggedIn ? '/profile' : '/login')}
              className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
            >
              {isLoggedIn && user?.name ? (
                <span className="font-headline font-black text-primary text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <span className="material-symbols-outlined text-primary text-[18px]">person</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Side Drawer — rendered inside the nearest relative (app-shell) */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
