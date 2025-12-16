'use client';

import React, { useState } from 'react';
import { CustomerOnly } from '@/components/guards';
import { useAuth } from '@/contexts/AuthContext';

interface AddToCartButtonProps {
  productId: number;
  productName: string;
}

export function AddToCartButton({ productId, productName }: AddToCartButtonProps) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:3001/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Đã thêm "${productName}" vào giỏ hàng!`);
      } else {
        setMessage(`❌ Lỗi: ${data.message}`);
      }
    } catch (error) {
      setMessage('❌ Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CustomerOnly
        fallback={
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 py-2 rounded cursor-not-allowed"
          >
            Đăng nhập để mua hàng
          </button>
        }
      >
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-2 rounded transition disabled:opacity-50"
        >
          {loading ? 'Đang thêm...' : '🛒 Thêm vào giỏ hàng'}
        </button>
      </CustomerOnly>
      
      {message && (
        <p className="mt-2 text-sm text-center">{message}</p>
      )}
    </div>
  );
}