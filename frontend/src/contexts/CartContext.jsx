import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../utils/helpers';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartService.get();
      setCart(data.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (payload) => {
    try {
      const { data } = await cartService.add(payload);
      setCart(data.data);
      toast.success('Added to cart');
      return data.data;
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await cartService.update(itemId, quantity);
      setCart(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const removeItem = async (itemId) => {
    try {
      const { data } = await cartService.remove(itemId);
      setCart(data.data);
      toast.success('Item removed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await cartService.applyCoupon(code);
      setCart(data.data);
      toast.success('Coupon applied');
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error;
    }
  };

  const removeCoupon = async () => {
    const { data } = await cartService.removeCoupon();
    setCart(data.data);
    toast.success('Coupon removed');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems: cart?.totalItems || 0,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
