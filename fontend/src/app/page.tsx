// File: fontend/src/app/(public)/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchProducts, fetchCategoriesWithCount, createMomoPayment, fetchAllCollections } from '@/lib/api-client';
import { PRODUCT_CATEGORIES, BANNER_SLIDES } from '@/lib/constants';
import { Product, CartItem, Category } from '@/types';
import { 
  ChevronLeft, ChevronRight, Heart, ShoppingBag, Star, 
  Sparkles, Gift, Truck, Shield, ArrowRight, TrendingUp,
  Smartphone, Watch, Headphones, Zap
} from 'lucide-react';

// Components
import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartModal from '@/components/modals/CartModal';
import CurrencyModal from '@/components/modals/CurrencyModal';
import { useWishlist } from '@/app/context/wishlist-context';
import { useCart } from '@/app/context/cart-context';

// Icon map for categories
const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'Ốp lưng': <Smartphone className="w-8 h-8" />,
  'Cường lực màn hình': <Shield className="w-8 h-8" />,
  'Miếng dán camera': <Watch className="w-8 h-8" />,
  'Cáp sạc': <Zap className="w-8 h-8" />,
  'Tai nghe': <Headphones className="w-8 h-8" />,
  'Phụ kiện': <Gift className="w-8 h-8" />,
};

// Gradient colors for categories
const CATEGORY_GRADIENTS = [
  'from-pink-500 via-rose-500 to-red-500',
  'from-violet-500 via-purple-500 to-indigo-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-emerald-500 via-green-500 to-teal-500',
  'from-amber-500 via-orange-500 to-red-500',
  'from-fuchsia-500 via-pink-500 to-rose-500',
  'from-sky-500 via-blue-500 to-violet-500',
];

