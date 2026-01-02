
'use client';
import { createMomoPayment } from '@/lib/api-client';
import { useState } from 'react';

export default function MomoPaymentPage() {
  // Có thể lấy orderId và amount từ query params, localStorage, hoặc hardcode để test
  const [amount] = useState<number>(50000); // test mặc định
  const [orderId] = useState<string>('test_order_' + Date.now()); // test mặc định
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMomoClick = async () => {
    setLoading(true);
    try {
      const res = await createMomoPayment({
        amount,
        orderId,
      });
      setQrUrl(res.data?.payUrl || '');
    } catch (err) {
      alert('Lỗi tạo thanh toán MoMo');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <h2>Thanh toán MoMo</h2>
      <button
        style={{
          marginTop: 16,
          background: '#a50064',
          color: '#fff',
          borderRadius: 8,
          padding: '10px 24px',
          fontWeight: 600,
        }}
        onClick={handleMomoClick}
        disabled={loading}
      >
        {loading ? 'Đang tạo QR...' : 'Tạo mã QR MoMo'}
      </button>
      {qrUrl && (
        <div style={{ marginTop: 24 }}>
          <img src={qrUrl} alt="QR MoMo" style={{ width: 300 }} />
          <p>Quét mã QR bằng app MoMo để thanh toán</p>
        </div>
      )}
    </div>
  );
}
