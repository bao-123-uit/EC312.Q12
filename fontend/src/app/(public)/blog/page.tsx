'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, User, Eye, Clock, Search, ChevronRight, Tag } from 'lucide-react';

interface BlogPost {
  post_id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  author_id: number;
  category: string;
  tags: string;
  view_count: number;
  is_published: boolean;
  published_at: string;
  meta_title: string;
  meta_description: string;
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9;

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'news', name: 'Tin tức' },
    { id: 'tips', name: 'Mẹo hay' },
    { id: 'review', name: 'Đánh giá' },
    { id: 'guide', name: 'Hướng dẫn' },
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/blog-posts`);
      if (response.ok) {
        const data = await response.json();
        setPosts(data.filter((p: BlogPost) => p.is_published));
      } else {
        setPosts(getSamplePosts());
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(getSamplePosts());
    } finally {
      setLoading(false);
    }
  };

  const getSamplePosts = (): BlogPost[] => {
    return [
      {
        post_id: 1,
        title: 'Top 10 ốp lưng iPhone 15 Pro Max đẹp nhất 2024',
        slug: 'top-10-op-lung-iphone-15-pro-max-dep-nhat-2024',
        content: '',
        excerpt: 'Khám phá những mẫu ốp lưng iPhone 15 Pro Max được yêu thích nhất.',
        featured_image: '/noel.jpg',
        author_id: 1,
        category: 'review',
        tags: 'iPhone,ốp lưng,phụ kiện',
        view_count: 1523,
        is_published: true,
        published_at: '2024-12-15T10:00:00Z',
        meta_title: '',
        meta_description: '',
        created_at: '2024-12-15T10:00:00Z',
        updated_at: '2024-12-15T10:00:00Z',
      },
      {
        post_id: 2,
        title: 'Cách bảo vệ điện thoại trong mùa đông lạnh',
        slug: 'cach-bao-ve-dien-thoai-mua-dong',
        content: '',
        excerpt: 'Những mẹo đơn giản giúp bảo vệ điện thoại của bạn.',
        featured_image: '/about1.jpg',
        author_id: 1,
        category: 'tips',
        tags: 'mẹo hay,bảo vệ điện thoại',
        view_count: 892,
        is_published: true,
        published_at: '2024-12-10T14:30:00Z',
        meta_title: '',
        meta_description: '',
        created_at: '2024-12-10T14:30:00Z',
        updated_at: '2024-12-10T14:30:00Z',
      },
      {
        post_id: 3,
        title: 'GoatTech ra mắt bộ sưu tập Giáng sinh 2024',
        slug: 'goattech-bo-suu-tap-giang-sinh-2024',
        content: '',
        excerpt: 'Chào đón mùa lễ hội với bộ sưu tập ốp lưng Giáng sinh độc quyền.',
        featured_image: '/noel.jpg',
        author_id: 1,
        category: 'news',
        tags: 'Giáng sinh,bộ sưu tập,mới',
        view_count: 2341,
        is_published: true,
        published_at: '2024-12-01T09:00:00Z',
        meta_title: '',
        meta_description: '',
        created_at: '2024-12-01T09:00:00Z',
        updated_at: '2024-12-01T09:00:00Z',
      },
    ];
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog GoatTech</h1>
          <p className="text-xl text-white/90 mb-8">
            Tin tức, mẹo hay và hướng dẫn về phụ kiện điện thoại
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-48 mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : paginatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedPosts.map((post) => (
              <Link key={post.post_id} href={`/blog/\${post.slug}`}>
                <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.featured_image || '/about1.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-3 py-1 rounded-full capitalize">
                        {categories.find(c => c.id === post.category)?.name || post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.published_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.view_count}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-pink-600 transition">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t">
                      <span className="text-pink-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Đọc thêm <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-gray-500">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg \${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white border hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}