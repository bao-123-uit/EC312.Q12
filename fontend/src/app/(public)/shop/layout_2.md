// File: fontend/src/app/shop/layout.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, ShoppingCart, User, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/app/context/cart-context';
// import { useAuth } from '@/app/context/auth-context';
import { useAuth } from '@/contexts/AuthContext';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout, getDisplayName } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  // Hàm đăng xuất
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-pink-400 font-medium">
            Ưu đãi GoatTech: Mua 4 ốp - Trả tiền 2 ốp
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4 text-slate-700">
              <button className="lg:hidden hover:text-pink-600 transition">
                <Menu className="w-6 h-6" />
              </button>
              <button className="lg:hidden hover:text-pink-600 transition">
                <Search className="w-6 h-6" />
              </button>
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-bold tracking-wider text-slate-900 hover:text-pink-600 transition"
            >
              GoatTech
            </Link>

            {/* Right */}
            <div className="flex items-center gap-4 text-slate-700">
              <button className="relative hover:text-pink-600 transition">
                <Heart className="w-6 h-6" />
              </button>

              {/* User section */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:text-pink-600 transition px-3 py-1.5 rounded-lg hover:bg-pink-50"
                  >
                    <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {getDisplayName().charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                      {getDisplayName()}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        href="/login"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Tài khoản của tôi
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-pink-50 hover:text-pink-600 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Đơn hàng
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="hover:text-pink-600 transition">
                  <User className="w-6 h-6" />
                </Link>
              )}

              <Link href="/shopping-cart" className="relative hover:text-pink-600 transition">
                <ShoppingCart className="w-6 h-6 cursor-pointer" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-200">
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition">
              Trang Chủ
            </Link>
            <Link href="/shop" className="text-sm font-medium text-slate-700 hover:text-pink-600 transition">
              Cửa Hàng
            </Link>
            <button className="text-sm font-medium text-slate-700 hover:text-pink-600 transition">
              Bộ Sưu Tập
            </button>
            <button className="text-sm font-medium text-slate-700 hover:text-pink-600 transition">
              Về Chúng Tôi
            </button>
            <button className="text-sm font-medium text-red-600 hover:text-red-700 transition">
              Khuyến Mại
            </button>
          </nav>
        </div>
      </header>

      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
      )}

      <main className="text-slate-800">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-white">GoatTech</h3>
              <p className="text-slate-400">Ốp điện thoại cao cấp và phụ kiện công nghệ</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Cửa Hàng</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/shop" className="hover:text-pink-400 transition">Ốp iPhone</Link></li>
                <li><Link href="/shop" className="hover:text-pink-400 transition">Phụ Kiện</Link></li>
                <li><Link href="/promotions" className="hover:text-pink-400 transition">Khuyến Mại</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Hỗ Trợ</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/contact" className="hover:text-pink-400 transition">Liên Hệ</Link></li>
                <li>Chính Sách Hoàn Hàng</li>
                <li>Câu Hỏi Thường Gặp</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Theo Dõi</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Instagram</li>
                <li>Facebook</li>
                <li>TikTok</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>© 2024 GoatTech. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}