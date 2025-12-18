'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/app/context/cart-context';
import { useRouter } from 'next/navigation';
import {
  fetchShoppingCart,
  updateShoppingCart,
  deleteShoppingCart,
  clearShoppingCart,
} from '@/lib/api-client';

interface CartItem {
  cart_id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product_name: string;
  price: number;
  original_price?: number;
  image_url: string;
}

export default function CartPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { refreshCart } = useCart();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Load cart
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const result = await fetchShoppingCart();

      if (result.success) {
        setCartItems(result.data || []);
        setCartTotal(result.total || 0);
        setItemCount(result.itemCount || 0);
        // Cập nhật icon giỏ hàng trên header
        await refreshCart();
      } else {
        console.error('Load cart failed:', result.message);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Load cart error:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, refreshCart]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push('/login?redirect=/shopping-cart');
      } else {
        loadCart();
      }
    }
  }, [authLoading, isAuthenticated, loadCart, router]);

  // Update quantity
  const handleUpdateQuantity = async (cartId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartId);
      return;
    }

    setUpdating(cartId);

    try {
      const result = await updateShoppingCart(cartId, newQuantity);

      if (result.success) {
        // Reload cart to get updated totals
        await loadCart();
        // Cập nhật icon
        await refreshCart();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Không thể cập nhật số lượng');
    } finally {
      setUpdating(null);
    }
  };

  // Remove item
  const handleRemoveItem = async (cartId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    setUpdating(cartId);

    try {
      const result = await deleteShoppingCart(cartId);

      if (result.success) {
        await loadCart();
        // Cập nhật icon
        await refreshCart();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Remove error:', error);
      alert('Không thể xóa sản phẩm');
    } finally {
      setUpdating(null);
    }
  };

  // Clear all
  const handleClearCart = async () => {
    if (!confirm('Xóa toàn bộ giỏ hàng?')) return;

    try {
      const result = await clearShoppingCart();

      if (result.success) {
        setCartItems([]);
        setCartTotal(0);
        setItemCount(0);
        // Cập nhật icon
        await refreshCart();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Clear cart error:', error);
      alert('Không thể xóa giỏ hàng');
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="text-gray-500">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">
          Vui lòng đăng nhập
        </h2>
        <p className="text-gray-500 mb-6">
          Bạn cần đăng nhập để xem giỏ hàng
        </p>
        <Link
          href="/login?redirect=/shopping-cart"
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg transition"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Giỏ hàng trống
        </h2>
        <p className="text-gray-500 mb-6">
          Hãy thêm sản phẩm vào giỏ hàng của bạn
        </p>
        <Link
          href="/shop"
          className="bg-pink-600 hover:bg-pink-700 text-white px-8 py-3 rounded-lg transition flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  // Cart with items
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-pink-600" />
            Giỏ Hàng ({itemCount} sản phẩm)
          </h1>

          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-600 text-sm font-medium flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cart_id}
                className={`bg-white rounded-2xl shadow-md p-5 flex gap-4 transition ${
                  updating === item.cart_id ? 'opacity-50' : ''
                }`}
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image_url && item.image_url.startsWith('http') ? (
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                      {item.product_name}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.product_name}
                  </h3>

                  <p className="text-pink-600 font-bold text-lg">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.cart_id, item.quantity - 1)}
                      disabled={updating === item.cart_id}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => handleUpdateQuantity(item.cart_id, item.quantity + 1)}
                      disabled={updating === item.cart_id}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item.cart_id)}
                      disabled={updating === item.cart_id}
                      className="ml-4 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Tóm tắt đơn hàng
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({itemCount} sản phẩm)</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <hr />
                <div className="flex justify-between text-xl font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-pink-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-4 rounded-xl font-semibold text-center block transition"
              >
                💳 Tiến hành thanh toán
              </Link>

              <Link
                href="/shop"
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium text-center block hover:bg-gray-50 transition"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}