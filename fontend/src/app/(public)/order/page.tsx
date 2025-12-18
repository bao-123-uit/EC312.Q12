'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyOrders } from '@/lib/api-client';
import { Package, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  order_id: number;
  order_number: string;
  order_status: string;
  total_amount: number;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchMyOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Fetch orders error', err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-700">
            <Clock className="w-4 h-4" /> Chờ xử lý
          </span>
        );
      case 'delivered':
        return (
          <span className="flex items-center gap-1 text-green-700">
            <CheckCircle className="w-4 h-4" /> Đã giao
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-red-700">
            <XCircle className="w-4 h-4" /> Đã hủy
          </span>
        );
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-pink-600" />
          Đơn hàng của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center shadow">
            <p className="text-gray-500 mb-4">
              Bạn chưa có đơn hàng nào
            </p>
            <Link
              href="/shop"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700"
            >
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                className="bg-white rounded-xl shadow p-5 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-lg">
                    #{order.order_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </p>
                  <div className="mt-1">
                    {statusBadge(order.order_status)}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-pink-600 text-lg">
                    {order.total_amount.toLocaleString('vi-VN')}₫
                  </p>
                  <Link
                    href={`/order/${order.order_number}`}
                    className="inline-flex items-center gap-1 text-sm text-pink-600 hover:underline mt-2"
                  >
                    Xem chi tiết <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
