import { createContext, useState, useCallback, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'

const API = 'http://localhost:5000/api'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { token, isLoggedIn } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [cartItems, setCartItems] = useState([])

  const fetchCart = useCallback(async () => {
    if (!token) { setCartCount(0); setCartItems([]); return }
    try {
      const res  = await fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) {
        setCartItems(data.data)
        setCartCount(data.data.reduce((sum, it) => sum + it.quantity, 0))
      }
    } catch {/* silent */}
  }, [token])

  useEffect(() => { fetchCart() }, [fetchCart])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!token) return false
    try {
      const res  = await fetch(`${API}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchCart()
        return true
      }
      return false
    } catch { return false }
  }, [token, fetchCart])

  const removeFromCart = useCallback(async (productId) => {
    if (!token) return
    try {
      await fetch(`${API}/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetchCart()
    } catch {/* silent */}
  }, [token, fetchCart])

  const updateQty = useCallback(async (productId, quantity) => {
    if (!token) return
    if (quantity <= 0) return removeFromCart(productId)
    try {
      await fetch(`${API}/cart`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: productId, quantity }),
      })
      await fetchCart()
    } catch {/* silent */}
  }, [token, fetchCart, removeFromCart])

  return (
    <CartContext.Provider value={{ cartCount, cartItems, addToCart, removeFromCart, updateQty, fetchCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
