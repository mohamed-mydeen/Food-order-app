// Admin Offers page — uses AuthContext (not useAuth hook)
import { useState, useEffect, useRef, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'

export default function Offers() {
  const { token } = useContext(AuthContext)
  const [offers, setOffers]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(null)
  const [file, setFile]           = useState(null)
  const [title, setTitle]         = useState("Today's Special Offer")
  const [pushTitle, setPushTitle] = useState("🔥 Inniku special offer 🔥")
  const [pushBody, setPushBody]   = useState("Chicken Mandi just ₹199 😱\nMiss pannadhe!")
  const [sendingPush, setSendingPush] = useState(false)
  const [toast, setToast]         = useState(null)
  const fileRef = useRef()

  const headers = { Authorization: `Bearer ${token}` }

  /* ── Fetch all offers ──────────────────────────────────────────── */
  const fetchOffers = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/offers`, { headers })
      const data = await res.json()
      if (data.success) setOffers(data.data)
    } catch { showToast('Failed to load offers', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchOffers() }, [])

  /* ── Toast helper ──────────────────────────────────────────────── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* ── File select → preview ─────────────────────────────────────── */
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  /* ── Upload ────────────────────────────────────────────────────── */
  const handleUpload = async () => {
    if (!file) return showToast('Please select an image first', 'error')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('image', file)
      form.append('title', title)
      const res  = await fetch(`${API}/api/offers`, { method: 'POST', headers, body: form })
      const data = await res.json()
      if (data.success) {
        showToast('✅ Offer poster uploaded & activated!')
        setFile(null); setPreview(null)
        fileRef.current.value = ''
        await fetchOffers()
      } else {
        showToast(data.message || 'Upload failed', 'error')
      }
    } catch { showToast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  /* ── Toggle active ─────────────────────────────────────────────── */
  const handleToggle = async (id) => {
    try {
      const res  = await fetch(`${API}/api/offers/${id}/toggle`, { method: 'PATCH', headers })
      const data = await res.json()
      if (data.success) { showToast(data.message); await fetchOffers() }
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Failed to toggle offer', 'error') }
  }

  /* ── Delete ────────────────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this offer poster?')) return
    try {
      const res  = await fetch(`${API}/api/offers/${id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) { showToast('Offer deleted'); await fetchOffers() }
      else showToast(data.message || 'Failed', 'error')
    } catch { showToast('Delete failed', 'error') }
  }

  /* ── Send Push Notification ────────────────────────────────────── */
  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) return showToast('Title and body are required', 'error')
    if (!window.confirm('Send this notification to all connected devices globally?')) return
    
    setSendingPush(true)
    try {
      const res = await fetch(`${API}/api/notifications/send`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: pushTitle, body: pushBody })
      })
      const data = await res.json()
      if (data.success) {
        showToast(`✅ ${data.message}`)
        setPushTitle('')
        setPushBody('')
      } else {
        showToast(data.message || 'Broadcast failed', 'error')
      }
    } catch { showToast('Broadcast failed', 'error') }
    finally { setSendingPush(false) }
  }

  /* ── UI ──────────────────────────────────────────────────────────── */
  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Offer Posters</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          Upload a promotional poster — it will appear as a popup in the app for customers.
        </p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        <h3 className="font-semibold text-slate-700 text-base flex items-center gap-2">
          <span className="text-xl">📤</span> Upload New Poster
        </h3>

        {/* Drag & drop zone */}
        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors group"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-52 object-contain rounded-lg shadow" />
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-slate-500 text-sm font-medium">Click to choose image</p>
              <p className="text-slate-400 text-xs">JPG, PNG, WEBP · max 5MB</p>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Title input */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1.5">Offer Title (shown in popup)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
            placeholder="e.g. Weekend Special – 20% Off!"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {uploading
              ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Uploading…</>
              : '🚀 Upload & Activate'}
          </button>
          {preview && (
            <button onClick={() => { setFile(null); setPreview(null); fileRef.current.value = '' }}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 transition">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Global Push Notification Configurator */}
      <div className="bg-indigo-50/50 rounded-2xl shadow-sm border border-indigo-100 p-6 space-y-5">
        <h3 className="font-semibold text-indigo-900 text-base flex items-center gap-2">
          <span className="text-xl">🔔</span> Send Global Push Notification
        </h3>
        <p className="text-indigo-600/80 text-sm -mt-2">
          Instantly broadcast a notification to all devices that have allowed permissions. Perfect for flash sales.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1.5">Notification Title</label>
            <input
              type="text"
              value={pushTitle}
              onChange={e => setPushTitle(e.target.value)}
              className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              placeholder="e.g. 🔥 Inniku special offer 🔥"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-indigo-800 mb-1.5">Notification Body</label>
            <textarea
              value={pushBody}
              onChange={e => setPushBody(e.target.value)}
              rows="3"
              className="w-full border border-indigo-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white placeholder-slate-400"
              placeholder="e.g. Chicken Mandi just ₹199 😱 Miss pannadhe!"
            />
          </div>
        </div>

        <button
          onClick={handleSendPush}
          disabled={sendingPush || !pushTitle.trim() || !pushBody.trim()}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 disabled:text-indigo-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {sendingPush
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Broadcasting…</>
            : '📡 Broadcast to All Devices'}
        </button>
      </div>

      {/* Offer list */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-700 text-base flex items-center gap-2">
          <span className="text-xl">🖼️</span> Uploaded Posters
          <span className="ml-auto text-xs font-normal text-slate-400">{offers.length} total</span>
        </h3>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Loading…</div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 text-slate-400 text-sm">
            No offer posters yet. Upload one above!
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map(offer => (
              <div key={offer.id}
                className={`bg-white rounded-2xl border shadow-sm flex gap-4 p-4 items-center transition-all
                  ${offer.is_active ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-100'}`}>

                {/* Thumbnail */}
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{offer.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(offer.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {offer.is_active && (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      LIVE IN APP
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(offer.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                      ${offer.is_active
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                    {offer.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(offer.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
