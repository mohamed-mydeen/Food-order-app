import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { usePWAInstall } from '../hooks/usePWAInstall'
import mandiSidebar from '../assets/mandi_profile.png'
import brandLogo from '../assets/brand_logo.png'

// Detect if already running as installed PWA
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

function InstallGuideModal({ open, onClose }) {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-1/2 z-[9999] w-full max-w-sm rounded-t-3xl overflow-hidden"
            style={{ x: '-50%' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="bg-white px-6 pt-5 pb-8">
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow"
                  style={{ background: 'linear-gradient(135deg,#c23a00,#ff784c)' }}>
                  <span className="material-symbols-outlined text-white text-[24px]">install_mobile</span>
                </div>
                <div>
                  <p className="font-headline font-black text-gray-900 text-base">Install Feast At Night</p>
                  <p className="text-gray-500 text-xs">Add to Home Screen in 3 easy steps</p>
                </div>
              </div>

              {/* Steps */}
              {isIOS ? (
                <div className="space-y-3">
                  {[
                    { icon: 'ios_share', step: '1', text: 'Tap the Share button at the bottom of Safari' },
                    { icon: 'add_box',   step: '2', text: 'Scroll down and tap "Add to Home Screen"' },
                    { icon: 'check_circle', step: '3', text: 'Tap "Add" in the top right corner' },
                  ].map(({ icon, step, text }) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-black">{step}</span>
                      </div>
                      <span className="text-gray-700 text-sm leading-snug">{text}</span>
                    </div>
                  ))}
                  <p className="text-center text-[11px] text-gray-400 mt-2">⚠️ Must use Safari on iPhone/iPad</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { icon: 'more_vert',    step: '1', text: 'Tap the ⋮ menu (top right) in Chrome' },
                    { icon: 'add_to_home_screen', step: '2', text: 'Tap "Add to Home Screen" or "Install app"' },
                    { icon: 'check_circle', step: '3', text: 'Tap "Add" to confirm — done!' },
                  ].map(({ icon, step, text }) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-black">{step}</span>
                      </div>
                      <span className="text-gray-700 text-sm leading-snug">{text}</span>
                    </div>
                  ))}
                  <p className="text-center text-[11px] text-gray-400 mt-2">⚠️ Must use Chrome browser on Android</p>
                </div>
              )}

              <button onClick={onClose}
                className="mt-5 w-full py-3 rounded-2xl font-headline font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#c23a00,#ff784c)' }}
              >
                Got it!
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

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
  const { canInstall, promptInstall } = usePWAInstall()
  const [guideOpen, setGuideOpen] = useState(false)
  const [installed, setInstalled] = useState(isStandalone)

  const go = (path) => { onClose(); setTimeout(() => navigate(path), 180) }
  const handleLogout = () => { onClose(); logout(); setTimeout(() => navigate('/login'), 200) }
  const handleInstallClick = () => {
    if (canInstall) {
      promptInstall()
    } else {
      setGuideOpen(true)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
            key="drawer-backdrop"
            className="absolute inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            onClick={onClose}
          />
      )}

      {/* Drawer */}
      {open && (
        <motion.div
            key="drawer-panel"
            className="absolute top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl flex flex-col"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header — Mandi image banner */}
            <div className="relative px-6 pt-10 pb-8 overflow-hidden"
              style={{ backgroundImage: `url(${mandiSidebar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/65" />
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
              {/* Nav Links — staggered entrance */}
              <motion.div
                variants={{ show: { transition: { staggerChildren: 0.055, delayChildren: 0.06 } } }}
                initial="hidden"
                animate="show"
              >
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
                    variants={{
                      hidden: { opacity: 0, x: -18 },
                      show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
                    }}
                    whileHover={{ x: 4, backgroundColor: isActive ? undefined : 'rgba(0,0,0,0.03)' }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary/10' : 'bg-surface-container'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-filled text-primary' : 'text-on-surface-variant'}`}>
                        {icon}
                      </span>
                    </div>
                    <span className={`font-headline font-bold text-sm flex-1 ${isActive ? 'text-primary' : ''}`}>{label}</span>
                    {isCart && cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </motion.span>
                    )}
                    {isActive && (
                      <motion.div layoutId="drawer-active" className="w-1.5 h-1.5 rounded-full bg-primary"
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }} />
                    )}
                  </motion.button>
                )
              })}
              </motion.div>

              {/* Divider */}
              <div className="mx-6 my-2 h-px bg-surface-container" />

              {/* Extra links */}
              {[
                { icon: 'settings',      label: 'Settings',      path: '/settings' },
                { icon: 'help_outline',  label: 'Help & Support', path: '/contact' },
              ].map(({ icon, label, path }) => (
                <motion.button key={label} onClick={() => go(path)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-left text-on-surface transition-colors"
                  whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{icon}</span>
                  </div>
                  <span className="font-headline font-bold text-sm">{label}</span>
                </motion.button>
              ))}

              {/* Install App button */}
              {!installed && (
                <motion.button onClick={handleInstallClick}
                  className="w-full flex items-center gap-4 px-6 py-3.5 text-left hover:bg-orange-50 transition-colors"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#c23a00,#ff784c)' }}>
                    <span className="material-symbols-outlined text-white text-[20px]">install_mobile</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-headline font-bold text-sm text-orange-700">Install App</span>
                    <p className="text-[10px] text-gray-400">Add to Home Screen</p>
                  </div>
                  <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                    {canInstall ? 'Ready' : 'How?'}
                  </span>
                </motion.button>
              )}
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
      )}

      {/* Install guide modal */}
      <InstallGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </AnimatePresence>
  )
}

export default function TopBar({ showSubtitle = true }) {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isLoggedIn, user } = useAuth()
  const { canInstall, promptInstall } = usePWAInstall()

  return (
    <>
      <div className="flex-shrink-0 z-30 bg-white/90 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center px-5 py-3.5 w-full">
          <div className="flex items-center gap-2.5">
            <motion.button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
              whileTap={{ scale: 0.88 }}
            >
              <span className="material-symbols-outlined text-[22px] text-orange-800">menu</span>
            </motion.button>
            {/* Brand logo image */}
            <img
              src={brandLogo}
              alt="Feast At Night"
              onClick={() => navigate('/home')}
              className="h-9 w-9 rounded-full object-cover cursor-pointer border-2 border-primary/20 shadow-sm"
            />
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

            {/* PWA Install button — only shown when installable */}
            <AnimatePresence>
              {canInstall && (
                <motion.button
                  key="install-btn"
                  onClick={promptInstall}
                  title="Install App"
                  className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.12 }}
                >
                  <span className="material-symbols-outlined text-orange-700 text-[18px]">download_for_offline</span>
                </motion.button>
              )}
            </AnimatePresence>

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
