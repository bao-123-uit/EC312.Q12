'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, Heart, ShoppingCart, Minus, Plus, 
  Truck, Shield, RotateCcw, Check, ChevronRight, Gift
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  product_id: number;
  product_name: string;
  product_slug: string;
  sku: string;
  description: string;
  short_description: string;
  price: number;
  sale_price: number;
  category_id: number;
  brand_id: number;
  image_url: string;
  is_featured: boolean;
  is_new: boolean;
  status: string;
  category_name?: string;
  brand_name?: string;
  images?: { image_id: number; image_url: string; is_primary: boolean }[];
  variants?: { variant_id: number; variant_name: string; price: number; stock: number }[];
  avg_rating?: number;
  review_count?: number;
}

interface Review {
  review_id: number;
  customer_id: number;
  rating: number;
  comment: string;
  created_at: string;
  customer_name?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isWished, setIsWished] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products/slug/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        setProduct(getSampleProduct());
        setReviews(getSampleReviews());
      }
    } catch (error) {
      setProduct(getSampleProduct());
      setReviews(getSampleReviews());
    } finally {
      setLoading(false);
    }
  };

  const getSampleProduct = (): Product => ({
    product_id: 1,
    product_name: 'Ốp lưng iPhone 15 Pro Max MagSafe trong suốt cao cấp',
    product_slug: slug,
    sku: 'IP15PM-MAGSAFE-CLEAR',
    description: `
      <h3>Đặc điểm nổi bật:</h3>
      <ul>
        <li>Chất liệu polycarbonate cao cấp, chống trầy xước</li>
        <li>Hỗ trợ sạc không dây MagSafe</li>
        <li>Thiết kế trong suốt, khoe trọn vẻ đẹp iPhone</li>
        <li>Viền chống sốc, bảo vệ góc cạnh</li>
      </ul>
    `,
    short_description: 'Ốp lưng MagSafe trong suốt cao cấp dành cho iPhone 15 Pro Max.',
    price: 350000,
    sale_price: 299000,
    category_id: 1,
    brand_id: 1,
    image_url: '/SP001.png',
    is_featured: true,
    is_new: true,
    status: 'active',
    category_name: 'Ốp iPhone',
    brand_name: 'GoatTech',
    images: [
      { image_id: 1, image_url: '/SP001.png', is_primary: true },
      { image_id: 2, image_url: '/about1.jpg', is_primary: false },
      { image_id: 3, image_url: '/about2.jpg', is_primary: false },
    ],
    variants: [
      { variant_id: 1, variant_name: 'Trong suốt', price: 299000, stock: 50 },
      { variant_id: 2, variant_name: 'Mờ (Matte)', price: 329000, stock: 30 },
    ],
    avg_rating: 4.8,
    review_count: 156,
  });

  const getSampleReviews = (): Review[] => [
    {
      review_id: 1,
      customer_id: 1,
      rating: 5,
      comment: 'Ốp rất đẹp, vừa khít máy. Chất lượng tuyệt vời!',
      created_at: '2024-12-10T10:00:00Z',
      customer_name: 'Nguyễn Văn A',
    },
    {
      review_id: 2,
      customer_id: 2,
      rating: 5,
      comment: 'Giao hàng nhanh, đóng gói cẩn thận.',
      created_at: '2024-12-08T14:30:00Z',
      customer_name: 'Trần Thị B',
    },
  ];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    setAddingToCart(true);
    try {
      // Add to cart API call here
      alert('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + '₫';
  };

  const getDiscountPercent = () => {
    if (!product || !product.sale_price || product.sale_price >= product.price) return 0;
    return Math.round((1 - product.sale_price / product.price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <Link href="/shop" className="text-pink-600 hover:underline">
            ← Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ image_id: 0, image_url: product.image_url, is_primary: true }];
  const currentPrice = product.sale_price || product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-pink-600">Cửa hàng</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.product_name}</span>
          </div>
        </div>
      </div>

      {/* Product Main */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={images[selectedImage]?.image_url || product.image_url}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                />
                {getDiscountPercent() > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{getDiscountPercent()}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={img.image_id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="mb-4">
                {product.brand_name && (
                  <span className="text-pink-600 text-sm font-medium">{product.brand_name}</span>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                  {product.product_name}
                </h1>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= (product.avg_rating || 4.5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {product.avg_rating || 4.5} ({product.review_count || reviews.length} đánh giá)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-pink-600">
                    {formatPrice(currentPrice)}
                  </span>
                  {product.sale_price && product.sale_price < product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-6">{product.short_description}</p>

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Phân loại:</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.variant_id}
                        onClick={() => setSelectedVariant(variant.variant_id)}
                        className={`px-4 py-2 rounded-lg border-2 transition ${
                          selectedVariant === variant.variant_id
                            ? 'border-pink-600 bg-pink-50 text-pink-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {variant.variant_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Số lượng:</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-3 hover:bg-gray-100 transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-3 hover:bg-gray-100 transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setIsWished(!isWished)}
                    className={`p-3 rounded-lg border transition ${
                      isWished ? 'bg-pink-50 border-pink-600 text-pink-600' : 'border-gray-200'
                    }`}
                  >
                    <Heart className={`w-6 h-6 ${isWished ? 'fill-pink-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-pink-600 text-pink-600 py-4 rounded-xl font-semibold hover:bg-pink-50 transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
                <button
                  onClick={() => { handleAddToCart(); router.push('/checkout'); }}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition"
                >
                  Mua ngay
                </button>
              </div>

              {/* Gift Button */}
              <button
                onClick={() => router.push(`/gift/send?productId=${product.product_id}`)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition mb-8"
              >
                <Gift className="w-5 h-5" />
                🎁 Gửi Tặng Bạn Bè
              </button>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Giao hàng nhanh</p>
                    <p className="text-gray-500">2-3 ngày</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Bảo hành</p>
                    <p className="text-gray-500">12 tháng</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Đổi trả</p>
                    <p className="text-gray-500">30 ngày</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Chính hãng</p>
                    <p className="text-gray-500">100%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mt-8 overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition \${
                activeTab === 'description'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mô tả sản phẩm
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition \${
                activeTab === 'reviews'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          <div className="p-6 lg:p-8">
            {activeTab === 'description' ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.review_id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.customer_name?.charAt(0) || 'K'}
                      </div>
                      <div>
                        <p className="font-medium">{review.customer_name || 'Khách hàng'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}