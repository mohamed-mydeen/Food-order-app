import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API = import.meta.env.VITE_API_URL || 'https://food-order-app-mpah.onrender.com';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isLoggedIn, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isLoggedIn, token]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWishlist(data.data.map(w => w.product_id));
      }
    } catch (err) {
      console.error("Failed to fetch wishlist", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) return false;

    // Optimistic UI update
    const isCurrentlyWishlisted = wishlist.includes(productId);
    setWishlist(prev => 
      isCurrentlyWishlisted 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    try {
      const res = await fetch(`${API}/api/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert optimistic update on failure
        setWishlist(prev => 
          isCurrentlyWishlisted 
            ? [...prev, productId] 
            : prev.filter(id => id !== productId)
        );
      }
      return data.isWishlisted;
    } catch (err) {
      // Revert optimistic update
      setWishlist(prev => 
        isCurrentlyWishlisted 
          ? [...prev, productId] 
          : prev.filter(id => id !== productId)
      );
      return isCurrentlyWishlisted;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
