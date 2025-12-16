'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Heart, Search, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchCategories, loginCustomer } from '@/lib/api-client';

const AccountPage: React.FC = () => {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devices, setDevices] = useState<string[]>(['iPhone 17 Pro Max']);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginCustomer(email, password);
      
      if (result.success) {
        // Lưu thông tin user vào localStorage
        const user = result.customer || result.user;
        localStorage.setItem('customer', JSON.stringify(user));
        
        // Kiểm tra role admin
        const isAdmin = result.role === 'admin' || 
                        user?.role === 'admin' || 
                        user?.email?.toLowerCase().includes('admin');
        
        localStorage.setItem('userRole', isAdmin ? 'admin' : 'customer');
        
        // Hiển thị thông báo
        alert(`Đăng nhập thành công với: ${email}`);
        
        // Redirect dựa trên role
        if (isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        alert(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  const handleCreateAccount = () => {
    window.location.href = '/register';
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Currency Modal */}
      {isCurrencyModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setIsCurrencyModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                CHỌN LOẠI TIỀN TỆ
              </h2>
              <button
                onClick={() => setIsCurrencyModalOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2 text-slate-700">
                QUỐC GIA/KHU VỰC:
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                value={selectedCurrency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="USD">United States (USD $)</option>
                <option value="VND">Việt Nam (VND ₫)</option>
              </select>
            </div>

            <button
              onClick={() => setIsCurrencyModalOpen(false)}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              ÁP DỤNG
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">
            Ưu đãi GoatTech: Mua 4 ốp - Trả tiền 2 ốp
          </span>
        </div>
      </div>

      {/* Header */}
    <header className="bg-slate-900 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-200 hover:text-pink-400">
              <Menu className="w-6 h-6" />
            </button>
            <button className="lg:hidden text-slate-200 hover:text-pink-400">
              <Search className="w-6 h-6" />
            </button>
          </div>

          <Link
            href="/"
            className="text-2xl font-bold tracking-wider text-white hover:text-pink-400 transition"
          >
            GoatTech
          </Link>

          <div className="flex items-center gap-4">
            <button
              className="hidden lg:block px-4 py-2 text-sm font-medium border border-slate-600 text-slate-200 rounded-lg hover:border-pink-500 hover:text-pink-400 transition"
              onClick={() => setIsCurrencyModalOpen(true)}
            >
              🌍 {selectedCurrency} {selectedCurrency === 'USD' ? '$' : '₫'}
            </button>

            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="hidden lg:block px-4 py-2 border border-slate-600 bg-slate-900 text-slate-200 rounded-lg text-sm focus:outline-none focus:border-pink-500"
            >
              {devices.map((device) => (
                <option key={device} value={device} className="text-black">
                  {device}
                </option>
              ))}
            </select>

            <button className="relative text-slate-200 hover:text-pink-400 transition">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button className="text-slate-200 hover:text-pink-400 transition">
              <User className="w-6 h-6" />
            </button>

            <button className="relative text-slate-200 hover:text-pink-400 transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-700">
          <Link href="/" className="text-sm font-medium text-slate-200 hover:text-pink-400">
            Trang Chủ
          </Link>
          <Link href="/shop" className="text-sm font-medium text-slate-200 hover:text-pink-400">
            Cửa Hàng
          </Link>
          <button className="text-sm font-medium text-slate-200 hover:text-pink-400">
            Bộ Sưu Tập
          </button>
          <Link href="/about" className="text-sm font-medium text-slate-200 hover:text-pink-400">
            Về Chúng Tôi
          </Link>
          <Link href="/contact" className="text-sm font-medium text-slate-200 hover:text-pink-400">
            Liên Hệ
          </Link>
          <Link
            href="/promotions"
            className="text-sm font-semibold text-pink-500 hover:text-pink-400"
          >
            Khuyến Mại
          </Link>
        </nav>
      </div>
    </header>


      {/* Hero Banner */}
      <div className="relative w-full h-[400px] bg-slate-100 overflow-hidden">
        <div className="flex items-center justify-center h-full gap-0 px-4">
          <img src="/banneraccount.jpg" alt="Left Banner" className="h-full w-auto object-contain" />
          <img src="/banneraccount.jpg" alt="Center Banner" className="h-full w-auto object-contain" />
          <img src="/banneraccount.jpg" alt="Right Banner" className="h-full w-auto object-contain" />
        </div>
      </div>

      {/* Account Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-slate-900">
              CHÀO MỪNG TRỞ LẠI
            </h1>
            <p className="text-slate-600 mb-8">
              Đăng nhập để xem đơn hàng và quản lý tài khoản của bạn.
            </p>

            <form onSubmit={handleSignIn}>
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Địa chỉ Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-slate-700">
                  Mật khẩu:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition mb-4"
              >
                ĐĂNG NHẬP
              </button>

              <button
                type="button"
                className="w-full text-sm text-slate-500 hover:text-pink-500 underline"
              >
                Quên mật khẩu?
              </button>
            </form>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4 text-slate-900">
              TẠO TÀI KHOẢN
            </h1>
            <p className="text-slate-600 mb-8">
              Tạo tài khoản GoatTech mới để theo dõi đơn hàng và quản lý tài khoản.
            </p>

            <button
              onClick={handleCreateAccount}
              className="w-full bg-slate-900 text-white py-4 rounded-lg font-semibold hover:bg-slate-800 transition text-lg"
            >
              TẠO TÀI KHOẢN
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">GoatTech</h3>
              <p className="text-slate-400">
                Ốp điện thoại cao cấp và phụ kiện công nghệ
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Cửa Hàng</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/shop" className="hover:text-pink-500 block">Ốp iPhone</Link></li>
                <li><Link href="/shop" className="hover:text-pink-500 block">Phụ Kiện</Link></li>
                <li><Link href="/shop" className="hover:text-pink-500 block">Hàng Mới Về</Link></li>
                <li><Link href="/promotions" className="hover:text-pink-500 block">Khuyến Mại</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/contact" className="hover:text-pink-500 block">Liên Hệ Chúng Tôi</Link></li>
                <li><button className="hover:text-pink-500 text-left">Thông Tin Vận Chuyển</button></li>
                <li><button className="hover:text-pink-500 text-left">Chính Sách Hoàn Hàng</button></li>
                <li><button className="hover:text-pink-500 text-left">Câu Hỏi Thường Gặp</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
              <ul className="space-y-2 text-slate-400">
                <li><button className="hover:text-pink-500 text-left">Instagram</button></li>
                <li><button className="hover:text-pink-500 text-left">Facebook</button></li>
                <li><button className="hover:text-pink-500 text-left">TikTok</button></li>
                <li><button className="hover:text-pink-500 text-left">YouTube</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>
              &copy; 2024 GoatTech - Ốp Điện Thoại Số 1 Việt Nam. Bảo Lưu Mọi Quyền.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

};

export default AccountPage;
