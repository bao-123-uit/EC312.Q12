'use client';

import React, { useState } from 'react';
import { RoleGuard } from '@/components/guards/RoleGuard';
import { useAuth} from '@/contexts/AuthContext';
// import {  UserRole } from '@/contexts/AuthContext';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function CheckoutContent() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Giả sử đây là items từ giỏ hàng
  const cartItems = [
    { product_id: 1, quantity: 2, price_unit: 150000 },
    { product_id: 2, quantity: 1, price_unit: 250000 },
  ];

  const handleCheckout = async () => {
    if (!session?.access_token) {
      alert('Bạn chưa đăng nhập');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cartItems,
        }),
      });

      const result = await response.json();
      setOrderResult(result);

      if (response.ok && result.success) {
        alert(`Đặt hàng thành công! Mã đơn: ${result.data}`);
      } else {
        alert(`Lỗi: ${result.message || result.error}`);
      }
    } catch (error: any) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600 mb-4">
          Xin chào, <span className="font-semibold">{user?.fullName || user?.email}</span>
        </p>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Đơn hàng của bạn:</h3>
          <ul className="space-y-2 mb-4">
            {cartItems.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>
                  Sản phẩm #{item.product_id} × {item.quantity}
                </span>
                <span>
                  {(item.price_unit * item.quantity).toLocaleString('vi-VN')}₫
                </span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RoleGuard
      allowedRoles={[UserRole.CUSTOMER]}
      redirectTo="/login"
      fallback={
        <div className="text-center py-10">
          <p className="text-red-600">Chỉ khách hàng mới có thể thanh toán</p>
        </div>
      }
    >
      <CheckoutContent />
    </RoleGuard>
  );
}
