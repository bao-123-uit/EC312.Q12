'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, ArrowLeft, Receipt } from 'lucide-react';
import Link from 'next/link';

interface PaymentResult {
  resultCode?: string;
  orderId?: string;
  message?: string;
  transId?: string;
  amount?: string;
}

const PaymentResultPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PaymentResult>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');
    const transId = searchParams.get('transId');
    const amount = searchParams.get('amount');

    setResult({
      resultCode: resultCode || undefined,
      orderId: orderId || undefined,
      message: message || undefined,
      transId: transId || undefined,
      amount: amount || undefined,
    });
    setLoading(false);
  }, [searchParams]);

  const isSuccess = result.resultCode === '0';
  const isPending = result.resultCode === '9000';
  const isFailed = result.resultCode && result.resultCode !== '0' && result.resultCode !== '9000';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
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
            {isFailed && (
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
            )}
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold text-center mb-2">
            {isSuccess && <span className="text-green-600">Thanh Toán Thành Công!</span>}
            {isPending && <span className="text-yellow-600">Đang Xử Lý</span>}
            {isFailed && <span className="text-red-600">Thanh Toán Thất Bại</span>}
          </h1>

          {/* Thông báo */}
          <p className="text-gray-600 text-center mb-8">
            {isSuccess && 'Cảm ơn bạn đã mua hàng tại GoatTech. Đơn hàng của bạn đã được xác nhận.'}
            {isPending && 'Giao dịch đang được xử lý. Vui lòng đợi trong giây lát.'}
            {isFailed && result.message || 'Giao dịch không thành công. Vui lòng thử lại.'}
          </p>

          {/* Thông tin chi tiết */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 space-y-4">
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <Receipt className="w-5 h-5" />
              <span className="font-semibold">Chi Tiết Giao Dịch</span>
            </div>

            {result.orderId && (
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{result.orderId}</span>
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
                {isFailed && 'Thất bại'}
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
                href="/account"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Xem Đơn Hàng
              </Link>
            )}

            {isFailed && (
              <button 
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Thử Lại
              </button>
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
