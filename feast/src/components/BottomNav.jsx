import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const navItems = [
  { label: 'Home',    icon: 'home',             path: '/home' },
  { label: 'Menu',    icon: 'restaurant_menu',  path: '/menu' },
  { label: 'Cart',    icon: 'shopping_cart',    path: '/cart' },
  { label: 'Contact', icon: 'contact_page',     path: '/contact' },
  { label: 'Profile', icon: 'person',           path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { cartCount } = useCart()

  return (
    <div className="flex-shrink-0 z-50 rounded-t-[28px] bg-white/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(0,0,0,0.08)] border-t border-neutral-100 flex justify-around items-center px-1 pb-4 pt-2">
      {navItems.map(({ label, icon, path }) => {
        const isActive = pathname === path
        const isCart   = label === 'Cart'
        return (
          <motion.button
            key={label}
            onClick={() => navigate(path)}
            className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-colors duration-200 ${
              isActive ? 'bg-orange-100 text-orange-900' : 'text-neutral-400'
            }`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bubble"
                className="absolute inset-0 rounded-2xl bg-orange-100"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className={`material-symbols-outlined text-[22px] relative z-10 ${isActive ? 'icon-filled' : ''}`}>
              {icon}
            </span>
            <span className="font-headline text-[9px] font-semibold uppercase tracking-widest mt-0.5 relative z-10">
              {label}
            </span>
            {/* Live cart count badge */}
            {isCart && cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-0.5 right-1 w-4 h-4 bg-[#a83100] text-white text-[8px] flex items-center justify-center rounded-full font-bold leading-none z-20"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
