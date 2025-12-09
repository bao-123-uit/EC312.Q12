'use client';

import React, { useState } from 'react';
import { ShoppingCart, User, Heart, Search, Menu } from 'lucide-react';
import Link from 'next/link';

const AccountPage: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 16e');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Đăng nhập với: ${email}`);
  };

  const handleCreateAccount = () => {
    window.location.href = '/register';
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
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

              <button>
                <User className="w-6 h-6" />
              </button>

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
            <Link href="/about" className="text-sm font-medium hover:text-pink-600">Về Chúng Tôi</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-pink-600">Liên Hệ</Link>
            <Link href="/promotions" className="text-sm font-medium text-red-600">Khuyến Mại</Link>
          </nav>
        </div>
      </header>

      {/* Hero Banner with 3 Images */}
      <div className="relative w-full h-[400px] bg-gray-200 overflow-hidden">
        <div className="flex items-center justify-center h-full gap-0 px-4">
          <img
            src="/banneraccount.jpg"
            alt="Left Banner"
            className="h-full w-auto object-contain"
          />
          <img
            src="/banneraccount.jpg"
            alt="Center Banner"
            className="h-full w-auto object-contain"
          />
          <img
            src="/banneraccount.jpg"
            alt="Right Banner"
            className="h-full w-auto object-contain"
          />
        </div>
      </div>

      {/* Account Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Sign In Section */}
          <div>
            <h1 className="text-3xl font-bold mb-4">WELCOME BACK</h1>
            <p className="text-gray-600 mb-8">
              Sign in below to view your recent order details & manage account.
            </p>

            <form onSubmit={handleSignIn}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Email address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition mb-4"
              >
                SIGN IN
              </button>

              <button
                type="button"
                className="w-full text-sm text-gray-600 hover:text-pink-600 underline"
              >
                Forgot your password?
              </button>
            </form>
          </div>

          {/* Create Account Section */}
          <div>
            <h1 className="text-3xl font-bold mb-4">CREATE AN ACCOUNT</h1>
            <p className="text-gray-600 mb-8">
              Create a new BURGA account to track orders and manage your account.
            </p>

            <button
              onClick={handleCreateAccount}
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition text-lg"
            >
              CREATE ACCOUNT
            </button>
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
                <li><Link href="/shop" className="hover:text-white text-left block">Ốp iPhone</Link></li>
                <li><Link href="/shop" className="hover:text-white text-left block">Phụ Kiện</Link></li>
                <li><Link href="/shop" className="hover:text-white text-left block">Hàng Mới Về</Link></li>
                <li><Link href="/promotions" className="hover:text-white text-left block">Khuyến Mại</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/contact" className="hover:text-white text-left block">Liên Hệ Chúng Tôi</Link></li>
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

export default AccountPage;
