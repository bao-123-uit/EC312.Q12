'use client';

import React, { useState } from 'react';
import { ShoppingCart, User, Heart, Search, Menu, Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Link from 'next/link';

const ContactPage: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 16e');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const devices = [
    'iPhone 17 Pro Max',
    'iPhone 17 Pro',
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16e',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 14 Pro Max',
    'Samsung Galaxy S24'
  ];

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cảm ơn ${formData.name}! Chúng tôi sẽ liên hệ lại với bạn sớm.`);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
      <div className="bg-black text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Ưu đãi BURGA: Mua 4 ốp - Trả tiền 2 ốp</span>
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
              BURGA
            </Link>

            <div className="flex items-center gap-4">
              <button className="hidden lg:block px-4 py-2 text-sm font-medium border rounded-lg" onClick={() => setIsCurrencyModalOpen(true)}>
                🌍 {selectedCurrency} {selectedCurrency === 'USD' ? '$' : '₫'}
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
            <button className="text-sm font-medium hover:text-pink-600">Bộ Sưu Tập</button>
            <button className="text-sm font-medium hover:text-pink-600">Về Chúng Tôi</button>
            <button className="text-sm font-medium text-red-600">Khuyến Mại</button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên Hệ Chúng Tôi</h1>
          <p className="text-xl">Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Điện Thoại</h3>
            <p className="text-gray-600">+84 123 456 789</p>
            <p className="text-gray-600">+84 987 654 321</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Email</h3>
            <p className="text-gray-600">support@burga.vn</p>
            <p className="text-gray-600">sales@burga.vn</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Địa Chỉ</h3>
            <p className="text-gray-600">123 Nguyễn Huệ</p>
            <p className="text-gray-600">Quận 1, TP.HCM</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Giờ Làm Việc</h3>
            <p className="text-gray-600">T2 - T6: 9:00 - 18:00</p>
            <p className="text-gray-600">T7 - CN: 10:00 - 17:00</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <p className="text-gray-600 mb-8">
              Điền thông tin vào form bên dưới và chúng tôi sẽ phản hồi trong vòng 24 giờ.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Họ và Tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0123 456 789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Chủ Đề *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  required
                >
                  <option value="">Chọn chủ đề</option>
                  <option value="order">Đơn Hàng</option>
                  <option value="product">Sản Phẩm</option>
                  <option value="shipping">Vận Chuyển</option>
                  <option value="return">Hoàn Trả</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tin Nhắn *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Nội dung tin nhắn của bạn..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Gửi Tin Nhắn
              </button>
            </form>
          </div>

          {/* Map or Additional Info */}
          <div>
            <h2 className="text-3xl font-bold mb-6">Tìm Chúng Tôi</h2>
            <div className="bg-gray-200 rounded-xl overflow-hidden mb-6" style={{ height: '400px' }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4989654716707!2d106.69822631533431!3d10.772466862169026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5a8b0f0c00dbf5e6!2zTmd1eeG7hW4gSHXhu4csIFF1YW4gMSwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5o!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl">
              <h3 className="font-semibold text-lg mb-4">Câu Hỏi Thường Gặp</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">•</span>
                  <span>Thời gian giao hàng: 2-5 ngày làm việc</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">•</span>
                  <span>Chính sách đổi trả trong vòng 30 ngày</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">•</span>
                  <span>Miễn phí vận chuyển đơn hàng trên 100K</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 font-bold">•</span>
                  <span>Bảo hành 12 tháng cho tất cả sản phẩm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">BURGA</h3>
              <p className="text-gray-400">Ốp điện thoại cao cấp và phụ kiện công nghệ</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cửa Hàng</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Ốp iPhone</button></li>
                <li><button className="hover:text-white text-left">Phụ Kiện</button></li>
                <li><button className="hover:text-white text-left">Hàng Mới Về</button></li>
                <li><button className="hover:text-white text-left">Khuyến Mại</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Liên Hệ Chúng Tôi</button></li>
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
            <p>&copy; 2024 BURGA - Ốp Điện Thoại Số 1 Việt Nam. Bảo Lưu Mọi Quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
