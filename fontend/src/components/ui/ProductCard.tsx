// File: fontend/src/components/ui/ProductCard.tsx

'use client';

import { Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isWished?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: number) => void;
}

export default function ProductCard({
  product,
  isWished = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const productId = product.product_id || product.id;
  const productName = product.name || product.product_name || 'Sản phẩm';
  const productImage = product.image || product.image_url || 'https://via.placeholder.com/400';
  const productRating = product.rating || 4.5;
  const productReviews = product.reviews || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition group cursor-pointer overflow-hidden">
      <Link href={`/product/${productId}`}>
        <div className="relative overflow-hidden">
          {product.tag && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
              {product.tag}
            </span>
          )}
          <img
            src={productImage}
            alt={productName}
            className="w-full h-64 object-cover group-hover:scale-110 transition duration-300"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleWishlist?.(productId);
            }}
            className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
          >
            <Heart
              className={`w-5 h-5 ${isWished ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${productId}`}>
          <h3 className="font-semibold mb-2 line-clamp-2 hover:text-pink-600 transition">
            {productName}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm ml-1">{productRating}</span>
          </div>
          <span className="text-sm text-gray-500">({productReviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            {(product.price || 0).toLocaleString('vi-VN')}₫
          </span>
          <button
            onClick={() => onAddToCart?.(product)}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition"
          >
            Thêm Vào Giỏ
          </button>
        </div>
      </div>
    </div>
  );
}