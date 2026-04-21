import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const navItems = [
  { label: 'Home',    icon: 'home',          path: '/home' },
  { label: 'Menu',    icon: 'restaurant',    path: '/menu' },
  { label: 'Cart',    icon: 'shopping_bag',  path: '/cart' },
  { label: 'Contact', icon: 'support_agent', path: '/contact' },
  { label: 'Profile', icon: 'person',        path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { cartCount } = useCart()

  return (
    <div
      className="fixed inset-x-0 mx-auto w-[88%] max-w-[340px] z-50 rounded-full overflow-hidden"
      style={{ bottom: 'max(12px, calc(env(safe-area-inset-bottom) + 8px))' }}
    >
      {/* Glass background — rendered once, no per-item layout animations */}
      <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.18)]" />

      <div className="relative flex justify-around items-center p-2">
        {navItems.map(({ label, icon, path }) => {
          const isActive = pathname === path
          const isCart   = label === 'Cart'
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`relative flex flex-col items-center justify-center w-[60px] h-[52px] rounded-[20px] transition-colors duration-150 ${
                isActive ? 'text-white' : 'text-white/55'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Active indicator — CSS transition only, no layoutId to prevent flicker */}
              <span
                className={`absolute inset-0 rounded-[20px] transition-opacity duration-200 bg-white/20 border border-white/20 shadow-sm ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span className={`material-symbols-outlined text-[22px] relative z-10 ${isActive ? 'icon-filled' : ''}`}>
                {icon}
              </span>
              <span className="font-headline text-[9px] font-semibold uppercase tracking-widest mt-0.5 relative z-10 leading-none">
                {label}
              </span>
              {/* Cart badge */}
              {isCart && cartCount > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-[#a83100] text-white text-[8px] flex items-center justify-center rounded-full font-bold leading-none z-20">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
