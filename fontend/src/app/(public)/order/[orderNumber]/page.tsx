'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchOrderByNumber } from '@/lib/api-client';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MapPin,
  Phone,
  CreditCard,
  Calendar
} from 'lucide-react';

interface OrderItem {
  order_item_id: number;
  product_id: number;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

interface Order {
  order_id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total_amount: number;
  tracking_number?: string;
  created_at: string;
  items: OrderItem[];
  shipping_full_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_ward?: string;
  shipping_district?: string;
  shipping_city?: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder();
    }
  }, [orderNumber]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await fetchOrderByNumber(orderNumber);
      setOrder(data);
    } catch (error) {
      console.error('Load order error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-5 h-5" /> },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle className="w-5 h-5" /> },
      processing: { label: 'Đang chuẩn bị', color: 'bg-purple-100 text-purple-700', icon: <Package className="w-5 h-5" /> },
      shipped: { label: 'Đang giao hàng', color: 'bg-indigo-100 text-indigo-700', icon: <Truck className="w-5 h-5" /> },
      delivered: { label: 'Đã giao hàng', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-5 h-5" /> },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-5 h-5" /> },
    };
    return statuses[status] || statuses.pending;
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + '₫';
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-gray-500 mb-4">Mã đơn hàng: {orderNumber}</p>
          <Link href="/" className="text-pink-600 hover:underline">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.order_status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/account" className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
            <h1 className="text-2xl font-bold">Đơn hàng #{order.order_number}</h1>
            <p className="text-gray-500 text-sm flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              Đặt ngày: {formatDate(order.created_at)}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.label}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-600" />
                Sản phẩm đã đặt ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.order_item_id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || '/placeholder.png'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product_name}</h3>
                      {item.variant_name && (
                        <p className="text-sm text-gray-500">Phân loại: {item.variant_name}</p>
                      )}
                      <div className="flex justify-between items-end mt-2">
                        <span className="text-sm text-gray-600">
                          {formatPrice(item.unit_price)} x {item.quantity}
                        </span>
                        <span className="font-semibold text-pink-600">{formatPrice(item.total_price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Info */}
            {order.tracking_number && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Theo dõi đơn hàng
                </h2>
                <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Mã vận đơn</p>
                    <p className="font-mono font-semibold">{order.tracking_number}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Thanh toán
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span>{order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-bold">Tổng cộng</span>
                  <span className="font-bold text-pink-600 text-xl">{formatPrice(order.total_amount)}</span>
                </div>
                <div className="pt-2">
                  <span className="text-sm text-gray-500">
                    Phương thức: {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                                  order.payment_method === 'momo' ? 'Ví MoMo' : 'Chuyển khoản'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_full_name && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Địa chỉ giao hàng
                </h2>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-base">{order.shipping_full_name}</p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {order.shipping_phone}
                  </p>
                  <p className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {[
                        order.shipping_address,
                        order.shipping_ward,
                        order.shipping_district,
                        order.shipping_city
                      ].filter(Boolean).join(', ')}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/shop"
                className="block w-full text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition"
              >
                Tiếp tục mua sắm
              </Link>
              <Link
                href="/contact"
                className="block w-full text-center bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Liên hệ hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}