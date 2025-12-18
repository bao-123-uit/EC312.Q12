// File: fontend/src/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ChevronDown, LogOut } from 'lucide-react';
import Link from 'next/link';
// import { useAuth } from '@/context/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/app/context/cart-context';
import { useWishlist } from '@/app/context/wishlist-context';
import { useRouter } from 'next/navigation';


interface HeaderProps {
  // onCartClick?: () => void;
  onWishlistClick?: () => void;
  showDeviceSelector?: boolean;
  devices?: string[];
  selectedDevice?: string;
  onDeviceChange?: (device: string) => void;
  showCurrencySelector?: boolean;
  selectedCurrency?: string;
  onCurrencyClick?: () => void;
}

export default function Header({
  // onCartClick,
  onWishlistClick,
  showDeviceSelector = false,
  devices = [],
  selectedDevice = '',
  onDeviceChange,
  showCurrencySelector = false,
  selectedCurrency = 'VND',
  onCurrencyClick,
}: HeaderProps) {
  const router = useRouter();

  const handleCartClick = () => {
    router.push('/shopping-cart');
  };
  
  const handleWishlistClick = () => {
    if (onWishlistClick) {
      onWishlistClick();
    } else {
      router.push('/wishlist');
    }
  };
  
  const { user, isAuthenticated, logout, getDisplayName } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

return (
  <header className="bg-gray-100 border-b border-gray-300 sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between gap-4 text-gray-900">
        {/* Left - Mobile menu */}
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-gray-800 hover:text-pink-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <button className="lg:hidden text-gray-800 hover:text-pink-600">
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wider text-gray-900 hover:text-pink-600 transition"
        >
          GoatTech
        </Link>

        {/* Right */}
        <div className="flex items-center gap-4">
          {/* Device Selector */}
          {showDeviceSelector && devices.length > 0 && (
            <select
              value={selectedDevice}
              onChange={(e) => onDeviceChange?.(e.target.value)}
              className="hidden lg:block px-4 py-2 border border-gray-400 rounded-lg text-sm bg-white text-gray-900"
            >
              {devices.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          )}

          {/* Currency Selector */}
          {showCurrencySelector && (
            <button
              className="hidden lg:block px-4 py-2 text-sm font-medium text-gray-900 hover:text-pink-600"
              onClick={onCurrencyClick}
            >
              {selectedCurrency} {selectedCurrency === 'USD' ? '$' : '₫'}
            </button>
          )}

          {/* Wishlist */}
          <button
            className="relative text-gray-800 hover:text-pink-600"
            onClick={handleWishlistClick}
          >
            <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User section */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-gray-900 hover:text-pink-600 transition px-2 py-1 rounded-lg hover:bg-pink-100"
              >
                <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {getDisplayName().charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                  {getDisplayName()}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-300 py-2 z-50 text-gray-900">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-semibold truncate">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100 hover:text-pink-600"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Tài khoản
                    </Link>

                    <Link
                      href="/order"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-pink-100 hover:text-pink-600"
                      onClick={() => setShowDropdown(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Đơn hàng
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-gray-800 hover:text-pink-600"
            >
              <User className="w-6 h-6" />
            </Link>
          )}

          {/* Cart */}
          <button
            className="relative text-gray-800 hover:text-pink-600"
            onClick={handleCartClick}
          >
            <ShoppingCart className="w-6 h-6" />
            {isAuthenticated && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-center gap-8 mt-4 pt-4 border-t border-gray-300 text-gray-900">
        <Link href="/shop" className="text-sm font-medium hover:text-pink-600">
          Cửa Hàng
        </Link>
        <Link href="/collections" className="text-sm font-medium hover:text-pink-600">
          Bộ Sưu Tập
        </Link>
        <Link href="/about" className="text-sm font-medium hover:text-pink-600">
          Về Chúng Tôi
        </Link>
        <Link href="/contact" className="text-sm font-medium hover:text-pink-600">
          Liên Hệ
        </Link>
        <Link href="/promotions" className="text-sm font-medium text-red-700">
          Khuyến Mại
        </Link>
      </nav>
    </div>
  </header>
);

}