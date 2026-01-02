'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyGiftPayment } from '@/lib/api-client';
import { CheckCircle, XCircle, Loader2, Gift, Home, RefreshCw } from 'lucide-react';

import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function GiftPaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const giftId = searchParams.get('giftId');
  const orderCode = searchParams.get('orderCode');
  const code = searchParams.get('code'); // PayOS status code
  const cancel = searchParams.get('cancel');
  const status = searchParams.get('status');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (giftId && orderCode) {
      verifyPayment();
    } else {
      setLoading(false);
      setError('Thiếu thông tin thanh toán');
    }
  }, [giftId, orderCode]);

  // Auto redirect sau khi thành công
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push('/');
    }
  }, [success, countdown, router]);

  const verifyPayment = async () => {
    try {
      setLoading(true);

      // Check if user cancelled
      if (cancel === 'true') {
        setSuccess(false);
        setError('Bạn đã hủy thanh toán');
        setLoading(false);
        return;
      }

      // Verify payment with backend
      const result = await verifyGiftPayment(giftId!, orderCode!);

      if (result.success) {
        setSuccess(true);
        setMessage(result.message || 'Thanh toán thành công! Email đã được gửi đến người nhận.');
      } else {
        setSuccess(false);
        setError(result.message || 'Thanh toán chưa hoàn thành');
      }
    } catch (err: any) {
      console.error('Verify payment error:', err);
      setSuccess(false);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi xác minh thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <TopBanner />
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {loading ? (
            <>
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-pink-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Đang xác minh thanh toán...
              </h1>
              <p className="text-gray-600">
                Vui lòng đợi trong giây lát
              </p>
            </>
          ) : success ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                🎁 Quà Tặng Đã Được Gửi!
              </h1>
              
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="bg-green-50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Gift className="w-5 h-5" />
                  <span className="font-semibold">Thanh toán thành công</span>
                </div>
                <p className="text-green-600 text-sm mt-2">
                  Email thông báo quà tặng đã được gửi đến người nhận
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-6 animate-pulse">
                🏠 Tự động chuyển về trang chủ sau {countdown} giây...
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Về Trang Chủ
                </Link>
                <Link
                  href="/shop"
                  className="px-6 py-3 border-2 border-pink-600 text-pink-600 rounded-full font-semibold hover:bg-pink-50 transition"
                >
                  Tiếp Tục Mua Sắm
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Thanh Toán Chưa Hoàn Thành
              </h1>
              
              <p className="text-gray-600 mb-6">
                {error || 'Có lỗi xảy ra trong quá trình thanh toán'}
              </p>

              <div className="bg-red-50 rounded-2xl p-6 mb-8">
                <p className="text-red-700">
                  Quà tặng chưa được gửi. Vui lòng thử lại hoặc liên hệ hỗ trợ.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-pink-600 text-white rounded-full font-semibold hover:bg-pink-700 transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Thử Lại
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-600 rounded-full font-semibold hover:bg-gray-50 transition"
                >
                  Về Trang Chủ
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
