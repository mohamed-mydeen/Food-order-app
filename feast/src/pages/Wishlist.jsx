import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useWishlist } from '../context/WishlistContext'
import TopBar from '../components/TopBar'
import { SkeletonCard } from '../components/SkeletonCard'

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com'

export default function Wishlist() {
  const navigate = useNavigate()
  const { isLoggedIn, token } = useAuth()
  const { toggleWishlist, wishlist: localWishlistIds } = useWishlist()
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setItems(data.data)
        }
      } catch (err) {
        console.error("Failed to load wishlist")
      } finally {
        setLoading(false)
      }
    }
    fetchWishlist()
  }, [isLoggedIn, token, navigate])

  const handleRemove = async (productId) => {
    // Optimistic UI removal
    setItems(prev => prev.filter(item => item.product_id !== productId))
    await toggleWishlist(productId)
  }

  return (
    <div className="flex flex-col h-full w-full bg-surface text-on-surface pb-[90px]">
      <TopBar />
      
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-headline font-black text-3xl">My Wishlist ❤️</h1>
        <p className="text-sm font-medium text-on-surface-variant mt-1">Your saved favourite items</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-20">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant">favorite</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-xl text-on-surface">Your wishlist is empty</h3>
              <p className="text-secondary text-sm mt-1">Save your favourite dishes to find them easily later!</p>
            </div>
            <button
              onClick={() => navigate('/menu')}
              className="mt-2 px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold shadow-sm"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm relative group"
                >
                  <div className="relative h-32 bg-gray-100">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                    )}
                    <button
                      onClick={() => handleRemove(item.product.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm text-red-500 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined font-variation-fill text-[18px]">favorite</span>
                    </button>
                    {item.product.category && (
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.product.category}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-headline font-bold text-sm truncate">{item.product.name}</h4>
                    <p className="font-black text-primary text-sm mt-1">₹{parseFloat(item.product.price).toFixed(0)}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
