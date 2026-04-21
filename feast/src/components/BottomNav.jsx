import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

const navItems = [
  { label: 'Home',    icon: 'home',           path: '/home' },
  { label: 'Menu',    icon: 'restaurant',     path: '/menu' },
  { label: 'Cart',    icon: 'shopping_bag',   path: '/cart' },
  { label: 'Contact', icon: 'support_agent',  path: '/contact' },
  { label: 'Profile', icon: 'person',         path: '/profile' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { cartCount } = useCart()

  return (
    <div
      className="fixed inset-x-0 mx-auto w-[88%] max-w-[340px] z-50 rounded-full bg-white/30 supports-[backdrop-filter]:bg-white/10 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/20 flex justify-around items-center p-2"
      style={{ bottom: 'max(12px, calc(env(safe-area-inset-bottom) + 8px))' }}
    >
      {navItems.map(({ label, icon, path }) => {
        const isActive = pathname === path
        const isCart   = label === 'Cart'
        return (
          <motion.button
            key={label}
            onClick={() => navigate(path)}
            className={`relative flex flex-col items-center justify-center w-[60px] h-[52px] rounded-[20px] transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
            }`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
          >
            {isActive && (
              <motion.div
                layoutId="nav-bubble"
                className="absolute inset-0 rounded-[20px] bg-white/20 border border-white/20 shadow-sm"
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
