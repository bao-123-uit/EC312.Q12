'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2, Star, ArrowLeft } from 'lucide-react';
import { useWishlist } from '@/app/context/wishlist-context';
import { AddToCartButton } from '@/components/products/AddToCartButton';
import { fetchProductById } from '@/lib/api-client';

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  sale_price?: number;
  image_url: string;
  description?: string;
}

export default function WishlistPage() {
  const { wishedProducts, loading, toggleWishlist, wishlistCount, refreshWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch thông tin sản phẩm khi wishedProducts thay đổi
  useEffect(() => {
    const loadProducts = async () => {
      if (wishedProducts.size === 0) {
        setProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        const productIds = Array.from(wishedProducts);
        const productPromises = productIds.map(id => fetchProductById(id));
        const results = await Promise.all(productPromises);
        
        // Lọc những sản phẩm fetch thành công
        const validProducts = results.filter(p => p && p.product_id);
        setProducts(validProducts);
      } catch (error) {
        console.error('Load products error:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [wishedProducts]);

  const formatPrice = (price: number) => price?.toLocaleString('vi-VN') + '₫';

  const handleRemove = async (productId: number) => {
    await toggleWishlist(productId);
  };

  if (loading || loadingProducts) {
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
            <p className="text-gray-500 mt-1">{wishlistCount} sản phẩm</p>
          </div>
          <Link href="/shop" className="text-pink-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {products.length === 0 ? (
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
            {products.map((product) => (
              <div
                key={product.product_id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition group"
              >
                <div className="relative">
                  <Link href={`/product/${product.product_id}`}>
                    <img
                      src={product.image_url || 'https://i.pinimg.com/1200x/f4/0a/de/f40ade8f15c8354c5eb584af2b1ebd82.jpg'}
                      alt={product.product_name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition duration-300"
                    />
                  </Link>

                  <button
                    onClick={() => handleRemove(product.product_id)}
                    className="absolute top-3 right-3 bg-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <Link href={`/product/${product.product_id}`}>
                    <h3 className="font-semibold line-clamp-2 mb-2 hover:text-pink-600 transition">
                      {product.product_name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.5</span>
                    <span className="text-sm text-gray-500">(0)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">
                      {formatPrice(product.sale_price || product.price)}
                    </span>
                    <AddToCartButton productId={product.product_id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
