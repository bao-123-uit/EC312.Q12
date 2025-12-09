'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts } from '@/lib/api-client';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tag?: string;
}

interface CartItem extends Product {
  quantity: number;
}

const BurgaHomepage: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);  
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(4); // Fetch 4 products for featured section
        // Ensure data is an array
        if (Array.isArray(data)) {
          setFeaturedProducts(data);
        } else {
          console.error('API did not return an array:', data);
          setFeaturedProducts([]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to dummy data if API fails
        setFeaturedProducts([
          {
            id: 1,
            name: 'Ốp iPhone 17 Pro Max - Họa Tiết Hoa Tuyệt Đẹp',
            price: 100.000,
            image: 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400&h=400&fit=crop',
            rating: 4.8,
            reviews: 1250,
            tag: 'BÁN CHẠY NHẤT'
          },
          {
            id: 2,
            name: 'Ốp iPhone 16 Pro Max - Thiết Kế Tối Giản',
            price: 34.99,
            image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 890,
            tag: 'MỚI'
          },
          {
            id: 3,
            name: 'Ốp iPhone 15 Pro Max - Bảo Vệ Cực Đại',
            price: 32.99,
            image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop',
            rating: 4.7,
            reviews: 2100
          },
          {
            id: 4,
            name: 'Ốp iPhone 14 Pro Max - Sang Trọng & Bền',
            price: 36.99,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop',
            rating: 4.9,
            reviews: 1560,
            tag: 'ĐANG HOT'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const devices = [
    'iPhone 17 Pro Max',
    'iPhone 17 Pro',
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 14 Pro Max',
    'iPhone 14 Pro',
    'iPhone 13 Pro Max',
    'iPhone 13 Pro',
    'iPhone 12 Pro Max',
    'iPhone 12 Pro',
    'iPhone SE',
    'Samsung Galaxy S24'
  ];

  const categories = [
    { name: 'Ốp iPhone 17', icon: '🌟', count: 120 },
    { name: 'Ốp iPhone 16', icon: '💎', count: 95 },
    { name: 'Ốp iPhone 15', icon: '✨', count: 85 },
    { name: 'Ốp Samsung', icon: '🎨', count: 60 },
    { name: 'Ốp Khác', icon: '🔥', count: 40 }
  ];

  const bannerSlides = [
    {
      title: 'Ốp Điện Thoại Cao Cấp - Shop #1 Việt Nam',
      subtitle: 'Bảo Vệ Điện Thoại Của Bạn Với Phong Cách',
      bg: 'from-purple-600 to-pink-600'
    },
    {
      title: 'Bộ Sưu Tập Xuân 2024 - Mẫu Mới Đặc Biệt',
      subtitle: 'Thiết Kế Độc Đáo, Chất Lượng Tuyệt Vời',
      bg: 'from-blue-600 to-cyan-600'
    },
    {
      title: 'Miễn Phí Vận Chuyển - Đơn Hàng Trên 100K',
      subtitle: 'Nhanh, An Toàn, Uy Tín',
      bg: 'from-green-600 to-teal-600'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const addToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
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

  const handleShopNow = () => {
    window.location.href = '/shop';
  };

  const handleViewAll = () => {
    alert('Navigate to all products page');
  };

  const handleSubscribe = (email: string) => {
    if (email) {
      alert(`Subscribed: ${email}`);
    }
  };

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setIsCurrencyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-xl w-full sm:max-w-2xl sm:mx-4 max-h-[90vh] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Giỏ Hàng ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Giỏ hàng trống</p>
                  <button
                    onClick={() => { setIsCartOpen(false); window.location.href = '/shop'; }}
                    className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition"
                  >
                    Mua Sắm Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-xl">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                        <p className="text-pink-600 font-bold mb-2">${item.price}</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-pink-600">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => alert('Chức năng thanh toán đang được phát triển!')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition"
                >
                  Thanh Toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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

            <div className="text-2xl font-bold tracking-wider">
              BURGA
            </div>

            <div className="flex items-center gap-4">
              <select 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="hidden lg:block px-4 py-2 border rounded-lg text-sm"
              >
                {devices.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>

              <button className="hidden lg:block px-4 py-2 text-sm font-medium" onClick={() => setIsCurrencyModalOpen(true)}>
                {selectedCurrency} {selectedCurrency === 'USD' ? '$' : '₫'}
              </button>

              <button className="relative" onClick={() => toggleWishlist(0)}>
                <Heart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              </button>

              <button>
                <User className="w-6 h-6" onClick={() => window.location.href = '/account'} />
              </button>

              <button className="relative" onClick={() => setIsCartOpen(true)}>
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
            <Link href="/shop" className="text-sm font-medium hover:text-pink-600">Cửa Hàng</Link>
            <button onClick={() => alert('Chuyển đến Bộ Sưu Tập')} className="text-sm font-medium hover:text-pink-600">Bộ Sưu Tập</button>
            <Link href="/about" className="text-sm font-medium hover:text-pink-600">Về Chúng Tôi</Link>
            <Link href="/contact" className="text-sm font-medium hover:text-pink-600">Liên Hệ</Link>
            <Link href="/promotions" className="text-sm font-medium text-red-600">Khuyến Mại</Link>
          </nav>
        </div>
      </header>

      {/* Hero Carousel */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {bannerSlides[currentSlide].title}
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              {bannerSlides[currentSlide].subtitle}
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition" onClick={handleShopNow}>
              Shop Now
            </button>
          </div>
        </div>
        
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Mua Ốp Theo Dòng Máy</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div
              key={category.name}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer text-center"
            >
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.count} sản phẩm</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Sản Phẩm Nổi Bật</h2>
          <button onClick={handleViewAll} className="text-pink-600 font-medium hover:underline">
            Xem Tất Cả →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
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
                <button className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition" onClick={() => toggleWishlist(product.id)}>
                  <Heart className={`w-5 h-5 ${wishedProducts.has(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${product.price}</span>
                  <button 
                    onClick={() => addToCart(product)}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
                  >
                    Thêm Vào Giỏ Hàng
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Tham Gia Nhóm BURGA</h2>
          <p className="text-xl mb-8">Nhận 15% giảm giá cho đơn hàng đầu tiên + ưu đãi độc quyền</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="px-4 py-3 rounded-lg text-gray-900 flex-1"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubscribe((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition" onClick={(e) => {
              const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
              handleSubscribe(input?.value || '');
              if (input) input.value = '';
            }}>
              Đăng Ký
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
                <li><button onClick={() => alert('Mở Thông Tin Vận Chuyển')} className="hover:text-white text-left">Thông Tin Vận Chuyển</button></li>
                <li><button onClick={() => alert('Mở Hoàn Hàng')} className="hover:text-white text-left">Chính Sách Hoàn Hàng</button></li>
                <li><button onClick={() => alert('Mở FAQ')} className="hover:text-white text-left">Câu Hỏi Thường Gặp</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => alert('Truy Cập Instagram')} className="hover:text-white text-left">Instagram</button></li>
                <li><button onClick={() => alert('Truy Cập Facebook')} className="hover:text-white text-left">Facebook</button></li>
                <li><button onClick={() => alert('Truy Cập TikTok')} className="hover:text-white text-left">TikTok</button></li>
                <li><button onClick={() => alert('Truy Cập YouTube')} className="hover:text-white text-left">YouTube</button></li>
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

export default BurgaHomepage;