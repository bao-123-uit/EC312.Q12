'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Star,
  Filter,
  X,
  ShoppingCart,
  Smartphone,
} from 'lucide-react';

import { fetchProducts, fetchCategoriesWithCount, createMomoPayment } from '@/lib/api-client';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { useCart } from '@/app/context/cart-context';
import { useWishlist } from '@/app/context/wishlist-context';
import { useAuth } from '@/contexts/AuthContext';

/* ===================== TYPES ===================== */
interface Product {
  id: number;
  name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  rating: number;
  reviews: number;
  tag?: string;
  category: string;
  categoryId: number;
}

interface Category {
  category_id: number;
  category_name: string;
  product_count: number;
}

interface CartItem extends Product {
  quantity: number;
}

/* ===================== PAGE ===================== */
export default function ShopPage() {
  /* ---------- State ---------- */
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9_999_999]);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const { refreshCart } = useCart();
  const { isWished, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  /* ---------- Fetch products & categories ---------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories từ API
        const catData = await fetchCategoriesWithCount();
        if (Array.isArray(catData)) {
          setCategories(catData);
        }
        
        // Fetch products
        const data = await fetchProducts(10000);
        console.log('SHOP PRODUCT SAMPLE:', data[0]);

        const mapped: Product[] = data.map((p: any, index: number) => ({
          id: p.product_id || p.id || index + 1,
          name: p.product_name || p.name || 'Sản phẩm',
          price: p.price || 0,
          sale_price: p.sale_price || null,
          image_url:
            p.image_url ||
            p.product_images?.find((img: any) => img.is_primary)?.image_url ||
            p.product_images?.[0]?.image_url ||
            p.image ||
            null,
          rating: p.rating_average || p.rating || 4.5,
          reviews: p.review_count || p.reviews || 0,
          tag: p.is_new ? 'MỚI' : p.is_featured ? 'NỔI BẬT' : undefined,
          category: p.category_name || p.categories?.category_name || 'Khác',
          categoryId: p.category_id || (p.categories?.category_id ?? 0),
        }));

        setProducts(mapped);
      } catch (err) {
        console.error('Load data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
  const handleToggleWishlist = async (productId: number) => {
    // Kiểm tra đăng nhập trước
    if (!isAuthenticated) {
      if (confirm('Vui lòng đăng nhập để thêm vào danh sách yêu thích. Đi đến trang đăng nhập?')) {
        router.push('/login');
      }
      return;
    }
    await toggleWishlist(productId);
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
              
              {/* Tất cả */}
              <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  checked={selectedCategory === 'Tất Cả'}
                  onChange={() => setSelectedCategory('Tất Cả')}
                />
                <span className="flex-1">Tất Cả</span>
                <span className="text-gray-400 text-sm">
                  ({products.length})
                </span>
              </label>
              
              {/* Categories từ API */}
              {categories.map(cat => (
                <label
                  key={cat.category_id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={selectedCategory === cat.category_name}
                    onChange={() => setSelectedCategory(cat.category_name)}
                  />
                  <span className="flex-1">{cat.category_name}</span>
                  <span className="text-gray-400 text-sm">
                    ({cat.product_count || 0})
                  </span>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-fr">
            {filteredProducts.map(product => {
              const productWished = isWished(product.id);
              const hasDiscount = product.sale_price && product.sale_price < product.price;
              const discountPercent = hasDiscount 
                ? Math.round((1 - product.sale_price! / product.price) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Image */}
                  <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Smartphone className="w-16 h-16" />
                      </div>
                    )}

                    {/* Badge giảm giá */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{discountPercent}%
                      </div>
                    )}

                    {/* Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleToggleWishlist(product.id);
                      }}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                        productWished 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${productWished ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick actions on hover */}
                    <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transform transition-all duration-300 ${
                      hoveredProduct === product.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                    }`}>
                      <Link
                        href={`/product/${product.id}`}
                        className="block w-full bg-white text-gray-900 text-center py-2 rounded-lg font-semibold hover:bg-pink-600 hover:text-white transition"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition h-12">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-pink-600">
                        {(product.sale_price || product.price).toLocaleString('vi-VN')}₫
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>

                    {/* Add to cart button */}
                    <div className="w-full mt-auto">
                      <AddToCartButton productId={product.id} />
                    </div>
                  </div>
                </div>
              );
            })}
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
