'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  Star,
  Filter,
  X,
  ShoppingCart,
} from 'lucide-react';

import { fetchProducts, createMomoPayment } from '@/lib/api-client';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { useCart } from '@/app/context/cart-context';

/* ===================== TYPES ===================== */
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tag?: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

/* ===================== PAGE ===================== */
export default function ShopPage() {
  /* ---------- State ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9_999_999]);

  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());

  const { refreshCart } = useCart();

  /* ---------- Fetch products ---------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(10000);

        const mapped: Product[] = data.map((p: any, index: number) => ({
          id: p.product_id || p.id || index + 1,
          name: p.product_name || p.name || 'Sản phẩm',
          price: p.price || 0,
          image:
            p.image_url ||
            p.image ||
            'https://i.pinimg.com/1200x/f4/0a/de/f40ade8f15c8354c5eb584af2b1ebd82.jpg',
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          tag: p.is_new ? 'MỚI' : p.is_featured ? 'NỔI BẬT' : undefined,
          category:
            p.category_id >= 1 && p.category_id <= 5
              ? 'Ốp lưng'
              : p.category_id >= 6 && p.category_id <= 8
              ? 'Cường lực màn hình'
              : 'Tất Cả',
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Load products error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ---------- Derived data ---------- */
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        p =>
          selectedCategory === 'Tất Cả' || p.category === selectedCategory,
      )
      .filter(
        p => p.price >= priceRange[0] && p.price <= priceRange[1],
      )
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          default:
            return b.id - a.id;
        }
      });
  }, [products, selectedCategory, priceRange, sortBy]);

  const cartCount = cartItems.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);

  /* ---------- Handlers ---------- */
  const toggleWishlist = (productId: number) => {
    setWishedProducts(prev => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================== BREADCRUMB ===================== */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 text-sm text-gray-600 flex gap-2">
          <Link href="/" className="hover:text-pink-600">
            Trang Chủ
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Cửa Hàng</span>
        </div>
      </div>

      {/* ===================== MAIN ===================== */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* ---------- FILTER SIDEBAR ---------- */}
        <aside
          className={`w-full lg:w-64 ${
            isFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between mb-6">
              <h2 className="font-bold">Bộ Lọc</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Loại Sản Phẩm</h3>
              {SHOP_CATEGORIES.map(c => (
                <label
                  key={c.name}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={selectedCategory === c.name}
                    onChange={() => setSelectedCategory(c.name)}
                  />
                  <span>{c.icon}</span>
                  <span>{c.name}</span>
                </label>
              ))}
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold mb-4">Sắp Xếp</h3>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="newest">Mới Nhất</option>
                <option value="price-low">Giá Thấp → Cao</option>
                <option value="price-high">Giá Cao → Thấp</option>
                <option value="rating">Đánh Giá Cao</option>
              </select>
            </div>
          </div>
        </aside>

        {/* ---------- PRODUCTS ---------- */}
        <main className="flex-1">
          <div className="mb-6 flex justify-between lg:hidden">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Bộ Lọc
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Hiển thị{' '}
            <span className="font-semibold">{filteredProducts.length}</span> sản
            phẩm
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
              >
                <div className="relative">
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
                      {product.tag}
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition"
                  />

                  <button
                    onClick={e => {
                      e.preventDefault();
                      toggleWishlist(product.id);
                    }}
                    className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        wishedProducts.has(product.id)
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <span className="text-xs text-gray-500 uppercase">
                    {product.category}
                  </span>

                  <h3 className="font-semibold line-clamp-2 mb-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating}</span>
                    <span className="text-sm text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <AddToCartButton productId={product.id} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              Không tìm thấy sản phẩm phù hợp
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
