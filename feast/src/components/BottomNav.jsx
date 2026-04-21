import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'

const navItems = [
  { label: 'Home',    icon: 'home',          path: '/home' },
  { label: 'Menu',    icon: 'restaurant',    path: '/menu' },
  { label: 'Cart',    icon: 'shopping_bag',  path: '/cart' },
  { label: 'Contact', icon: 'support_agent', path: '/contact' },
  { label: 'Profile', icon: 'person',        path: '/profile' },
]

const NO_NAV_ROUTES = ['/', '/login', '/signup']

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { cartCount } = useCart()

  // Hide BottomNav on splash, login, signup
  if (NO_NAV_ROUTES.includes(pathname)) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed inset-x-0 mx-auto w-[88%] max-w-[340px] z-50 rounded-full"
        style={{ bottom: 'max(12px, calc(env(safe-area-inset-bottom) + 8px))' }}
      >
        {/* Glass background */}
        <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.18)]" />

        <div className="relative flex justify-around items-center p-2">
          {navItems.map(({ label, icon, path }) => {
            const isActive = pathname === path
            const isCart   = label === 'Cart'
            return (
              <motion.button
                key={label}
                onClick={() => navigate(path)}
                className={`relative flex flex-col items-center justify-center w-[60px] h-[52px] rounded-[20px] transition-colors duration-150 ${
                  isActive ? 'text-white' : 'text-white/55'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                whileTap={{ scale: 0.9 }}
              >
                {/* 🚀 SMOOTH SLIDING PILL 🚀 */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-[20px] bg-white/20 border border-white/20 shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.span 
                  className={`material-symbols-outlined text-[22px] relative z-10 ${isActive ? 'icon-filled' : ''}`}
                  animate={{ 
                    y: isActive ? -2 : 0,
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                  {icon}
                </motion.span>
                <motion.span 
                  className="font-headline text-[9px] font-semibold uppercase tracking-widest mt-0.5 relative z-10 leading-none"
                  animate={{
                    opacity: isActive ? 1 : 0.8,
                    scale: isActive ? 1.05 : 1
                  }}
                >
                  {label}
                </motion.span>
                {/* Cart badge */}
                {isCart && cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={cartCount} 
                    className="absolute -top-0.5 right-1 w-4 h-4 bg-[#a83100] text-white text-[8px] flex items-center justify-center rounded-full font-bold leading-none z-20"
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
