// File: fontend/src/app/(public)/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchProducts, fetchCategoriesWithCount, createMomoPayment } from '@/lib/api-client';
import { PRODUCT_CATEGORIES, BANNER_SLIDES } from '@/lib/constants';
import { Product, CartItem, Category } from '@/types';

// Components
import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { HeroCarousel, CategoryGrid, FeaturedProducts, PromoSection } from '@/components/home';
import CartModal from '@/components/modals/CartModal';
import CurrencyModal from '@/components/modals/CurrencyModal';

// Icon map for categories
const CATEGORY_ICON_MAP: Record<string, string> = {
  'Ốp lưng': '📱',
  'Cường lực màn hình': '🛡️',
  'Miếng dán camera': '📷',
  'Cáp sạc': '⚡',
  'Tai nghe': '🎧',
  'Dây đeo điện thoại': '🔗',
  'Sticker trang trí': '✨',
  'Phụ kiện': '🎁',
  'Sạc dự phòng': '🔋',
  'Giá đỡ điện thoại': '📲',
};

export default function HomePage() {
  const router = useRouter();

  // State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('VND');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(PRODUCT_CATEGORIES);
  const [devices, setDevices] = useState<string[]>(['iPhone 17 Pro Max']);
  const [selectedDevice, setSelectedDevice] = useState('iPhone 17 Pro Max');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategoriesWithCount();
        if (Array.isArray(data) && data.length > 0) {
          const categoryNames = data.map((cat: any) => cat.category_name);
          setDevices(categoryNames);
          setSelectedDevice(categoryNames[0]);

          const mappedCategories = data.map((cat: any) => ({
            name: cat.category_name,
            icon: CATEGORY_ICON_MAP[cat.category_name] || '📦',
            count: cat.product_count || 0,
          }));
          setCategories(mappedCategories);
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
        const data = await fetchProducts(4);
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

  // Wishlist handler
  const toggleWishlist = (productId: number) => {
    const newWished = new Set(wishedProducts);
    if (newWished.has(productId)) {
      newWished.delete(productId);
      setWishlistCount((c) => c - 1);
    } else {
      newWished.add(productId);
      setWishlistCount((c) => c + 1);
    }
    setWishedProducts(newWished);
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

  // Subscribe handler
  const handleSubscribe = (email: string) => {
    alert(`Đã đăng ký: ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
        onWishlistClick={() => {}}
        wishlistCount={wishlistCount}
        showDeviceSelector
        devices={devices}
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        showCurrencySelector
        selectedCurrency={selectedCurrency}
        onCurrencyClick={() => setIsCurrencyModalOpen(true)}
      />

      {/* Hero */}
      <HeroCarousel
        slides={BANNER_SLIDES}
        onShopNow={() => router.push('/shop')}
      />

      {/* Categories */}
      <CategoryGrid categories={categories} />

      {/* Featured Products */}
      <FeaturedProducts
        products={featuredProducts}
        loading={loading}
        wishedProducts={wishedProducts}
        onAddToCart={addToCart}
        onToggleWishlist={toggleWishlist}
      />

      {/* Promo */}
      <PromoSection onSubscribe={handleSubscribe} />

      {/* Footer */}
      <Footer />
    </div>
  );
}