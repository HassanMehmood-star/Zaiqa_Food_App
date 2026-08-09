import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  // Meal queued for add when the "clear cart & continue" confirmation is showing.
  const [pendingConflict, setPendingConflict] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user || user.role !== 'regular_user') return;
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch (err) {
      // Silent - cart just stays empty/stale
    } finally {
      setLoading(false);
    }
  }, [user]);

  async function addItem(mealId, quantity = 1, replaceCart = false) {
    try {
      const { data } = await api.post('/cart/items', { mealId, quantity, replaceCart });
      setCart(data.cart);
      setPendingConflict(null);
      toast.success('Added to cart');
    } catch (err) {
      if (err.details?.code === 'RESTAURANT_MISMATCH') {
        setPendingConflict({ mealId, quantity });
      } else {
        toast.error(err.message);
      }
    }
  }

  async function confirmReplaceCart() {
    if (!pendingConflict) return;
    await addItem(pendingConflict.mealId, pendingConflict.quantity, true);
  }

  function cancelConflict() {
    setPendingConflict(null);
  }

  async function updateQuantity(itemId, quantity) {
    try {
      const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function removeItem(itemId) {
    try {
      const { data } = await api.delete(`/cart/items/${itemId}`);
      setCart(data.cart);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function clearCart() {
    try {
      await api.delete('/cart');
      setCart(null);
      refreshCart();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        refreshCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        pendingConflict,
        confirmReplaceCart,
        cancelConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