export default function HomePage() {
  const router = useRouter();
  const { wishedProducts, toggleWishlist } = useWishlist();
  const { refreshCart } = useCart();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('VND');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [devices, setDevices] = useState<string[]>(['iPhone 17 Pro Max']);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  // Hero slides với thiết kế mới
  const heroSlides = [
    {
      title: 'Bộ Sưu Tập Xuân 2026',
      subtitle: 'Thiết Kế Độc Đáo, Chất Lượng Tuyệt Vời',
      gradient: 'from-purple-600 via-pink-500 to-rose-500',
      cta: 'Khám Phá Ngay',
    },
    {
      title: 'Flash Sale - Giảm 50%',
      subtitle: 'Chỉ Trong Hôm Nay - Số Lượng Có Hạn',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      cta: 'Mua Ngay',
    },
    {
      title: 'Phụ Kiện Cao Cấp',
      subtitle: 'Bảo Vệ Hoàn Hảo Cho Thiết Bị Của Bạn',
      gradient: 'from-cyan-500 via-blue-500 to-violet-500',
      cta: 'Xem Thêm',
    },
  ];

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesWithCount();
        if (Array.isArray(data) && data.length > 0) {
          const categoryNames = data.map((cat: any) => cat.category_name);
          setDevices(categoryNames);
          setSelectedDevice(categoryNames[0]);
          setCategories(data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(8);
        if (Array.isArray(data)) {
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  // Cart handlers
  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Checkout handler
  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      const cartTotal = cartItems.reduce((t, i) => t + i.price * i.quantity, 0);
      const orderItems = cartItems.map((i) => `${i.name} x${i.quantity}`).join(', ');
      const result = await createMomoPayment({
        amount: Math.round(cartTotal),
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modals */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
      />

      {isCurrencyModalOpen && (
        <CurrencyModal
          isOpen={isCurrencyModalOpen}
          onClose={() => setIsCurrencyModalOpen(false)}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      )}

      {/* Layout */}
      <TopBanner />
      
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => router.push('/wishlist')}
        wishlistCount={wishedProducts.size}
        showDeviceSelector
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        showCurrencySelector
        selectedCurrency={selectedCurrency}
        onCurrencyClick={() => setIsCurrencyModalOpen(true)}
      />

      {/* ═══════════════════════════════════════════════════════════════════════════
          HERO SECTION - Modern Carousel
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
            
            <div className="relative h-full max-w-7xl mx-auto px-4 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 drop-shadow-lg animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <button
                  onClick={() => router.push('/shop')}
                  className="group bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  {slide.cta}
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-2 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FEATURES BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Truck className="w-6 h-6" />, title: 'Miễn phí ship', desc: 'Đơn từ 100K' },
              { icon: <Shield className="w-6 h-6" />, title: 'Bảo hành', desc: '12 tháng' },
              { icon: <Gift className="w-6 h-6" />, title: 'Quà tặng', desc: 'Mua 4 tặng 2' },
              { icon: <Sparkles className="w-6 h-6" />, title: 'Chính hãng', desc: '100% authentic' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 justify-center p-3">
                <div className="text-pink-600">{feature.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{feature.title}</p>
                  <p className="text-gray-500 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          CATEGORIES SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header với animation */}
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-pulse" />
            </div>
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
               Khám Phá Ngay
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-pink-600 to-purple-600 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Khám phá đa dạng phụ kiện điện thoại chất lượng cao với thiết kế độc đáo
            </p>
          </div>

          {/* Categories Grid - Thiết kế mới */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.slice(0, 8).map((cat: any, index) => {
              const icons = Object.values(CATEGORY_ICON_MAP);
              const gradients = [
                'from-rose-400 via-pink-500 to-pink-600',
                'from-violet-400 via-purple-500 to-purple-600',
                'from-blue-400 via-cyan-500 to-cyan-600',
                'from-emerald-400 via-green-500 to-green-600',
                'from-amber-400 via-orange-500 to-orange-600',
                'from-fuchsia-400 via-pink-500 to-rose-600',
                'from-indigo-400 via-blue-500 to-blue-600',
                'from-teal-400 via-cyan-500 to-teal-600',
              ];
              
              return (
                <Link
                  key={cat.category_id}
                  href={`/shop?category=${encodeURIComponent(cat.category_name)}`}
                  className="group perspective-1000"
                >
                  <div className={`
                    relative h-52 rounded-3xl overflow-hidden
                    bg-gradient-to-br ${gradients[index % gradients.length]}
                    transform transition-all duration-500 ease-out
                    group-hover:scale-[1.02] group-hover:-rotate-1
                    group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                    shadow-xl
                  `}>
                    {/* Animated background patterns */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:rotate-180 transition-transform duration-1000" />
                    </div>
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-white">
                      {/* Icon với animation */}
                      <div className="text-5xl mb-4 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300 drop-shadow-lg">
                        {icons[index % icons.length]}
                      </div>
                      
                      {/* Category name */}
                      <h3 className="font-bold text-xl mb-2 text-center line-clamp-2 drop-shadow-md group-hover:scale-105 transition-transform">
                        {cat.category_name}
                      </h3>
                      
                      {/* Product count với pill design */}
                      <div className="flex items-center gap-2 bg-white/25 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium shadow-inner">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        {cat.product_count || 0} sản phẩm
                      </div>
                      
                      {/* Arrow indicator */}
                      <div className="absolute bottom-4 right-4 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <Sparkles className="w-5 h-5" />
              Xem Tất Cả Danh Mục
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          DESIGN YOUR OWN CASE - CTA BANNER
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8 md:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Tính năng mới</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  🎨 Tự Thiết Kế Ốp Lưng Của Bạn
                </h2>
                <p className="text-white/90 text-lg max-w-xl">
                  Upload ảnh yêu thích, thêm chữ và tạo ra chiếc ốp điện thoại độc nhất vô nhị. 
                  Chúng tôi sẽ in và giao đến tận tay bạn!
                </p>
                <ul className="mt-4 space-y-2 text-white/80">
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span> Thiết kế theo ý thích
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span> In ấn chất lượng cao 300dpi
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-300">✓</span> Nhiều mẫu điện thoại
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="text-8xl mb-4"></div>
                <Link
                  href="/design"
                  className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all hover:shadow-xl transform hover:scale-105"
                >
                  Bắt Đầu Thiết Kế Ngay →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          FEATURED PRODUCTS SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Sản Phẩm Nổi Bật
              </h2>
              <p className="text-gray-600">Được yêu thích nhất tuần này</p>
            </div>
            <Link
              href="/shop"
              className="hidden md:flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-pink-700 transition-all hover:shadow-lg"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 md:h-64 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-10 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any) => {
                const productId = product.product_id || product.id;
                const isWished = wishedProducts.has(productId);
                const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url
                  || product.image_url;
                const hasDiscount = product.sale_price && product.sale_price < product.price;
                const discountPercent = hasDiscount 
                  ? Math.round((1 - product.sale_price / product.price) * 100)
                  : 0;

                return (
                  <div
                    key={productId}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                    onMouseEnter={() => setHoveredProduct(productId)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Image */}
                    <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.product_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Smartphone className="w-16 h-16" />
                        </div>
                      )}

                      {/* Badges */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          -{discountPercent}%
                        </div>
                      )}

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(productId);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
                          isWished 
                            ? 'bg-pink-500 text-white' 
                            : 'bg-white/80 text-gray-600 hover:bg-pink-500 hover:text-white'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                      </button>

                      {/* Quick actions */}
                      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transform transition-all duration-300 ${
                        hoveredProduct === productId ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}>
                        <Link
                          href={`/product/${productId}`}
                          className="block w-full bg-white text-gray-900 text-center py-2 rounded-lg font-semibold hover:bg-pink-600 hover:text-white transition"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <Link href={`/product/${productId}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition">
                          {product.product_name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(128)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-pink-600">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile CTA */}
          <div className="text-center mt-8 md:hidden">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-full font-semibold"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TRENDING SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-sm font-semibold uppercase tracking-wider">Hot Trend</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Bộ Sưu Tập Mùa Lễ Hội
                </h2>
                <p className="text-white/80 max-w-md">
                  Khám phá những thiết kế độc đáo cho mùa Noel, Valentine và Tết Nguyên Đán
                </p>
              </div>
              <Link
                href="/collections"
                className="flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-xl hover:shadow-2xl"
              >
                Khám phá ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════════
          NEWSLETTER SECTION
      ═══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-6 text-pink-500" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Đăng Ký Nhận Ưu Đãi
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên và cập nhật những ưu đãi mới nhất
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 transition"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold hover:opacity-90 transition"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}