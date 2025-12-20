'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, Heart, ShoppingCart, Minus, Plus, 
  Truck, Shield, RotateCcw, Check, ChevronRight, Gift,
  Smartphone, ChevronDown, Search
} from 'lucide-react';
import { fetchProductById, addToShoppingCart, fetchCompatiblePhoneModels, fetchAllPhoneModels } from '@/lib/api-client';
import TopBanner from '@/components/layout/TopBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useWishlist } from '@/app/context/wishlist-context';
import { useCart } from '@/app/context/cart-context';

interface PhoneModel {
  model_id: number;
  brand_name: string;
  model_name: string;
  model_code?: string;
  release_year?: number;
  is_popular?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const { wishedProducts, toggleWishlist } = useWishlist();
  const { refreshCart, increaseCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // Phone model selection states
  const [compatibleModels, setCompatibleModels] = useState<PhoneModel[]>([]);
  const [allPhoneModels, setAllPhoneModels] = useState<{brand: string, models: PhoneModel[]}[]>([]);
  const [selectedPhoneModel, setSelectedPhoneModel] = useState<PhoneModel | null>(null);
  const [showPhoneModelDropdown, setShowPhoneModelDropdown] = useState(false);
  const [phoneModelSearch, setPhoneModelSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadPhoneModels();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await fetchProductById(parseInt(productId));
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPhoneModels = async () => {
    try {
      setLoadingModels(true);
      // Lấy dòng máy tương thích với sản phẩm
      const compatibleRes = await fetchCompatiblePhoneModels(parseInt(productId));
      if (compatibleRes.success && compatibleRes.data.length > 0) {
        setCompatibleModels(compatibleRes.data);
      }
      
      // Lấy tất cả dòng máy grouped by brand
      const allRes = await fetchAllPhoneModels();
      if (allRes.success) {
        setAllPhoneModels(allRes.data);
      }
    } catch (error) {
      console.error('Error loading phone models:', error);
    } finally {
      setLoadingModels(false);
    }
  };

  // Filter models dựa trên search và brand
  const getFilteredModels = () => {
    let models: PhoneModel[] = [];
    
    // Luôn hiện TẤT CẢ dòng máy từ database, không giới hạn chỉ compatible
    if (allPhoneModels.length > 0) {
      if (selectedBrand) {
        const brandData = allPhoneModels.find(b => b.brand === selectedBrand);
        models = brandData?.models || [];
      } else {
        models = allPhoneModels.flatMap(b => b.models);
      }
    } else if (compatibleModels.length > 0) {
      // Fallback nếu allPhoneModels không có
      if (selectedBrand) {
        models = compatibleModels.filter(m => m.brand_name === selectedBrand);
      } else {
        models = compatibleModels;
      }
    }

    if (phoneModelSearch) {
      const search = phoneModelSearch.toLowerCase();
      models = models.filter(m => 
        m.model_name.toLowerCase().includes(search) ||
        m.brand_name.toLowerCase().includes(search)
      );
    }

    return models;
  };

  const getBrands = () => {
    // Luôn lấy tất cả brands từ allPhoneModels
    if (allPhoneModels.length > 0) {
      return allPhoneModels.map(b => b.brand);
    }
    // Fallback nếu chưa load xong
    if (compatibleModels.length > 0) {
      return [...new Set(compatibleModels.map(m => m.brand_name))];
    }
    return [];
  };

  const handleAddToCart = async (): Promise<boolean> => {
    if (!product) return false;
    
    // Chỉ yêu cầu chọn dòng máy nếu có dòng máy trong database
    const hasPhoneModels = compatibleModels.length > 0 || allPhoneModels.length > 0;
    if (hasPhoneModels && !selectedPhoneModel) {
      alert('Vui lòng chọn dòng máy điện thoại!');
      setShowPhoneModelDropdown(true);
      return false;
    }
    
    setAddingToCart(true);
    try {
      // Lấy customer từ localStorage (đúng key)
      const customerData = localStorage.getItem('customer');
      if (!customerData) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return false;
      }
      
      const customer = JSON.parse(customerData);
      const userId = customer.id;
      
      if (!userId) {
        router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return false;
      }

      const result = await addToShoppingCart({
        userId,
        productId: product.product_id,
        quantity,
        phoneModelId: selectedPhoneModel?.model_id,
        phoneModelName: selectedPhoneModel ? `${selectedPhoneModel.brand_name} ${selectedPhoneModel.model_name}` : undefined
      });
      
      if (result.success) {
        // Cập nhật cart count ngay lập tức (optimistic update cho UX mượt)
        increaseCart(quantity);
        // Sau đó sync lại với backend để chắc chắn
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      } else {
        alert(result.message || 'Có lỗi xảy ra');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
      return false;
    } finally {
      setAddingToCart(false);
    }
  };

  // Mua ngay - thêm vào giỏ rồi chuyển đến checkout
  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      router.push('/checkout');
    }
  };

