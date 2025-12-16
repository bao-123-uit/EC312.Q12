// File: fontend/src/components/home/FeaturedProducts.tsx

'use client';

import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/types';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  loading?: boolean;
  wishedProducts?: Set<number>;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: number) => void;
}

export default function FeaturedProducts({
  products,
  title = 'Sản Phẩm Nổi Bật',
  loading = false,
  wishedProducts = new Set(),
  onAddToCart,
  onToggleWishlist,
}: FeaturedProductsProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-64 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-8 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">{title}</h2>
        <Link href="/shop" className="text-pink-600 font-medium hover:underline">
          Xem Tất Cả →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.product_id || product.id}
            product={product}
            isWished={wishedProducts.has(product.product_id || product.id)}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}