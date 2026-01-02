'use client';
import { useState, useEffect } from 'react';
import { createMomoPayment } from '@/lib/api-client';

interface MomoPaymentButtonProps {
  amount: number;
  orderId: string;
  autoTrigger?: boolean; // Tự động gọi thanh toán khi component mount
  onPaymentCreated?: (payUrl: string) => void; // Callback khi tạo thanh toán thành công
}

export default function MomoPaymentButton({ 
  amount, 
  orderId, 
  autoTrigger = false,
  onPaymentCreated 
}: MomoPaymentButtonProps) {
  const [payUrl, setPayUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [triggered, setTriggered] = useState(false);

  const handleMomoPayment = async () => {
    // Validate amount - MoMo yêu cầu tối thiểu 1000 VNĐ
    const validAmount = Math.max(amount, 1000);
    
    setLoading(true);
    setError('');
    
    try {
      console.log('🔄 Creating MoMo payment:', { amount: validAmount, orderId });
      
      const res = await createMomoPayment({
        amount: validAmount,
        orderId,
        orderInfo: `Thanh toán quà tặng - ${orderId}`,
      });
      
      console.log('✅ MoMo response:', res);
      
      const url = res.data?.payUrl || res.payUrl || '';
      setPayUrl(url);
      
      if (url && onPaymentCreated) {
        onPaymentCreated(url);
      }
      
      // Tự động chuyển đến trang thanh toán MoMo
      if (url) {
        window.open(url, '_blank');
      } else {
        setError('Không nhận được link thanh toán từ MoMo');
      }
    } catch (err: any) {
      console.error('❌ MoMo payment error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Lỗi tạo thanh toán MoMo';
      setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    }
    setLoading(false);
  };

  // Tự động gọi thanh toán nếu autoTrigger = true (chỉ 1 lần)
  useEffect(() => {
    if (autoTrigger && amount > 0 && !triggered) {
      setTriggered(true);
      handleMomoPayment();
    }
  }, [autoTrigger, amount, triggered]);

  return (
    <div style={{ marginTop: 16, textAlign: 'center' }}>
      <button
        onClick={handleMomoPayment}
        disabled={loading}
        className="bg-[#a50064] hover:bg-[#8a0054] text-white rounded-full px-6 py-3 font-semibold transition disabled:opacity-50"
      >
        {loading ? 'Đang tạo thanh toán...' : 'Thanh toán MoMo'}
      </button>
      
      {error && (
        <p className="text-red-500 mt-2 text-sm">{error}</p>
      )}
      
      {payUrl && (
        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-2">
            Nếu không tự động chuyển, hãy{' '}
            <a 
              href={payUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-pink-600 underline"
            >
              nhấn vào đây
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
