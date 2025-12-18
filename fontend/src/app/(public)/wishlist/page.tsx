'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Star, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistItem {
  wishlist_id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  price: number;
  sale_price: number;
  image_url: string;
  category_name: string;
  avg_rating: number;
  review_count: number;
  is_in_stock: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WishlistPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading) {
      loadWishlist();
    }
  }, [authLoading, isAuthenticated]);

  const loadWishlist = async () => {
    if (!isAuthenticated) {
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        setWishlist(JSON.parse(localWishlist));
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${user?.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
      } else {
        setWishlist(getSampleWishlist());
      }
    } catch (error) {
      setWishlist(getSampleWishlist());
    } finally {
      setLoading(false);
    }
  };

  const getSampleWishlist = (): WishlistItem[] => [
    {
      wishlist_id: 1,
      product_id: 1,
      product_name: 'Ốp lưng iPhone 15 Pro Max MagSafe trong suốt',
      product_slug: 'op-lung-iphone-15-pro-max-magsafe',
      price: 350000,
      sale_price: 299000,
      image_url: '/SP001.png',
      category_name: 'Ốp iPhone',
      avg_rating: 4.8,
      review_count: 156,
      is_in_stock: true,
    },
    {
      wishlist_id: 2,
      product_id: 2,
      product_name: 'Ốp lưng Samsung S24 Ultra carbon fiber',
      product_slug: 'op-lung-samsung-s24-ultra-carbon',
      price: 280000,
      sale_price: 0,
      image_url: '/about1.jpg',
      category_name: 'Ốp Samsung',
      avg_rating: 4.6,
      review_count: 89,
      is_in_stock: true,
    },
  ];

  const handleRemoveFromWishlist = async (wishlistId: number) => {
    setRemoving(wishlistId);
    try {
      if (isAuthenticated) {
        await fetch(`${API_URL}/wishlist/${wishlistId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user?.access_token}` },
        });
      }
      setWishlist(prev => prev.filter(item => item.wishlist_id !== wishlistId));
    } catch (error) {
      setWishlist(prev => prev.filter(item => item.wishlist_id !== wishlistId));
    } finally {
      setRemoving(null);
    }
  };

  const formatPrice = (price: number) => price.toLocaleString('vi-VN') + '₫';

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
              Sản phẩm yêu thích
            </h1>
            <p className="text-gray-500 mt-1">{wishlist.length} sản phẩm</p>
          </div>
          <Link href="/shop" className="text-pink-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Chưa có sản phẩm yêu thích</h2>
            <p className="text-gray-500 mb-8">
              Hãy thêm sản phẩm vào danh sách yêu thích để dễ dàng theo dõi!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-pink-700 hover:to-purple-700 transition"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.wishlist_id}
                className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group ${
                  removing === item.wishlist_id ? 'opacity-50' : ''
                }`}
              >
                <div className="relative">
                  <Link href={`/shop/product/${item.product_slug}`}>
                    <img
                      src={item.image_url || '/SP001.png'}
                      alt={item.product_name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  {item.sale_price > 0 && item.sale_price < item.price && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{Math.round((1 - item.sale_price / item.price) * 100)}%
                    </span>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(item.wishlist_id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-1">{item.category_name}</p>
                  <Link href={`/shop/product/${item.product_slug}`}>
                    <h3 className="font-semibold line-clamp-2 mb-2 hover:text-pink-600 transition">
                      {item.product_name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{item.avg_rating}</span>
                    <span className="text-sm text-gray-500">({item.review_count})</span>
                  </div>

                  <div className="mb-4">
                    <span className="text-lg font-bold text-pink-600">
                      {formatPrice(item.sale_price || item.price)}
                    </span>
                    {item.sale_price > 0 && item.sale_price < item.price && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </div>

                  {item.is_in_stock ? (
                    <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition">
                      <ShoppingCart className="w-5 h-5" />
                      Thêm vào giỏ
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 py-2 rounded-lg font-medium cursor-not-allowed"
                    >
                      Hết hàng
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
