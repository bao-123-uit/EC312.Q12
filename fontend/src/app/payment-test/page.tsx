'use client';

import { useState } from 'react';
import { createMomoPayment, checkMomoPaymentStatus } from '@/lib/api-client';
import { CreditCard, DollarSign, FileText, Search } from 'lucide-react';

export default function PaymentTest() {
  const [amount, setAmount] = useState('50000');
  const [orderInfo, setOrderInfo] = useState('Thanh toán đơn hàng GoatTech');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check status
  const [checkOrderId, setCheckOrderId] = useState('');
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResponse, setCheckResponse] = useState<any>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await createMomoPayment({
        amount,
        orderInfo,
      });
      
      setResponse(result);
      console.log('✅ Payment Created:', result);
      
      // Nếu có payUrl, tự động chuyển hướng
      if (result?.data?.payUrl) {
        setTimeout(() => {
          window.open(result.data.payUrl, '_blank');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi khi tạo thanh toán');
      console.error('❌ Payment Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!checkOrderId.trim()) {
      alert('Vui lòng nhập Order ID');
      return;
    }

    setCheckLoading(true);
    setCheckResponse(null);

    try {
      const result = await checkMomoPaymentStatus(checkOrderId);
      setCheckResponse(result);
      console.log('📊 Status:', result);
    } catch (err: any) {
      console.error('❌ Check Status Error:', err);
      setCheckResponse({ error: err.message });
    } finally {
      setCheckLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          Test Thanh Toán MoMo
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Card tạo thanh toán */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-pink-100 rounded-xl">
                <CreditCard className="w-6 h-6 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Tạo Thanh Toán</h2>
            </div>

            {/* Nhập số tiền */}
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                <DollarSign className="w-4 h-4" />
                Số tiền (VND)
              </label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                placeholder="50000"
              />
            </div>

            {/* Nhập mô tả đơn hàng */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700">
                <FileText className="w-4 h-4" />
                Mô tả đơn hàng
              </label>
              <input
                type="text"
                value={orderInfo}
                onChange={(e) => setOrderInfo(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pink-500 focus:outline-none transition"
                placeholder="Thanh toán đơn hàng GoatTech"
              />
            </div>

            {/* Nút thanh toán */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg"
            >
              {loading ? '⏳ Đang xử lý...' : '💳 Tạo Thanh Toán MoMo'}
            </button>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
                <strong>❌ Lỗi:</strong> {error}
              </div>
            )}

            {/* Hiển thị kết quả */}
            {response && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <strong className="text-green-700">✅ Thành công!</strong>
                {response.data?.payUrl && (
                  <div className="mt-3">
                    <a 
                      href={response.data.payUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      🔗 Mở Link Thanh Toán
                    </a>
                  </div>
                )}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Xem chi tiết
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>

          {/* Card kiểm tra trạng thái */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Kiểm Tra Trạng Thái</h2>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Order ID
              </label>
              <input
                type="text"
                value={checkOrderId}
                onChange={(e) => setCheckOrderId(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition"
                placeholder="MOMO1234567890"
              />
            </div>

            <button
              onClick={handleCheckStatus}
              disabled={checkLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg"
            >
              {checkLoading ? '⏳ Đang kiểm tra...' : '🔍 Kiểm Tra Trạng Thái'}
            </button>

            {/* Hiển thị kết quả kiểm tra */}
            {checkResponse && (
              <div className={`mt-4 p-4 rounded-xl border-2 ${
                checkResponse.error 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                {checkResponse.error ? (
                  <div className="text-red-700">
                    <strong>❌ Lỗi:</strong> {checkResponse.error}
                  </div>
                ) : (
                  <>
                    <strong className="text-blue-700">📊 Kết quả:</strong>
                    {checkResponse.data?.resultCode === 0 && (
                      <div className="mt-2 text-green-600 font-semibold">
                        ✅ Thanh toán thành công
                      </div>
                    )}
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        Xem chi tiết
                      </summary>
                      <pre className="mt-2 text-xs overflow-auto bg-gray-100 p-2 rounded">
                        {JSON.stringify(checkResponse, null, 2)}
                      </pre>
                    </details>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hướng dẫn */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">📖 Hướng Dẫn Test</h3>
          <div className="space-y-3 text-gray-600">
            <div className="flex gap-3">
              <span className="font-bold text-pink-600">1.</span>
              <p>Nhập số tiền và mô tả, nhấn <strong>"Tạo Thanh Toán MoMo"</strong></p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-pink-600">2.</span>
              <p>Sao chép <strong>payUrl</strong> hoặc nhấn nút "Mở Link Thanh Toán"</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-pink-600">3.</span>
              <p>Trên trang MoMo test, chọn phương thức thanh toán và xác nhận</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-pink-600">4.</span>
              <p>Sau khi thanh toán, bạn sẽ được redirect về trang kết quả</p>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-pink-600">5.</span>
              <p>Sử dụng <strong>Order ID</strong> để kiểm tra trạng thái thanh toán</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Lưu ý:</strong> Đây là môi trường test của MoMo. 
              Sử dụng thông tin test được cung cấp bởi MoMo để thanh toán.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
