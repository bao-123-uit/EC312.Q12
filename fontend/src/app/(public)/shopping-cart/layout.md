'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Menu, ShoppingCart, User, Heart, Router } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
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

            <Link
              href="/account"
              className="hover:text-pink-600 transition"
            >
              <User className="w-6 h-6" />
            </Link>

            <Link
              href="/shopping-cart"
              className="relative hover:text-pink-600 transition"
            >
              <ShoppingCart className="w-6 h-6 cursor-pointer" />
            </Link>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-200">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-pink-600 transition"
          >
            Trang Chủ
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium text-slate-700 hover:text-pink-600 transition"
          >
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

    {/* Page content */}
    <main className="text-slate-800">{children}</main>

    {/* Footer */}
    <footer className="bg-slate-900 text-slate-300 py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-white">
              GoatTech
            </h3>
            <p className="text-slate-400">
              Ốp điện thoại cao cấp và phụ kiện công nghệ
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">
              Cửa Hàng
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="hover:text-pink-400 transition">
                  Ốp iPhone
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-pink-400 transition">
                  Phụ Kiện
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-pink-400 transition">
                  Hàng Mới Về
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="hover:text-pink-400 transition">
                  Khuyến Mại
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">
              Hỗ Trợ
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/contact" className="hover:text-pink-400 transition">
                  Liên Hệ
                </Link>
              </li>
              <li>Thông Tin Vận Chuyển</li>
              <li>Chính Sách Hoàn Hàng</li>
              <li>Câu Hỏi Thường Gặp</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">
              Theo Dõi
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>Instagram</li>
              <li>Facebook</li>
              <li>TikTok</li>
              <li>YouTube</li>
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
