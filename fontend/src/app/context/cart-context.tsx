'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { fetchShoppingCart } from '@/lib/api-client';

interface CartContextType {
  cartCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  refreshCart: () => {},
});

// const CUSTOMER_ID = 10;

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCart = async () => {
    try {
      const result = await fetchShoppingCart();
      if (result.success) {
        const total = result.data.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0,
        );
        setCartCount(total);
      }
    } catch (err) {
      console.error('Load cart failed', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
