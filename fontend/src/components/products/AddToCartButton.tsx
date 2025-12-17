'use client';

import { useAuth } from '@/contexts/AuthContext';
import { addToShoppingCart } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AddToCartButtonProps {
  productId: number;
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 🚫 Chặn Link bọc ngoài
    e.preventDefault();
    e.stopPropagation();

    // 1️⃣ Chưa đăng nhập → login
    if (!isAuthenticated || !user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }

    // 2️⃣ Không có user.id → lỗi logic
    if (!user.id) {
      alert('Không tìm thấy thông tin người dùng');
      return;
    }

    setLoading(true);
    try {
      // 3️⃣ Gọi backend
      await addToShoppingCart({
        // customer_id: user.id,
        productId,
        quantity: 1,
      });

      // 4️⃣ Đồng bộ giỏ hàng (header, cart badge…)
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Add to cart error:', error);
      alert('Không thể thêm vào giỏ hàng, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading}
      className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
    >
      {loading ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
    </button>
  );
}

