'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Heart, ChevronLeft, Star, Check, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchProducts } from '@/lib/api-client';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tag?: string;
  category: string;
  description: string;
  images: string[];
  stock: number;
  sku: string;
  material?: string;
  compatibility?: string[];
  features: string[];
  inStock: boolean;
}

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [wishedProducts, setWishedProducts] = useState<Set<number>>(new Set());
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(20);
        const foundProduct = data.find((p: any) => p.id === productId);
        
        if (foundProduct) {
          // Enhance product with additional details
          setProduct({
            ...foundProduct,
            description: foundProduct.description || 'Bảo vệ điện thoại của bạn bằng ốp cao cấp. Thiết kế vừa phong cách vừa bền vững.',
            images: [foundProduct.image, foundProduct.image, foundProduct.image, foundProduct.image],
            stock: 15,
            sku: `GOAT-${foundProduct.id}`,
            material: 'TPU + Polycarbonate',
            compatibility: [foundProduct.name],
            features: [
              'Bảo vệ từ độ cao 6 feet',
              'Các khe cắt chính xác cho tất cả cổng',
              'Hỗ trợ sạc không dây',
              'Dễ dàng tháo lắp'
            ],
            inStock: true
          });
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Không Tìm Thấy Sản Phẩm</h1>
          <Link href="/shop" className="text-pink-600 hover:underline">
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const addToCart = () => {
    setCartCount(cartCount + quantity);
  };

  const toggleWishlist = () => {
    const newWished = new Set(wishedProducts);
    if (newWished.has(product.id)) {
      newWished.delete(product.id);
      setWishlistCount(wishlistCount - 1);
    } else {
      newWished.add(product.id);
      setWishlistCount(wishlistCount + 1);
    }
    setWishedProducts(newWished);
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-black text-white py-2 px-4 text-center text-sm">
        <span>Miễn phí vận chuyển cho đơn hàng trên 100K</span>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-2xl font-bold tracking-wider">
              GoatTech
            </Link>

            <div className="flex items-center gap-4">
              <button>
                <Heart className="w-6 h-6" />
              </button>
              <button onClick={() => window.location.href = '/account'}>
                <User className="w-6 h-6" />
              </button>
              <button className="relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Trang Chủ</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-pink-600">Cửa Hàng</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-xl overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            {product.tag && (
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                {product.tag}
              </span>
            )}

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{product.rating}</span>
              <span className="text-gray-600">({product.reviews} reviews)</span>
            </div>

            <div className="text-4xl font-bold text-pink-600 mb-6">${product.price.toFixed(2)}</div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            {/* Product Details */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6 space-y-2">
              <p><span className="font-semibold">SKU:</span> {product.sku}</p>
              {product.material && <p><span className="font-semibold">Material:</span> {product.material}</p>}
              {product.compatibility && (
                <p><span className="font-semibold">Compatibility:</span> {product.compatibility.join(', ')}</p>
              )}
              <p>
                <span className="font-semibold">Stock:</span>{' '}
                <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                  {product.inStock ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </p>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Số Lượng</label>
              <div className="flex items-center gap-4 max-w-xs">
                <button
                  onClick={decreaseQuantity}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  -
                </button>
                <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="flex-1 bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition disabled:bg-gray-400"
              >
                <ShoppingCart className="inline w-5 h-5 mr-2" />
                Thêm Vào Giỏ Hàng
              </button>
              <button
                onClick={toggleWishlist}
                className={`px-8 py-3 rounded-lg font-semibold transition border-2 ${
                  wishedProducts.has(product.id)
                    ? 'bg-red-50 border-red-500 text-red-600'
                    : 'border-gray-300 text-gray-700 hover:border-pink-600'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${wishedProducts.has(product.id) ? 'fill-red-500' : ''}`}
                />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold">Vận Chuyển Miễn Phí</p>
                  <p className="text-sm text-gray-600">Cho đơn hàng trên 100K</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold">Dễ Dàng Hoàn Hàng</p>
                  <p className="text-sm text-gray-600">Chính sách hoàn hàng 30 ngày</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <p className="font-semibold">Chất Lượng Được Đảm Bảo</p>
                  <p className="text-sm text-gray-600">100% sản phẩm chính hãng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12 bg-white rounded-xl">
          <div className="border-b flex">
            {['description', 'features', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-pink-600 text-pink-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'description' && 'Mô Tả'}
                {tab === 'features' && 'Tính Năng'}
                {tab === 'reviews' && 'Đánh Giá'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{product.description}</p>
                <p className="mt-4 text-gray-600">
                  Trải nghiệm bảo vệ cao cấp với {product.name}. Thiết kế dành cho những người dùng hiện đại đòi hỏi cả phong cách lẫn chức năng, ốp này cung cấp bảo vệ toàn diện đồng thời duy trì vẻ ngoài bóng bẩy.
                </p>
              </div>
            )}

            {activeTab === 'features' && (
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Hãy là người đầu tiên đánh giá sản phẩm này</p>
                <button className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
                  Viết Đánh Giá
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">GoatTech</h3>
              <p className="text-gray-400">Ốp điện thoại cao cấp và phụ kiện công nghệ</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cửa Hàng</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/shop" className="hover:text-white">Ốp iPhone</Link></li>
                <li><button className="hover:text-white text-left">Phụ Kiện</button></li>
                <li><button className="hover:text-white text-left">Hàng Mới Về</button></li>
                <li><button className="hover:text-white text-left">Khuyến Mại</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Liên Hệ Chúng Tôi</button></li>
                <li><button className="hover:text-white text-left">Thông Tin Vận Chuyển</button></li>
                <li><button className="hover:text-white text-left">Chính Sách Hoàn Hàng</button></li>
                <li><button className="hover:text-white text-left">Câu Hỏi Thường Gặp</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Theo Dõi Chúng Tôi</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button className="hover:text-white text-left">Instagram</button></li>
                <li><button className="hover:text-white text-left">Facebook</button></li>
                <li><button className="hover:text-white text-left">TikTok</button></li>
                <li><button className="hover:text-white text-left">YouTube</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GoatTech - Ốp Điện Thoại Số 1 Việt Nam. Bảo Lưu Mọi Quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailPage;
