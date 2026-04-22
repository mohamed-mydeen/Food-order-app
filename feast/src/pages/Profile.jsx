import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { NEIGHBORHOODS } from '../constants/neighborhoods'
import NeighborhoodPicker from '../components/NeighborhoodPicker'
import mandiBanner from '../assets/mandi_profile.png'

const API = `${import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'}/api`


const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' } }),
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, token, logout, updateUser, isLoggedIn } = useAuth()

  const [orders, setOrders]         = useState([])
  const [ordersLoading, setOLoading]= useState(true)
  const [editOpen, setEditOpen]     = useState(false)
  const [editForm, setEditForm]     = useState({ name: '', phone: '', address: '', neighborhood: '' })
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')

  // Removed automatic redirect to allow guest browsing


  // Fetch user orders
  useEffect(() => {
    if (!token) return
    const fetchOrders = async () => {
      try {
        const res  = await fetch(`${API}/orders/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setOrders(data.data)
      } catch {/* silently fail */}
      finally { setOLoading(false) }
    }
    fetchOrders()
  }, [token])

  // Open edit form pre-filled
  const openEdit = () => {
    setEditForm({ 
      name: user?.name || '', 
      phone: user?.phone || '', 
      address: user?.address || '',
      neighborhood: user?.neighborhood || ''
    })
    setEditOpen(true)
    setSaveMsg('')
  }

  // Save profile update
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg('')
    try {
      const res  = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      updateUser({ 
        name: editForm.name, 
        phone: editForm.phone, 
        address: editForm.address,
        neighborhood: editForm.neighborhood
      })
      setSaveMsg('Profile updated!')
      setTimeout(() => setEditOpen(false), 1000)
    } catch (err) {
      setSaveMsg(err.message || 'Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-full w-full bg-surface text-on-surface">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center"
             style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>
          
          <motion.div 
            className="w-32 h-32 rounded-[24px] bg-[#a83100]/10 flex items-center justify-center mb-6 shadow-xl"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          >
            <span className="material-symbols-outlined text-[#a83100] text-6xl icon-filled">account_circle</span>
          </motion.div>

          <h2 className="font-headline font-black text-3xl text-on-surface mb-2 leading-tight">Join the Feast</h2>
          <p className="text-secondary text-sm mb-10 max-w-xs leading-relaxed font-medium">
            Create an account to track your orders, save favorite dishes, and get exclusive midnight offers!
          </p>

          <div className="w-full max-w-xs space-y-4">
            <motion.button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-gradient-to-r from-[#e34105] to-[#ff7138] text-white rounded-2xl font-headline font-black tracking-wide shadow-lg shadow-[#e34105]/20 active:scale-[0.98] transition-all"
              whileTap={{ scale: 0.98 }}
            >
              SIGN IN
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/signup')}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl font-headline font-black tracking-wide active:scale-[0.98] transition-all"
              whileTap={{ scale: 0.98 }}
            >
              CREATE ACCOUNT
            </motion.button>
          </div>

          <p className="mt-8 text-[11px] text-outline font-medium tracking-wide">
            Experience Tirunelveli's finest midnight flavors.
          </p>
        </div>
      </div>
    )
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'

  return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface">
      <TopBar />
      <div className="flex-1 overflow-y-auto hide-scrollbar"
           style={{ paddingBottom: 'max(90px, calc(env(safe-area-inset-bottom) + 90px))' }}>

        {/* Hero Header */}
        <div className="relative bg-cover bg-center px-6 pt-8 pb-16"
          style={{ backgroundImage: `url(${mandiBanner})` }}
        >
          {/* Dark overlay to make text readable */}
          <div className="absolute inset-0 bg-black/60" />
          <motion.div className="flex flex-col items-center relative z-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center shadow-2xl mb-3">
              <span className="font-headline font-black text-white text-3xl">{initial}</span>
            </div>
            <h1 className="font-headline font-black text-white text-2xl tracking-tight">{user?.name || 'Guest'}</h1>
            <p className="text-white/70 text-sm font-medium mt-0.5">{user?.email || ''}</p>
            {user?.phone && <p className="text-white/60 text-xs mt-0.5">{user.phone}</p>}
            <div className="mt-2 flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full">
              <span className="material-symbols-outlined text-[14px] text-white/80 icon-filled">verified</span>
              <span className="text-white/80 text-xs font-semibold">Verified Customer</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="-mt-8 mx-4 relative z-20">
          <motion.div className="bg-white rounded-xl shadow-lg p-4 flex justify-around items-center"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            {[
              { label: 'Orders', value: orders.length, icon: 'shopping_bag' },
              { label: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, icon: 'check_circle' },
              { label: 'Pending', value: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length, icon: 'schedule' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-0.5">
                  <span className="material-symbols-outlined text-primary text-[18px] icon-filled">{icon}</span>
                </div>
                <span className="font-headline font-black text-xl text-on-surface">{value}</span>
                <span className="text-xs text-secondary font-medium">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Profile Actions */}
        <div className="px-4 mt-5 space-y-2">
          {[
            { icon: 'shopping_bag', label: 'My Orders',        sub: `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`, action: () => navigate('/orders'), badge: orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length },
            { icon: 'favorite',     label: 'My Wishlist',      sub: 'Your saved dishes', action: () => navigate('/wishlist') },
            { icon: 'person',       label: 'Edit Profile',      sub: 'Update your name & details', action: openEdit },
            { icon: 'location_on',  label: 'Delivery Address',  sub: user?.address || 'Add your address', action: openEdit },
            { icon: 'settings',     label: 'Settings',          sub: 'Theme, address, support & more', action: () => navigate('/settings') },
            { icon: 'help',         label: 'Help & Support',    sub: 'Chat with us anytime', action: () => navigate('/contact') },
            { icon: 'share',        label: 'Share App',         sub: 'Share with friends & family', action: async () => {
              const url = window.location.origin;
              if (navigator.share) {
                try { await navigator.share({ title: 'Feast At Night', text: 'Order delicious food from Feast At Night!', url }); } catch(e){}
              } else {
                try { await navigator.clipboard.writeText(url); alert('App link copied!'); } catch(e){}
              }
            } },
          ].map(({ icon, label, sub, action, badge }, i) => (
            <motion.div
              key={label}
              className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm cursor-pointer"
              custom={i} variants={itemVariants} initial="hidden" animate="show"
              whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
              onClick={action}
            >
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center relative">
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#a83100] text-white text-[9px] font-black flex items-center justify-center rounded-full">
                    {badge}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-headline font-bold text-on-surface text-sm">{label}</p>
                <p className="text-on-surface-variant text-xs truncate">{sub}</p>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders Preview — tappable shortcut */}
        {!ordersLoading && orders.length > 0 && (
          <div className="px-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-headline font-bold text-sm text-on-surface">Recent Orders</h2>
              <motion.button
                onClick={() => navigate('/orders')}
                className="text-xs text-primary font-bold flex items-center gap-0.5"
                whileTap={{ scale: 0.92 }}
              >
                View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </motion.button>
            </div>
            <motion.div
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
              whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/orders')}
            >
              {orders.slice(0, 2).map(({ id, created_at, items, total_amount, status }, i) => {
                const cfg = { Pending: 'text-amber-600 bg-amber-50', Preparing: 'text-blue-600 bg-blue-50', 'Out for Delivery': 'text-purple-600 bg-purple-50', Delivered: 'text-green-600 bg-green-50', Cancelled: 'text-red-600 bg-red-50' }
                const names = (items || []).map(it => it.product?.name).filter(Boolean).join(', ') || 'Order items'
                return (
                  <div key={id} className={`px-4 py-3 ${i > 0 ? 'border-t border-dashed border-gray-100' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{names}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wide ${cfg[status] || 'bg-gray-100 text-gray-500'}`}>{status}</span>
                        <span className="font-black text-[#a83100] text-sm">₹{parseFloat(total_amount).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-center gap-1.5 border-t border-gray-100">
                <span className="text-xs text-[#a83100] font-bold">See all orders</span>
                <span className="material-symbols-outlined text-[#a83100] text-sm">arrow_forward</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* Logout */}
        <div className="px-4 mt-5 mb-6">
          <motion.button
            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-50 text-red-600 font-headline font-bold shadow-sm"
            whileHover={{ backgroundColor: '#fee2e2' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Log Out
          </motion.button>
        </div>


        {/* Developer credit */}
        <div className="pt-2 pb-6 text-center text-[10.5px] text-outline tracking-wide font-medium">
          Developed by{' '}
          <a href="https://innoveldlabs-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-secondary hover:text-primary transition-colors cursor-pointer">
            InnoVeld Labs
          </a>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-[2px]">
          <motion.div
            className="bg-surface rounded-t-[28px] sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-surface-container/50">
              <h3 className="font-headline font-black text-xl text-on-surface tracking-tight">Edit Account</h3>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6">
              {saveMsg && (
                <div className={`mb-5 text-sm px-4 py-3 rounded-xl flex items-center gap-2 ${saveMsg.includes('updated') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                  <span className="material-symbols-outlined text-[18px]">{saveMsg.includes('updated') ? 'check_circle' : 'error'}</span>
                  {saveMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Enter your full name', icon: 'person' },
                  { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 98765 43210', icon: 'call' },
                  { label: 'Neighborhood', key: 'neighborhood', type: 'select', placeholder: 'Select your area', icon: 'location_on' },
                  { label: 'Delivery Address', key: 'address', type: 'textarea', placeholder: 'Enter your complete delivery address', icon: 'home_pin' },
                ].map(({ label, key, type, placeholder, icon }) => (
                  <div key={key} className="relative">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">{label}</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 top-4 material-symbols-outlined text-[20px] text-outline z-10">{icon}</span>
                      {type === 'select' ? (
                        <NeighborhoodPicker 
                          value={editForm[key]}
                          onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        />
                      ) : type === 'textarea' ? (
                        <textarea
                          value={editForm[key]}
                          onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                          placeholder={placeholder}
                          rows={3}
                          className="w-full bg-white border border-outline-variant/40 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium text-on-surface resize-none shadow-sm"
                        />
                      ) : (
                        <input
                          type={type}
                          value={editForm[key]}
                          onChange={e => setEditForm({ ...editForm, [key]: e.target.value })}
                          placeholder={placeholder}
                          className="w-full bg-white border border-outline-variant/40 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[15px] font-medium text-on-surface shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 bg-gradient-to-r from-[#e34105] to-[#ff7138] shadow-[0_6px_20px_rgba(255,120,76,0.3)] text-white font-headline font-black tracking-wide rounded-[16px] transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.98] text-[15px]"
                  >
                    {saving ? (
                      <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                    ) : 'SAVE CHANGES'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  )
}
