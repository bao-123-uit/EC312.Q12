// File: fontend/src/components/home/PromoSection.tsx

'use client';

import { useState } from 'react';

interface PromoSectionProps {
  title?: string;
  subtitle?: string;
  onSubscribe?: (email: string) => void;
}

export default function PromoSection({
  title = 'Tham Gia Nhóm GoatTech',
  subtitle = 'Nhận 15% giảm giá cho đơn hàng đầu tiên + ưu đãi độc quyền',
  onSubscribe,
}: PromoSectionProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSubscribe?.(email);
      setEmail('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">{title}</h2>
        <p className="text-xl mb-8">{subtitle}</p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
            className="px-4 py-3 rounded-lg text-gray-900 flex-1"
            required
          />
          <button
            type="submit"
            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Đăng Ký
          </button>
        </form>
      </div>
    </div>
  );
}