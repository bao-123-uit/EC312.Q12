  'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProductById, createGiftPayment, CreateGiftPaymentData } from '@/lib/api-client';
import { Gift, Heart, ArrowLeft, Send, Loader2, CheckCircle, AlertCircle, Sparkles, CreditCard } from 'lucide-react';

import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SendGiftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    senderMessage: '',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
  });

  // Load product
  useEffect(() => {
    if (productId) {
      loadProduct(parseInt(productId));
    } else {
      setLoading(false);
    }
  }, [productId]);

  const loadProduct = async (id: number) => {
    try {
      const data = await fetchProductById(id);
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.senderName || !formData.senderEmail || !formData.recipientName || !formData.recipientEmail) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!productId) {
      setError('Vui lòng chọn sản phẩm để gửi tặng');
      return;
    }

    try {
      setSending(true);
      
      const giftData: CreateGiftPaymentData = {
        senderName: formData.senderName,
        senderEmail: formData.senderEmail,
        senderMessage: formData.senderMessage,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        recipientPhone: formData.recipientPhone,
        productId: parseInt(productId),
        quantity: 1,
      };

      // Tạo thanh toán PayOS
      const result = await createGiftPayment(giftData);
      
      if (result.success && result.checkoutUrl) {
        // Chuyển đến trang thanh toán PayOS
        window.location.href = result.checkoutUrl;
      } else {
        setError('Không thể tạo thanh toán. Vui lòng thử lại.');
      }
    } catch (err: any) {
      console.error('Create gift payment error:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán');
    } finally {
      setSending(false);
    }
  };

  const getProductImage = () => {
    if (!product) return '';
    return product.image_url || 
      product.product_images?.find((img: any) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url ||
      '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <TopBanner />
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
            <Gift className="w-5 h-5" />
            <span className="font-semibold">Gửi Quà Tặng</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tặng Quà Cho Người Thân Yêu
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Chọn sản phẩm, điền thông tin người nhận và thanh toán để gửi quà
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Preview */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              Sản Phẩm Tặng
            </h2>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
              </div>
            ) : product ? (
              <div className="flex gap-6">
                <div className="w-40 h-40 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                  {getProductImage() ? (
                    <img
                      src={getProductImage()}
                      alt={product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Gift className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    {product.product_name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-pink-600">
                      {(product.sale_price || product.price).toLocaleString('vi-VN')}₫
                    </span>
                    {product.sale_price && product.sale_price < product.price && (
                      <span className="text-gray-400 line-through">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Chưa chọn sản phẩm</p>
                <Link
                  href="/shop"
                  className="inline-block bg-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-pink-700 transition"
                >
                  Chọn Sản Phẩm
                </Link>
              </div>
            )}

            {/* Gift message preview */}
            {formData.senderMessage && (
              <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6">
                <p className="text-sm text-pink-600 font-semibold mb-2">💌 Lời nhắn của bạn:</p>
                <p className="text-gray-700 italic">"{formData.senderMessage}"</p>
                <p className="text-right text-pink-600 mt-2">— {formData.senderName || 'Người gửi'}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sender Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Thông Tin Người Gửi
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email của bạn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="senderEmail"
                      value={formData.senderEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lời nhắn gửi kèm
                </label>
                <textarea
                  name="senderMessage"
                  value={formData.senderMessage}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition resize-none"
                  placeholder="Chúc mừng sinh nhật! Hy vọng bạn sẽ thích món quà này..."
                />
              </div>

              {/* Recipient Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-500" />
                  Thông Tin Người Nhận
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên người nhận <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                        placeholder="Trần Thị B"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="recipientPhone"
                        value={formData.recipientPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                        placeholder="0901234567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email người nhận <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="recipientEmail"
                      value={formData.recipientEmail}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      placeholder="nguoinhan@example.com"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      📧 Email xác nhận sẽ được gửi đến địa chỉ này
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {/* Price Info */}
              {product && (
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Giá trị quà tặng:</span>
                    <span className="text-xl font-bold text-pink-600">
                      {(product.sale_price || product.price).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={sending || !product}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Thanh Toán & Gửi Quà
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                💳 Thanh toán qua PayOS - Bạn sẽ được chuyển đến trang thanh toán
              </p>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
