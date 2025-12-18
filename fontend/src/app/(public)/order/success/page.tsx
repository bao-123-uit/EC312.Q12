'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, ArrowRight, Mail, Phone, Copy, Check } from 'lucide-react';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const orderNumber = searchParams.get('orderNumber') || searchParams.get('order') || 'GT' + Date.now();
  const total = searchParams.get('total');

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Đặt hàng thành công! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã mua sắm tại GoatTech
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center mb-6 pb-6 border-b">
            <p className="text-gray-500 mb-2">Mã đơn hàng của bạn</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-pink-600 font-mono">
                {orderNumber}
              </span>
              <button
                onClick={handleCopyOrderNumber}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {total && (
              <p className="mt-4 text-lg">
                Tổng thanh toán: <span className="font-bold text-pink-600">{parseInt(total).toLocaleString('vi-VN')}₫</span>
              </p>
            )}
          </div>

          {/* Order Steps */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Các bước tiếp theo:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Đơn hàng đã được xác nhận</p>
                  <p className="text-sm text-gray-500">Chúng tôi đã nhận được đơn hàng của bạn</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Đang chuẩn bị hàng</p>
                  <p className="text-sm text-gray-500">Đơn hàng sẽ được đóng gói trong 1-2 ngày</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Giao hàng</p>
                  <p className="text-sm text-gray-500">Dự kiến giao trong 2-5 ngày làm việc</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Notice */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Email xác nhận đã được gửi
                </p>
                <p className="text-sm text-blue-700">
                  Kiểm tra hộp thư của bạn để xem chi tiết đơn hàng.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/order/${orderNumber}`}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition"
            >
              Xem chi tiết đơn hàng
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/shop"
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Support Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
          <h3 className="font-semibold mb-4">Cần hỗ trợ?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="tel:1900xxxx" className="flex items-center justify-center gap-2 text-gray-600 hover:text-pink-600">
              <Phone className="w-5 h-5" />
              <span>1900 xxxx</span>
            </a>
            <a href="mailto:support@goattech.vn" className="flex items-center justify-center gap-2 text-gray-600 hover:text-pink-600">
              <Mail className="w-5 h-5" />
              <span>support@goattech.vn</span>
            </a>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Giảm 10% cho đơn hàng tiếp theo!</h3>
          <p className="text-white/90 mb-4">Sử dụng mã <span className="font-mono bg-white/20 px-2 py-1 rounded">THANKYOU10</span></p>
          <Link
            href="/shop"
            className="inline-block bg-white text-pink-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition"
          >
            Mua sắm ngay
          </Link>
        </div>
      </div>
    </div>
  );
}