  // Thêm vào giỏ và hiện thông báo
  const handleAddToCartWithNotification = async () => {
    const success = await handleAddToCart();
    if (success) {
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  const formatPrice = (price: number) => {
    return price?.toLocaleString('vi-VN') + '₫';
  };

  const getDiscountPercent = () => {
    if (!product || !product.sale_price || product.sale_price >= product.price) return 0;
    return Math.round((1 - product.sale_price / product.price) * 100);
  };

  const getProductImage = () => {
    if (!product) return '';
    return product.image_url || 
      product.product_images?.find((img: any) => img.is_primary)?.image_url ||
      product.product_images?.[0]?.image_url ||
      '';
  };

  const images = product?.product_images?.length 
    ? product.product_images 
    : product?.image_url 
      ? [{ image_id: 0, image_url: product.image_url, is_primary: true }]
      : [];

  const isWished = product && wishedProducts.has(product.product_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBanner />
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBanner />
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
            <Link href="/shop" className="text-pink-600 hover:underline">
              ← Quay lại cửa hàng
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = product.sale_price || product.price;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBanner />
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-pink-600">Cửa hàng</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">
              {product.product_name}
            </span>
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
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.image_url || getProductImage()}
                    alt={product.product_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ShoppingCart className="w-24 h-24" />
                  </div>
                )}
                {getDiscountPercent() > 0 && (
                  <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                    -{getDiscountPercent()}%
                  </span>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img: any, index: number) => (
                    <button
                      key={img.image_id || index}
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
                {product.categories?.category_name && (
                  <span className="text-pink-600 text-sm font-medium">
                    {product.categories.category_name}
                  </span>
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
                          star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-600">4.5 (128 đánh giá)</span>
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

              {/* Description */}
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Phone Model Selection */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-pink-600" />
                  Chọn dòng máy:
                  {selectedPhoneModel && (
                    <span className="text-pink-600 font-normal">
                      {selectedPhoneModel.brand_name} {selectedPhoneModel.model_name}
                    </span>
                  )}
                </h3>
                
                <div className="relative">
                  <button
                    onClick={() => setShowPhoneModelDropdown(!showPhoneModelDropdown)}
                    className={`w-full flex items-center justify-between p-4 border-2 rounded-xl transition ${
                      selectedPhoneModel 
                        ? 'border-pink-600 bg-pink-50' 
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <span className={selectedPhoneModel ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedPhoneModel 
                        ? `${selectedPhoneModel.brand_name} ${selectedPhoneModel.model_name}`
                        : 'Chọn dòng máy phù hợp với ốp'
                      }
                    </span>
                    <ChevronDown className={`w-5 h-5 transition ${showPhoneModelDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showPhoneModelDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-80 overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b sticky top-0 bg-white">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm dòng máy..."
                            value={phoneModelSearch}
                            onChange={(e) => setPhoneModelSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:border-pink-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Brand tabs */}
                      {getBrands().length > 1 && (
                        <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
                          <button
                            onClick={() => setSelectedBrand('')}
                            className={`px-3 py-1 rounded-full text-sm transition ${
                              selectedBrand === '' 
                                ? 'bg-pink-600 text-white' 
                                : 'bg-white border hover:bg-gray-100'
                            }`}
                          >
                            Tất cả
                          </button>
                          {getBrands().map(brand => (
                            <button
                              key={brand}
                              onClick={() => setSelectedBrand(brand)}
                              className={`px-3 py-1 rounded-full text-sm transition ${
                                selectedBrand === brand 
                                  ? 'bg-pink-600 text-white' 
                                  : 'bg-white border hover:bg-gray-100'
                              }`}
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Model list */}
                      <div className="max-h-48 overflow-y-auto">
                        {loadingModels ? (
                          <div className="p-4 text-center text-gray-500">
                            Đang tải...
                          </div>
                        ) : getFilteredModels().length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            {compatibleModels.length === 0 && allPhoneModels.length === 0
                              ? 'Sản phẩm này phù hợp với mọi dòng máy'
                              : 'Không tìm thấy dòng máy phù hợp'
                            }
                          </div>
                        ) : (
                          getFilteredModels().map((model) => (
                            <button
                              key={model.model_id}
                              onClick={() => {
                                setSelectedPhoneModel(model);
                                setShowPhoneModelDropdown(false);
                                setPhoneModelSearch('');
                              }}
                              className={`w-full flex items-center justify-between p-3 hover:bg-pink-50 transition text-left ${
                                selectedPhoneModel?.model_id === model.model_id ? 'bg-pink-50' : ''
                              }`}
                            >
                              <div>
                                <span className="text-gray-500 text-sm">{model.brand_name}</span>
                                <span className="mx-2">•</span>
                                <span className="font-medium">{model.model_name}</span>
                                {model.is_popular && (
                                  <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                                    Phổ biến
                                  </span>
                                )}
                              </div>
                              {selectedPhoneModel?.model_id === model.model_id && (
                                <Check className="w-5 h-5 text-pink-600" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {compatibleModels.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    ✓ Sản phẩm này tương thích với {compatibleModels.length} dòng máy
                  </p>
                )}
              </div>

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
                    onClick={() => toggleWishlist(product.product_id)}
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
                  onClick={handleAddToCartWithNotification}
                  disabled={addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-pink-600 text-pink-600 py-4 rounded-xl font-semibold hover:bg-pink-50 transition disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-pink-700 hover:to-purple-700 transition disabled:opacity-50"
                >
                  {addingToCart ? 'Đang xử lý...' : 'Mua ngay'}
                </button>
              </div>

              {/* Gift Button */}
              <button
                onClick={() => router.push(`/gift/send?productId=${product.product_id}`)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition mb-8"
              >
                <Gift className="w-5 h-5" />
                 Gửi Tặng Bạn Bè
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
      </div>

      <Footer />
    </div>
  );
}
