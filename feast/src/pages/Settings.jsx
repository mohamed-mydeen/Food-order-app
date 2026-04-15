import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { useAuth } from '../context/AuthContext'
import mandiBanner from '../assets/mandi_settings.png'

const WHATSAPP_NUMBER = '919876543210' // ← replace with your number
const SUPPORT_PHONE   = '+91 98765 43210' // ← replace with your number
const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`

// ── Theme helpers ─────────────────────────────────────────────────────────────
const THEMES = ['Light', 'System', 'Dark']
const THEME_ICONS = { Light: 'light_mode', System: 'settings_brightness', Dark: 'dark_mode' }

function getTheme() { return localStorage.getItem('fan_theme') || 'Dark' }

function applyTheme(t) {
  // Apply to the app-shell div (max-width container) so it scopes correctly
  const shell = document.querySelector('.app-shell') || document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (t === 'Dark' || (t === 'System' && prefersDark)) {
    shell.classList.add('dark')
  } else {
    shell.classList.remove('dark')
  }
  localStorage.setItem('fan_theme', t)
}

// ── Reusable row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, sub, onClick, right, danger = false, custom = false, children }) {
  return (
    <motion.div
      onClick={!custom ? onClick : undefined}
      className={`flex items-center gap-4 px-4 py-3.5 cursor-pointer rounded-xl transition-colors
        ${danger ? 'hover:bg-red-50 active:bg-red-100' : 'hover:bg-surface-container active:bg-surface-container-high'}`}
      whileHover={{ x: danger ? 0 : 3 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${danger ? 'bg-red-50' : 'bg-surface-container'}`}>
        <span className={`material-symbols-outlined text-[20px] ${danger ? 'text-red-500' : 'text-primary'}`}>
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-headline font-bold text-sm ${danger ? 'text-red-500' : 'text-on-surface'}`}>{label}</p>
        {sub && <p className="text-on-surface-variant text-xs mt-0.5 truncate">{sub}</p>}
        {children}
      </div>
      {right ?? (
        !danger && <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
      )}
    </motion.div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="mx-4 mb-3">
      <p className="text-xs font-black uppercase tracking-widest text-secondary mb-1.5 px-1">{title}</p>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-surface-container">
        {children}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Settings() {
  const navigate = useNavigate()
  const { user, token, logout, updateUser, isLoggedIn } = useAuth()

  const [theme, setTheme]           = useState(getTheme)
  const [orders, setOrders]         = useState([])
  const [ordersLoading, setOLoad]   = useState(true)
  const [addressOpen, setAddrOpen]  = useState(false)
  const [address, setAddress]       = useState(user?.address || '')
  const [savingAddr, setSavingAddr] = useState(false)
  const [addrMsg, setAddrMsg]       = useState('')

  // Apply saved theme on mount
  useEffect(() => { applyTheme(getTheme()) }, [])

  // Redirect if not logged in
  useEffect(() => { if (!isLoggedIn) navigate('/login') }, [isLoggedIn])

  // Fetch orders for history count
  useEffect(() => {
    if (!token) return
    fetch(`${API}/orders/user`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data) })
      .catch(() => {})
      .finally(() => setOLoad(false))
  }, [token])

  const handleTheme = (t) => { setTheme(t); applyTheme(t) }

  const handleSaveAddress = async () => {
    setSavingAddr(true); setAddrMsg('')
    try {
      const res  = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      updateUser({ address })
      setAddrMsg('Address saved!')
      setTimeout(() => setAddrOpen(false), 900)
    } catch (err) { setAddrMsg(err.message || 'Failed') }
    finally { setSavingAddr(false) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="relative flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-16">

        {/* ── Hero banner ─────────────────────────────────────────── */}
        <div className="relative px-6 pt-8 pb-14 overflow-hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${mandiBanner})` }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />
          <motion.div className="flex items-center gap-4 relative z-10"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-xl">
              <span className="font-headline font-black text-white text-2xl">{initial}</span>
            </div>
            <div>
              <h1 className="font-headline font-black text-white text-xl tracking-tight">{user?.name || 'Guest'}</h1>
              <p className="text-white/70 text-xs mt-0.5">{user?.phone || user?.email || ''}</p>
            </div>
          </motion.div>
        </div>

        <div className="pt-4 pb-28 space-y-1">

          {/* ── Account ──────────────────────────────────────────── */}
          <Section title="Account">
            <SettingRow icon="person" label="Profile" sub={user?.email || 'View & edit profile'} onClick={() => navigate('/profile')} />
            <SettingRow icon="location_on" label="Delivery Address"
              sub={user?.address || 'Add your delivery address'} onClick={() => { setAddress(user?.address || ''); setAddrOpen(true) }} />
          </Section>

          {/* ── Orders ───────────────────────────────────────────── */}
          <Section title="Orders">
            <SettingRow icon="shopping_bag" label="Order History"
              sub={ordersLoading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
              onClick={() => navigate('/orders')}
              right={
                <div className="flex items-center gap-2">
                  {!ordersLoading && orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length > 0 && (
                    <span className="bg-[#a83100] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length} active
                    </span>
                  )}
                  <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                </div>
              }
            />
          </Section>

          {/* ── Appearance ───────────────────────────────────────── */}
          <Section title="Appearance">
            <SettingRow icon="palette" label="Theme" sub={`Currently: ${theme}`} custom>
              <div className="flex gap-2 mt-2">
                {THEMES.map(t => (
                  <button key={t} onClick={() => handleTheme(t)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1
                      ${theme === t
                        ? 'bg-primary text-on-primary border-primary shadow'
                        : 'bg-surface-container text-on-surface-variant border-transparent hover:border-outline-variant'}`}>
                    <span className={`material-symbols-outlined text-[18px] ${theme === t ? 'text-on-primary icon-filled' : 'text-on-surface-variant'}`}>
                      {THEME_ICONS[t]}
                    </span>
                    {t}
                  </button>
                ))}
              </div>
            </SettingRow>
          </Section>

          {/* ── Help & Support ───────────────────────────────────── */}
          <Section title="Help & Support">
            <SettingRow icon="headset_mic" label="Contact Support" sub={SUPPORT_PHONE} onClick={() => navigate('/contact')} />
            <SettingRow icon="chat" label="WhatsApp Us" sub="Chat with us instantly"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%20Feast%20At%20Night%20Support!`, '_blank')}
              right={
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">Online</span>
                  <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                </div>
              }
            />
            <SettingRow icon="call" label="Call Us" sub={SUPPORT_PHONE}
              onClick={() => window.open(`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`, '_self')} />
          </Section>

          {/* ── About ────────────────────────────────────────────── */}
          <Section title="About">
            <SettingRow icon="restaurant" label="Feast At Night" sub="Version 1.0 · Authentic food & juices"
              right={<span className="text-xs text-secondary font-medium">v1.0</span>} />
            <SettingRow icon="info" label="About Us" sub="Our story and mission"
              onClick={() => navigate('/about')} />
          </Section>

          {/* ── Danger zone ──────────────────────────────────────── */}
          <Section title="Account Actions">
            <SettingRow icon="logout" label="Log Out" sub="You'll need to sign in again"
              onClick={handleLogout} danger right={null} />
          </Section>

          {/* Developer credit */}
          <div className="pt-2 pb-6 text-center text-[10.5px] text-outline tracking-wide font-medium">
            Developed by <span className="font-bold text-secondary">InnoVeld Labs</span>
          </div>

        </div>
      </div>

      {/* ── Address bottom sheet ─────────────────────────────────── */}
      <AnimatePresence>
        {addressOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAddrOpen(false)} />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-6 shadow-2xl"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Delivery Address</h3>

              {addrMsg && (
                <div className={`mb-3 text-sm px-4 py-2.5 rounded-xl ${addrMsg.includes('saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {addrMsg}
                </div>
              )}

              <textarea
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />

              <div className="flex gap-3 mt-4">
                <button onClick={() => setAddrOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-surface-container-high text-secondary font-medium text-sm">
                  Cancel
                </button>
                <button onClick={handleSaveAddress} disabled={savingAddr}
                  className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {savingAddr
                    ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving…</>
                    : 'Save Address'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  )
}
