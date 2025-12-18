'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { 
  fetchWishlistProductIds, 
  toggleWishlist as apiToggleWishlist,
  fetchWishlist as apiFetchWishlist 
} from '@/lib/api-client';

interface WishlistItem {
  wishlist_id: number;
  product_id: number;
  created_at: string;
  products: {
    product_id: number;
    product_name: string;
    price: number;
    sale_price?: number;
    image_url: string;
    description: string;
  };
}

interface WishlistContextType {
  // Danh sách product_id đã yêu thích
  wishedProducts: Set<number>;
  
  // Danh sách chi tiết sản phẩm yêu thích
  wishlistItems: WishlistItem[];
  
  // Loading state
  loading: boolean;
  
  // Kiểm tra sản phẩm có trong wishlist
  isWished: (productId: number) => boolean;
  
  // Toggle yêu thích - return true nếu thành công
  toggleWishlist: (productId: number) => Promise<boolean>;
  
  // Refresh danh sách từ server
  refreshWishlist: () => Promise<void>;
  
  // Số lượng sản phẩm yêu thích
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * 🔄 Đồng bộ danh sách yêu thích từ backend
   */
  const refreshWishlist = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách product_id
      const productIds = await fetchWishlistProductIds();
      console.log('📋 Wishlist productIds:', productIds);
      setWishedProducts(new Set(productIds));
      
      // Lấy chi tiết sản phẩm
      const items = await apiFetchWishlist();
      console.log('📋 Wishlist items:', items);
      setWishlistItems(items || []);
    } catch (error) {
      console.error('❌ refreshWishlist failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   *  Kiểm tra sản phẩm có trong danh sách yêu thích
   */
  const isWished = useCallback((productId: number): boolean => {
    return wishedProducts.has(productId);
  }, [wishedProducts]);

  /**
   *  Toggle yêu thích sản phẩm
   * @returns true nếu thành công, false nếu chưa đăng nhập
   */
  const toggleWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      // Kiểm tra đăng nhập
      const customerData = localStorage.getItem('customer');
      if (!customerData) {
        return false; // Chưa đăng nhập
      }

      // Optimistic update (cập nhật UI trước)
      setWishedProducts(prev => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });

      // Gọi API
      const result = await apiToggleWishlist(productId);
      console.log('Toggle wishlist result:', result);
      
      // Refresh để đồng bộ với server
      await refreshWishlist();
      return true;
    } catch (error) {
      console.error('❌ toggleWishlist failed:', error);
      // Rollback nếu lỗi
      await refreshWishlist();
      return false;
    }
  }, [refreshWishlist]);

  /**
   *  Load wishlist lần đầu khi app mount
   */
  useEffect(() => {
    // Chỉ load nếu đã đăng nhập
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      refreshWishlist();
    }
  }, [refreshWishlist]);

  // Lắng nghe sự kiện login/logout (từ tab khác)
  useEffect(() => {
    const handleStorageChange = () => {
      const customerData = localStorage.getItem('customer');
      if (customerData) {
        refreshWishlist();
      } else {
        setWishedProducts(new Set());
        setWishlistItems([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshWishlist]);

  // Lắng nghe custom event khi login/logout trong cùng tab
  useEffect(() => {
    const handleAuthChange = () => {
      const customerData = localStorage.getItem('customer');
      if (customerData) {
        console.log('🔄 Auth changed - refreshing wishlist');
        refreshWishlist();
      } else {
        console.log('🔄 Auth changed - clearing wishlist');
        setWishedProducts(new Set());
        setWishlistItems([]);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        wishedProducts,
        wishlistItems,
        loading,
        isWished,
        toggleWishlist,
        refreshWishlist,
        wishlistCount: wishedProducts.size,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * 🔐 Hook an toàn
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
