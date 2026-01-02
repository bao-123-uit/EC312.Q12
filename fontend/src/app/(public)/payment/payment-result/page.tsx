'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, Receipt, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { verifyPayOSReturn } from '@/lib/api/payment.api';

interface PaymentResult {
  resultCode?: string;
  orderId?: string;
  orderNumber?: string;
  message?: string;
  transId?: string;
  amount?: string;
  gateway?: string;
  // PayOS specific
  orderCode?: string;
  status?: string;
  isPaid?: boolean;
}

const PaymentResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult>({});
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const gateway = searchParams.get('gateway');
    const orderNumber = searchParams.get('orderNumber');
    
    // MoMo params
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');
    const transId = searchParams.get('transId');
    const amount = searchParams.get('amount');
    
    // PayOS params
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const code = searchParams.get('code');
    const cancel = searchParams.get('cancel');

    // Xử lý PayOS
    if (gateway === 'payos' && orderCode && orderNumber) {
      setVerifying(true);
      verifyPayOSReturn(orderCode, orderNumber)
        .then((response) => {
          console.log('PayOS verify response:', response);
          setResult({
            gateway: 'payos',
            orderNumber,
            orderCode,
            isPaid: response.isPaid,
            status: response.isPaid ? 'PAID' : (cancel === 'true' ? 'CANCELLED' : 'PENDING'),
            amount: response.paymentInfo?.amount?.toString(),
            message: response.isPaid ? 'Thanh toán thành công' : (cancel === 'true' ? 'Đã hủy thanh toán' : 'Thanh toán đang xử lý'),
          });
        })
        .catch((err) => {
          console.error('PayOS verify error:', err);
          setResult({
            gateway: 'payos',
            orderNumber,
            orderCode,
            isPaid: false,
            status: cancel === 'true' ? 'CANCELLED' : 'ERROR',
            message: cancel === 'true' ? 'Đã hủy thanh toán' : 'Lỗi xác minh thanh toán',
          });
        })
        .finally(() => {
          setVerifying(false);
          setLoading(false);
        });
    } else {
      // MoMo hoặc các gateway khác
      setResult({
        gateway: gateway || 'momo',
        resultCode: resultCode || undefined,
        orderId: orderId || orderNumber || undefined,
        orderNumber: orderNumber || undefined,
        message: message || undefined,
        transId: transId || undefined,
        amount: amount || undefined,
      });
      setLoading(false);
    }
  }, [searchParams]);

  // Xác định trạng thái
  const isPayOS = result.gateway === 'payos';
  const isSuccess = isPayOS ? result.isPaid : result.resultCode === '0';
  const isPending = isPayOS 
    ? result.status === 'PENDING' 
    : result.resultCode === '9000';
  const isCancelled = isPayOS && result.status === 'CANCELLED';
  const isFailed = isPayOS 
    ? !result.isPaid && !isCancelled && result.status !== 'PENDING'
    : (result.resultCode && result.resultCode !== '0' && result.resultCode !== '9000');

  // Tự động chuyển về trang chủ sau 3 giây khi thanh toán thành công
  useEffect(() => {
    if (isSuccess && !loading && !verifying) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, loading, verifying, router]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-pink-600 animate-spin mb-4" />
        <p className="text-gray-600">Đang xác minh thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header với logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Goat
            </span>
            <span className="text-gray-800">Tech</span>
          </Link>
        </div>

        {/* Card kết quả */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Icon trạng thái */}
          <div className="text-center mb-6">
            {isSuccess && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
            {isPending && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            )}
            {(isFailed || isCancelled) && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold text-center mb-2">
            {isSuccess && <span className="text-green-600">Thanh Toán Thành Công!</span>}
            {isPending && <span className="text-yellow-600">Đang Xử Lý</span>}
            {isCancelled && <span className="text-red-600">Đã Hủy Thanh Toán</span>}
            {isFailed && !isCancelled && <span className="text-red-600">Thanh Toán Thất Bại</span>}
          </h1>

          {/* Thông báo */}
          <p className="text-gray-600 text-center mb-4">
            {isSuccess && 'Cảm ơn bạn đã mua hàng tại GoatTech. Đơn hàng của bạn đã được xác nhận.'}
            {isPending && 'Giao dịch đang được xử lý. Vui lòng đợi trong giây lát.'}
            {isCancelled && 'Bạn đã hủy thanh toán. Đơn hàng vẫn được tạo và bạn có thể thanh toán sau.'}
            {isFailed && !isCancelled && (result.message || 'Giao dịch không thành công. Vui lòng thử lại.')}
          </p>

          {/* Thông báo chuyển hướng tự động */}
          {isSuccess && (
            <p className="text-pink-600 text-center mb-8 font-medium animate-pulse">
              🏠 Tự động chuyển về trang chủ sau 3 giây...
            </p>
          )}

          {/* Thông tin chi tiết */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Receipt className="w-5 h-5" />
              <span className="font-semibold">Chi Tiết Giao Dịch</span>
            </div>

            {/* Phương thức thanh toán */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">Phương thức:</span>
              <span className="font-semibold text-gray-800">
                {isPayOS ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs">P</span>
                    PayOS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center text-white text-xs font-bold">M</span>
                    MoMo
                  </span>
                )}
              </span>
            </div>

            {(result.orderId || result.orderNumber) && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{result.orderNumber || result.orderId}</span>
              </div>
            )}

            {result.orderCode && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã giao dịch PayOS:</span>
                <span className="font-semibold text-gray-800">{result.orderCode}</span>
              </div>
            )}

            {result.transId && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-semibold text-gray-800">{result.transId}</span>
              </div>
            )}

            {result.amount && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-pink-600 text-lg">
                  {Number(result.amount).toLocaleString('vi-VN')}₫
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-semibold ${
                isSuccess ? 'text-green-600' : 
                isPending ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {isSuccess && 'Thành công'}
                {isPending && 'Đang xử lý'}
                {isCancelled && 'Đã hủy'}
                {isFailed && !isCancelled && 'Thất bại'}
              </span>
            </div>
          </div>

          {/* Nút hành động */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/"
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-pink-700 hover:to-purple-700 transition font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Về Trang Chủ
            </Link>
            
            {isSuccess && (
              <Link 
                href={result.orderNumber ? `/order/${result.orderNumber}` : "/account"}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Xem Đơn Hàng
              </Link>
            )}

            {(isFailed || isCancelled) && result.orderNumber && (
              <Link 
                href={`/order/${result.orderNumber}`}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Xem Đơn Hàng
              </Link>
            )}
          </div>

          {/* Lưu ý */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Lưu ý:</strong> Thông tin đơn hàng đã được gửi đến email của bạn. 
                Vui lòng kiểm tra hộp thư và cả thư mục spam.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Lưu ý:</strong> Đơn hàng của bạn vẫn được lưu. 
                Bạn có thể thanh toán lại sau trong phần quản lý đơn hàng.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Cần hỗ trợ? Liên hệ: <a href="mailto:support@goattech.com" className="text-pink-600 hover:underline">support@goattech.com</a></p>
          <p className="mt-1">Hotline: <a href="tel:1900xxxx" className="text-pink-600 hover:underline">1900 xxxx</a></p>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
