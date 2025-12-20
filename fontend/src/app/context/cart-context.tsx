'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { fetchShoppingCart } from '@/lib/api-client';

interface CartContextType {
  cartCount: number;

  // Sync với backend
  refreshCart: () => Promise<void>;

  // Local update (UX mượt)
  increaseCart: (qty?: number) => void;
  decreaseCart: (qty?: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cartCount, setCartCount] = useState(0);

  /**
   * 🔄 Đồng bộ giỏ hàng từ backend
   */
  const refreshCart = useCallback(async () => {
    try {
      const result = await fetchShoppingCart();

      if (result?.success && Array.isArray(result.data)) {
        const total = result.data.reduce(
          (sum: number, item: any) => sum + (item.quantity || 0),
          0,
        );
        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('❌ refreshCart failed:', error);
    }
  }, []);

  /**
   * ➕ Tăng số lượng ngay (UX)
   */
  const increaseCart = useCallback((qty: number = 1) => {
    setCartCount(prev => Math.max(prev + qty, 0));
  }, []);

  /**
   * ➖ Giảm số lượng
   */
  const decreaseCart = useCallback((qty: number = 1) => {
    setCartCount(prev => Math.max(prev - qty, 0));
  }, []);

  /**
   * Clear cart (sau checkout / logout)
   */
  const clearCart = useCallback(() => {
    setCartCount(0);
  }, []);

  /**
   * Load cart lần đầu khi app mount
   */
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  /**
   *  Lắng nghe event cartUpdated để cập nhật ngay khi thêm vào giỏ
   */
  useEffect(() => {
    const handleCartUpdated = () => {
      refreshCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        refreshCart,
        increaseCart,
        decreaseCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * 🔐 Hook an toàn
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
