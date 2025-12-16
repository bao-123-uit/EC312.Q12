'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ChevronDown, Star, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, createMomoPayment,addToShoppingCart } from '@/lib/api-client';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { useCart } from '@/app/context/cart-context';
// import { useAuth } from '@/app/context/auth-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';


interface Product {
  id: number;
  product_id?: number;
  name: string;
  product_name?: string;
  price: number;
  image: string;
  image_url?: string;
  rating: number;
  reviews: number;
  tag?: string;
  category: string;
  category_id?: number;
}

interface CartItem extends Product {
  quantity: number;
}

const ShopPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { refreshCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(10000); // Fetch 12 products
        console.log('RAW API RESPONSE:', data);
        // Map database format to component format
        const mappedProducts = data.map((p: any, index: number) => ({
          id: p.product_id || p.id || index + 1,
          name: p.product_name || p.name || 'Sản phẩm',
          price: p.price || 0,
          image: p.image_url || p.image || 'https://i.pinimg.com/1200x/f4/0a/de/f40ade8f15c8354c5eb584af2b1ebd82.jpg',
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          tag: p.is_new ? 'MỚI' : (p.is_featured ? 'NỔI BẬT' : p.tag),
          // category: p.category || 'Tất Cả',
          category : p.category_id >= 1 && p.category_id <= 5 ? 'Ốp lưng' 
          : p.category_id >= 6 && p.category_id <= 8 ? 'Cường lực màn hình'
                : 'Tất Cả',
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to dummy data if API fails
        setProducts([
          {
            id: 1,
            name: 'Ốp iPhone 17 Pro Max - Họa Tiết Hoa Tuyệt Đẹp',
            price: 100,
            image: 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400&h=400&fit=crop',
            rating: 4.8,
            reviews: 1250,
            tag: 'BÁN CHẠY NHẤT',
            category: 'Ốp iPhone 17'
          },
          {
            id: 2,
            name: 'Ốp iPhone 16 Pro Max - Thiết Kế Tối Giản',
            price: 34.99,
            image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 890,
            tag: 'MỚI',
            category: 'Ốp iPhone 16'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = SHOP_CATEGORIES;

  const filteredProducts = products
    .filter(product =>
      selectedCategory === 'Tất Cả' ||
      product.category === selectedCategory
    )
    .filter(product =>
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const addToCart = async (product: Product) => {
    
    if (!isAuthenticated || !user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }
  // 1. Update UI (frontend)
    setCartItems(prevItems => {
      const existing = prevItems.find(i => i.id === product.id);

      let newCart;
      if (existing) {
        newCart = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevItems, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    refreshCart();
    // 2. Call backend API
    await addToShoppingCart({
      customer_id: 10,
      product_id: product.id,
      quantity: 1,
    });
    // const addToCart = async (product: Product) => {
    //   try {
    //     await addToShoppingCart({
    //       customer_id: 10,
    //       product_id: product.id,
    //       quantity: 1,
    //     });

    //     // 🔥 CẬP NHẬT LẠI CONTEXT → ICON 🛒 TỰ ĐỔI
    //     refreshCart();

    //   } catch (err) {
    //     console.error('Add to cart failed', err);
    //   }
    // };
  };



  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const toggleWishlist = (productId: number) => {
    const newWished = new Set(wishedProducts);
    if (newWished.has(productId)) {
      newWished.delete(productId);
      setWishlistCount(wishlistCount - 1);
    } else {
      newWished.add(productId);
      setWishlistCount(wishlistCount + 1);
    }
    setWishedProducts(newWished);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Giỏ Hàng ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-200px)] p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition"
                  >
                    Mua Sắm Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-pink-600 font-bold mb-2">{item.price.toLocaleString('vi-VN')}₫</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 rounded-l-lg"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 rounded-r-lg"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="text-right font-bold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Tổng Cộng:</span>
                  <span className="text-2xl font-bold text-pink-600">{cartTotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      setCheckoutLoading(true);
                      // Sử dụng giá thực từ database (VNĐ)
                      const totalVND = Math.round(cartTotal);
                      const orderItems = cartItems.map(item => `${item.name} x${item.quantity}`).join(', ');
                      const result = await createMomoPayment({
                        amount: totalVND,
                        orderInfo: `GoatTech - ${orderItems}`,
                      });
                      
                      if (result?.data?.payUrl) {
                        window.location.href = result.data.payUrl;
                      } else {
                        alert('Không thể tạo thanh toán. Vui lòng thử lại!');
                      }
                    } catch (error: any) {
                      console.error('Payment error:', error);
                      alert('Lỗi thanh toán: ' + (error.message || 'Vui lòng thử lại!'));
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    '💳 Thanh Toán MoMo'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Banner */}

      {/* Header */}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Trang Chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Cửa Hàng</span>
          </div>
        </div>
      </div>

      {/* Shop Header */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-full lg:w-64 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Bộ Lọc</h2>
                <button onClick={() => setIsFilterOpen(false)} className="lg:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Loại Sản Phẩm</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.name}
                        onChange={() => setSelectedCategory(category.name)}
                      />
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Khoảng Giá</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₫</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="0"
                    />
                    <span className="text-sm">-</span>
                    <span className="text-sm">₫</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      max="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-4">Sắp Xếp Theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="newest">Mới Nhất</option>
                  <option value="price-low">Giá: Thấp Đến Cao</option>
                  <option value="price-high">Giá: Cao Đến Thấp</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Filter Toggle for Mobile */}
            <div className="mb-6 lg:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Bộ Lọc
              </button>
            </div>

            {/* Product Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
              </p>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition group cursor-pointer overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        {product.tag}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                    />
                    <button
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishedProducts.has(product.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                      >
                        Thêm Vào Giỏ Hàng
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm phù hợp với các bộ lọc của bạn</p>
                <button
                  onClick={() => {
                    setSelectedCategory('Tất Cả');
                    setPriceRange([0, 10000000]);
                  }}
                  className="text-pink-600 font-medium hover:underline"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default ShopPage;


















































































'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ChevronDown, Star, Filter, X } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, createMomoPayment,addToShoppingCart } from '@/lib/api-client';
import { SHOP_CATEGORIES } from '@/lib/constants';
import { useCart } from '@/app/context/cart-context';
// import { useAuth } from '@/app/context/auth-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';


interface Product {
  id: number;
  product_id?: number;
  name: string;
  product_name?: string;
  price: number;
  image: string;
  image_url?: string;
  rating: number;
  reviews: number;
  tag?: string;
  category: string;
  category_id?: number;
}

interface CartItem extends Product {
  quantity: number;
}

const ShopPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 9999999]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { refreshCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(10000); // Fetch 12 products
        console.log('RAW API RESPONSE:', data);
        // Map database format to component format
        const mappedProducts = data.map((p: any, index: number) => ({
          id: p.product_id || p.id || index + 1,
          name: p.product_name || p.name || 'Sản phẩm',
          price: p.price || 0,
          image: p.image_url || p.image || 'https://i.pinimg.com/1200x/f4/0a/de/f40ade8f15c8354c5eb584af2b1ebd82.jpg',
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          tag: p.is_new ? 'MỚI' : (p.is_featured ? 'NỔI BẬT' : p.tag),
          // category: p.category || 'Tất Cả',
          category : p.category_id >= 1 && p.category_id <= 5 ? 'Ốp lưng' 
          : p.category_id >= 6 && p.category_id <= 8 ? 'Cường lực màn hình'
                : 'Tất Cả',
        }));
        setProducts(mappedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to dummy data if API fails
        setProducts([
          {
            id: 1,
            name: 'Ốp iPhone 17 Pro Max - Họa Tiết Hoa Tuyệt Đẹp',
            price: 100,
            image: 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400&h=400&fit=crop',
            rating: 4.8,
            reviews: 1250,
            tag: 'BÁN CHẠY NHẤT',
            category: 'Ốp iPhone 17'
          },
          {
            id: 2,
            name: 'Ốp iPhone 16 Pro Max - Thiết Kế Tối Giản',
            price: 34.99,
            image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 890,
            tag: 'MỚI',
            category: 'Ốp iPhone 16'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = SHOP_CATEGORIES;

  const filteredProducts = products
    .filter(product =>
      selectedCategory === 'Tất Cả' ||
      product.category === selectedCategory
    )
    .filter(product =>
      product.price >= priceRange[0] &&
      product.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return b.id - a.id;
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const addToCart = async (product: Product) => {
    
    if (!isAuthenticated || !user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
      router.push('/login');
      return;
    }
  // 1. Update UI (frontend)
    setCartItems(prevItems => {
      const existing = prevItems.find(i => i.id === product.id);

      let newCart;
      if (existing) {
        newCart = prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...prevItems, { ...product, quantity: 1 }];
      }

      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    refreshCart();
    // 2. Call backend API
    await addToShoppingCart({
      customer_id: 10,
      product_id: product.id,
      quantity: 1,
    });
    // const addToCart = async (product: Product) => {
    //   try {
    //     await addToShoppingCart({
    //       customer_id: 10,
    //       product_id: product.id,
    //       quantity: 1,
    //     });

    //     // 🔥 CẬP NHẬT LẠI CONTEXT → ICON 🛒 TỰ ĐỔI
    //     refreshCart();

    //   } catch (err) {
    //     console.error('Add to cart failed', err);
    //   }
    // };
  };



  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const toggleWishlist = (productId: number) => {
    const newWished = new Set(wishedProducts);
    if (newWished.has(productId)) {
      newWished.delete(productId);
      setWishlistCount(wishlistCount - 1);
    } else {
      newWished.add(productId);
      setWishlistCount(wishlistCount + 1);
    }
    setWishedProducts(newWished);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Giỏ Hàng ({cartCount})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-200px)] p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg mb-4">Giỏ hàng trống</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition"
                  >
                    Mua Sắm Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{item.name}</h3>
                        <p className="text-pink-600 font-bold mb-2">{item.price.toLocaleString('vi-VN')}₫</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 rounded-l-lg"
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 rounded-r-lg"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="text-right font-bold">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Tổng Cộng:</span>
                  <span className="text-2xl font-bold text-pink-600">{cartTotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      setCheckoutLoading(true);
                      // Sử dụng giá thực từ database (VNĐ)
                      const totalVND = Math.round(cartTotal);
                      const orderItems = cartItems.map(item => `${item.name} x${item.quantity}`).join(', ');
                      const result = await createMomoPayment({
                        amount: totalVND,
                        orderInfo: `GoatTech - ${orderItems}`,
                      });
                      
                      if (result?.data?.payUrl) {
                        window.location.href = result.data.payUrl;
                      } else {
                        alert('Không thể tạo thanh toán. Vui lòng thử lại!');
                      }
                    } catch (error: any) {
                      console.error('Payment error:', error);
                      alert('Lỗi thanh toán: ' + (error.message || 'Vui lòng thử lại!'));
                    } finally {
                      setCheckoutLoading(false);
                    }
                  }}
                  disabled={checkoutLoading}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-medium hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    '💳 Thanh Toán MoMo'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Banner */}

      {/* Header */}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Trang Chủ</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Cửa Hàng</span>
          </div>
        </div>
      </div>

      {/* Shop Header */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className={`w-full lg:w-64 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Bộ Lọc</h2>
                <button onClick={() => setIsFilterOpen(false)} className="lg:hidden">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Loại Sản Phẩm</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.name}
                        onChange={() => setSelectedCategory(category.name)}
                      />
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Khoảng Giá</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">₫</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="0"
                    />
                    <span className="text-sm">-</span>
                    <span className="text-sm">₫</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-20 px-2 py-1 border rounded text-sm"
                      max="1000"
                    />
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-4">Sắp Xếp Theo</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="newest">Mới Nhất</option>
                  <option value="price-low">Giá: Thấp Đến Cao</option>
                  <option value="price-high">Giá: Cao Đến Thấp</option>
                  <option value="rating">Đánh Giá Cao Nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Filter Toggle for Mobile */}
            <div className="mb-6 lg:hidden">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Bộ Lọc
              </button>
            </div>

            {/* Product Count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
              </p>
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition group cursor-pointer overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        {product.tag}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
                    />
                    <button
                      className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                      onClick={() => toggleWishlist(product.id)}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          wishedProducts.has(product.id) ? 'fill-red-500 text-red-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</span>
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm ml-1">{product.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                        className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                      >
                        Thêm Vào Giỏ Hàng
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm phù hợp với các bộ lọc của bạn</p>
                <button
                  onClick={() => {
                    setSelectedCategory('Tất Cả');
                    setPriceRange([0, 10000000]);
                  }}
                  className="text-pink-600 font-medium hover:underline"
                >
                  Xóa Bộ Lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  );
};

export default ShopPage;
