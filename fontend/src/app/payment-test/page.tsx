'use client';

import { useState } from 'react';
import { createMomoPayment } from '@/lib/api-client';

export default function PaymentTest() {
  const [amount, setAmount] = useState('50000');
  const [orderInfo, setOrderInfo] = useState('Test Payment');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await createMomoPayment(amount, orderInfo);
      setResponse(result);
      console.log('Payment Success:', result);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gọi API');
      console.error('Payment Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Test Thanh Toán MoMo</h1>

        {/* Nhập số tiền */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Số tiền (VND)</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="50000"
          />
        </div>

        {/* Nhập mô tả đơn hàng */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Mô tả</label>
          <input
            type="text"
            value={orderInfo}
            onChange={(e) => setOrderInfo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="Test Payment"
          />
        </div>

        {/* Nút thanh toán */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition"
        >
          {loading ? 'Đang xử lý...' : 'Gửi Thanh Toán'}
        </button>

        {/* Hiển thị lỗi */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {/* Hiển thị kết quả */}
        {response && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            <strong>Thành công!</strong>
            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </div>
    </main>
  );
}
