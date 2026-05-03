'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Heart, Search, Menu, Tag, Clock, Percent, Gift, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchCategories, fetchPromotions } from '@/lib/api-client';

interface Deal {
  id: number;
  title: string;
  description: string;
  discount: string;
  code: string;
  image: string;
  endDate: string;
  tag?: string;
}

const PromotionsPage: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [devices, setDevices] = useState<string[]>(['iPhone 17 Pro Max']);
  const [featuredDeals, setFeaturedDeals] = useState<Deal[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        if (Array.isArray(data) && data.length > 0) {
          const categoryNames = data.map((cat: any) => cat.category_name);
          setDevices(categoryNames);
          setSelectedDevice(categoryNames[0]);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await fetchPromotions();
        setFeaturedDeals(Array.isArray(data?.featured) ? data.featured : []);
        setDeals(Array.isArray(data?.deals) ? data.deals : []);
      } catch (error) {
        console.error('Error loading promotions:', error);
      } finally {
        setIsLoadingPromotions(false);
      }
    };
    loadPromotions();
  }, []);

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
  };

  const copyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const featuredFallbackImages = [
    '/about1.jpg',
    '/about2.jpg',
    '/about3.jpg',
  ];

  const dealFallbackImages = [
    '/about4.jpg',
    '/about1.jpg',
    '/SP001.png',
  ];

  const placeholderImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' font-size='20' fill='%239ca3af' dominant-baseline='middle' text-anchor='middle'>No%20Image</text></svg>";

  const formatBadgeDiscount = (value?: string) => {
    if (!value) return '';
    const trimmed = value.trim();
    if (/^[0-9]+(\.[0-9]+)?%?$/.test(trimmed)) {
      return `-${trimmed}`;
    }
    return trimmed;
  };

  const normalizeImageUrl = (value?: string) => {
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : '';
  };

  const resolveFeaturedImage = (_deal: Deal, index: number) =>
    featuredFallbackImages[index % featuredFallbackImages.length] || placeholderImage;

  const resolveDealImage = (_deal: Deal, index: number) =>
    dealFallbackImages[index % dealFallbackImages.length] || placeholderImage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Currency Modal */}
      {isCurrencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsCurrencyModalOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">CHỌN LOẠI TIỀN TỆ</h2>
              <button onClick={() => setIsCurrencyModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-gray-700">QUỐC GIA/KHU VỰC:</label>
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="USD">United States (USD $)</option>
                <option value="VND">Việt Nam (VND ₫)</option>
              </select>
            </div>

            <button 
              onClick={() => setIsCurrencyModalOpen(false)}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              ÁP DỤNG
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-semibold animate-pulse">
        <div className="max-w-7xl mx-auto">
          🔥 KHUYẾN MÃI ĐẶC BIỆT - GIẢM ĐẾN 50% - MUA NGAY KẺO LỠ! 🔥
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden">
                <Menu className="w-6 h-6" />
              </button>
              <button className="lg:hidden">
                <Search className="w-6 h-6" />
              </button>
            </div>

            <Link href="/" className="text-2xl font-bold tracking-wider">
              GoatTech
            </Link>

            <div className="flex items-center gap-4">
              <button className="hidden lg:block px-4 py-2 text-sm font-medium border rounded-lg" onClick={() => setIsCurrencyModalOpen(true)}>
                {selectedCurrency} {selectedCurrency === 'USD' ? '$' : '₫'}
              </button>

              <select 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="hidden lg:block px-4 py-2 border rounded-lg text-sm"
              >
                {devices.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>

              <button className="relative">
                <Heart className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <Link href="/account">
                <User className="w-6 h-6" />
              </Link>

              <button className="relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t">
            <Link href="/" className="text-sm font-medium hover:text-pink-600">Trang Chủ</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-pink-600">Cửa Hàng</Link>
            {/* <button className="text-sm font-medium hover:text-pink-600">Bộ Sưu Tập</button> */}
            <Link href="/about" className="text-sm font-medium hover:text-pink-600">Về Chúng Tôi</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-pink-600">Liên Hệ</Link>
            <Link href="/promotions" className="text-sm font-medium text-red-600">Khuyến Mại</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/20 px-6 py-2 rounded-full mb-4">
            <span className="font-bold">⚡ SALE LỚN THÁNG 12</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Khuyến Mãi Đặc Biệt</h1>
          <p className="text-xl md:text-2xl mb-8">
            Tiết kiệm đến 50% cho tất cả sản phẩm - Ưu đãi có hạn!
          </p>
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-1">50+</div>
              <div className="text-sm">Mã Giảm Giá</div>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div>
              <div className="text-4xl font-bold mb-1">500K+</div>
              <div className="text-sm">Khách Đã Tiết Kiệm</div>
            </div>
            <div className="w-px h-12 bg-white/30"></div>
            <div>
              <div className="text-4xl font-bold mb-1">-50%</div>
              <div className="text-sm">Giảm Tối Đa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Deals */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Ưu Đãi Nổi Bật</h2>
        {isLoadingPromotions ? (
          <div className="text-center text-gray-600">Đang tải ưu đãi...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDeals.map((deal, index) => (
              <div key={`${deal.id}-${index}`} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition group">
              <div className="relative overflow-hidden">
                {deal.tag && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
                    {deal.tag}
                  </span>
                )}
                {deal.discount && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black w-20 h-20 rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-lg">
                    {formatBadgeDiscount(deal.discount)}
                  </div>
                )}
                <img
                  src={resolveFeaturedImage(deal, index)}
                  alt={deal.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  onError={(event) => {
                    const fallback = featuredFallbackImages[index % featuredFallbackImages.length];
                    if (event.currentTarget.src !== fallback) {
                      event.currentTarget.src = fallback;
                      return;
                    }
                    if (event.currentTarget.src !== placeholderImage) {
                      event.currentTarget.src = placeholderImage;
                    }
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
                <p className="text-gray-600 mb-4">{deal.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>Hết hạn: {deal.endDate}</span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">MÃ GIẢM GIÁ:</div>
                      <div className="text-xl font-bold text-purple-600">{deal.code || 'N/A'}</div>
                    </div>
                    <button
                      onClick={() => copyCode(deal.code)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
                      disabled={!deal.code}
                    >
                      {copiedCode === deal.code ? '✓ Đã Copy' : 'Copy'}
                    </button>
                  </div>
                </div>

                <Link
                  href="/shop"
                  className="block w-full bg-black text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  Mua Ngay
                </Link>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* All Deals */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Tất Cả Ưu Đãi</h2>
          {isLoadingPromotions ? (
            <div className="text-center text-gray-600">Đang tải ưu đãi...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {deals.map((deal, index) => (
                <div key={`${deal.id}-${index}`} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border-2 border-gray-100 hover:border-pink-300 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    {deal.discount && (
                      <div className="bg-gradient-to-br from-pink-500 to-orange-500 text-white w-16 h-16 rounded-xl flex items-center justify-center font-bold shadow-lg">
                        {formatBadgeDiscount(deal.discount)}
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  </div>

                  <img
                    src={resolveDealImage(deal, index)}
                    alt={deal.title}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={(event) => {
                      const fallback = dealFallbackImages[index % dealFallbackImages.length];
                      if (event.currentTarget.src !== fallback) {
                        event.currentTarget.src = fallback;
                        return;
                      }
                      if (event.currentTarget.src !== placeholderImage) {
                        event.currentTarget.src = placeholderImage;
                      }
                    }}
                  />

                  <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{deal.description}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Đến {deal.endDate || 'N/A'}</span>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3 mb-4 border-2 border-dashed border-gray-300">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-600">{deal.code || 'N/A'}</span>
                      <button
                        onClick={() => copyCode(deal.code)}
                        className="text-pink-600 hover:text-pink-700 text-sm font-semibold disabled:opacity-60"
                        disabled={!deal.code}
                      >
                        {copiedCode === deal.code ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <Link
                    href="/shop"
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-600 to-orange-600 text-white py-2 rounded-lg font-semibold hover:from-pink-700 hover:to-orange-700 transition"
                  >
                    Áp Dụng Ngay <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* How to Use */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Cách Sử Dụng Mã Giảm Giá</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl font-bold text-purple-600">1</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Chọn Sản Phẩm</h3>
            <p className="text-gray-600">Thêm sản phẩm yêu thích vào giỏ hàng</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl font-bold text-blue-600">2</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Copy Mã</h3>
            <p className="text-gray-600">Click nút Copy để sao chép mã giảm giá</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl font-bold text-green-600">3</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Nhập Mã</h3>
            <p className="text-gray-600">Dán mã vào ô "Mã giảm giá" khi thanh toán</p>
          </div>
          <div className="text-center">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-3xl font-bold text-orange-600">4</div>
            </div>
            <h3 className="font-semibold text-lg mb-2">Tiết Kiệm</h3>
            <p className="text-gray-600">Tận hưởng giá ưu đãi và hoàn tất đơn hàng</p>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <Gift className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-4xl font-bold mb-4">Đăng Ký Nhận Ưu Đãi</h2>
          <p className="text-xl mb-8">Nhận mã giảm giá 15% cho đơn hàng đầu tiên + thông báo ưu đãi độc quyền</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="px-4 py-3 rounded-lg text-gray-900 flex-1"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition">
              Đăng Ký Ngay
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">GoatTech</h3>
              <p className="text-gray-400">Ốp điện thoại cao cấp và phụ kiện công nghệ</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cửa Hàng</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop" className="hover:text-white">Ốp iPhone</Link></li>
                <li><Link href="/shop" className="hover:text-white">Phụ Kiện</Link></li>
                <li><Link href="/shop" className="hover:text-white">Hàng Mới Về</Link></li>
                <li><Link href="/promotions" className="hover:text-white">Khuyến Mại</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white">Liên Hệ Chúng Tôi</Link></li>
                <li><button className="hover:text-white text-left">Thông Tin Vận Chuyển</button></li>
                <li><button className="hover:text-white text-left">Chính Sách Hoàn Hàng</button></li>
                <li><button className="hover:text-white text-left">Câu Hỏi Thường Gặp</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Instagram</button></li>
                <li><button className="hover:text-white text-left">Facebook</button></li>
                <li><button className="hover:text-white text-left">TikTok</button></li>
                <li><button className="hover:text-white text-left">YouTube</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoatTech - Ốp Điện Thoại Số 1 Việt Nam. Bảo Lưu Mọi Quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PromotionsPage;
