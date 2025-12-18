'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchRootCategories, fetchChildCategories } from '@/lib/api-client';

interface Category {
  category_id: number;
  category_name: string;
  category_slug: string;
  parent_category_id: number | null;
  description: string;
  image_url: string;
  icon_name: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

const CategoriesPage: React.FC = () => {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadRootCategories();
  }, []);

  const loadRootCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchRootCategories();
      if (Array.isArray(data)) {
        setRootCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildCategories = async (parentId: number, category: Category) => {
    try {
      setSelectedCategory(category);
      const data = await fetchChildCategories(parentId);
      if (Array.isArray(data)) {
        setChildCategories(data);
      }
    } catch (error) {
      console.error('Error loading child categories:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-black text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">Ưu đãi GoatTech: Mua 4 ốp - Trả tiền 2 ốp</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
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
              <button className="relative">
                <Heart className="w-6 h-6" />
              </button>

              <Link href="/account">
                <User className="w-6 h-6" />
              </Link>

              <Link href="/shop" className="relative">
                <ShoppingCart className="w-6 h-6" />
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t">
            <Link href="/" className="text-sm font-medium hover:text-pink-600">Trang Chủ</Link>
            <Link href="/shop" className="text-sm font-medium hover:text-pink-600">Cửa Hàng</Link>
            <Link href="/categories" className="text-sm font-medium text-pink-600">Danh Mục</Link>
            <Link href="/about" className="text-sm font-medium hover:text-pink-600">Về Chúng Tôi</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-pink-600">Liên Hệ</Link>
            <Link href="/promotions" className="text-sm font-medium hover:text-pink-600">Khuyến Mại</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Danh Mục Sản Phẩm</h1>
          <p className="text-gray-600">Khám phá các danh mục ốp lưng và phụ kiện điện thoại</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl">Đang tải...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Root Categories - Left Side */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">Danh Mục Chính</h2>
              <div className="space-y-3">
                {rootCategories.map((category) => (
                  <button
                    key={category.category_id}
                    onClick={() => loadChildCategories(category.category_id, category)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      selectedCategory?.category_id === category.category_id
                        ? 'border-pink-600 bg-pink-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{category.category_name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Child Categories - Right Side */}
            <div className="lg:col-span-2">
              {selectedCategory ? (
                <>
                  <h2 className="text-2xl font-bold mb-6">
                    {selectedCategory.category_name}
                  </h2>
                  {childCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {childCategories.map((category) => (
                        <Link
                          key={category.category_id}
                          href={`/shop?category=${category.category_slug}`}
                          className="group bg-white rounded-lg border-2 border-gray-200 hover:border-pink-600 transition p-6"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-600">
                                {category.category_name}
                              </h3>
                              <p className="text-sm text-gray-600">{category.description}</p>
                            </div>
                            <span className="text-2xl">{category.icon_name || '📱'}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg border-2 border-gray-200">
                      <p className="text-gray-600">Chưa có danh mục con</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-lg border-2 border-gray-200">
                  <p className="text-gray-600 text-lg">
                    ← Chọn một danh mục bên trái để xem chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Ốp Lưng Theo Hãng</h3>
            <p className="mb-4">iPhone, Samsung, Xiaomi, OPPO...</p>
            <Link href="/shop?filter=brand" className="inline-block bg-white text-pink-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              Xem Ngay
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Bộ Sưu Tập Độc Quyền</h3>
            <p className="mb-4">Thiết kế độc đáo, phong cách riêng</p>
            <Link href="/shop?filter=collection" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              Khám Phá
            </Link>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-teal-600 text-white p-8 rounded-2xl">
            <h3 className="text-2xl font-bold mb-4">Phụ Kiện Cao Cấp</h3>
            <p className="mb-4">Kính cường lực, dây đeo, charm...</p>
            <Link href="/shop?filter=accessories" className="inline-block bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100">
              Mua Sắm
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">GoatTech</h3>
            <p className="text-gray-400">Ốp lưng cao cấp, phong cách Việt Nam</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/contact">Liên Hệ</Link></li>
              <li><Link href="/shipping">Vận Chuyển</Link></li>
              <li><Link href="/return">Đổi Trả</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Về Chúng Tôi</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about">Giới Thiệu</Link></li>
              <li><Link href="/careers">Tuyển Dụng</Link></li>
              <li><Link href="/press">Báo Chí</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo Dõi</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>&copy; 2024 GoatTech Vietnam. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CategoriesPage;
