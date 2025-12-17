'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import {
  fetchShoppingCart,
  updateShoppingCart,
  deleteShoppingCart,
} from '@/lib/api-client';

interface CartItem {
  cart_id: number;
  product_id: number;
  product_name?: string;
  price?: number;
  image?: string;
  quantity: number;
}

const CUSTOMER_ID = 10;

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      setLoading(true);
      const result = await fetchShoppingCart(CUSTOMER_ID);
      if (result.success) {
        setCartItems(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const changeQuantity = async (cartId: number, quantity: number) => {
    if (quantity < 1) {
      await deleteShoppingCart(cartId);
    } else {
      await updateShoppingCart(cartId, quantity);
    }
    loadCart();
  };

  const removeItem = async (cartId: number) => {
    await deleteShoppingCart(cartId);
    loadCart();
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải giỏ hàng...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-50">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Giỏ hàng trống
        </h2>
        <Link
          href="/shop"
          className="mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition"
        >
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          🛒 Giỏ Hàng
        </h1>

        {/* Cart list */}
        <div className="space-y-5">
          {cartItems.map(item => (
            <div
              key={item.cart_id}
              className="flex items-center justify-between gap-6 bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition"
            >
              {/* Left: Product info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.product_name || `Sản phẩm #${item.product_id}`}
                </h3>

                {/* Quantity controls */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() =>
                      changeQuantity(item.cart_id, item.quantity - 1)
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    −
                  </button>

                  <span className="min-w-[32px] text-center font-semibold text-gray-800">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      changeQuantity(item.cart_id, item.quantity + 1)
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.cart_id)}
                    className="ml-6 text-sm font-medium text-red-500 hover:text-red-600 transition"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Right: Price */}
              <div className="text-right">
                <p className="text-lg font-bold text-pink-600">
                  {((item.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.price?.toLocaleString('vi-VN')}₫ / sản phẩm
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-10 bg-white rounded-2xl shadow-md p-6 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700">
            Tổng cộng
          </span>
          <span className="text-3xl font-extrabold text-pink-600">
            {cartTotal.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Checkout */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white px-10 py-4 rounded-xl font-semibold shadow-lg transition"
          >
            💳 Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );

}







