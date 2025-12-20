'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getGiftInfo, verifyGift, claimGift } from '@/lib/api-client';
import { 
  Gift, CheckCircle, AlertCircle, Loader2, PartyPopper, 
  Lock, MapPin, Phone, ArrowRight, Clock, User, Mail 
} from 'lucide-react';
import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type GiftStatus = 'pending' | 'verified' | 'claimed' | 'expired';

export default function ClaimGiftPage() {
  const params = useParams();
  const router = useRouter();
  const giftId = params.giftId as string;

  const [gift, setGift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  // Claim form
  const [claimData, setClaimData] = useState({
    address: '',
    phone: '',
  });
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Load gift info
  useEffect(() => {
    if (giftId) {
      loadGift();
    }
  }, [giftId]);

  const loadGift = async () => {
    try {
      setLoading(true);
      const data = await getGiftInfo(giftId);
      setGift(data);
      
      // Check status
      if (data.status === 'verified') {
        setVerified(true);
      } else if (data.status === 'claimed') {
        setClaimed(true);
      }
    } catch (err: any) {
      console.error('Load gift error:', err);
      setError('Không tìm thấy quà tặng hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verificationCode.length !== 6) {
      setError('Mã xác nhận phải có 6 chữ số');
      return;
    }

    try {
      setVerifying(true);
      await verifyGift(giftId, verificationCode);
      setVerified(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Mã xác nhận không đúng');
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!claimData.address || !claimData.phone) {
      setError('Vui lòng nhập địa chỉ và số điện thoại');
      return;
    }

    try {
      setClaiming(true);
      const result = await claimGift(giftId, claimData.address, claimData.phone);
      setClaimed(true);
      setOrderId(result.orderId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setClaiming(false);
    }
  };

  const getProductImage = () => {
    if (!gift?.products) return '';
    const product = gift.products;
    return product.image_url ||
      product.product_images?.find((img: any) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url ||
      '';
  };

  const isExpired = gift && new Date(gift.expires_at) < new Date();

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-pink-600" />
      </div>
    );
  }

  // Error - Gift not found
  if (error && !gift) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
        <TopBanner />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không Tìm Thấy Quà Tặng</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success - Claimed
  if (claimed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <TopBanner />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Chúc Mừng!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Bạn đã nhận quà thành công!
            </p>
            {orderId && (
              <p className="text-gray-500 mb-6">
                Mã đơn hàng: <strong>#{orderId}</strong>
              </p>
            )}

            <div className="bg-green-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 justify-center">
                {getProductImage() && (
                  <img
                    src={getProductImage()}
                    alt={gift.products.product_name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                )}
                <div className="text-left">
                  <h3 className="font-bold text-gray-900">{gift.products.product_name}</h3>
                  <p className="text-green-600 font-semibold">MIỄN PHÍ</p>
                </div>
              </div>
            </div>

            <p className="text-gray-500 mb-6">
              Đơn hàng sẽ được giao đến địa chỉ bạn đã cung cấp trong 2-3 ngày làm việc.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition"
            >
              Khám Phá Thêm Sản Phẩm
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Already claimed
  if (gift?.status === 'claimed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <TopBanner />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quà Đã Được Nhận</h1>
            <p className="text-gray-600 mb-6">Quà tặng này đã được nhận trước đó.</p>
            <Link
              href="/shop"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Mua Sắm
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Expired
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <TopBanner />
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Quà Đã Hết Hạn</h1>
            <p className="text-gray-600 mb-6">
              Rất tiếc, quà tặng này đã hết hạn vào {new Date(gift.expires_at).toLocaleDateString('vi-VN')}.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-pink-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Khám Phá Shop
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      <TopBanner />
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Gift Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-8 text-white text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h1 className="text-3xl font-bold mb-2">Bạn Có Quà Tặng!</h1>
            <p className="opacity-90">Từ {gift.sender_name}</p>
          </div>

          <div className="p-8">
            {/* Sender message */}
            {gift.sender_message && (
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 mb-8">
                <p className="text-lg text-gray-700 italic text-center">
                  "{gift.sender_message}"
                </p>
                <p className="text-right text-pink-600 mt-2 font-semibold">
                  — {gift.sender_name}
                </p>
              </div>
            )}

            {/* Product */}
            <div className="flex flex-col sm:flex-row gap-6 items-center bg-gray-50 rounded-2xl p-6 mb-8">
              <div className="w-40 h-40 bg-white rounded-2xl overflow-hidden shadow flex-shrink-0">
                {getProductImage() ? (
                  <img
                    src={getProductImage()}
                    alt={gift.products?.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Gift className="w-16 h-16" />
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {gift.products?.product_name}
                </h2>
                <p className="text-3xl font-bold text-pink-600">
                  {(gift.products?.sale_price || gift.products?.price)?.toLocaleString('vi-VN')}₫
                </p>
                <p className="text-green-600 font-semibold mt-2">🎉 MIỄN PHÍ CHO BẠN!</p>
              </div>
            </div>

            {/* Expiry warning */}
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-3 rounded-xl mb-8">
              <Clock className="w-5 h-5 flex-shrink-0" />
              <p>
                Quà có hiệu lực đến: <strong>{new Date(gift.expires_at).toLocaleDateString('vi-VN')}</strong>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Step 1: Verify */}
            {!verified && (
              <div className="border-2 border-pink-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-pink-500" />
                  Bước 1: Nhập Mã Xác Nhận
                </h3>
                <p className="text-gray-600 mb-4">
                  Mã xác nhận 6 số đã được gửi trong email. Vui lòng kiểm tra hộp thư.
                </p>
                <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 px-6 py-4 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="000000"
                  />
                  <button
                    type="submit"
                    disabled={verifying || verificationCode.length !== 6}
                    className="px-8 py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Xác Nhận
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Claim */}
            {verified && !claimed && (
              <div className="border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Xác nhận thành công!</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-pink-500" />
                  Bước 2: Nhập Địa Chỉ Nhận Quà
                </h3>

                <form onSubmit={handleClaim} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={claimData.phone}
                        onChange={(e) => setClaimData({ ...claimData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="0901234567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ nhận hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                      <textarea
                        value={claimData.address}
                        onChange={(e) => setClaimData({ ...claimData, address: e.target.value })}
                        rows={3}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={claiming}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {claiming ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Nhận Quà Ngay
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
