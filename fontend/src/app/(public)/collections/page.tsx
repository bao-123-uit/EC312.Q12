'use client';

import React, { useState, useEffect } from 'react';
import { Search, Menu, ShoppingCart, User, Heart, ArrowRight, Star, Sparkles, Crown, Gem, Palette, Zap, Shield, Gift, X } from 'lucide-react';
import Link from 'next/link';
import { fetchProducts, fetchCategoriesWithCount, fetchProductsBySeason, fetchSeasonProductCounts, fetchAllCollections, fetchCollectionsByType, fetchCollectionProductCounts, fetchProductsByCollection } from '@/lib/api-client';

interface Collection {
  id: number;
  name: string;
  description: string;
  image: string;
  productCount: number;
  gradient: string;
  icon: React.ReactNode;
  featured?: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  tag?: string;
}

interface SeasonalCollection {
  id: number;
  name: string;
  image: string;
  gradient: string;
  products: number;
  seasonKey: string;
}

const CollectionsPage: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<number | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Season modal states
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<SeasonalCollection | null>(null);
  const [seasonProducts, setSeasonProducts] = useState<Product[]>([]);
  const [loadingSeasonProducts, setLoadingSeasonProducts] = useState(false);
  
  // Season product counts from API
  const [seasonCounts, setSeasonCounts] = useState<Record<string, number>>({
    noel: 0,
    valentine: 0,
    tet: 0
  });

  // Collection product counts from API (bắt đầu từ 0)
  const [collectionCounts, setCollectionCounts] = useState<Record<string, number>>({
    'luxury-edition': 0,
    'minimalist': 0,
    'artistic-series': 0,
    'gaming-pro': 0,
    'rugged-armor': 0,
    'limited-edition': 0,
    'giang-sinh-noel': 0,
    'valentine': 0,
    'tet-nguyen-dan': 0
  });

  // Featured Collections - sử dụng collectionCounts từ API
  const collections: Collection[] = [
    {
      id: 1,
      name: 'Luxury Edition',
      description: 'Bộ sưu tập cao cấp với chất liệu da thật và kim loại nguyên khối',
      image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&h=600&fit=crop',
      productCount: collectionCounts['luxury-edition'] || 0,
      gradient: 'from-amber-500 via-yellow-500 to-orange-500',
      icon: <Crown className="w-8 h-8" />,
      featured: true
    },
    {
      id: 2,
      name: 'Minimalist',
      description: 'Thiết kế tối giản, tinh tế cho người yêu thích sự đơn giản',
      image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=800&h=600&fit=crop',
      productCount: collectionCounts['minimalist'] || 0,
      gradient: 'from-gray-700 via-gray-800 to-gray-900',
      icon: <Gem className="w-8 h-8" />
    },
    {
      id: 3,
      name: 'Artistic Series',
      description: 'Họa tiết nghệ thuật độc đáo từ các nghệ sĩ hàng đầu',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=600&fit=crop',
      productCount: collectionCounts['artistic-series'] || 0,
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      icon: <Palette className="w-8 h-8" />
    },
    {
      id: 4,
      name: 'Gaming Pro',
      description: 'Dành cho game thủ với thiết kế RGB và grip chống trượt',
      image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800&h=600&fit=crop',
      productCount: collectionCounts['gaming-pro'] || 0,
      gradient: 'from-green-400 via-cyan-500 to-blue-500',
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 5,
      name: 'Rugged Armor',
      description: 'Bảo vệ tối đa với chuẩn quân đội, chống va đập cực tốt',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=600&fit=crop',
      productCount: collectionCounts['rugged-armor'] || 0,
      gradient: 'from-slate-600 via-slate-700 to-slate-800',
      icon: <Shield className="w-8 h-8" />
    },
    {
      id: 6,
      name: 'Limited Edition',
      description: 'Phiên bản giới hạn, số lượng có hạn, thiết kế độc quyền',
      image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&h=600&fit=crop',
      productCount: collectionCounts['limited-edition'] || 0,
      gradient: 'from-rose-500 via-pink-600 to-purple-600',
      icon: <Sparkles className="w-8 h-8" />,
      featured: true
    }
  ];

  // Seasonal Collections - sử dụng collectionCounts từ API
  const seasonalCollections: SeasonalCollection[] = [
    {
      id: 7,
      name: 'Giáng Sinh - Noel',
      image: 'noel.jpg',
      gradient: 'from-red-600 to-green-600',
      products: collectionCounts['giang-sinh-noel'] || 0,
      seasonKey: 'noel'
    },
    {
      id: 8,
      name: 'Valentine',
      image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&h=400&fit=crop',
      gradient: 'from-red-400 to-pink-500',
      products: collectionCounts['valentine'] || 0,
      seasonKey: 'valentine'
    },
    {
      id: 9,
      name: 'Tết Nguyên Đán',
      image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=600&h=400&fit=crop',
      gradient: 'from-yellow-500 to-red-500',
      products: collectionCounts['tet-nguyen-dan'] || 0,
      seasonKey: 'tet'
    }
  ];

  // Load season product counts
  useEffect(() => {
    const loadSeasonCounts = async () => {
      try {
        const counts = await fetchSeasonProductCounts();
        setSeasonCounts(counts);
      } catch (error) {
        console.error('Error loading season counts:', error);
      }
    };
    loadSeasonCounts();
  }, []);

  // Load collection product counts từ API
  useEffect(() => {
    const loadCollectionCounts = async () => {
      try {
        const counts = await fetchCollectionProductCounts();
        setCollectionCounts(counts);
      } catch (error) {
        console.error('Error loading collection counts:', error);
        // Giữ giá trị 0 nếu lỗi
      }
    };
    loadCollectionCounts();
  }, []);

  // Handle click on seasonal collection
  const handleSeasonClick = async (collection: SeasonalCollection) => {
    setSelectedSeason(collection);
    setShowSeasonModal(true);
    setLoadingSeasonProducts(true);
    
    try {
      const products = await fetchProductsBySeason(collection.seasonKey);
      const mapped = products.map((p: any) => ({
        id: p.product_id || p.id,
        name: p.product_name || p.name,
        price: p.price || 0,
        image: p.image_url || p.image || 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400',
        rating: p.rating || 4.5,
        reviews: p.reviews || 0,
        tag: p.tag
      }));
      setSeasonProducts(mapped);
    } catch (error) {
      console.error('Error loading season products:', error);
      setSeasonProducts([]);
    } finally {
      setLoadingSeasonProducts(false);
    }
  };

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(8);
        const mapped = data.map((p: any) => ({
          id: p.product_id || p.id,
          name: p.product_name || p.name,
          price: p.price || 0,
          image: p.image_url || p.image || 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400',
          rating: p.rating || 4.5,
          reviews: p.reviews || 0,
          tag: p.tag
        }));
        setFeaturedProducts(mapped);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback data
        setFeaturedProducts([
          { id: 1, name: 'Ốp Luxury Gold', price: 299000, image: 'https://images.unsplash.com/photo-1565849904461-04a3cc76e3a9?w=400', rating: 4.9, reviews: 128 },
          { id: 2, name: 'Ốp Minimal Black', price: 199000, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400', rating: 4.8, reviews: 256 },
          { id: 3, name: 'Ốp Art Series', price: 249000, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', rating: 4.7, reviews: 89 },
          { id: 4, name: 'Ốp Gaming RGB', price: 349000, image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400', rating: 4.9, reviews: 312 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Season Products Modal */}
      {showSeasonModal && selectedSeason && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSeasonModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedSeason.gradient} p-6 text-white relative`}>
              <button 
                onClick={() => setShowSeasonModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold">{selectedSeason.name}</h2>
              <p className="text-white/80">{selectedSeason.products} sản phẩm trong bộ sưu tập</p>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingSeasonProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-xl h-40 mb-3"></div>
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : seasonProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">Chưa có sản phẩm trong bộ sưu tập này</p>
                  <p className="text-gray-400 text-sm mt-2">Hãy thêm sản phẩm với mùa "{selectedSeason.seasonKey}" trong Admin</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {seasonProducts.map((product) => (
                    <Link href={`/product/${product.id}`} key={product.id}>
                      <div className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition">
                        <div className="relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                          />
                          {product.tag && (
                            <span className="absolute top-2 left-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {product.tag}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-pink-600 transition">{product.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-gray-600">{product.rating}</span>
                          </div>
                          <p className="text-pink-600 font-bold">{product.price.toLocaleString('vi-VN')}₫</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <Link href="/shop" className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition">
                Xem Tất Cả Sản Phẩm
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 text-white py-2 px-4 text-center text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>Khám phá bộ sưu tập mới nhất - Giảm đến 30% cho thành viên</span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      </div>

      

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-800 to-pink-900"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium">Bộ sưu tập 2025</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Khám Phá <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Bộ Sưu Tập</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Những thiết kế độc đáo, chất lượng cao cấp dành riêng cho bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-xl">
                Khám Phá Ngay
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition">
                Xem Video
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </section>

      {/* Featured Collections Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Bộ Sưu Tập Nổi Bật</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Khám phá những bộ sưu tập được thiết kế đặc biệt, mang đến phong cách độc đáo cho chiếc điện thoại của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className={`group relative overflow-hidden rounded-3xl cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                collection.featured ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
              style={{ minHeight: collection.featured ? '400px' : '320px' }}
              onMouseEnter={() => setActiveCollection(collection.id)}
              onMouseLeave={() => setActiveCollection(null)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-80 group-hover:opacity-90 transition-opacity duration-300`}></div>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                {collection.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    HOT
                  </div>
                )}
                
                <div className={`transform transition-all duration-500 ${activeCollection === collection.id ? 'translate-y-0' : 'translate-y-4'}`}>
                  <div className="mb-3 inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl">
                    {collection.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{collection.name}</h3>
                  <p className={`text-white/80 mb-4 transition-all duration-300 ${activeCollection === collection.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0'} overflow-hidden`}>
                    {collection.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{collection.productCount} sản phẩm</span>
                    <button className="flex items-center gap-2 font-medium hover:gap-3 transition-all">
                      Xem ngay <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seasonal Collections */}
      <section className="bg-gradient-to-b from-gray-100 to-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Bộ Sưu Tập Theo Mùa</h2>
              <p className="text-gray-600">Những thiết kế phù hợp với từng dịp đặc biệt</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-pink-600 font-medium hover:gap-3 transition-all">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seasonalCollections.map((collection) => (
              <div
                key={collection.id}
                className="group relative overflow-hidden rounded-2xl h-64 cursor-pointer"
                onClick={() => handleSeasonClick(collection)}
              >
                <img 
                  src={collection.image} 
                  alt={collection.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${collection.gradient} opacity-60 group-hover:opacity-70 transition-opacity`}></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-1">{collection.name}</h3>
                  <p className="text-sm text-white/80">{collection.products} sản phẩm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products from Collections
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sản Phẩm Nổi Bật Từ Bộ Sưu Tập</h2>
          <p className="text-gray-600">Những sản phẩm được yêu thích nhất</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {product.tag}
                    </span>
                  )}
                  <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}>
                    <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium transform transition-transform hover:scale-105">
                      Xem Chi Tiết
                    </button>
                  </div>
                  <button className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                    <Heart className="w-5 h-5 text-gray-600 hover:text-pink-500 transition-colors" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm ml-1">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-pink-600">{product.price.toLocaleString('vi-VN')}₫</span>
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition">
                      Thêm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/shop" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition transform hover:scale-105 shadow-lg">
            Xem Tất Cả Sản Phẩm <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section> */}

      {/* Newsletter Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center text-white">
          <Gift className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Nhận Ưu Đãi Độc Quyền</h2>
          <p className="text-xl text-white/80 mb-8">Đăng ký để nhận thông tin về bộ sưu tập mới và giảm giá 15% cho đơn hàng đầu tiên</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition transform hover:scale-105 shadow-lg">
              Đăng Ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
