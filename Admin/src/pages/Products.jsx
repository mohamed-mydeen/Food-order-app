import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const CATEGORIES = ['All', 'Mandi', 'Burgers', 'Pizza', 'Biryani', 'Shawarma', 'Desserts', 'Drinks', 'Snacks']

const emptyForm = { name: '', price: '', category: '', description: '', in_stock: true, image: null }

function Modal({ title, onClose, children }) {
  // ... unchanged modal ...
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="text-center font-bold text-slate-800 mb-2">Delete Product</h3>
        <p className="text-center text-slate-500 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-60"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts]       = useState([])
  const [filtered, setFiltered]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [activeCat, setActiveCat]     = useState('All')
  const [showModal, setShowModal]     = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm]               = useState(emptyForm)
  const [preview, setPreview]         = useState(null)
  const [saving, setSaving]           = useState(false)
  const [formError, setFormError]     = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const fileRef = useRef()

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.data)
      setFiltered(res.data.data)
    } catch {
      setError('Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  // Filter on search & category
  useEffect(() => {
    let list = products
    if (activeCat !== 'All') list = list.filter(p => p.category === activeCat)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    setFiltered(list)
  }, [search, activeCat, products])

  const openAdd = () => {
    setEditProduct(null)
    setForm(emptyForm)
    setPreview(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEditProduct(p)
    setForm({ name: p.name, price: p.price, category: p.category, description: p.description || '', in_stock: p.in_stock !== false, image: null })
    setPreview(p.image || null)
    setFormError('')
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setForm({ ...form, image: file })
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('price', form.price)
      fd.append('category', form.category)
      fd.append('description', form.description)
      fd.append('in_stock', form.in_stock)
      if (form.image) fd.append('image', form.image)

      const config = { headers: { 'Content-Type': 'multipart/form-data' } }

      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, fd, config)
      } else {
        await api.post('/products', fd, config)
      }
      setShowModal(false)
      fetchProducts()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.delete(`/products/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchProducts()
    } catch (err) {
      // If 404, the product was already deleted from DB (stale UI). 
      // Synchronize state locally and close dialog.
      if (err.response?.status === 404) {
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      }
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">{error}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">{filtered.length} products total</p>
        </div>
        <button
          id="add-product-btn"
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeCat === cat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="text-slate-400 font-medium">No products found</p>
          <p className="text-slate-300 text-sm mt-1">Try adjusting your search or add a new product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(product => (
            <div key={product.id} className={`bg-white rounded-2xl shadow-sm border ${product.in_stock === false ? 'border-red-100 ring-1 ring-red-100 opacity-80' : 'border-slate-100 hover:shadow-md'} transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group`}>
              {/* Image */}
              <div className="relative h-44 img-placeholder overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                    <span className="text-4xl opacity-30">🍽️</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 z-10">
                  <span className="bg-white/95 backdrop-blur-md text-slate-700 text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded shadow-sm">
                    {product.category}
                  </span>
                </div>
                {/* Out of Stock visual badge overlay */}
                {product.in_stock === false && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="bg-red-500 text-white font-black uppercase text-sm tracking-widest px-3 py-1.5 rounded shadow-lg transform -rotate-12 outline outline-1 outline-offset-2 outline-red-500/50">
                      Out of Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className={`font-bold truncate ${product.in_stock === false ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{product.name}</h4>
                {product.description && (
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{product.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className={`font-black text-lg ${product.in_stock === false ? 'text-slate-400' : 'text-orange-500'}`}>₹{parseFloat(product.price).toFixed(0)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editProduct ? 'Edit Product' : 'Add New Product'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{formError}</div>
            )}

            {/* In Stock Toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-4 bg-orange-50 border border-orange-100 rounded-2xl hover:bg-orange-100/50 transition-colors mb-2">
              <input
                type="checkbox"
                checked={form.in_stock}
                onChange={e => setForm({ ...form, in_stock: e.target.checked })}
                className="w-5 h-5 accent-orange-600 rounded bg-white border-2 border-orange-600 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">Currently In Stock</span>
                <span className="text-orange-900/60 text-xs font-medium">Uncheck to mark as sold out (removes order button).</span>
              </div>
            </label>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
              <div
                onClick={() => fileRef.current.click()}
                className="relative h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-orange-400 transition-colors overflow-hidden group"
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 group-hover:text-orange-400 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">JPEG, PNG, WebP (max 5MB)</span>
                  </div>
                )}
                {preview && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-white text-sm font-medium">Change Image</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Chicken Biryani"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
              />
            </div>

            {/* Price + Category row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  placeholder="199"
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all bg-white"
                >
                  <option value="">Select...</option>
                  {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the product..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</>
                ) : (
                  editProduct ? 'Update Product' : 'Add Product'
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  )
}
